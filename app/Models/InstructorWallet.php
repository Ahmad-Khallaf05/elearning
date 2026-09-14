<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InstructorWallet extends Model
{
    protected $fillable = ['instructor_id', 'balance'];
    protected function casts(): array { return ['balance' => 'decimal:2']; }
    public function instructor(): BelongsTo { return $this->belongsTo(User::class, 'instructor_id'); }
}
