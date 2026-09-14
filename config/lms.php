<?php

return [
    'platform_fee_rate' => (float) env('LMS_PLATFORM_FEE_RATE', 0.20),
    'minimum_payout' => (float) env('LMS_MINIMUM_PAYOUT', 50),
    'webhook_secret' => env('PAYMENT_WEBHOOK_SECRET'),
];
