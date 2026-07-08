<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Section;
use Illuminate\Http\Request;
use App\Http\Resources\SectionResource;

class SectionController extends Controller
{
    public function index(Course $course)
    {
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
            'order' => 'integer',
        ]);

        $section = $course->sections()->create([
            'title' => $validated['title'],
            'order' => $validated['order'] ?? 0,
        ]);

        return new SectionResource($section);
    }

    public function show(Section $section)
    {
        return new SectionResource($section->load('lessons'));
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
            'order' => 'sometimes|integer',
        ]);

        $section->update($validated);

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

        return response()->json(['message' => 'Section deleted successfully.']);
    }
}
