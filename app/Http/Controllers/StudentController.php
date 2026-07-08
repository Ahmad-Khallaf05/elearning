<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Lesson;
use App\Models\Enrollment;
use Illuminate\Support\Facades\Auth;

class StudentController extends Controller
{
    public function enrollments(Request $request)
    {
        $user = $request->user();
        
        $enrollments = Enrollment::with(['course.sections.lessons'])
            ->where('student_id', $user->id)
            ->get();

        // Calculate progress for each enrollment
        $completedLessonIds = $user->completedLessons()->pluck('lessons.id')->toArray();

        $enrollments->transform(function ($enrollment) use ($completedLessonIds) {
            $course = $enrollment->course;
            
            $totalLessons = 0;
            $completedCount = 0;
            $courseLessonIds = [];

            foreach ($course->sections as $section) {
                foreach ($section->lessons as $lesson) {
                    $totalLessons++;
                    $courseLessonIds[] = $lesson->id;
                    if (in_array($lesson->id, $completedLessonIds)) {
                        $completedCount++;
                    }
                }
            }

            $progressPercentage = $totalLessons > 0 ? round(($completedCount / $totalLessons) * 100) : 0;
            $courseCompletedLessonIds = array_values(array_intersect($completedLessonIds, $courseLessonIds));
            
            // Format response to include course and calculated progress
            $courseData = $course->toArray();
            $courseData['progress_percentage'] = $progressPercentage;
            
            return [
                'id' => $enrollment->id,
                'course_id' => $course->id,
                'access_granted_at' => $enrollment->access_granted_at,
                'completed_lesson_ids' => $courseCompletedLessonIds,
                'course' => $courseData
            ];
        });

        return response()->json(['data' => $enrollments]);
    }

    public function toggleLessonComplete(Request $request, Lesson $lesson)
    {
        $user = $request->user();
        
        // Verify user is enrolled in the course this lesson belongs to
        $courseId = $lesson->section->course_id;
        
        $isEnrolled = Enrollment::where('student_id', $user->id)
            ->where('course_id', $courseId)
            ->exists();
            
        if (!$isEnrolled) {
            return response()->json(['message' => 'You are not enrolled in this course.'], 403);
        }

        // Toggle completion
        $user->completedLessons()->toggle($lesson->id);

        return response()->json(['message' => 'Lesson completion status updated.']);
    }
}
