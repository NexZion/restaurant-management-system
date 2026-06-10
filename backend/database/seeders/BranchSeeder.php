<?php

namespace Database\Seeders;
use App\Models\Branch;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class BranchSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
            Branch::factory(10)->create();
            Branch::create([
           'code' => 'HQ-001',
           'name' => 'Headquarters',
           'slug' => 'headquarters',
           'address_line1' => '123 Main Street',
           'city' => 'Colombo',
           'phone' => '0112345678'
        ]);
    }
}
