<?php

namespace Database\Factories;

use App\Models\ScrollJob;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ScrollJobFactory extends Factory
{
    protected $model = ScrollJob::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'durasi' => $this->faker->numberBetween(10, 300),
            'durasi_aktual' => null,
            'status' => ScrollJob::STATUS_PENDING,
            'videos_json' => null,
            'error_message' => null,
            'started_at' => null,
            'completed_at' => null,
        ];
    }

    public function processing(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => ScrollJob::STATUS_PROCESSING,
            'started_at' => now(),
        ]);
    }

    public function completed(): static
    {
        $videos = [];
        for ($i = 0; $i < 5; $i++) {
            $videos[] = [
                'title' => $this->faker->sentence(4),
                'url' => 'https://youtube.com/watch?v=' . $this->faker->uuid(),
                'channel' => $this->faker->name(),
            ];
        }

        return $this->state(fn (array $attributes) => [
            'status' => ScrollJob::STATUS_COMPLETED,
            'durasi_aktual' => $attributes['durasi'] + $this->faker->numberBetween(1, 5),
            'videos_json' => $videos,
            'started_at' => now()->subMinutes(2),
            'completed_at' => now(),
        ]);
    }

    public function failed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => ScrollJob::STATUS_FAILED,
            'error_message' => $this->faker->sentence(),
            'started_at' => now()->subMinutes(1),
            'completed_at' => now(),
        ]);
    }
}
