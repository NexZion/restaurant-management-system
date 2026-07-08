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
            'description' => 'Full access to all system features and settings',
            'access_level' => 10
        ]);
        Role::create([
            'name' => 'Manager',
            'description' => 'Access to manage branches, users, and view reports',
            'access_level' => 8
        ]);

        Role::create([
            'name' => 'Cashier',
            'description' => 'Access to process orders and manage payments',
            'access_level' => 5
        ]);

        Role::create([
            'name' => 'Waiter',
            'description' => 'Access to manage tables and take orders',  
            'access_level' => 4
        ]);
        Role::create([
            'name' => 'Chef',
            'description' => 'Access to view and manage orders in the kitchen',
            'access_level' => 3
        ]);
    }
}