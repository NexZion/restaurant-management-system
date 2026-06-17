<?php

namespace Database\Factories;

use App\Models\Branch;
use App\Models\MenuCategory;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

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

            'branch_id' => Branch::inRandomOrder()->first()?->id,

            'menu_category_id' => MenuCategory::inRandomOrder()->first()?->id,

            'sku' => 'SKU-' . strtoupper(fake()->unique()->bothify('###??')),

            'name' => $name,

            'slug' => Str::slug($name . '-' . fake()->unique()->numberBetween(1, 9999)),

            'short_description' => fake()->sentence(),

            'long_description' => fake()->paragraph(),

            'base_price' => fake()->randomFloat(2, 500, 5000),

            'preparation_time' => fake()->numberBetween(5, 30),

            'display_order' => fake()->numberBetween(1, 20),

            'status' => fake()->randomElement([
                'available',
                'unavailable',
                'out_of_stock'
            ])
        ];
    }
}