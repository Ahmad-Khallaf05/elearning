<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\URL;
use App\Models\Order;
use App\Models\InstructorWallet;
use Tests\TestCase;

class PayPalCheckoutTest extends TestCase
{
    use RefreshDatabase;

    public function test_checkout_creates_paypal_order_and_returns_approval_url(): void
    {
        config(['app.url' => 'http://127.0.0.1:8000', 'paypal.client_id' => 'client', 'paypal.client_secret' => 'secret', 'paypal.currency' => 'USD', 'paypal.frontend_url' => 'http://localhost:5000']);
        Http::fake([
            '*/v1/oauth2/token' => Http::response(['access_token' => 'token'], 200),
            '*/v2/checkout/orders' => Http::response(['id' => 'PAYPAL-123', 'status' => 'CREATED', 'links' => [['rel' => 'approve', 'href' => 'https://www.sandbox.paypal.com/checkoutnow?token=PAYPAL-123']]], 201),
        ]);
        $student = User::factory()->create(['role' => 'student']);
        $instructor = User::factory()->create(['role' => 'instructor']);
        $course = Course::create(['instructor_id' => $instructor->id, 'title' => 'Course', 'description' => 'Description', 'price' => 25, 'approval_status' => 'approved']);

        $response = $this->actingAs($student, 'sanctum')->postJson('/api/v1/orders/checkout', ['course_id' => $course->id]);

        $response->assertCreated()->assertJsonPath('order_id', fn ($id) => is_int($id))->assertJsonPath('redirect_url', 'https://www.sandbox.paypal.com/checkoutnow?token=PAYPAL-123');
        $orderId = $response->json('order_id');
        Http::assertSent(function ($request) use ($orderId) {
            if (! str_ends_with($request->url(), '/v2/checkout/orders')) return false;
            $body = $request->data();
            return $body['application_context']['return_url'] === 'http://127.0.0.1:8000/api/v1/payments/paypal/capture?order_id='.$orderId
                && str_starts_with($body['application_context']['cancel_url'], 'http://localhost:5000/payment/cancel?order_id='.$orderId);
        });
        $this->assertDatabaseHas('orders', ['provider_reference' => 'PAYPAL-123', 'status' => 'pending', 'payment_provider' => 'paypal']);
    }

    public function test_signed_paypal_capture_enrolls_student_and_redirects(): void
    {
        config(['paypal.client_id' => 'client', 'paypal.client_secret' => 'secret', 'paypal.frontend_url' => 'http://localhost:5173']);
        Http::fake([
            '*/v1/oauth2/token' => Http::response(['access_token' => 'token'], 200),
            '*/v2/checkout/orders/PAYPAL-123/capture' => Http::response(['id' => 'PAYPAL-123', 'status' => 'COMPLETED', 'purchase_units' => [['payments' => ['captures' => [['amount' => ['value' => '100.00', 'currency_code' => 'USD']]]]]]], 201),
        ]);
        $student = User::factory()->create(['role' => 'student']);
        $instructor = User::factory()->create(['role' => 'instructor']);
        $course = Course::create(['instructor_id' => $instructor->id, 'title' => 'Course', 'description' => 'Description', 'price' => 100, 'approval_status' => 'approved']);
        $order = Order::create(['student_id' => $student->id, 'course_id' => $course->id, 'total_amount' => 100, 'platform_fee_rate' => .2, 'platform_fee_amount' => 20, 'currency' => 'USD', 'status' => 'pending', 'payment_status' => 'pending', 'payment_provider' => 'paypal', 'provider_reference' => 'PAYPAL-123']);
        $url = URL::temporarySignedRoute('paypal.capture', now()->addMinutes(5), ['order_id' => $order->id, 'token' => 'PAYPAL-123']);

        $this->get($url)->assertRedirect('http://localhost:5173/payment/success?order_id='.$order->id);
        $this->assertDatabaseHas('enrollments', ['student_id' => $student->id, 'course_id' => $course->id]);
        $this->assertDatabaseHas('instructor_wallets', ['instructor_id' => $instructor->id, 'balance' => '80.00']);
        $this->assertDatabaseHas('orders', ['id' => $order->id, 'status' => 'completed']);
    }

