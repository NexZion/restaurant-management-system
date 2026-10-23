<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Branch;
use App\Models\MenuCategory;

class MenuCategorySeeder extends Seeder
{
    public function run(): void
    {
        MenuCategory::factory(10)->create()->each(function (MenuCategory $category): void {
            $branchIds = Branch::query()->inRandomOrder()->limit(3)->pluck('id')->all();
            $category->branches()->syncWithPivotValues($branchIds, [
                'is_active' => $category->is_active,
                'display_order' => $category->display_order,
            ]);
        });
    }
}
