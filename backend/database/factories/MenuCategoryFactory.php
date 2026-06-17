<?php

namespace Database\Factories;

use App\Models\Branch;
use Illuminate\Database\Eloquent\Factories\Factory;

class MenuCategoryFactory extends Factory
{
    public function definition(): array
    {
        return [

            'branch_id' => Branch::inRandomOrder()->first()?->id,

            'name' => fake()->randomElement([
                'Main Courses',
                'Beverages',
                'Desserts',
                'Appetizers',
                'Soups',
                'Breakfast'
            ]),

            'description' => fake()->sentence(),

            'image' => fake()->imageUrl(),

            'display_order' => fake()->numberBetween(1, 20),

            'status' => fake()->randomElement([
                'active',
                'inactive'
            ])
        ];
    }
}