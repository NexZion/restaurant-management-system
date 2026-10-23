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
        $menuItems = MenuItem::with([
            'menuCategory',
            'images',
            'branches',
            'variantOptions.variant',
        ])->get();

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
        $variantAssignments = $this->variantAssignments($data['variant_option_assignments'] ?? []);
        $this->ensureCategoryActive($data['menu_category_id']);
        unset($data['branch_assignments'], $data['variant_option_assignments']);
        $item = MenuItem::create($data);
        $item->branches()->sync($assignments);
        $item->variantOptions()->sync($variantAssignments);
        $item->load(['menuCategory', 'branches', 'images', 'variantOptions.variant']);

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
            'variantOptions.variant',

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
        $variantAssignments = $this->variantAssignments($data['variant_option_assignments'] ?? []);
        $this->ensureCategoryActive($data['menu_category_id']);
        unset($data['branch_assignments'], $data['variant_option_assignments']);
        $item->update($data);
        $item->branches()->sync($assignments);
        $item->variantOptions()->sync($variantAssignments);
        $item->load(['menuCategory', 'branches', 'images', 'variantOptions.variant']);

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

    private function ensureCategoryActive(int|string $categoryId): void
    {
        $category = MenuCategory::find($categoryId);
        if (!$category || !$category->is_active) {
            throw ValidationException::withMessages([
                'menu_category_id' => 'The selected category must be active.',
            ]);
        }
    }

    private function variantAssignments(array $assignments): array
    {
        return collect($assignments)->mapWithKeys(function ($assignment) {
            $id = $assignment['variant_option_id'];
            unset($assignment['variant_option_id']);
            return [$id => $assignment];
        })->all();
    }
}
