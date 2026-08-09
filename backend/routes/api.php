<?php

use App\Http\Controllers\Api\AccountingOperationController;
use App\Http\Controllers\Api\AuditLogController;
use App\Http\Controllers\Api\BranchController;
use App\Http\Controllers\Api\BusinessModuleController;
use App\Http\Controllers\Api\CashierShiftController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\InventoryOperationController;
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
            ->parameters([$catalogResource => 'catalog'])
            ->middleware('permission:catalog.manage');
    }

    foreach ([
        'promotions', 'coupons', 'reservation-deposits', 'inventory-items',
        'suppliers', 'purchase-orders', 'purchase-order-items',
        'recipes', 'recipe-ingredients', 'accounts', 'journal-entries',
    ] as $businessResource) {
        Route::apiResource($businessResource, BusinessModuleController::class)
            ->parameters([$businessResource => 'module'])
            ->middleware("permission:{$businessResource}.manage");
    }
    Route::apiResource('stock-levels', BusinessModuleController::class)
        ->only(['index', 'show'])->parameters(['stock-levels' => 'module'])
        ->middleware('permission:stock-levels.manage');
    foreach (['stock-movements', 'wastages', 'loyalty-transactions'] as $operationalResource) {
        Route::apiResource($operationalResource, BusinessModuleController::class)
            ->except(['store'])->parameters([$operationalResource => 'module'])
            ->middleware("permission:{$operationalResource}.manage");
    }

    Route::post('/stock-movements', [InventoryOperationController::class, 'movement'])->middleware('permission:stock-movements.manage');
    Route::post('/wastages', [InventoryOperationController::class, 'wastage'])->middleware('permission:wastages.manage');
    Route::post('/purchase-orders/{purchaseOrder}/receive', [InventoryOperationController::class, 'receive'])->middleware('permission:purchase-orders.manage');
    Route::post('/orders/{order}/consume-inventory', [InventoryOperationController::class, 'consume'])->middleware('permission:inventory-items.manage');
    Route::post('/customers/{customer}/loyalty-transactions', [SalesOperationController::class, 'loyalty'])->middleware('permission:loyalty-transactions.manage');
    Route::post('/orders/{order}/apply-promotion', [SalesOperationController::class, 'promotion'])->middleware('permission:discounts.manage');
    Route::patch('/reservation-deposits/{reservationDeposit}/status', [SalesOperationController::class, 'deposit'])->middleware('permission:reservation-deposits.manage');
    Route::post('/journal-entries/{journalEntry}/post', [AccountingOperationController::class, 'post'])->middleware('permission:journal-entries.manage');
    Route::post('/journal-entries/{journalEntry}/reverse', [AccountingOperationController::class, 'reverse'])->middleware('permission:journal-entries.manage');

    Route::get('/dashboard/summary', [ReportingController::class, 'dashboard'])->middleware('permission:dashboard.view');
    Route::get('/payments', [ReportingController::class, 'payments'])->middleware('permission:payments.manage');
    Route::get('/orders/{order}/history', [ReportingController::class, 'orderHistory'])->middleware('permission:orders.manage');
    Route::get('/orders/{order}/items/{item}/history', [ReportingController::class, 'itemHistory'])->middleware('permission:orders.manage');
    Route::apiResource('audit-logs', AuditLogController::class)->only(['index', 'show'])->middleware('permission:audit-logs.view');
    Route::post('/printers/{printer}/test', [PrinterOperationController::class, 'test'])->middleware('permission:catalog.manage');

    Route::apiResource('roles', RoleController::class)->middleware('permission:roles.manage');
    Route::apiResource('users', UserController::class)->middleware('permission:users.manage');
    Route::apiResource('customers', CustomerController::class)->middleware('permission:customers.manage');
    Route::apiResource('branches', BranchController::class)
        ->only(['index', 'show']);
    Route::apiResource('branches', BranchController::class)
        ->only(['store', 'update', 'destroy'])
        ->middleware('permission:branches.manage');
    Route::apiResource('menu-categories', MenuCategoryController::class)->middleware('permission:menu.manage');
    Route::apiResource('menu-items', MenuItemController::class)->middleware('permission:menu.manage');
    Route::apiResource('menu-item-images', MenuItemImageController::class)->middleware('permission:menu.manage');
    Route::apiResource('menus', MenuController::class)->middleware('permission:menu.manage');

    Route::middleware('permission:menu.manage')->group(function () {
        Route::post('/menus/{menu}/items', [MenuMenuItemController::class, 'attach']);
        Route::get('/menus/{menu}/items', [MenuMenuItemController::class, 'index']);
        Route::delete('/menus/{menu}/items/{item}', [MenuMenuItemController::class, 'detach']);
        Route::put('/menus/{menu}/items/{item}/order', [MenuMenuItemController::class, 'updateOrder']);
    });

    Route::apiResource('restaurant-tables', RestaurantTableController::class)->middleware('permission:tables.manage');
    Route::apiResource('reservations', ReservationController::class)->middleware('permission:reservations.manage');
    Route::apiResource('table-sessions', TableSessionController::class)->middleware('permission:tables.manage');
    Route::apiResource('kitchen-stations', KitchenStationController::class)->middleware('permission:kitchen.manage');
    Route::apiResource('kitchen-tickets', KitchenTicketController::class)->middleware('permission:kitchen.manage');
    Route::apiResource('payment-methods', PaymentMethodController::class)->middleware('permission:payments.manage');
    Route::apiResource('refunds', RefundController::class)->middleware('permission:refunds.manage');
    Route::apiResource('order-deliveries', OrderDeliveryController::class)->middleware('permission:orders.manage');
    Route::apiResource('order-discounts', OrderDiscountController::class)->middleware('permission:discounts.manage');
    Route::apiResource('orders', OrderController::class)->middleware('permission:orders.manage');
    Route::post('/cashier-shifts/open', [CashierShiftController::class, 'open'])->middleware('permission:shifts.manage');
    Route::post('/cashier-shifts/{cashierShift}/close', [CashierShiftController::class, 'close'])->middleware('permission:shifts.manage');

    Route::get('/orders/{order}/items', [OrderItemController::class, 'getItems'])->middleware('permission:orders.manage');
    Route::post('/orders/{order}/items', [OrderItemController::class, 'addItem'])->middleware('permission:orders.manage');
    Route::put('/orders/{order}/items/{item}', [OrderItemController::class, 'updateQuantity'])->middleware('permission:orders.manage');
    Route::delete('/orders/{order}/items/{item}', [OrderItemController::class, 'removeItem'])->middleware('permission:orders.manage');
    Route::patch('/orders/{order}/items/{item}/status', [OrderItemController::class, 'updateStatus'])->middleware('permission:orders.status');
    Route::post('/orders/{order}/items/{item}/transfer', [OrderWorkflowController::class, 'transfer'])->scopeBindings()->middleware('permission:orders.transfer');
    Route::post('/orders/{order}/merge', [OrderWorkflowController::class, 'merge'])->middleware('permission:orders.merge');
    Route::get('/orders/{order}/items/{item}', [OrderItemController::class, 'show'])->middleware('permission:orders.manage');

    Route::post('/orders/{order}/bill', [OrderBillController::class, 'generateBill'])->middleware('permission:bills.manage');
    Route::get('/orders/{order}/bill', [OrderBillController::class, 'show'])->middleware('permission:bills.manage');
    Route::delete('/orders/{order}/bill', [OrderBillController::class, 'destroy'])->middleware('permission:bills.manage');

    Route::post('/bills/{bill}/pay', [PaymentController::class, 'pay'])->middleware('permission:payments.manage');
    Route::post('/bills/{bill}/split', [OrderWorkflowController::class, 'split'])->middleware('permission:bills.split');
    Route::get('/bills/{bill}/payments', [PaymentController::class, 'show'])->middleware('permission:payments.manage');
    Route::get('/bills/{bill}/payment', [PaymentController::class, 'show'])->middleware('permission:payments.manage');
    Route::put('/bills/{bill}/payments/{payment}', [PaymentController::class, 'update'])->middleware('permission:payments.manage');
    Route::delete('/bills/{bill}/payments/{payment}', [PaymentController::class, 'destroy'])->middleware('permission:payments.manage');
});
