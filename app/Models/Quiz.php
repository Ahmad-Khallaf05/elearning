<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Quiz extends Model
{
    protected $fillable = [
        'lesson_id',
        'title',
        'description',
        'title_translations',
        'description_translations',
    ];

    protected function casts(): array
    {
        return ['title_translations' => 'array', 'description_translations' => 'array'];
    }

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class);
    }

    public function questions(): HasMany { return $this->hasMany(Question::class); }
    public function attempts(): HasMany { return $this->hasMany(QuizAttempt::class); }
}
