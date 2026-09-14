<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Lesson extends Model
{
    protected $fillable = [
        'section_id',
        'title',
        'title_translations',
        'description_translations',
        'type',
        'source_type',
        'vod_url',
        'website_url',
        'file_path',
        'attachment_path',
        'attachment_name',
        'live_metadata',
        'order',
        'hls_path',
        'hls_key_path',
        'processing_status',
    ];

    protected function casts(): array
    {
        return [
            'live_metadata' => 'array',
            'title_translations' => 'array',
            'description_translations' => 'array',
        ];
    }

    public function setTypeAttribute($value): void
    {
        $this->attributes['type'] = strtolower((string) $value);
    }

    public function section(): BelongsTo
    {
        return $this->belongsTo(Section::class);
    }

    public function quiz(): HasOne
    {
        return $this->hasOne(Quiz::class);
    }

    public function assignment(): HasOne
    {
        return $this->hasOne(Assignment::class);
    }

    public function completedByUsers()
    {
        return $this->belongsToMany(User::class, 'lesson_user')->withTimestamps();
    }
}
