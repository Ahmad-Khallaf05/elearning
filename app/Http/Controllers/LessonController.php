<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Section;
use App\Models\Lesson;
use Illuminate\Http\Request;
use App\Http\Resources\LessonResource;

class LessonController extends Controller
{
    public function index(Request $request, Section $section)
    {
        $course = $section->course;
        if (!$this->canAccess($request->user(), $course)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return LessonResource::collection($section->lessons()->orderBy('order')->get());
    }

    public function show(Request $request, Lesson $lesson)
    {
        if (!$this->canAccess($request->user(), $lesson->section->course)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return new LessonResource($lesson);
    }

    public function store(Request $request, Section $section)
    {
        $user = $request->user();
        $course = $section->course;

        if ($user->role !== 'admin' && $course->instructor_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->merge(['type' => strtolower((string) $request->input('type'))]);
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'type' => 'required|in:vod,live',
            'vod_url' => 'required_if:type,vod|nullable|url|max:2048',
            'live_metadata' => 'required_if:type,live|nullable|array',
            'order' => 'sometimes|integer|min:0|max:2147483647',
        ]);

        $lesson = $section->lessons()->create([
            'title' => $validated['title'],
            'type' => $validated['type'],
            'vod_url' => $validated['vod_url'] ?? null,
            'live_metadata' => $validated['live_metadata'] ?? null,
            'order' => $validated['order'] ?? 0,
        ]);
        $this->resetInstructorApproval($user, $course);

        return new LessonResource($lesson);
    }

    public function update(Request $request, Lesson $lesson)
    {
        $user = $request->user();
        $course = $lesson->section->course;

        if ($user->role !== 'admin' && $course->instructor_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($request->has('type')) {
            $request->merge(['type' => strtolower((string) $request->input('type'))]);
        }
        $effectiveType = strtolower($request->input('type') ?: $lesson->type);
        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'type' => 'sometimes|in:vod,live',
            'vod_url' => 'sometimes|nullable|url|max:2048',
            'live_metadata' => 'sometimes|nullable|array',
            'order' => 'sometimes|integer|min:0|max:2147483647',
        ]);
        if ($request->has('type') && $effectiveType === 'vod' && !$request->filled('vod_url')) {
            return response()->json(['message' => 'A valid VOD URL is required for VOD lessons.'], 422);
        }
        if ($request->has('type') && $effectiveType === 'live' && !$request->has('live_metadata')) {
            return response()->json(['message' => 'Live metadata is required for live lessons.'], 422);
        }

        $lesson->update($validated);
        $this->resetInstructorApproval($user, $course);

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
        $this->resetInstructorApproval($user, $course);

        return response()->json(['message' => 'Lesson deleted successfully.']);
    }

    private function canAccess($user, $course): bool
    {
        return $user && (
            $user->role === 'admin' ||
            $course->instructor_id === $user->id ||
            ($user->role === 'student' && $course->approval_status === 'approved' &&
                $course->enrollments()->where('student_id', $user->id)->exists())
        );
    }

    private function resetInstructorApproval($user, $course): void
    {
        if ($user->role === 'instructor' && $course->approval_status === 'approved') {
            $course->update(['approval_status' => 'pending']);
        }
    }
}
