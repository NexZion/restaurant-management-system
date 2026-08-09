<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\IndexFilterRequest;
use App\Http\Requests\StoreMenuItemRequest;
use App\Http\Requests\UpdateMenuItemRequest;
use App\Http\Resources\MenuItemListResource;
use App\Models\MenuItem;

class MenuItemController extends Controller
{
    public function index(IndexFilterRequest $request)
    {
        $menuItems = $this->filterAndPaginate(
            MenuItem::with(['menuCategory', 'images']),
            $request,
            [
                'id', 'menu_category_id', 'sku', 'name', 'slug', 'short_description',
                'long_description', 'base_price', 'preparation_time', 'display_order',
                'status', 'created_at', 'updated_at',
            ],
            ['sku', 'name', 'slug', 'short_description', 'long_description'],
        );

        return response()->json([
            'success' => true,
            'data' => MenuItemListResource::collection($menuItems),
        ]);
    }

    public function store(StoreMenuItemRequest $request)
    {
        $item = MenuItem::create($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Menu item created successfully',
            'data' => $item,
        ], 201);
    }

    public function show($id)
    {
        $item = MenuItem::with([
            'menuCategory',
            'images',

        ])->find($id);

        if (! $item) {

            return response()->json([
                'success' => false,
                'message' => 'Menu item not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $item,
        ]);
    }

    public function update(UpdateMenuItemRequest $request, $id)
    {
        $item = MenuItem::find($id);

        if (! $item) {

            return response()->json([
                'success' => false,
                'message' => 'Menu item not found',
            ], 404);
        }

        $item->update($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Menu item updated successfully',
            'data' => $item,
        ]);
    }

    public function destroy($id)
    {
        $item = MenuItem::find($id);

        if (! $item) {

            return response()->json([
                'success' => false,
                'message' => 'Menu item not found',
            ], 404);
        }

        $item->status = 'unavailable';
        $item->save();

        $item->delete();

        return response()->json([
            'success' => true,
            'message' => 'Menu item deleted successfully',
        ]);
    }
}
