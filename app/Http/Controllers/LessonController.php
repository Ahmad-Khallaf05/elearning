<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Section;
use App\Models\Lesson;
use Illuminate\Http\Request;
use App\Http\Resources\LessonResource;

class LessonController extends Controller
{
    public function store(Request $request, Section $section)
    {
        $user = $request->user();
        $course = $section->course;

        if ($user->role !== 'admin' && $course->instructor_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'type' => 'required|in:VOD,Live',
            'vod_url' => 'nullable|url',
            'live_metadata' => 'nullable|array',
            'order' => 'integer',
        ]);

        $lesson = $section->lessons()->create([
            'title' => $validated['title'],
            'type' => $validated['type'],
            'vod_url' => $validated['vod_url'] ?? null,
            'live_metadata' => $validated['live_metadata'] ?? null,
            'order' => $validated['order'] ?? 0,
        ]);

        return new LessonResource($lesson);
    }

    public function update(Request $request, Lesson $lesson)
    {
        $user = $request->user();
        $course = $lesson->section->course;

        if ($user->role !== 'admin' && $course->instructor_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'type' => 'sometimes|in:VOD,Live',
            'vod_url' => 'nullable|url',
            'live_metadata' => 'nullable|array',
            'order' => 'sometimes|integer',
        ]);

        $lesson->update($validated);

        return new LessonResource($lesson);
    }

    public function destroy(Request $request, Lesson $lesson)
    {
        $user = $request->user();
        $course = $lesson->section->course;

        if ($user->role !== 'admin' && $course->instructor_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $lesson->delete();

        return response()->json(['message' => 'Lesson deleted successfully.']);
    }
}
