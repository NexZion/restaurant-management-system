<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\IndexFilterRequest;
use App\Http\Requests\StoreMenuItemImageRequest;
use App\Http\Requests\UpdateMenuItemImageRequest;
use App\Models\MenuItemImage;

class MenuItemImageController extends Controller
{
    public function index(IndexFilterRequest $request)
    {
        return response()->json([
            'success' => true,
            'data' => $this->filterAndPaginate(
                MenuItemImage::with('menuItem'),
                $request,
                [
                    'id', 'menu_item_id', 'image_path', 'is_primary',
                    'display_order', 'created_at', 'updated_at',
                ],
                ['image_path'],
            ),
        ]);
    }

    public function store(StoreMenuItemImageRequest $request)
    {
        if ($request->is_primary) {

            MenuItemImage::where(
                'menu_item_id',
                $request->menu_item_id
            )->update([
                'is_primary' => false,
            ]);
        }

        $image = MenuItemImage::create($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Image created successfully',
            'data' => $image,
        ], 201);
    }

    public function show($id)
    {
        $image = MenuItemImage::with('menuItem')->find($id);

        if (! $image) {

            return response()->json([
                'success' => false,
                'message' => 'Image not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $image,
        ]);
    }

    public function update(UpdateMenuItemImageRequest $request, $id)
    {
        $image = MenuItemImage::find($id);

        if (! $image) {

            return response()->json([
                'success' => false,
                'message' => 'Image not found',
            ], 404);
        }

        if ($request->is_primary) {

            MenuItemImage::where(
                'menu_item_id',
                $request->menu_item_id
            )->update([
                'is_primary' => false,
            ]);
        }

        $image->update($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Image updated successfully',
            'data' => $image,
        ]);
    }

    public function destroy($id)
    {
        $image = MenuItemImage::find($id);

        if (! $image) {

            return response()->json([
                'success' => false,
                'message' => 'Image not found',
            ], 404);
        }

        $image->delete();

        return response()->json([
            'success' => true,
            'message' => 'Image deleted successfully',
        ]);
    }
}
