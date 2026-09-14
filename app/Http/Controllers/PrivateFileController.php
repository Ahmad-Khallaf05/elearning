<?php

namespace App\Http\Controllers;

use App\Models\Lesson;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PrivateFileController extends Controller
{
    public function lessonAttachment(Request $request, Lesson $lesson): StreamedResponse
    {
        $course = $lesson->section->course;
        abort_unless($request->user()->role === 'admin' || $course->instructor_id === $request->user()->id || $request->user()->enrollments()->where('course_id', $course->id)->exists(), 403);
        abort_unless($lesson->attachment_path && Storage::disk('local')->exists($lesson->attachment_path), 404);
        $headers = ['Content-Disposition' => 'attachment; filename="'.addcslashes($lesson->attachment_name ?: 'attachment', '"').'"'];
        if (config('filesystems.private_accel_internal')) {
            return response()->streamDownload(fn () => null, $lesson->attachment_name, ['X-Accel-Redirect' => '/protected/'.ltrim($lesson->attachment_path, '/')]);
        }
        return Storage::disk('local')->download($lesson->attachment_path, $lesson->attachment_name, $headers);
    }
}
