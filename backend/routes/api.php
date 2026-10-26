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
use App\Http\Controllers\Api\RestaurantTableController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\OrderItemController;
use App\Http\Controllers\Api\OrderBillController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\RawMaterialController;
use App\Http\Controllers\Api\UnitController;
use App\Http\Controllers\Api\RecipeController;
use App\Http\Controllers\Api\VariantController;
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
    Route::post('/menu-categories/{id}/reassign-items', [MenuCategoryController::class, 'reassignItems']);
    Route::apiResource('menu-categories', MenuCategoryController::class);
    Route::apiResource('menu-items', MenuItemController::class);
    Route::apiResource('raw-materials', RawMaterialController::class);
    Route::apiResource('units', UnitController::class);
    Route::apiResource('recipes', RecipeController::class);
    Route::apiResource('variants', VariantController::class);
    Route::apiResource('menu-item-images', MenuItemImageController::class);
    Route::apiResource('menus', MenuController::class);
    Route::put('/menus/{menu}/branches', [MenuController::class, 'updateBranches']);
    Route::patch('/menus/{menu}/availability', [MenuController::class, 'updateAvailability']);

    Route::post('/menus/{menu}/items', [MenuMenuItemController::class, 'attach']);
    Route::get('/menus/{menu}/items', [MenuMenuItemController::class, 'index']);
    Route::put('/menus/{menu}/items', [MenuMenuItemController::class, 'sync']);
    Route::delete('/menus/{menu}/items/{item}', [MenuMenuItemController::class, 'detach']);
    Route::put('/menus/{menu}/items/{item}/order', [MenuMenuItemController::class, 'updateOrder']);

    Route::apiResource('restaurant-tables', RestaurantTableController::class);
    Route::apiResource('orders', OrderController::class);

    Route::get('/orders/{order}/items', [OrderItemController::class, 'getItems']);
    Route::post('/orders/{order}/items', [OrderItemController::class, 'addItem']);
    Route::put('/orders/{order}/items/{item}', [OrderItemController::class, 'updateQuantity']);
    Route::delete('/orders/{order}/items/{item}', [OrderItemController::class, 'removeItem']);
    Route::patch('/orders/{order}/items/{item}/status', [OrderItemController::class, 'updateStatus']);
    Route::get('/orders/{order}/items/{item}', [OrderItemController::class, 'show']);

});
