<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Api\BranchController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\MenuCategoryController;
use App\Http\Controllers\Api\MenuItemController;
use App\Http\Controllers\Api\MenuItemImageController;
/*
|--------------------------------------------------------------------------
| Authentication Routes
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| Branch Routes
|--------------------------------------------------------------------------
*/

Route::middleware('auth:api')->group(function () {

    Route::post('/branches', [BranchController::class, 'store']);
    Route::get('/branches', [BranchController::class, 'index']);
    Route::get('/branches/{id}', [BranchController::class, 'show']);
    Route::put('/branches/{id}', [BranchController::class, 'update']);
    Route::delete('/branches/{id}', [BranchController::class, 'destroy']);
});


Route::middleware('auth:api')->group(function () {

    Route::apiResource('roles', RoleController::class);
    Route::apiResource('users', UserController::class);
    Route::apiResource('customers', CustomerController::class); 
    Route::apiResource('menu-categories', MenuCategoryController::class);
    Route::apiResource('menu-items', MenuItemController::class);
    Route::apiResource('menu-item-images', MenuItemImageController::class);
});
