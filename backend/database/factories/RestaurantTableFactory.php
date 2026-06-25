<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class RestaurantTableFactory extends Factory
{
    public function definition(): array
    {
        return [
            'table_number' => 'T-' . fake()->unique()->numberBetween(1, 50),

            'capacity' => fake()->numberBetween(2, 10),

            'table_type' => fake()->randomElement([
                'standard',
                'vip',
                'outdoor',
                'family'
            ]),

            'section' => fake()->randomElement([
                'Ground Floor',
                'First Floor',
                'Garden',
                'VIP Area'
            ]),

            'status' => fake()->randomElement([
                'available',
                'occupied',
                'reserved',
                'maintenance'
            ])
        ];
    }
}