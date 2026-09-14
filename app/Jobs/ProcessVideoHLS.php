<?php

namespace App\Jobs;

use App\Models\Lesson;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Process;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;

class ProcessVideoHLS implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public int $lessonId, public string $sourcePath) {}

    public function handle(): void
    {
        $lesson = Lesson::findOrFail($this->lessonId);
        $lesson->update(['processing_status' => 'processing']);
        $disk = Storage::disk('local');
        $output = 'hls/lessons/'.$lesson->id;
        $keyPath = $output.'/enc.key';
        $disk->makeDirectory($output);
        $disk->put($keyPath, random_bytes(16));
        $keyInfoPath = storage_path('app/'.Str::uuid().'.keyinfo');
        file_put_contents($keyInfoPath, implode(PHP_EOL, [$disk->path($keyPath), '/api/v1/lessons/'.$lesson->id.'/hls-key', bin2hex(random_bytes(16))]).PHP_EOL);
        try {
            foreach ([1080, 720, 480] as $height) {
                $result = Process::run(['ffmpeg', '-y', '-i', $disk->path($this->sourcePath), '-vf', 'scale=-2:'.$height, '-c:v', 'libx264', '-preset', 'medium', '-crf', '22', '-c:a', 'aac', '-b:a', $height >= 1080 ? '192k' : ($height >= 720 ? '128k' : '96k'), '-hls_time', '6', '-hls_playlist_type', 'vod', '-hls_segment_filename', $disk->path($output.'/'.$height.'p_%05d.ts'), '-hls_key_info_file', $keyInfoPath, $disk->path($output.'/'.$height.'p.m3u8')]);
                if ($result->failed()) throw new RuntimeException($result->errorOutput());
            }
            $master = "#EXTM3U\n#EXT-X-VERSION:3\n#EXT-X-STREAM-INF:BANDWIDTH=5000000,RESOLUTION=1920x1080\n1080p.m3u8\n#EXT-X-STREAM-INF:BANDWIDTH=2800000,RESOLUTION=1280x720\n720p.m3u8\n#EXT-X-STREAM-INF:BANDWIDTH=1200000,RESOLUTION=854x480\n480p.m3u8\n";
            $disk->put($output.'/master.m3u8', $master);
            $lesson->update(['hls_path' => $output.'/master.m3u8', 'hls_key_path' => $keyPath, 'processing_status' => 'ready']);
        } catch (\Throwable $exception) {
            $lesson->update(['processing_status' => 'failed']);
            throw $exception;
        } finally {
            @unlink($keyInfoPath);
        }
    }
}