    public function test_missing_paypal_credentials_return_a_graceful_json_error(): void
    {
        config(['paypal.client_id' => null, 'paypal.client_secret' => null]);
        $student = User::factory()->create(['role' => 'student']);
        $instructor = User::factory()->create(['role' => 'instructor']);
        $course = Course::create(['instructor_id' => $instructor->id, 'title' => 'Course', 'description' => 'Description', 'price' => 25, 'approval_status' => 'approved']);

        $this->actingAs($student, 'sanctum')
            ->postJson('/api/v1/orders/checkout', ['course_id' => $course->id])
            ->assertStatus(503)
            ->assertJson(['message' => 'PayPal checkout is temporarily unavailable.']);
    }

    public function test_paypal_return_token_is_not_rejected_by_laravel_signed_middleware(): void
    {
        config(['paypal.client_id' => 'client', 'paypal.client_secret' => 'secret', 'paypal.frontend_url' => 'http://localhost:5000']);
        Http::fake([
            '*/v1/oauth2/token' => Http::response(['access_token' => 'token'], 200),
            '*/v2/checkout/orders/PAYPAL-RETURN/capture' => Http::response(['id' => 'PAYPAL-RETURN', 'status' => 'COMPLETED', 'purchase_units' => [['payments' => ['captures' => [['amount' => ['value' => '25.00', 'currency_code' => 'USD']]]]]]], 201),
        ]);
        $student = User::factory()->create(['role' => 'student']);
        $instructor = User::factory()->create(['role' => 'instructor']);
        $course = Course::create(['instructor_id' => $instructor->id, 'title' => 'Course', 'description' => 'Description', 'price' => 25, 'approval_status' => 'approved']);
        $order = Order::create(['student_id' => $student->id, 'course_id' => $course->id, 'total_amount' => 25, 'platform_fee_rate' => .2, 'platform_fee_amount' => 5, 'currency' => 'USD', 'status' => 'pending', 'payment_status' => 'pending', 'payment_provider' => 'paypal', 'provider_reference' => 'PAYPAL-RETURN']);

        $this->get(route('paypal.capture', ['order_id' => $order->id, 'token' => 'PAYPAL-RETURN', 'PayerID' => 'sandbox-payer']))
            ->assertRedirect('http://localhost:5000/payment/success?order_id='.$order->id);
    }

    public function test_local_sandbox_webhook_fallback_processes_capture_without_webhook_id(): void
    {
        config(['paypal.webhook_id' => null, 'paypal.allow_unverified_webhooks' => true]);
        $student = User::factory()->create(['role' => 'student']);
        $instructor = User::factory()->create(['role' => 'instructor']);
        $course = Course::create(['instructor_id' => $instructor->id, 'title' => 'Course', 'description' => 'Description', 'price' => 25, 'approval_status' => 'approved']);
        $order = Order::create(['student_id' => $student->id, 'course_id' => $course->id, 'total_amount' => 25, 'platform_fee_rate' => .2, 'platform_fee_amount' => 5, 'currency' => 'USD', 'status' => 'pending', 'payment_status' => 'pending', 'payment_provider' => 'paypal', 'provider_reference' => 'PAYPAL-WEBHOOK']);

        $event = ['id' => 'WH-1', 'event_type' => 'PAYMENT.CAPTURE.COMPLETED', 'resource' => ['amount' => ['value' => '25.00', 'currency_code' => 'USD'], 'supplementary_data' => ['related_ids' => ['order_id' => 'PAYPAL-WEBHOOK']]]];
        $this->postJson('/api/v1/payments/paypal/webhook', $event)->assertOk();
        $this->postJson('/api/v1/payments/paypal/webhook', $event)->assertOk();

        $this->assertDatabaseHas('orders', ['id' => $order->id, 'status' => 'completed']);
        $this->assertDatabaseCount('enrollments', 1);
        $this->assertSame('20.00', (string) InstructorWallet::where('instructor_id', $instructor->id)->value('balance'));
    }
}
