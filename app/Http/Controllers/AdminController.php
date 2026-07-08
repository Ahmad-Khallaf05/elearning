<?php

namespace App\Http\Controllers;

use App\Models\Course;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function pendingCourses()
    {
        // Fetch pending courses with their instructor
        $courses = Course::with('instructor')
            ->where('approval_status', 'pending')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['data' => $courses]);
    }

    public function updateCourseStatus(Request $request, Course $course)
    {
        $validated = $request->validate([
            'status' => 'required|in:approved,rejected',
        ]);

        $course->update([
            'approval_status' => $validated['status']
        ]);

        return response()->json([
            'message' => 'Course status updated successfully.',
            'data' => $course
        ]);
    }
}
