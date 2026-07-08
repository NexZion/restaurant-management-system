<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class CustomerFactory extends Factory
{
    public function definition(): array
    {
        return [

            'customer_code' => 'CUS-' . fake()->unique()->numberBetween(1000, 9999),

            'first_name' => fake()->firstName(),

            'last_name' => fake()->lastName(),

            'email' => fake()->unique()->safeEmail(),

            'phone' => '07' . fake()->numberBetween(10000000, 99999999),

            'whatsapp' => '07' . fake()->numberBetween(10000000, 99999999),

            'address_line1' => fake()->streetAddress(),

            'address_line2' => fake()->optional()->secondaryAddress(),

            'city' => fake()->city(),

            'district' => fake()->randomElement([
                'Colombo',
                'Gampaha',
                'Kalutara',
                'Kandy',
                'Galle'
            ]),

            'postal_code' => fake()->postcode(),

            'state' => fake()->randomElement([
                'Western',
                'Central',
                'Southern'
            ]),

            'customer_type' => fake()->randomElement([
                'regular',
                'vip',
                'corporate'
            ]),

            'loyalty_points' => fake()->numberBetween(0, 5000),

            'total_spend' => fake()->randomFloat(2, 0, 500000),

            'receipt_count' => fake()->numberBetween(0, 200),

            'last_visited_at' => fake()->dateTimeBetween('-1 year', 'now'),

            'id_number' => fake()->numerify('############'),

            'id_type' => fake()->randomElement([
                'nic',
                'passport'
            ]),

            'status' => fake()->randomElement([
                'active',
                'inactive',
                'suspended'
            ]),

            'is_active' => true
        ];
    }
}