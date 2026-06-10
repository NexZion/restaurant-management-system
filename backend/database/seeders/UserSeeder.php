<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;

class UserSeeder extends Seeder
{
    public function run(): void
    {
    User::create([
    'name' => 'Admin',
    'username' => 'admin',

    'email' => 'admin@gmail.com',

    'phone' => '0771234567',

    'whatsapp' => '94771234567',

    'password' => bcrypt('123456'),

    'role_id' => 1,

    'branch_id' => 4,

    'pin' => '1111',

    'image' => null,

    'dob' => '1999-01-01',

    'address' => 'Colombo',

    'status' => 'active'
]);
  User::create([
    'name' => 'Manager',
    'username' => 'manager',

    'email' => 'manager@gmail.com',

    'phone' => '0772222222',

    'whatsapp' => '94772222222',

    'password' => bcrypt('123456'),

    'role_id' => 2,

    'branch_id' => 2,

    'pin' => '3333',

    'image' => null,

    'dob' => '1998-05-10',

    'address' => 'Kandy',

    'status' => 'active'
]);

  User::create([
    'name' => 'Waiter',
    'username' => 'waiter',

    'email' => 'waiter@gmail.com',

    'phone' => '0770000000',

    'whatsapp' => '94770000000',

    'password' => bcrypt('123456'),

    'role_id' => 3,

    'branch_id' => 5,

    'pin' => '2222',

    'image' => null,

    'dob' => '2000-05-10',

    'address' => 'Negombo',

    'status' => 'active'
]);



      
    }
}