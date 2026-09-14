<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuizAttempt extends Model
{
    protected $fillable = ['quiz_id', 'student_id', 'answers', 'score', 'total_points', 'passed', 'submitted_at'];

    protected function casts(): array
    {
        return ['answers' => 'array', 'score' => 'decimal:2', 'passed' => 'boolean', 'submitted_at' => 'datetime'];
    }

    public function quiz(): BelongsTo { return $this->belongsTo(Quiz::class); }
    public function student(): BelongsTo { return $this->belongsTo(User::class, 'student_id'); }
}
