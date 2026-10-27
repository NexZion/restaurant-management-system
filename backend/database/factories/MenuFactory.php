<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class MenuFactory extends Factory
{
    public function definition(): array
    {
        return [

            'code' => 'MENU-' . strtoupper(fake()->unique()->bothify('###??')),

            'name' => fake()->randomElement([
                'Breakfast Menu',
                'Lunch Menu',
                'Dinner Menu',
                'Kids Menu',
                'Beverage Menu'
            ]),

            'description' => fake()->sentence(),

            'display_order' => fake()->numberBetween(1, 10),

            'is_active' => true,
            'service_types' => ['dine_in'],
        ];
    }
}
