<?php

namespace Database\Factories;

use App\Models\MenuCategory;
use Illuminate\Database\Eloquent\Factories\Factory;

class MenuItemFactory extends Factory
{
    public function definition(): array
    {
        $name = fake()->randomElement([
            'Chicken Fried Rice',
            'Seafood Fried Rice',
            'Cheese Burger',
            'Chicken Burger',
            'Coke',
            'Sprite',
            'Ice Cream'
        ]);
        
        return [


            'menu_category_id' => MenuCategory::inRandomOrder()->first()?->id,

            'sku' => 'SKU-' . strtoupper(fake()->unique()->bothify('###??')),

            'name' => $name,

            'description' => fake()->paragraph(),

            'base_price' => fake()->randomFloat(2, 500, 5000),

            'base_cost' => fake()->randomFloat(2, 100, 2500),

            'preparation_time' => fake()->numberBetween(5, 30),

            'display_order' => fake()->numberBetween(1, 20),

            'is_active' => true,

            'is_available' => fake()->boolean(90),
        ];
    }
}
