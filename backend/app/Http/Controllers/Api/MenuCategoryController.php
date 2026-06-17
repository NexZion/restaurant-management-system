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
            'data' => MenuCategory::with('branch')->get()
        ]);
    }

    public function store(StoreMenuCategoryRequest $request)
    {
        $category = MenuCategory::create([

            'branch_id' => $request->branch_id,

            'name' => $request->name,

            'description' => $request->description,

            'image' => $request->image,

            'display_order' => $request->display_order ?? 0,

            'status' => $request->status
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Menu category created successfully',
            'data' => $category
        ], 201);
    }

    public function show($id)
    {
        $category = MenuCategory::with('branch')->find($id);

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

        $category->update([

            'branch_id' => $request->branch_id,

            'name' => $request->name,

            'description' => $request->description,

            'image' => $request->image,

            'display_order' => $request->display_order,

            'status' => $request->status
        ]);

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