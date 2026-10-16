<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MenuItem;
use App\Models\MenuCategory;
use Illuminate\Http\Request;
use App\Http\Requests\StoreMenuItemRequest;
use App\Http\Requests\UpdateMenuItemRequest;
use App\Http\Resources\MenuItemListResource;
use Illuminate\Validation\ValidationException;

class MenuItemController extends Controller
{
    public function index()
    {
        $query = MenuItem::with([
            'menuCategory',
            'images',
            'branches',
        ]);
        $branchId = request()->user()?->branch_id ?? request()->integer('branch_id');
        if ($branchId) {
            $query->where('is_active', true)
                ->where('is_available', true)
                ->whereHas('branches', function ($branchQuery) use ($branchId) {
                    $branchQuery->where('branches.id', $branchId)
                        ->where('branch_menu_items.is_active', true)
                        ->where('branch_menu_items.is_available', true);
                })
                ->whereHas('menuCategory', function ($categoryQuery) use ($branchId) {
                    $categoryQuery->where('is_active', true)
                        ->whereHas('branches', function ($categoryBranchQuery) use ($branchId) {
                            $categoryBranchQuery->where('branches.id', $branchId)
                                ->where('branch_menu_categories.is_active', true);
                        });
                })
                ->with(['branches' => fn ($branchQuery) => $branchQuery->where('branches.id', $branchId)]);
        }
        $menuItems = $query->get();

        return response()->json([
            'success' => true,
            'data' => MenuItemListResource::collection($menuItems)
        ]);
    }

    public function store(StoreMenuItemRequest $request)
    {
        $data = $request->validated();
        $assignments = collect($data['branch_assignments'])->mapWithKeys(function ($assignment) {
            $branchId = $assignment['branch_id'];
            unset($assignment['branch_id']);
            return [$branchId => $assignment];
        })->all();
        $this->ensureCategoryAssignedToBranches($data['menu_category_id'], array_keys($assignments));
        unset($data['branch_assignments']);
        $item = MenuItem::create($data);
        $item->branches()->sync($assignments);
        $item->load(['menuCategory', 'branches', 'images']);

        return response()->json([
            'success' => true,
            'message' => 'Menu item created successfully',
            'data' => $item
        ], 201);
    }

    public function show($id)
    {
        $item = MenuItem::with([
            'menuCategory',
            'images',
            'branches',

        ])->find($id);

        if (!$item) {

            return response()->json([
                'success' => false,
                'message' => 'Menu item not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $item
        ]);
    }

    public function update(UpdateMenuItemRequest $request, $id)
    {
        $item = MenuItem::find($id);

        if (!$item) {

            return response()->json([
                'success' => false,
                'message' => 'Menu item not found'
            ], 404);
        }

        $data = $request->validated();
        $assignments = collect($data['branch_assignments'])->mapWithKeys(function ($assignment) {
            $branchId = $assignment['branch_id'];
            unset($assignment['branch_id']);
            return [$branchId => $assignment];
        })->all();
        $this->ensureCategoryAssignedToBranches($data['menu_category_id'], array_keys($assignments));
        unset($data['branch_assignments']);
        $item->update($data);
        $item->branches()->sync($assignments);
        $item->load(['menuCategory', 'branches', 'images']);

        return response()->json([
            'success' => true,
            'message' => 'Menu item updated successfully',
            'data' => $item
        ]);
    }

    public function destroy($id)
    {
        $item = MenuItem::find($id);

        if (!$item) {

            return response()->json([
                'success' => false,
                'message' => 'Menu item not found'
            ], 404);
        }

        $item->delete();

        return response()->json([
            'success' => true,
            'message' => 'Menu item deleted successfully'
        ]);
    }

    private function ensureCategoryAssignedToBranches(int|string $categoryId, array $branchIds): void
    {
        $category = MenuCategory::find($categoryId);
        $assignedBranchIds = $category && $category->is_active
            ? $category->branches()->wherePivot('is_active', true)->pluck('branches.id')->map(fn ($id) => (int) $id)->all()
            : [];
        if (array_diff(array_map('intval', $branchIds), $assignedBranchIds)) {
            throw ValidationException::withMessages([
                'menu_category_id' => 'The selected category must be active and assigned to every selected branch.',
            ]);
        }
    }
}
