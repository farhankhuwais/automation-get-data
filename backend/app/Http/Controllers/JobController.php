<?php

namespace App\Http\Controllers;

use App\Http\Requests\SubmitJobRequest;
use App\Models\ScrollJob;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Log;

class JobController extends Controller
{
    public function store(SubmitJobRequest $request): JsonResponse
    {
        $user = auth('api')->user();

        $job = ScrollJob::create([
            'user_id' => $user->id,
            'durasi' => $request->durasi,
            'status' => ScrollJob::STATUS_PROCESSING,
            'started_at' => now(),
        ]);

        $jobPayload = [
            'job_id' => $job->id,
            'durasi' => $job->durasi,
            'callback_url' => config('app.url') . '/api/jobs/callback',
            'timestamp' => now()->toIso8601String(),
        ];

        Redis::lpush('scroll_jobs', json_encode($jobPayload));

        Log::info('Job pushed to Redis', ['job_id' => $job->id, 'queue' => 'scroll_jobs']);

        return response()->json([
            'success' => true,
            'data' => [
                'job_id' => $job->id,
                'status' => 'queued'
            ]
        ], 201);
    }

    public function history(Request $request): JsonResponse
    {
        $user = auth('api')->user();
        $perPage = $request->get('per_page', 15);

        $jobs = ScrollJob::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        $items = $jobs->getCollection()->map(function ($job) {
            return [
                'id' => $job->id,
                'durasi' => $job->durasi,
                'durasi_aktual' => $job->durasi_aktual,
                'status' => $job->status,
                'videos_json' => $job->videos_json,
                'videos_count' => is_array($job->videos_json) ? count($job->videos_json) : 0,
                'error_message' => $job->error_message,
                'created_at' => $job->created_at,
                'completed_at' => $job->completed_at,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $items,
            'pagination' => [
                'current_page' => $jobs->currentPage(),
                'per_page' => $jobs->perPage(),
                'total' => $jobs->total(),
                'last_page' => $jobs->lastPage(),
            ]
        ]);
    }

    public function show(string $id): JsonResponse
    {
        $user = auth('api')->user();

        $job = ScrollJob::where('id', $id)
            ->where('user_id', $user->id)
            ->first();

        if (!$job) {
            return response()->json([
                'success' => false,
                'message' => 'Job not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $job
        ]);
    }

    public function callback(Request $request): JsonResponse
    {
        $request->validate([
            'job_id' => 'required|integer',
            'status' => 'required|string|in:completed,failed',
            'durasi_aktual' => 'nullable|integer',
            'videos' => 'nullable|array',
            'timestamp' => 'nullable|string',
            'error_message' => 'nullable|string',
        ]);

        $job = ScrollJob::find($request->job_id);

        if (!$job) {
            return response()->json([
                'success' => false,
                'message' => 'Job not found'
            ], 404);
        }

        $updateData = [
            'status' => $request->status,
            'durasi_aktual' => $request->durasi_aktual,
            'videos_json' => $request->videos ?? [],
            'completed_at' => $request->timestamp ?? now(),
        ];

        if ($request->has('error_message')) {
            $updateData['error_message'] = $request->error_message;
        }

        $job->update($updateData);

        Log::info('Job callback received', ['job_id' => $job->id, 'status' => $request->status, 'videos_count' => count($request->videos ?? [])]);

        return response()->json([
            'success' => true,
            'message' => 'Job updated successfully'
        ]);
    }
}
