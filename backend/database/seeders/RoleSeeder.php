<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        Role::create([
            'name' => 'Admin',
            'description' => 'Full access to all system features and settings'
        ]);
        Role::create([
            'name' => 'Manager',
            'description' => 'Access to manage branches, users, and view reports'
        ]);

        Role::create([
            'name' => 'Cashier'
        ]);

        Role::create([
            'name' => 'Waiter'
        ]);
    }
}