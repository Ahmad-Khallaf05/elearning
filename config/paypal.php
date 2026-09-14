<?php

return [
    'mode' => env('PAYPAL_MODE', 'sandbox'),
    'client_id' => env('PAYPAL_CLIENT_ID'),
    'client_secret' => env('PAYPAL_CLIENT_SECRET'),
    'webhook_id' => env('PAYPAL_WEBHOOK_ID'),
    'allow_unverified_webhooks' => filter_var(
        env('PAYPAL_ALLOW_UNVERIFIED_WEBHOOKS', env('APP_ENV') !== 'production' && env('PAYPAL_MODE', 'sandbox') === 'sandbox'),
        FILTER_VALIDATE_BOOLEAN
    ),
    'currency' => env('PAYPAL_CURRENCY', 'USD'),
    'base_url' => env('PAYPAL_MODE', 'sandbox') === 'live'
        ? 'https://api-m.paypal.com'
        : 'https://api-m.sandbox.paypal.com',
    'frontend_url' => rtrim(env('FRONTEND_URL', 'http://localhost:5000'), '/'),
];
