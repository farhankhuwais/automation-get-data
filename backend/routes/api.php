<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\JobController;

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/refresh', [AuthController::class, 'refresh'])->middleware('jwt.auth');
    Route::post('/logout', [AuthController::class, 'logout'])->middleware('jwt.auth');
    Route::get('/me', [AuthController::class, 'me'])->middleware('jwt.auth');
});

Route::middleware('jwt.auth')->group(function () {
    Route::post('/jobs', [JobController::class, 'store']);
    Route::get('/jobs/history', [JobController::class, 'history']);
    Route::get('/jobs/{id}', [JobController::class, 'show']);
});

Route::post('/jobs/callback', [JobController::class, 'callback']);
