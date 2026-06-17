<?php

namespace Database\Factories;

use App\Models\MenuItem;
use Illuminate\Database\Eloquent\Factories\Factory;

class MenuItemImageFactory extends Factory
{
    public function definition(): array
    {
        return [
            'menu_item_id' => MenuItem::inRandomOrder()->first()?->id,

            'image_path' => 'menu-items/default-food.jpg',

            'is_primary' => fake()->boolean(30),

            'display_order' => fake()->numberBetween(1, 5),
        ];
    }
}