<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PayoutRequest extends Model
{
    protected $fillable = ['instructor_id', 'amount', 'status', 'payout_method', 'payout_details', 'admin_note', 'processed_at', 'processed_by'];
    protected $hidden = ['payout_details'];
    protected function casts(): array { return ['amount' => 'decimal:2', 'payout_details' => 'array', 'processed_at' => 'datetime']; }
    public function instructor(): BelongsTo { return $this->belongsTo(User::class, 'instructor_id'); }
    public function processor(): BelongsTo { return $this->belongsTo(User::class, 'processed_by'); }
}
