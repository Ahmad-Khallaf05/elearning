<?php

namespace App\Http\Controllers;

use App\Events\OrderPaid;
use App\Models\Commission;
use App\Models\Enrollment;
use App\Models\InstructorWallet;
use App\Models\Invoice;
use App\Models\Order;
use App\Services\PayPalService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;
use Throwable;

class PayPalController extends Controller
{
    public function __construct(private readonly PayPalService $paypal) {}

    public function checkout(Request $request): JsonResponse
    {
        $data = $request->validate([
            'course_id' => ['required', 'exists:courses,id'],
            'discount_amount' => ['sometimes', 'numeric', 'min:0'],
        ]);
        $student = $request->user();
        abort_unless($student?->role === 'student', 403, 'Only students can check out courses.');

        $course = \App\Models\Course::findOrFail($data['course_id']);
        abort_unless($course->approval_status === 'approved', 422, 'Course is not available for purchase.');
        abort_if(Enrollment::where('student_id', $student->id)->where('course_id', $course->id)->exists(), 409, 'You are already enrolled in this course.');

        $discount = min((float) ($data['discount_amount'] ?? 0), (float) $course->price);
        $total = round((float) $course->price - $discount, 2);
        $feeRate = (float) config('lms.platform_fee_rate');
        $order = null;
        try {
            $order = DB::transaction(fn () => Order::create([
                'student_id' => $student->id,
                'course_id' => $course->id,
                'total_amount' => $total,
                'discount_amount' => $discount,
                'platform_fee_rate' => $feeRate,
                'platform_fee_amount' => round($total * $feeRate, 2),
                'currency' => config('paypal.currency'),
                'status' => 'pending',
                'payment_status' => 'pending',
                'payment_provider' => 'paypal',
                'provider_reference' => (string) Str::uuid(),
            ]));
            $returnUrl = URL::route('paypal.capture', ['order_id' => $order->id]);
            $cancelUrl = config('paypal.frontend_url').'/payment/cancel?order_id='.$order->id.'&course_id='.$course->id;
            Log::info('PayPal checkout redirect URLs', [
                'order_id' => $order->id,
                'return_url' => $returnUrl,
                'cancel_url' => $cancelUrl,
            ]);
            $paypalOrder = $this->paypal->createOrder(number_format($total, 2, '.', ''), $returnUrl, $cancelUrl, $order->id);
            $approveUrl = collect($paypalOrder['links'] ?? [])->firstWhere('rel', 'approve')['href'] ?? null;
            abort_unless($approveUrl, 502, 'PayPal did not return an approval URL.');
            $order->update(['provider_reference' => $paypalOrder['id'], 'metadata' => ['paypal_order_id' => $paypalOrder['id'], 'paypal_status' => $paypalOrder['status']]]);
            return response()->json(['order_id' => $order->id, 'redirect_url' => $approveUrl], 201);
        } catch (Throwable $exception) {
            if ($order) {
                $order->update(['status' => 'failed', 'payment_status' => 'failed', 'metadata' => ['error' => $exception->getMessage()]]);
            }
            report($exception);
            return response()->json(['message' => 'PayPal checkout is temporarily unavailable.'], 503);
        }
    }

    public function capture(Request $request): RedirectResponse
    {
        $localOrderId = $request->integer('order_id');
        $paypalOrderId = (string) $request->query('token');
        $frontend = config('paypal.frontend_url');
        $order = Order::whereKey($localOrderId)->where('payment_provider', 'paypal')->firstOrFail();

        abort_unless($paypalOrderId && $paypalOrderId === $order->provider_reference, 403, 'PayPal order does not match the local order.');

        if ($order->status === 'completed') {
            return redirect()->away($frontend.'/payment/success?order_id='.$order->id);
        }

        try {
            $capture = $this->paypal->captureOrder($paypalOrderId);
            Log::info('PayPal capture response received', [
                'order_id' => $order->id,
                'paypal_order_id' => $paypalOrderId,
                'status' => $capture['status'] ?? null,
                'response' => $capture,
            ]);
            abort_unless(($capture['status'] ?? null) === 'COMPLETED', 422, 'PayPal payment was not completed.');
            $capturedAmount = data_get($capture, 'purchase_units.0.payments.captures.0.amount.value');
            $capturedCurrency = data_get($capture, 'purchase_units.0.payments.captures.0.amount.currency_code');
            abort_unless($capturedAmount !== null && number_format((float) $capturedAmount, 2, '.', '') === number_format((float) $order->total_amount, 2, '.', '') && $capturedCurrency === $order->currency, 422, 'PayPal payment amount does not match the order.');
            $this->completeOrder($order, $capture, (float) $capturedAmount, (string) $capturedCurrency);
            OrderPaid::dispatch($order->fresh());
            return redirect()->away($frontend.'/payment/success?order_id='.$order->id);
        } catch (Throwable $exception) {
            Log::error('PayPal capture flow failed', [
                'order_id' => $order->id,
                'paypal_order_id' => $paypalOrderId,
                'exception' => $exception::class,
                'message' => $exception->getMessage(),
            ]);
            report($exception);
            return redirect()->away($frontend.'/payment/cancel?order_id='.$order->id.'&course_id='.$order->course_id);
        }
    }

