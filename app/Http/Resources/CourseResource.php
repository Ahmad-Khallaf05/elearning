<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CourseResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'instructor_id' => $this->instructor_id,
            'instructor' => $this->whenLoaded('instructor', fn() => [
                'id' => $this->instructor->id,
                'name' => $this->instructor->name,
            ]),
            'title' => $this->title,
            'description' => $this->description,
            'thumbnail_url' => $this->thumbnail_url,
            'price' => (float) $this->price,
            'approval_status' => $this->approval_status,
            'sections' => SectionResource::collection($this->whenLoaded('sections')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
