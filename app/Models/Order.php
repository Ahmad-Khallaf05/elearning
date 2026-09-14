<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Order extends Model
{
    protected $fillable = [
        'student_id',
        'course_id',
        'total_amount',
        'payment_status',
        'payment_provider',
        'provider_reference',
        'webhook_verified',
        'metadata',
        'status',
        'discount_amount',
        'platform_fee_rate',
        'platform_fee_amount',
        'currency',
        'webhook_event_id',
    ];

    protected function casts(): array
    {
        return ['total_amount' => 'decimal:2', 'discount_amount' => 'decimal:2', 'platform_fee_rate' => 'decimal:4', 'platform_fee_amount' => 'decimal:2', 'webhook_verified' => 'boolean', 'metadata' => 'array'];
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function enrollments(): HasMany
    {
        return $this->hasMany(Enrollment::class);
    }

    public function commissions(): HasMany
    {
        return $this->hasMany(Commission::class);
    }

    public function course(): BelongsTo { return $this->belongsTo(Course::class); }
    public function invoice(): HasOne { return $this->hasOne(Invoice::class); }
}
