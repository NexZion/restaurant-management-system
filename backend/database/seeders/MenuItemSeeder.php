<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Branch;
use App\Models\MenuItem;

class MenuItemSeeder extends Seeder
{
    public function run(): void
    {
        MenuItem::factory(30)->create()->each(function (MenuItem $item): void {
            $branchIds = $item->menuCategory->branches()->pluck('branches.id')->all();
            if (!$branchIds) {
                $branchIds = Branch::query()->inRandomOrder()->limit(1)->pluck('id')->all();
            }
            $item->branches()->syncWithPivotValues($branchIds, [
                'selling_price' => null,
                'is_active' => $item->is_active,
                'is_available' => $item->is_available,
                'display_order' => $item->display_order,
            ]);
        });
    }
}
