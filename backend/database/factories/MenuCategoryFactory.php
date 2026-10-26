<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class MenuCategoryFactory extends Factory
{
    public function definition(): array
    {
        return [

        

            'name' => fake()->randomElement([
                'Main Courses',
                'Beverages',
                'Desserts',
                'Appetizers',
                'Soups',
                'Breakfast'
            ]),

            'code' => 'CAT-' . strtoupper(fake()->unique()->bothify('###??')),

            'description' => fake()->sentence(),

            'image_path' => fake()->imageUrl(),

            'display_order' => fake()->numberBetween(1, 20),

            'is_active' => true,
        ];
    }
}
