<?php

namespace Database\Factories;

use App\Models\Branch;
use App\Models\Customer;
use App\Models\Order;
use App\Models\RestaurantTable;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
class OrderFactory extends Factory
{
    public function definition(): array
    {
        $orderType = fake()->randomElement([
            'dining',
            'takeaway',
            'delivery',
        ]);

        return [
            'branch_id' => Branch::factory(),

            'order_number' => 'ORD-' . fake()->unique()->numerify('######'),

            'table_id' => fake()->boolean(70) ? RestaurantTable::factory() : null,

            'customer_id' => fake()->boolean(60) ? Customer::factory() : null,

            'created_by' => User::factory(),

            'waiter_id' => fake()->boolean(50) ? User::factory() : null,

            'order_type' => $orderType,

            'status' => fake()->randomElement([
                'pending',
                'accepted',
                'preparing',
                'ready',
                'served',
                'completed',
                'cancelled',
            ]),

            'is_online' => fake()->boolean(25),

            'notes' => fake()->optional()->sentence(),
        ];
    }
}
