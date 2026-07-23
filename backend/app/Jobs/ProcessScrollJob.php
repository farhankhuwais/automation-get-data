<?php

namespace App\Jobs;

use App\Models\ScrollJob;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Log;

class ProcessScrollJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 60;

    public function __construct(
        public ScrollJob $scrollJob
    ) {
        $this->onQueue('scroll_jobs');
    }

    public function handle(): void
    {
        Log::info('Processing scroll job', ['job_id' => $this->scrollJob->id]);

        $jobPayload = [
            'job_id' => $this->scrollJob->id,
            'durasi' => $this->scrollJob->durasi,
            'callback_url' => config('app.url') . '/api/jobs/callback',
            'timestamp' => now()->toIso8601String(),
        ];

        Redis::lpush('scroll_jobs', json_encode($jobPayload));

        Log::info('Job pushed to Redis queue', [
            'job_id' => $this->scrollJob->id,
            'queue' => 'scroll_jobs'
        ]);
    }

    public function failed(\Throwable $exception): void
    {
        Log::error('Failed to process scroll job', [
            'job_id' => $this->scrollJob->id,
            'error' => $exception->getMessage()
        ]);

        $this->scrollJob->update([
            'status' => ScrollJob::STATUS_FAILED,
            'error_message' => 'Queue processing failed: ' . $exception->getMessage(),
            'completed_at' => now(),
        ]);
    }
}