    public function webhook(Request $request): JsonResponse
    {
        $event = $request->json()->all();
        if (! $this->paypal->verifyWebhookSignature($request, $event)) {
            return response()->json(['message' => 'Invalid PayPal webhook signature.'], 403);
        }

        if (($event['event_type'] ?? null) !== 'PAYMENT.CAPTURE.COMPLETED') {
            return response()->json(['message' => 'Webhook acknowledged.']);
        }

        $paypalOrderId = data_get($event, 'resource.supplementary_data.related_ids.order_id');
        $order = Order::where('payment_provider', 'paypal')->where('provider_reference', $paypalOrderId)->first();
        if (! $order) {
            return response()->json(['message' => 'Webhook acknowledged.'], 202);
        }
        if ($order->status === 'completed') {
            return response()->json(['message' => 'Webhook already processed.']);
        }

        $amount = (float) data_get($event, 'resource.amount.value', 0);
        $currency = (string) data_get($event, 'resource.amount.currency_code', '');
        if (number_format($amount, 2, '.', '') !== number_format((float) $order->total_amount, 2, '.', '') || $currency !== $order->currency) {
            return response()->json(['message' => 'Webhook payment does not match the order.'], 422);
        }

        try {
            $this->completeOrder($order, ['status' => 'COMPLETED', 'paypal_event' => $event], $amount, $currency);
            OrderPaid::dispatch($order->fresh());
            return response()->json(['message' => 'Webhook processed.']);
        } catch (Throwable $exception) {
            report($exception);
            return response()->json(['message' => 'Webhook processing failed.'], 500);
        }
    }

    private function completeOrder(Order $order, array $payment, float $amount, string $currency): void
    {
        DB::transaction(function () use ($order, $payment, $amount, $currency): void {
            $locked = Order::whereKey($order->id)->lockForUpdate()->firstOrFail();
            if ($locked->status === 'completed') return;
            abort_unless(number_format($amount, 2, '.', '') === number_format((float) $locked->total_amount, 2, '.', '') && $currency === $locked->currency, 422, 'PayPal payment amount does not match the order.');
            $course = $locked->course;
            $locked->update(['status' => 'completed', 'payment_status' => 'completed', 'webhook_verified' => true, 'metadata' => array_merge($locked->metadata ?? [], ['paypal_payment' => $payment])]);
            Enrollment::firstOrCreate(['student_id' => $locked->student_id, 'course_id' => $course->id], ['order_id' => $locked->id, 'access_granted_at' => now()]);
            $fee = (float) $locked->platform_fee_amount;
            Commission::firstOrCreate(['order_id' => $locked->id, 'instructor_id' => $course->instructor_id], ['amount' => $fee, 'status' => 'pending']);
            InstructorWallet::firstOrCreate(['instructor_id' => $course->instructor_id])->increment('balance', (float) $locked->total_amount - $fee);
            Invoice::firstOrCreate(['order_id' => $locked->id], ['number' => 'INV-'.now()->format('Ymd').'-'.str_pad((string) $locked->id, 6, '0', STR_PAD_LEFT), 'locale' => $locked->student->preferred_locale ?? 'ar']);
        });
    }

    public function status(Request $request, Order $order): JsonResponse
    {
        abort_unless($order->student_id === $request->user()->id, 403);
        return response()->json(['data' => ['id' => $order->id, 'status' => $order->status, 'payment_status' => $order->payment_status, 'course_id' => $order->course_id]]);
    }
}
