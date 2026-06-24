<?php

namespace Database\Factories;

use App\Models\Branch;
use Illuminate\Database\Eloquent\Factories\Factory;

class MenuFactory extends Factory
{
    public function definition(): array
    {
        return [

            'branch_id' => Branch::inRandomOrder()->first()?->id,

            'name' => fake()->randomElement([
                'Breakfast Menu',
                'Lunch Menu',
                'Dinner Menu',
                'Kids Menu',
                'Beverage Menu'
            ]),

            'description' => fake()->sentence(),

            'display_order' => fake()->numberBetween(1, 10),

            'status' => 'active'
        ];
    }
}