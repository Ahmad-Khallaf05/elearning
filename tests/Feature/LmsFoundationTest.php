<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class LmsFoundationTest extends TestCase
{
    use RefreshDatabase;

    public function test_api_resolves_requested_locale(): void
    {
        $this->getJson('/api/courses', ['X-Locale' => 'ar'])
            ->assertOk()
            ->assertHeader('Content-Language', 'ar');
    }

    public function test_checkout_creates_pending_order_without_enrollment(): void
    {
        config(['paypal.client_id' => 'client', 'paypal.client_secret' => 'secret']);
        Http::fake([
            '*/v1/oauth2/token' => Http::response(['access_token' => 'token'], 200),
            '*/v2/checkout/orders' => Http::response(['id' => 'PAYPAL-PENDING', 'status' => 'CREATED', 'links' => [['rel' => 'approve', 'href' => 'https://sandbox.paypal.test/approve']]], 201),
        ]);
        $student = User::factory()->create(['role' => 'student']);
        $instructor = User::factory()->create(['role' => 'instructor']);
        $course = Course::create(['instructor_id' => $instructor->id, 'title' => 'Course', 'description' => 'Description', 'price' => 25, 'approval_status' => 'approved']);

        $response = $this->actingAs($student, 'sanctum')->postJson('/api/v1/orders/checkout', ['course_id' => $course->id]);

        $response->assertCreated()->assertJsonPath('redirect_url', 'https://sandbox.paypal.test/approve');
        $this->assertDatabaseHas('orders', ['provider_reference' => 'PAYPAL-PENDING', 'status' => 'pending']);
        $this->assertDatabaseCount('enrollments', 0);
    }
}
