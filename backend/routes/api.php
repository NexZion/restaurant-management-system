<?php

use App\Http\Controllers\Api\BranchController;
use App\Http\Controllers\Api\BusinessModuleController;
use App\Http\Controllers\Api\CashierShiftController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\KitchenStationController;
use App\Http\Controllers\Api\KitchenTicketController;
use App\Http\Controllers\Api\MenuCategoryController;
use App\Http\Controllers\Api\MenuController;
use App\Http\Controllers\Api\MenuItemController;
use App\Http\Controllers\Api\MenuItemImageController;
use App\Http\Controllers\Api\MenuMenuItemController;
use App\Http\Controllers\Api\OrderBillController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\OrderDeliveryController;
use App\Http\Controllers\Api\OrderDiscountController;
use App\Http\Controllers\Api\OrderItemController;
use App\Http\Controllers\Api\OrderWorkflowController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\PaymentMethodController;
use App\Http\Controllers\Api\PrinterOperationController;
use App\Http\Controllers\Api\RefundController;
use App\Http\Controllers\Api\ReportingController;
use App\Http\Controllers\Api\ReservationController;
use App\Http\Controllers\Api\RestaurantTableController;
use App\Http\Controllers\Api\RmsCatalogController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\SalesOperationController;
use App\Http\Controllers\Api\TableSessionController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Auth\AuthController;
use Illuminate\Support\Facades\Route;

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

    foreach ([
        'menu-item-variants', 'attributes', 'attribute-values', 'variant-attributes',
        'modifier-groups', 'modifier-options', 'menu-item-modifier-groups',
        'reservation-tables', 'restaurant-sections', 'restaurant-floors', 'taxes',
        'branch-menu-items', 'pos-terminals', 'cashier-shifts', 'customer-addresses', 'printers',
        'permissions', 'reason-codes', 'document-sequences',
    ] as $catalogResource) {
        Route::apiResource($catalogResource, RmsCatalogController::class)
            ->parameters([$catalogResource => 'catalog']);
    }

    foreach ([
        'promotions', 'coupons', 'reservation-deposits', 'inventory-items',
        'suppliers', 'purchase-orders', 'purchase-order-items',
        'recipes', 'recipe-ingredients', 'accounts', 'journal-entries',
    ] as $businessResource) {
        Route::apiResource($businessResource, BusinessModuleController::class)
            ->parameters([$businessResource => 'module']);
    }
    Route::apiResource('stock-levels', BusinessModuleController::class)
        ->only(['index', 'show'])->parameters(['stock-levels' => 'module']);
    foreach (['stock-movements', 'wastages', 'loyalty-transactions'] as $operationalResource) {
        Route::apiResource($operationalResource, BusinessModuleController::class)
            ->except(['store'])->parameters([$operationalResource => 'module']);
    }

    Route::patch('/reservation-deposits/{reservationDeposit}/status', [SalesOperationController::class, 'deposit']);

    Route::get('/dashboard/summary', [ReportingController::class, 'dashboard']);
    Route::get('/payments', [ReportingController::class, 'payments']);
    Route::get('/orders/{order}/history', [ReportingController::class, 'orderHistory']);
    Route::get('/orders/{order}/items/{item}/history', [ReportingController::class, 'itemHistory']);
    Route::post('/printers/{printer}/test', [PrinterOperationController::class, 'test']);

    Route::apiResource('roles', RoleController::class);
    Route::apiResource('users', UserController::class);
    Route::apiResource('customers', CustomerController::class);
    Route::apiResource('branches', BranchController::class)
        ->only(['index', 'show']);
    Route::apiResource('branches', BranchController::class)
        ->only(['store', 'update', 'destroy']);
    Route::apiResource('menu-categories', MenuCategoryController::class);
    Route::apiResource('menu-items', MenuItemController::class);
    Route::apiResource('menu-item-images', MenuItemImageController::class);
    Route::apiResource('menus', MenuController::class);

    Route::group([], function () {
        Route::post('/menus/{menu}/items', [MenuMenuItemController::class, 'attach']);
        Route::get('/menus/{menu}/items', [MenuMenuItemController::class, 'index']);
        Route::delete('/menus/{menu}/items/{item}', [MenuMenuItemController::class, 'detach']);
        Route::put('/menus/{menu}/items/{item}/order', [MenuMenuItemController::class, 'updateOrder']);
    });

    Route::apiResource('restaurant-tables', RestaurantTableController::class);
    Route::apiResource('reservations', ReservationController::class);
    Route::apiResource('table-sessions', TableSessionController::class);
    Route::apiResource('kitchen-stations', KitchenStationController::class);
    Route::apiResource('kitchen-tickets', KitchenTicketController::class);
    Route::apiResource('payment-methods', PaymentMethodController::class);
    Route::apiResource('refunds', RefundController::class);
    Route::apiResource('order-deliveries', OrderDeliveryController::class);
    Route::apiResource('order-discounts', OrderDiscountController::class);
    Route::apiResource('orders', OrderController::class);
    Route::post('/cashier-shifts/open', [CashierShiftController::class, 'open']);
    Route::post('/cashier-shifts/{cashierShift}/close', [CashierShiftController::class, 'close']);

    Route::get('/orders/{order}/items', [OrderItemController::class, 'getItems']);
    Route::post('/orders/{order}/items', [OrderItemController::class, 'addItem']);
    Route::put('/orders/{order}/items/{item}', [OrderItemController::class, 'updateQuantity']);
    Route::delete('/orders/{order}/items/{item}', [OrderItemController::class, 'removeItem']);
    Route::patch('/orders/{order}/items/{item}/status', [OrderItemController::class, 'updateStatus']);
    Route::post('/orders/{order}/items/{item}/transfer', [OrderWorkflowController::class, 'transfer'])->scopeBindings();
    Route::post('/orders/{order}/merge', [OrderWorkflowController::class, 'merge']);
    Route::get('/orders/{order}/items/{item}', [OrderItemController::class, 'show']);

    Route::post('/orders/{order}/bill', [OrderBillController::class, 'generateBill']);
    Route::get('/orders/{order}/bill', [OrderBillController::class, 'show']);
    Route::delete('/orders/{order}/bill', [OrderBillController::class, 'destroy']);

    Route::post('/bills/{bill}/pay', [PaymentController::class, 'pay']);
    Route::post('/bills/{bill}/split', [OrderWorkflowController::class, 'split']);
    Route::get('/bills/{bill}/payments', [PaymentController::class, 'show']);
    Route::get('/bills/{bill}/payment', [PaymentController::class, 'show']);
    Route::put('/bills/{bill}/payments/{payment}', [PaymentController::class, 'update']);
    Route::delete('/bills/{bill}/payments/{payment}', [PaymentController::class, 'destroy']);
});
