<?php

namespace App\Http\Controllers;

use App\Models\Lesson;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class HlsController extends Controller
{
    public function key(Request $request, Lesson $lesson)
    {
        abort_unless($lesson->processing_status === 'ready', 404);
        $course = $lesson->section->course;
        abort_unless($request->user()->role === 'admin' || $course->instructor_id === $request->user()->id || $request->user()->enrollments()->where('course_id', $course->id)->exists(), 403);
        return response(Storage::disk('local')->get($lesson->hls_key_path), 200, ['Content-Type' => 'application/octet-stream', 'Cache-Control' => 'private, no-store']);
    }
    public function asset(Request $request, Lesson $lesson, string $asset)
    {
        $this->authorize($request, $lesson);
        abort_unless(preg_match('/^(master|1080p|720p|480p)(?:_\\d{5})?\\.(m3u8|ts)$/', $asset), 404);
        $path = dirname($lesson->hls_path).'/'.$asset;
        abort_unless(Storage::disk('local')->exists($path), 404);
        return response(Storage::disk('local')->get($path), 200, ['Content-Type' => str_ends_with($asset, '.m3u8') ? 'application/vnd.apple.mpegurl' : 'video/mp2t', 'Cache-Control' => 'private, no-store']);
    }

    private function authorize(Request $request, Lesson $lesson): void
    {
        abort_unless($lesson->processing_status === 'ready', 404);
        $course = $lesson->section->course;
        abort_unless($request->user()->role === 'admin' || $course->instructor_id === $request->user()->id || $request->user()->enrollments()->where('course_id', $course->id)->exists(), 403);
    }
}
