<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MenuCategory;
use Illuminate\Http\Request;
use App\Http\Requests\StoreMenuCategoryRequest;
use App\Http\Requests\UpdateMenuCategoryRequest;

class MenuCategoryController extends Controller
{
    public function index()
    {
        return response()->json([
            'success' => true,
            'data' => MenuCategory::with('branches')->get()
        ]);
    }

    public function store(StoreMenuCategoryRequest $request)
    {
        $data = $request->validated();
        $branchIds = $data['branch_ids'];
        unset($data['branch_ids']);
        $category = MenuCategory::create($data);
        $category->branches()->syncWithPivotValues($branchIds, [
            'is_active' => $category->is_active,
            'display_order' => $category->display_order,
        ]);
        $category->load('branches');

        return response()->json([
            'success' => true,
            'message' => 'Menu category created successfully',
            'data' => $category
        ], 201);
    }

    public function show($id)
    {
        $category = MenuCategory::with('branches')->find($id);

        if (!$category) {

            return response()->json([
                'success' => false,
                'message' => 'Menu category not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $category
        ]);
    }

    public function update(UpdateMenuCategoryRequest $request, $id)
    {
        $category = MenuCategory::find($id);

        if (!$category) {

            return response()->json([
                'success' => false,
                'message' => 'Menu category not found'
            ], 404);
        }

        $data = $request->validated();
        if (array_key_exists('branch_ids', $data) || array_key_exists('is_active', $data) || array_key_exists('display_order', $data)) {
            $branchIds = $data['branch_ids'] ?? $category->branches()->pluck('branches.id')->all();
            $category->branches()->syncWithPivotValues($branchIds, [
                'is_active' => $data['is_active'] ?? $category->is_active,
                'display_order' => $data['display_order'] ?? $category->display_order,
            ]);
        }
        if (array_key_exists('branch_ids', $data)) {
            unset($data['branch_ids']);
        }
        $category->update($data);
        $category->load('branches');

        return response()->json([
            'success' => true,
            'message' => 'Menu category updated successfully',
            'data' => $category
        ]);
    }

    public function destroy($id)
    {
        $category = MenuCategory::find($id);

        if (!$category) {

            return response()->json([
                'success' => false,
                'message' => 'Menu category not found'
            ], 404);
        }

        $category->delete();

        return response()->json([
            'success' => true,
            'message' => 'Menu category deleted successfully'
        ]);
    }
}
