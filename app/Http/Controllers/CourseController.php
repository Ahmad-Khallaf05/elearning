<?php

namespace App\Http\Controllers;

use App\Models\Course;
use Illuminate\Http\Request;
use App\Http\Resources\CourseResource;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class CourseController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request)
    {
        $user = $request->user();
        
        $query = Course::with('instructor');

        if ($user->role === 'student') {
            $query->where('approval_status', 'approved');

        } elseif ($user->role === 'instructor') {
            $query->where('instructor_id', $user->id);
        }
        // admin sees all courses

        return CourseResource::collection($query->get());
    }

    public function store(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'instructor' && $user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized. Only instructors can create courses.'], 403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'nullable|numeric|min:0',
        ]);

        $course = Course::create([
            'instructor_id' => $user->id,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'price' => $validated['price'] ?? 0,
            'approval_status' => 'pending', // Automatically pending for instructors
        ]);

        return new CourseResource($course);
    }

    public function show(Request $request, Course $course)
    {
        $user = $request->user();

        if ($course->approval_status !== 'approved') {
            if ($user->role === 'student' || ($user->role === 'instructor' && $course->instructor_id !== $user->id)) {
                return response()->json(['message' => 'Course not found or unauthorized.'], 404);
            }
        }

        $course->load('sections.lessons', 'instructor');

        return new CourseResource($course);
    }

    public function update(Request $request, Course $course)
    {
        $user = $request->user();

        if ($user->role !== 'admin' && $course->instructor_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized to update this course.'], 403);
        }

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'price' => 'sometimes|numeric|min:0',
            'approval_status' => 'sometimes|in:pending,approved,rejected',
        ]);

        // Only admin can change approval_status
        if (isset($validated['approval_status']) && $user->role !== 'admin') {
            unset($validated['approval_status']);
        }

        $course->update($validated);

        return new CourseResource($course);
    }

    public function destroy(Request $request, Course $course)
    {
        $user = $request->user();

        if ($user->role !== 'admin' && $course->instructor_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized to delete this course.'], 403);
        }

        $course->delete();

        return response()->json(['message' => 'Course deleted successfully.']);
    }
}
