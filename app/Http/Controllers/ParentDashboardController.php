<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ParentDashboardController extends Controller
{
    public function index(Request $request)
    {
        $children = $request->user()->children()->wherePivot('status', 'approved')->get();
        $data = $children->map(function ($student) {
            $enrollments = $student->enrollments()->with('course.sections.lessons')->get();
            $lessonIds = $enrollments->flatMap(fn ($enrollment) => $enrollment->course->sections->flatMap->lessons->pluck('id'));
            $completed = $student->completedLessons()->whereIn('lessons.id', $lessonIds)->count();
            $progress = $lessonIds->count() ? round($completed / $lessonIds->count() * 100) : 0;
            return ['id' => $student->id, 'name' => $student->name, 'email' => $student->email, 'progress_percentage' => $progress, 'courses' => $enrollments->map(fn ($enrollment) => ['id' => $enrollment->course_id, 'title' => $enrollment->course->title, 'progress_percentage' => $this->courseProgress($student, $enrollment->course)]) , 'recent_quiz_grades' => DB::table('quiz_attempts')->join('quizzes', 'quizzes.id', '=', 'quiz_attempts.quiz_id')->where('quiz_attempts.student_id', $student->id)->orderByDesc('quiz_attempts.created_at')->limit(5)->get(['quizzes.title', 'quiz_attempts.score', 'quiz_attempts.created_at'])];
        });
        return response()->json(['data' => $data]);
    }

    private function courseProgress($student, $course): int
    {
        $lessons = $course->sections->flatMap->lessons;
        if ($lessons->isEmpty()) return 0;
        return (int) round($student->completedLessons()->whereIn('lessons.id', $lessons->pluck('id'))->count() / $lessons->count() * 100);
    }
}
