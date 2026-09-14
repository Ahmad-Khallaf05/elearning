<?php

namespace App\Services;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;
use Throwable;

class PayPalService
{
    private function client(): PendingRequest
    {
        return Http::baseUrl(config('paypal.base_url'))
            ->acceptJson()
            ->asJson()
            ->connectTimeout(5)
            ->timeout(15)
            ->retry(2, 200, null, false);
    }

    private function accessToken(): string
    {
        $clientId = config('paypal.client_id');
        $clientSecret = config('paypal.client_secret');
        if (! is_string($clientId) || trim($clientId) === '' || ! is_string($clientSecret) || trim($clientSecret) === '') {
            throw new RuntimeException('PayPal credentials are not configured.');
        }

        $response = Http::baseUrl(config('paypal.base_url'))
            ->withBasicAuth($clientId, $clientSecret)
            ->asForm()
            ->acceptJson()
            ->connectTimeout(5)
            ->timeout(15)
            ->retry(2, 200, null, false)
            ->post('/v1/oauth2/token', ['grant_type' => 'client_credentials']);

        if ($response->failed()) {
            $this->logFailure('authentication', $response, null);
            throw new RuntimeException('PayPal authentication failed: '.$this->responseSummary($response));
        }

        return (string) $response->json('access_token');
    }

    public function createOrder(string $value, string $returnUrl, string $cancelUrl, int $localOrderId): array
    {
        $response = $this->client()->withToken($this->accessToken())->withHeaders([
            'PayPal-Request-Id' => 'lms-'.$localOrderId,
            'Prefer' => 'return=representation',
        ])->post('/v2/checkout/orders', [
            'intent' => 'CAPTURE',
            'purchase_units' => [[
                'reference_id' => (string) $localOrderId,
                'custom_id' => (string) $localOrderId,
                'amount' => ['currency_code' => config('paypal.currency'), 'value' => $value],
            ]],
            'application_context' => [
                'brand_name' => config('app.name'),
                'user_action' => 'PAY_NOW',
                'return_url' => $returnUrl,
                'cancel_url' => $cancelUrl,
            ],
        ]);

        if ($response->failed()) {
            $this->logFailure('order creation', $response, $localOrderId);
            throw new RuntimeException('PayPal order creation failed: '.$this->responseSummary($response));
        }

        return $response->json();
    }

    public function captureOrder(string $paypalOrderId): array
    {
        $response = $this->client()->withToken($this->accessToken())->withHeaders([
            'PayPal-Request-Id' => 'lms-capture-'.$paypalOrderId,
        ])->withBody('{}', 'application/json')->post('/v2/checkout/orders/'.$paypalOrderId.'/capture');

        if ($response->failed()) {
            $this->logFailure('capture', $response, $paypalOrderId);
            throw new RuntimeException('PayPal order capture failed: '.$this->responseSummary($response));
        }

        return $response->json();
    }

    public function verifyWebhookSignature(Request $request, array $event): bool
    {
        $webhookId = config('paypal.webhook_id');
        if (! is_string($webhookId) || trim($webhookId) === '') {
            return (bool) config('paypal.allow_unverified_webhooks');
        }

        $payload = [
            'auth_algo' => $request->header('PAYPAL-AUTH-ALGO'),
            'cert_url' => $request->header('PAYPAL-CERT-URL'),
            'transmission_id' => $request->header('PAYPAL-TRANSMISSION-ID'),
            'transmission_sig' => $request->header('PAYPAL-TRANSMISSION-SIG'),
            'transmission_time' => $request->header('PAYPAL-TRANSMISSION-TIME'),
            'webhook_id' => $webhookId,
            'webhook_event' => $event,
        ];

        if (in_array(null, array_slice($payload, 0, 5), true)) {
            return false;
        }

        try {
            $response = $this->client()
                ->withToken($this->accessToken())
                ->post('/v1/notifications/verify-webhook-signature', $payload);

            if (! $response->successful()) {
                $this->logFailure('webhook verification', $response, $request->header('PAYPAL-TRANSMISSION-ID'));
                return false;
            }
            return $response->json('verification_status') === 'SUCCESS';
        } catch (Throwable $exception) {
            report($exception);
            return false;
        }
    }

    private function logFailure(string $operation, \Illuminate\Http\Client\Response $response, string|int|null $reference): void
    {
        Log::error('PayPal API request failed', [
            'operation' => $operation,
            'reference' => $reference,
            'status' => $response->status(),
            'body' => $response->json() ?? $response->body(),
        ]);
    }

    private function responseSummary(\Illuminate\Http\Client\Response $response): string
    {
        return json_encode($response->json() ?? ['raw' => $response->body()], JSON_UNESCAPED_SLASHES) ?: 'unknown provider error';
    }
}
