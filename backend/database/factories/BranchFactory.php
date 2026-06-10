<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class BranchFactory extends Factory
{
    public function definition(): array
    {
        return [

            'code' => fake()->unique()->bothify('COL-###'),

            'name' => fake()->company(),

            'slug' => fake()->slug(),

            'address_line1' => fake()->streetAddress(),

            'address_line2' => null,

            'city' => fake()->city(),

            'state_province' => 'Western',

            'postal_code' => fake()->postcode(),

            'country' => 'Sri Lanka',

            'latitude' => fake()->latitude(),

            'longitude' => fake()->longitude(),

            'phone' => fake()->phoneNumber(),

            'email' => fake()->unique()->safeEmail(),

            'whatsapp' => fake()->numerify('9477#######'),

            'branch_type' => 'restaurant',

            'has_dining' => true,

            'has_rooms' => false,

            'has_delivery' => true,

            'opening_time' => '08:00:00',

            'closing_time' => '23:00:00',

            'timezone' => 'Asia/Colombo',

            'contact_person_phone' => fake()->phoneNumber(),

            'status' => 'active',
        ];
    }
}
