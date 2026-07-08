<?php

namespace Database\Factories;

use App\Models\MenuItem;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Database\Eloquent\Factories\Factory;
class OrderItemFactory extends Factory
{
    public function definition(): array
    {
        $quantity = fake()->numberBetween(1, 6);
        $unitPrice = fake()->randomFloat(2, 150, 5000);

        return [
            'order_id' => Order::factory(),

            'menu_item_id' => MenuItem::factory(),

            'quantity' => $quantity,

            'unit_price' => $unitPrice,

            'total_price' => round($quantity * $unitPrice, 2),

            'notes' => fake()->optional()->sentence(),

            'status' => fake()->randomElement([
                'pending',
                'preparing',
                'ready',
            ]),
        ];
    }
}
