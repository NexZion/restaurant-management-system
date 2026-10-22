<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Menu;
use App\Http\Requests\StoreMenuRequest;
use App\Http\Requests\UpdateMenuRequest;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class MenuController extends Controller
{
    public function index()
    {
        $menus = Menu::with(['branches'])
            ->latest()
            ->get();
        $branchId = request()->user()?->branch_id ?? request()->integer('branch_id');
        $menus->each(function (Menu $menu) use ($branchId) {
            $branch = $branchId ? $menu->branches->firstWhere('id', $branchId) : null;
            $menu->setAttribute('branch_availability', $branch ? (bool) $branch->pivot->is_active : null);
            $menu->setAttribute('availability_branch_id', $branchId ?: null);
            $menu->setAttribute('branch_menu_item_count', $branchId ? $menu->menuItemsForBranch((int) $branchId)->count() : 0);
        });

        return response()->json([
            'success' => true,
            'data' => $menus
        ]);
    }

    public function store(StoreMenuRequest $request)
    {
        $data = $request->validated();
        $branchId = $request->user()?->branch_id ?? $request->integer('branch_id');
        if (!$branchId) {
            throw ValidationException::withMessages([
                'branch_id' => 'A logged-in branch is required to create a menu.',
            ]);
        }

        $menu = DB::transaction(function () use ($data, $branchId) {
            $menu = Menu::create($data);
            $menu->branches()->attach($branchId, [
                'is_active' => true,
                'display_order' => $menu->display_order,
            ]);

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
        $menu = Menu::with(['branches'])
            ->find($id);

        if (!$menu) {

            return response()->json([
                'success' => false,
                'message' => 'Menu not found'
            ], 404);
        }

        $branchId = request()->user()?->branch_id ?? request()->integer('branch_id');
        $menu->setRelation('menuItems', $branchId
            ? $menu->menuItemsForBranch((int) $branchId)->with(['images', 'menuCategory'])->get()
            : collect());

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
        $menu->update($data);
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

    public function updateAvailability(Request $request, Menu $menu)
    {
        $data = $request->validate(['is_active' => ['required', 'boolean']]);
        $branchId = $request->user()?->branch_id ?? $request->integer('branch_id');
        if (!$branchId) {
            throw ValidationException::withMessages(['branch_id' => 'A branch must be selected to set menu availability.']);
        }

        $menu->branches()->syncWithoutDetaching([
            $branchId => [
                'is_active' => $data['is_active'],
                'display_order' => $menu->display_order,
            ],
        ]);

        return response()->json([
            'success' => true,
            'data' => ['branch_id' => (int) $branchId, 'is_active' => (bool) $data['is_active']],
        ]);
    }

    public function updateBranches(Request $request, Menu $menu)
    {
        $data = $request->validate([
            'branch_ids' => ['required', 'array'],
            'branch_ids.*' => ['required', 'integer', 'distinct', 'exists:branches,id'],
        ]);

        $branchIds = array_map('intval', $data['branch_ids']);
        $existingBranches = $menu->branches()->get()->keyBy('id');
        $assignments = collect($branchIds)->mapWithKeys(function (int $branchId) use ($existingBranches, $menu) {
            $existing = $existingBranches->get($branchId);

            return [$branchId => [
                'is_active' => $existing ? (bool) $existing->pivot->is_active : true,
                'display_order' => $existing ? $existing->pivot->display_order : $menu->display_order,
            ]];
        })->all();
        $detachedBranchIds = $existingBranches->keys()->diff($branchIds);

        DB::transaction(function () use ($menu, $assignments, $detachedBranchIds) {
            $menu->branches()->sync($assignments);

            if ($detachedBranchIds->isNotEmpty()) {
                DB::table('branch_menu_menu_items')
                    ->where('menu_id', $menu->id)
                    ->whereIn('branch_id', $detachedBranchIds)
                    ->delete();
            }
        });

        return response()->json([
            'success' => true,
            'message' => 'Menu branches updated successfully.',
            'data' => $menu->load('branches'),
        ]);
    }

}
