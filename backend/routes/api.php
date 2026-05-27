<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;

Route::prefix('auth')->group(function () {

    // Public Routes
    Route::post('/login', [AuthController::class, 'login']);

    Route::post('/login/pin', [AuthController::class, 'pinLogin']);

    // Protected Routes
    Route::middleware('auth:api')->group(function () {

        Route::post('/logout', [AuthController::class, 'logout']);

        Route::post('/refresh', [AuthController::class, 'refresh']);

        Route::get('/me', [AuthController::class, 'me']);

        Route::post('/password/change', [AuthController::class, 'changePassword']);
        
        
    });

});