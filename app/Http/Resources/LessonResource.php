<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LessonResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $locale = app()->getLocale();
        $attachmentUrl = null;

        if (!empty($this->attachment_path)) {
            $attachmentUrl = route('lessons.attachment', ['lesson' => $this->id]);
        }

        return [
            'id' => $this->id,
            'section_id' => $this->section_id,
            'title' => $this->title_translations[$locale] ?? $this->title,
            'description' => $this->description_translations[$locale] ?? null,
            'translations' => ['title' => $this->title_translations, 'description' => $this->description_translations],
            'type' => $this->type,
            'source_type' => $this->source_type,
            'vod_url' => $this->vod_url,
            'website_url' => $this->website_url,
            'file_path' => $this->file_path,
            'attachment_path' => $this->attachment_path,
            'attachment_name' => $this->attachment_name,
            'attachment_url' => $attachmentUrl,
            'hls_url' => $this->hls_path ? route('lessons.hls', ['lesson' => $this->id, 'asset' => basename($this->hls_path)]) : null,
            'live_metadata' => $this->live_metadata,
            'order' => $this->order,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
