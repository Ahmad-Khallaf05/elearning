<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Section;
use Illuminate\Http\Request;
use App\Http\Resources\SectionResource;

class SectionController extends Controller
{
    public function index(Request $request, Course $course)
    {
        if (!$this->canAccess($request->user(), $course)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        return SectionResource::collection($course->sections()->orderBy('order')->get());
    }

    public function store(Request $request, Course $course)
    {
        $user = $request->user();

        if ($user->role !== 'admin' && $course->instructor_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'order' => 'sometimes|integer|min:0|max:2147483647',
        ]);

        $section = $course->sections()->create([
            'title' => $validated['title'],
            'order' => $validated['order'] ?? 0,
        ]);
        $this->resetInstructorApproval($user, $course);

        return new SectionResource($section);
    }

    public function show(Request $request, Section $section)
    {
        if (!$this->canAccess($request->user(), $section->course)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        return new SectionResource($section->load(['lessons' => fn ($query) => $query->orderBy('order')]));
    }

    public function update(Request $request, Section $section)
    {
        $user = $request->user();
        $course = $section->course;

        if ($user->role !== 'admin' && $course->instructor_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'order' => 'sometimes|integer|min:0|max:2147483647',
        ]);

        $section->update($validated);
        $this->resetInstructorApproval($user, $course);

        return new SectionResource($section);
    }

    public function destroy(Request $request, Section $section)
    {
        $user = $request->user();
        $course = $section->course;

        if ($user->role !== 'admin' && $course->instructor_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $section->delete();
        $this->resetInstructorApproval($user, $course);

        return response()->json(['message' => 'Section deleted successfully.']);
    }

    private function canAccess($user, Course $course): bool
    {
        return $user && (
            $user->role === 'admin' ||
            $course->instructor_id === $user->id ||
            ($user->role === 'student' && $course->approval_status === 'approved' &&
                $course->enrollments()->where('student_id', $user->id)->exists())
        );
    }

    private function resetInstructorApproval($user, Course $course): void
    {
        if ($user->role === 'instructor' && $course->approval_status === 'approved') {
            $course->update(['approval_status' => 'pending']);
        }
    }
}
