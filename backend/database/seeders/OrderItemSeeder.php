<?php

namespace Database\Seeders;

use App\Models\MenuItem;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class OrderItemSeeder extends Seeder
{
    public function run(): void
    {
        $orderIds = Order::query()->pluck('id');
        $menuItemIds = MenuItem::query()->pluck('id');

        if ($orderIds->isEmpty() || $menuItemIds->isEmpty()) {
            return;
        }

        OrderItem::factory()
            ->count(60)
            ->state(function () use ($orderIds, $menuItemIds): array {
                return [
                    'order_id' => $orderIds->random(),
                    'menu_item_id' => $menuItemIds->random(),
                ];
            })
            ->create();
    }
}
