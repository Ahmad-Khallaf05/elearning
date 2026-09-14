<?php

namespace App\Http\Controllers;

use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\Course;
use Illuminate\Http\Request;

class QuizController extends Controller
{
    public function attempt(Request $request, Quiz $quiz)
    {
        $this->authorizeStudent($request, $quiz);
        return response()->json(['data' => $quiz->load('questions')]);
    }

    public function submit(Request $request, Quiz $quiz)
    {
        $this->authorizeStudent($request, $quiz);
        $data = $request->validate(['answers' => 'required|array']);
        $quiz->load('questions');
        $points = 0; $earned = 0;
        foreach ($quiz->questions as $question) {
            $points += $question->points;
            if (in_array($question->type, ['single_choice', 'multiple_choice', 'true_false'], true)
                && $this->sameAnswer($data['answers'][$question->id] ?? null, $question->correct_answer)) {
                $earned += $question->points;
            }
        }
        $score = $points ? round(($earned / $points) * 100, 2) : 0;
        $attempt = QuizAttempt::create(['quiz_id' => $quiz->id, 'student_id' => $request->user()->id, 'answers' => $data['answers'], 'score' => $score, 'total_points' => $points, 'passed' => $score >= 60, 'submitted_at' => now()]);
        return response()->json(['data' => $attempt], 201);
    }

    public function analytics(Request $request, int $course)
    {
        abort_unless(in_array($request->user()->role, ['instructor', 'admin'], true), 403);
        $courseModel = Course::findOrFail($course);
        abort_unless($request->user()->role === 'admin' || $courseModel->instructor_id === $request->user()->id, 403);
        return response()->json(['data' => QuizAttempt::whereHas('quiz.lesson.section', fn ($query) => $query->where('course_id', $course))->selectRaw('quiz_id, count(*) attempts, avg(score) average_score')->groupBy('quiz_id')->get()]);
    }

    public function parentReports(Request $request, int $student)
    {
        abort_unless($request->user()->children()->wherePivot('student_id', $student)->wherePivot('status', 'approved')->exists(), 403);
        return response()->json(['data' => QuizAttempt::where('student_id', $student)->with('quiz')->latest()->get()]);
    }

    private function authorizeStudent(Request $request, Quiz $quiz): void
    {
        abort_unless($request->user()->role === 'student', 403);
        abort_unless($request->user()->enrollments()->whereHas('course.sections.lessons', fn ($query) => $query->where('lessons.id', $quiz->lesson_id))->exists(), 403);
    }

    private function sameAnswer(mixed $answer, mixed $correct): bool
    {
        $answer = is_array($answer) ? $answer : [$answer];
        $correct = is_array($correct) ? $correct : [$correct];
        sort($answer); sort($correct);
        return $answer === $correct;
    }
}
