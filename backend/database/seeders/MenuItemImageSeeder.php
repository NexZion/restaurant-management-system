<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\MenuItemImage;

class MenuItemImageSeeder extends Seeder
{
    public function run(): void
    {
        MenuItemImage::factory(50)->create();
    }
}