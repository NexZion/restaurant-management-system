<?php

namespace Database\Seeders;

use App\Models\Branch;
use App\Models\Customer;
use App\Models\Order;
use App\Models\RestaurantTable;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class OrderSeeder extends Seeder
{
    public function run(): void
    {
        $branchIds = Branch::query()->pluck('id');
        $userIds = User::query()->pluck('id');
        $tableIds = RestaurantTable::query()->pluck('id');
        $customerIds = Customer::query()->pluck('id');

        if ($branchIds->isEmpty() || $userIds->isEmpty()) {
            return;
        }

        Order::factory()
            ->count(30)
            ->state(function () use ($branchIds, $userIds, $tableIds, $customerIds): array {
                return [
                    'branch_id' => $branchIds->random(),
                    'created_by' => $userIds->random(),
                    'waiter_id' => fake()->boolean(50) ? $userIds->random() : null,
                    'table_id' => $tableIds->isNotEmpty() && fake()->boolean(70) ? $tableIds->random() : null,
                    'customer_id' => $customerIds->isNotEmpty() && fake()->boolean(60) ? $customerIds->random() : null,
                ];
            })
            ->create();
    }
}
