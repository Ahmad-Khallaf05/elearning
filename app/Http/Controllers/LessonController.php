<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Section;
use App\Models\Lesson;
use Illuminate\Http\Request;
use App\Http\Resources\LessonResource;
use Illuminate\Support\Facades\Storage;

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
        $sourceType = strtolower((string) $request->input('source_type', 'url'));

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'type' => 'required|in:vod,live',
            'source_type' => 'sometimes|in:url,upload,website,file',
            'vod_url' => 'sometimes|nullable|url|max:2048',
            'website_url' => 'sometimes|nullable|url|max:2048',
            'video_file' => 'sometimes|nullable|file|mimetypes:video/mp4|max:204800',
            'document_file' => 'sometimes|nullable|file|mimes:pdf,doc,docx,ppt,pptx|max:51200',
            'live_metadata' => 'required_if:type,live|nullable|array',
            'order' => 'sometimes|integer|min:0|max:2147483647',
        ]);

        $videoUrl = null;
        $websiteUrl = null;
        $filePath = null;
        $attachmentPath = null;
        $attachmentName = null;

        if ($request->input('type') === 'vod') {
            if ($sourceType === 'upload' && $request->hasFile('video_file')) {
                $filePath = $request->file('video_file')->store('lesson-videos', 'local');
            } elseif ($sourceType === 'url') {
                $videoUrl = $request->input('vod_url');
            } elseif ($sourceType === 'website') {
                $websiteUrl = $request->input('website_url');
            } elseif ($sourceType === 'file' && $request->hasFile('document_file')) {
                $attachmentPath = $request->file('document_file')->store('lesson-files', 'local');
                $attachmentName = $request->file('document_file')->getClientOriginalName();
            }
        }

        $lesson = $section->lessons()->create([
            'title' => $validated['title'],
            'type' => $validated['type'],
            'source_type' => $sourceType,
            'vod_url' => $videoUrl,
            'website_url' => $websiteUrl,
            'file_path' => $filePath,
            'attachment_path' => $attachmentPath,
            'attachment_name' => $attachmentName,
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
        $sourceType = strtolower((string) $request->input('source_type', $lesson->source_type ?? 'url'));
        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'type' => 'sometimes|in:vod,live',
            'source_type' => 'sometimes|in:url,upload,website,file',
            'vod_url' => 'sometimes|nullable|url|max:2048',
            'website_url' => 'sometimes|nullable|url|max:2048',
            'video_file' => 'sometimes|nullable|file|mimetypes:video/mp4|max:204800',
            'document_file' => 'sometimes|nullable|file|mimes:pdf,doc,docx,ppt,pptx|max:51200',
            'live_metadata' => 'sometimes|nullable|array',
            'order' => 'sometimes|integer|min:0|max:2147483647',
        ]);

        if ($effectiveType === 'vod') {
            $videoUrl = $request->input('vod_url', $lesson->vod_url);
            $websiteUrl = $request->input('website_url', $lesson->website_url);
            $filePath = $lesson->file_path;
            $attachmentPath = $lesson->attachment_path;
            $attachmentName = $lesson->attachment_name;

            if ($sourceType === 'upload' && $request->hasFile('video_file')) {
                $filePath = $request->file('video_file')->store('lesson-videos', 'local');
                $videoUrl = null;
                $websiteUrl = null;
                $attachmentPath = null;
                $attachmentName = null;
            } elseif ($sourceType === 'url') {
                $videoUrl = $request->input('vod_url', $lesson->vod_url);
                $websiteUrl = null;
                $attachmentPath = null;
                $attachmentName = null;
            } elseif ($sourceType === 'website') {
                $videoUrl = null;
                $websiteUrl = $request->input('website_url', $lesson->website_url);
                $attachmentPath = null;
                $attachmentName = null;
            } elseif ($sourceType === 'file' && $request->hasFile('document_file')) {
                $videoUrl = null;
                $websiteUrl = null;
                $attachmentPath = $request->file('document_file')->store('lesson-files', 'local');
                $attachmentName = $request->file('document_file')->getClientOriginalName();
            }

            $validated['source_type'] = $sourceType;
            $validated['vod_url'] = $videoUrl;
            $validated['website_url'] = $websiteUrl;
            $validated['file_path'] = $filePath;
            $validated['attachment_path'] = $attachmentPath;
            $validated['attachment_name'] = $attachmentName;
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
