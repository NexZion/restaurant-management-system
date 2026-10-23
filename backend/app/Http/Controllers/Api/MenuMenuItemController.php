<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Menu;
use App\Models\MenuItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class MenuMenuItemController extends Controller
{
    public function index(Request $request, Menu $menu)
    {
        $branchId = $this->branchId($request);
        $availableItems = $this->availableItems($branchId)->get();
        $assignedItems = $menu->menuItemsForBranch($branchId)
            ->with(['images', 'menuCategory'])
            ->orderBy('branch_menu_menu_items.display_order')
            ->get();

        return response()->json([
            'success' => true,
            'menu' => $menu->only(['id', 'name', 'code', 'menu_type', 'availability_type', 'is_active']),
            'branch_id' => $branchId,
            'branch_name' => $request->user()?->branch?->name ?? DB::table('branches')->where('id', $branchId)->value('name'),
            'available_items' => $availableItems->map(fn (MenuItem $item) => $this->itemData($item)),
            'assigned_items' => $assignedItems->map(fn (MenuItem $item) => $this->itemData($item)),
        ]);
    }

    public function sync(Request $request, Menu $menu)
    {
        $branchId = $this->branchId($request);
        $data = $request->validate([
            'menu_item_ids' => ['present', 'array'],
            'menu_item_ids.*' => ['required', 'integer', 'distinct', 'exists:menu_items,id'],
            'all_branches' => ['sometimes', 'boolean'],
        ]);
        $itemIds = collect($data['menu_item_ids'])->map(fn ($id) => (int) $id)->values();
        $targetBranchIds = !empty($data['all_branches'])
            ? $menu->branches()->pluck('branches.id')->map(fn ($id) => (int) $id)->all()
            : [$branchId];

        if (!$targetBranchIds) {
            throw ValidationException::withMessages([
                'all_branches' => 'Assign this menu to at least one branch before applying its items to all branches.',
            ]);
        }

        foreach ($targetBranchIds as $targetBranchId) {
            $existingIds = $menu->menuItemsForBranch($targetBranchId)->pluck('menu_items.id')->map(fn ($id) => (int) $id);
            $availableIds = $this->availableItems($targetBranchId)->pluck('menu_items.id')->map(fn ($id) => (int) $id);
            $allowedIds = $availableIds->merge($existingIds)->unique();

            if ($itemIds->diff($allowedIds)->isNotEmpty()) {
                throw ValidationException::withMessages([
                    'menu_item_ids' => !empty($data['all_branches'])
                        ? 'Every selected item must be active and available at all branches assigned to this menu.'
                        : 'Every assigned item must be active and available at your branch.',
                ]);
            }
        }

        DB::transaction(function () use ($menu, $targetBranchIds, $itemIds) {
            foreach ($targetBranchIds as $targetBranchId) {
                if ($itemIds->isNotEmpty()) {
                    $branchMenuExists = DB::table('branch_menus')
                        ->where('menu_id', $menu->id)
                        ->where('branch_id', $targetBranchId)
                        ->exists();
                    if (!$branchMenuExists) {
                        DB::table('branch_menus')->insert([
                            'menu_id' => $menu->id,
                            'branch_id' => $targetBranchId,
                            'is_active' => false,
                            'display_order' => $menu->display_order,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);
                    }
                }

                $query = DB::table('branch_menu_menu_items')
                    ->where('menu_id', $menu->id)
                    ->where('branch_id', $targetBranchId);
                if ($itemIds->isEmpty()) {
                    $query->delete();
                    continue;
                }

                $query->whereNotIn('menu_item_id', $itemIds->all())->delete();
                foreach ($itemIds as $position => $itemId) {
                    DB::table('branch_menu_menu_items')->updateOrInsert(
                        ['menu_id' => $menu->id, 'branch_id' => $targetBranchId, 'menu_item_id' => $itemId],
                        ['display_order' => $position],
                    );
                }
            }
        });

        return $this->index($request, $menu);
    }

    public function attach(Request $request, Menu $menu)
    {
        $data = $request->validate(['menu_item_id' => ['required', 'integer', 'exists:menu_items,id']]);
        $branchId = $this->branchId($request);
        $itemIds = $menu->menuItemsForBranch($branchId)->pluck('menu_items.id')->map(fn ($id) => (int) $id)->all();
        $itemIds[] = (int) $data['menu_item_id'];
        $request->merge(['menu_item_ids' => array_values(array_unique($itemIds))]);
        return $this->sync($request, $menu);
    }

    public function detach(Request $request, Menu $menu, $itemId)
    {
        $branchId = $this->branchId($request);
        DB::table('branch_menu_menu_items')->where([
            'menu_id' => $menu->id,
            'branch_id' => $branchId,
            'menu_item_id' => $itemId,
        ])->delete();
        return response()->json(['success' => true, 'message' => 'Menu item removed from this branch menu.']);
    }

    public function updateOrder(Request $request, Menu $menu, $itemId)
    {
        $branchId = $this->branchId($request);
        $data = $request->validate(['display_order' => ['required', 'integer', 'min:0']]);
        $updated = DB::table('branch_menu_menu_items')->where([
            'menu_id' => $menu->id,
            'branch_id' => $branchId,
            'menu_item_id' => $itemId,
        ])->update(['display_order' => $data['display_order']]);
        if (!$updated) {
            throw ValidationException::withMessages(['menu_item_id' => 'This item is not assigned to this menu at your branch.']);
        }
        return response()->json(['success' => true]);
    }

    private function branchId(Request $request): int
    {
        $branchId = (int) ($request->user()?->branch_id ?? $request->integer('branch_id'));
        if (!$branchId) {
            throw ValidationException::withMessages(['branch_id' => 'A logged-in branch is required to manage menu items.']);
        }
        return $branchId;
    }

    private function availableItems(int $branchId)
    {
        return MenuItem::query()
            ->with(['images', 'menuCategory'])
            ->where('is_active', true)
            ->where('is_available', true)
            ->whereHas('branches', fn ($query) => $query->where('branches.id', $branchId)
                ->where('branch_menu_items.is_active', true)
                ->where('branch_menu_items.is_available', true))
            ->whereHas('menuCategory', fn ($query) => $query->where('is_active', true))
            ->orderBy('name');
    }

    private function itemData(MenuItem $item): array
    {
        $image = $item->images->firstWhere('is_primary', true)?->image_path ?? $item->images->first()?->image_path;
        return [
            'id' => $item->id,
            'name' => $item->name,
            'sku' => $item->sku,
            'category' => $item->menuCategory?->name,
            'image' => $image,
            'image_path' => $image,
        ];
    }
}
