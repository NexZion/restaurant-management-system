<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Menu;
use App\Http\Requests\StoreMenuRequest;
use App\Http\Requests\UpdateMenuRequest;
use App\Models\MenuItem;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\DB;

class MenuController extends Controller
{
    public function index()
    {
        $menus = Menu::with(['branches', 'menuItems'])
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $menus
        ]);
    }

    public function store(StoreMenuRequest $request)
    {
        $data = $request->validated();
        $branchIds = $data['branch_ids'];
        $menuItemIds = $data['menu_item_ids'] ?? [];
        unset($data['branch_ids']);
        unset($data['menu_item_ids']);

        $menu = DB::transaction(function () use ($data, $branchIds, $menuItemIds) {
            $menu = Menu::create($data);
            $menu->branches()->syncWithPivotValues($branchIds, [
                'is_active' => $menu->is_active,
                'display_order' => $menu->display_order,
            ]);
            $this->syncMenuItemsForBranches($menu, $menuItemIds, $branchIds);
            return $menu;
        });
        $menu->load('branches');

        return response()->json([
            'success' => true,
            'message' => 'Menu created successfully',
            'data' => $menu
        ], 201);
    }

    public function show($id)
    {
        $menu = Menu::with(['menuItems', 'branches'])
            ->find($id);

        if (!$menu) {

            return response()->json([
                'success' => false,
                'message' => 'Menu not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $menu
        ]);
    }
    public function update(
        UpdateMenuRequest $request,
        $id
    ) {

        $menu = Menu::find($id);

        if (!$menu) {

            return response()->json([
                'success' => false,
                'message' => 'Menu not found'
            ], 404);
        }

        $data = $request->validated();
        $branchIds = $data['branch_ids'] ?? $menu->branches()->pluck('branches.id')->map(fn ($id) => (int) $id)->all();
        $menuItemIds = $data['menu_item_ids'] ?? $menu->menuItems()->pluck('menu_items.id')->all();
        DB::transaction(function () use ($menu, $branchIds, $menuItemIds, $data) {
            if (array_key_exists('branch_ids', $data) || array_key_exists('is_active', $data) || array_key_exists('display_order', $data)) {
                $menu->branches()->syncWithPivotValues($branchIds, [
                    'is_active' => $data['is_active'] ?? $menu->is_active,
                    'display_order' => $data['display_order'] ?? $menu->display_order,
                ]);
            }
            $this->syncMenuItemsForBranches($menu, $menuItemIds, $branchIds);
            $menu->update(collect($data)->except(['branch_ids', 'menu_item_ids'])->all());
        });
        unset($data['branch_ids'], $data['menu_item_ids']);
        $menu->load('branches');

        return response()->json([
            'success' => true,
            'message' => 'Menu updated successfully',
            'data' => $menu
        ]);
    }
    public function destroy($id)
    {
        $menu = Menu::find($id);

        if (!$menu) {

            return response()->json([
                'success' => false,
                'message' => 'Menu not found'
            ], 404);
        }

        $menu->delete();

        return response()->json([
            'success' => true,
            'message' => 'Menu deleted successfully'
        ]);
    }

    private function syncMenuItemsForBranches(Menu $menu, array $menuItemIds, array $branchIds): void
    {
        $assignments = [];
        foreach (array_values($menuItemIds) as $position => $menuItemId) {
            $item = MenuItem::with('branches')->find($menuItemId);
            $itemBranchIds = $item?->branches
                ->filter(fn ($branch) => $branch->pivot->is_active && $branch->pivot->is_available)
                ->pluck('id')->map(fn ($id) => (int) $id)->all() ?? [];
            if (!$item || !array_intersect(array_map('intval', $branchIds), $itemBranchIds)) {
                throw ValidationException::withMessages([
                    'menu_item_ids' => 'Every menu item must be active and available at a branch assigned to this menu.',
                ]);
            }
            $assignments[$menuItemId] = ['display_order' => $position];
        }
        $menu->menuItems()->sync($assignments);
    }
}
