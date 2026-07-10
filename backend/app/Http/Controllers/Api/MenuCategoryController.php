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
            'data' => MenuCategory::all()
        ]);
    }

    public function store(StoreMenuCategoryRequest $request)
    {
        $category = MenuCategory::create($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Menu category created successfully',
            'data' => $category
        ], 201);
    }

    public function show($id)
    {
        $category = MenuCategory::find($id);

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

        $category->update($request->validated());

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