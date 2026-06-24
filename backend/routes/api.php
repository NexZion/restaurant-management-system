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
use App\Http\Controllers\Api\MenuController;
use App\Http\Controllers\Api\MenuMenuItemController;
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
    
    Route::apiResource('roles', RoleController::class);
    Route::apiResource('users', UserController::class);
    Route::apiResource('customers', CustomerController::class);
    Route::apiResource('branches', BranchController::class);    
    Route::apiResource('menu-categories', MenuCategoryController::class);
    Route::apiResource('menu-items', MenuItemController::class);
    Route::apiResource('menu-item-images', MenuItemImageController::class);
    Route::apiResource( 'menus', MenuController::class);
    Route::post('/menus/{menu}/items', [MenuMenuItemController::class, 'attach']);
    Route::get('/menus/{menu}/items', [MenuMenuItemController::class, 'index']);
    Route::delete('/menus/{menu}/items/{item}', [MenuMenuItemController::class, 'detach']);
    Route::put('/menus/{menu}/items/{item}/order', [MenuMenuItemController::class, 'updateOrder']);
    
});
