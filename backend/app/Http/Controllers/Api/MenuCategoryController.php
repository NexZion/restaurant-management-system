<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MenuCategory;
use App\Http\Requests\StoreMenuCategoryRequest;
use App\Http\Requests\UpdateMenuCategoryRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MenuCategoryController extends Controller
{
    public function index()
    {
        return response()->json([
            'success' => true,
            'data' => MenuCategory::withCount('menuItems')->get()
        ]);
    }

    public function store(StoreMenuCategoryRequest $request)
    {
        $data = $request->validated();
        if ($request->hasFile('image_file')) {
            $data['image_path'] = $request->file('image_file')->store('menu-categories', 'public');
        }
        unset($data['image_file']);
        $category = MenuCategory::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Menu category created successfully',
            'data' => $category
        ], 201);
    }

    public function show($id)
    {
        $category = MenuCategory::with(['menuItems.images'])->find($id);

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

    public function reassignItems(Request $request, $id)
    {
        $category = MenuCategory::find($id);
        if (!$category) {
            return response()->json(['success' => false, 'message' => 'Menu category not found'], 404);
        }

        $data = $request->validate([
            'target_category_id' => ['required', 'integer', 'exists:menu_categories,id', 'not_in:' . $category->id],
        ]);
        $targetCategory = MenuCategory::findOrFail($data['target_category_id']);
        $updated = $category->menuItems()->update(['menu_category_id' => $targetCategory->id]);

        return response()->json([
            'success' => true,
            'message' => 'Menu items reassigned successfully',
            'data' => ['updated_count' => $updated],
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
        $previousImagePath = $category->image_path;
        if ($request->hasFile('image_file')) {
            $data['image_path'] = $request->file('image_file')->store('menu-categories', 'public');
        }
        unset($data['image_file']);
        $category->update($data);

        if ($previousImagePath && $previousImagePath !== $category->image_path && !filter_var($previousImagePath, FILTER_VALIDATE_URL)) {
            Storage::disk('public')->delete($previousImagePath);
        }

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
