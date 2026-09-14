<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ParentLinkInvitation extends Model
{
    protected $fillable = ['student_id', 'token_hash', 'expires_at', 'accepted_at'];
    protected function casts(): array { return ['expires_at' => 'datetime', 'accepted_at' => 'datetime']; }
    public function student(): BelongsTo { return $this->belongsTo(User::class, 'student_id'); }
}
