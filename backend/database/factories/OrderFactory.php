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
            'dine_in',
            'takeaway',
            'delivery',
        ]);

        return [
            'branch_id' => Branch::factory(),

            'order_number' => 'ORD-' . fake()->unique()->numerify('######'),

            'table_id' => fake()->boolean(70) ? RestaurantTable::factory() : null,

            'customer_id' => fake()->boolean(60) ? Customer::factory() : null,

            'created_by' => User::factory(),

            'assigned_by' => fake()->boolean(50) ? User::factory() : null,

            'order_type' => $orderType,

            'status' => fake()->randomElement([
                'draft',
                'confirmed',
                'preparing',
                'ready',
                'served',
                'completed',
                'cancelled',
            ]),

            'payment_status' => 'unpaid',
            'subtotal' => 0,
            'discount_total' => 0,
            'tax_total' => 0,
            'service_charge_total' => 0,
            'grand_total' => 0,
            'paid_total' => 0,
            'balance_due' => 0,
            'customer_note' => fake()->optional()->sentence(),
            'internal_note' => fake()->optional()->sentence(),
            'ordered_at' => now(),
        ];
    }
}
