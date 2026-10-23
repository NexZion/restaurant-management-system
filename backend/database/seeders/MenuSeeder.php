<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Branch;
use App\Models\Menu;
use App\Models\MenuItem;
use Illuminate\Support\Facades\DB;

class MenuSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Menu::factory(20)->create()->each(function (Menu $menu): void {
            $branchIds = Branch::query()->inRandomOrder()->limit(3)->pluck('id')->all();
            $menu->branches()->syncWithPivotValues($branchIds, [
                'is_active' => $menu->is_active,
                'display_order' => $menu->display_order,
            ]);

            foreach ($branchIds as $branchId) {
                $menuItemIds = MenuItem::query()
                    ->whereHas('branches', function ($query) use ($branchId): void {
                        $query->where('branches.id', $branchId)
                            ->where('branch_menu_items.is_active', true)
                            ->where('branch_menu_items.is_available', true);
                    })
                    ->inRandomOrder()
                    ->limit(12)
                    ->pluck('id')
                    ->all();

                foreach (array_values($menuItemIds) as $order => $menuItemId) {
                    DB::table('branch_menu_menu_items')->insertOrIgnore([
                        'branch_id' => $branchId,
                        'menu_id' => $menu->id,
                        'menu_item_id' => $menuItemId,
                        'display_order' => $order,
                    ]);
                }
            }
        });
    }
}
