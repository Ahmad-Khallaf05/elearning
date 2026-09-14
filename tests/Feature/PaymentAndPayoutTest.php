<?php

namespace Tests\Feature;

use App\Models\InstructorWallet;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PaymentAndPayoutTest extends TestCase
{
    use RefreshDatabase;

    public function test_payout_rejects_amount_above_wallet_balance(): void
    {
        $instructor = User::factory()->create(['role' => 'instructor']);
        InstructorWallet::create(['instructor_id' => $instructor->id, 'balance' => 20]);

        $this->actingAs($instructor, 'sanctum')->postJson('/api/instructor/payouts', [
            'amount' => 50,
            'payout_method' => 'paypal',
            'payout_details' => ['account' => 'payee@example.com'],
        ])->assertStatus(422);

        $this->assertDatabaseCount('payout_requests', 0);
    }
}
