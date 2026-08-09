<?php

namespace App\Providers;

use App\Models\Order;
use App\Models\OrderBill;
use App\Models\OrderDiscount;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Refund;
use App\Models\Reservation;
use App\Models\TableSession;
use App\Observers\AuditObserver;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        foreach ([
            Order::class, OrderItem::class, OrderBill::class, Payment::class,
            Refund::class, OrderDiscount::class, Reservation::class, TableSession::class,
        ] as $model) {
            $model::observe(AuditObserver::class);
        }
    }
}
