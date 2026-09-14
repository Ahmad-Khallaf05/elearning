<?php

namespace App\Http\Controllers;

use App\Jobs\ProcessVideoHLS;
use App\Models\Lesson;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class VideoUploadController extends Controller
{
    public function chunk(Request $request, Lesson $lesson)
    {
        abort_unless($request->user()->role === 'instructor' && $lesson->section->course->instructor_id === $request->user()->id, 403);
        $data = $request->validate(['upload_id' => 'required|alpha_dash|max:100', 'chunk' => 'required|integer|min:0', 'total_chunks' => 'required|integer|min:1|max:10000', 'video' => 'required|file|max:512000']);
        $path = 'uploads/'.$lesson->id.'/'.$data['upload_id'].'/'.$data['chunk'].'.part';
        Storage::disk('local')->put($path, $request->file('video')->getContent());
        return response()->json(['uploaded' => (int) $data['chunk'], 'upload_id' => $data['upload_id']]);
    }

    public function complete(Request $request, Lesson $lesson)
    {
        abort_unless($request->user()->role === 'instructor' && $lesson->section->course->instructor_id === $request->user()->id, 403);
        $data = $request->validate(['upload_id' => 'required|alpha_dash|max:100', 'total_chunks' => 'required|integer|min:1|max:10000']);
        $disk = Storage::disk('local');
        $source = 'uploads/'.$lesson->id.'/'.$data['upload_id'].'/source.mp4';
        $handle = fopen($disk->path($source), 'wb');
        for ($chunk = 0; $chunk < $data['total_chunks']; $chunk++) {
            $part = 'uploads/'.$lesson->id.'/'.$data['upload_id'].'/'.$chunk.'.part';
            abort_unless($disk->exists($part), 422, 'Missing upload chunk.');
            fwrite($handle, $disk->get($part));
        }
        fclose($handle);
        $lesson->update(['source_type' => 'upload', 'file_path' => $source, 'processing_status' => 'pending']);
        ProcessVideoHLS::dispatch($lesson->id, $source);
        return response()->json(['message' => 'Video queued for processing.', 'lesson_id' => $lesson->id], 202);
    }
}
