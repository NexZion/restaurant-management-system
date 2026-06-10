<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
public function definition(): array
{
    return [
        'name' => fake()->name(),

        'username' => fake()->unique()->userName(),

        'email' => fake()->unique()->safeEmail(),

        'phone' => fake()->numerify('077#######'),

        'whatsapp' => fake()->numerify('9477#######'),

        'password' => bcrypt('123456'),

        'role_id' => 2,

        'branch_id' => null,

        'pin' => fake()->numerify('####'),

        'image' => null,

        'dob' => fake()->date(),

        'address' => fake()->address(),

        'status' => 'active',

        'failed_attempts' => 0,

        'is_locked' => false,
    ];
}

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }
}
