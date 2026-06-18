<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MenuItemImage;
use App\Http\Requests\StoreMenuItemImageRequest;
use App\Http\Requests\UpdateMenuItemImageRequest;

class MenuItemImageController extends Controller
{
    public function index()
    {
        return response()->json([
            'success' => true,
            'data' => MenuItemImage::with('menuItem')->get()
        ]);
    }

    public function store(StoreMenuItemImageRequest $request)
    {
        if ($request->is_primary) {

            MenuItemImage::where(
                'menu_item_id',
                $request->menu_item_id
            )->update([
                'is_primary' => false
            ]);
        }

        $image = MenuItemImage::create([
            'menu_item_id' => $request->menu_item_id,
            'image_path' => $request->image_path,
            'is_primary' => $request->is_primary ?? false,
            'display_order' => $request->display_order ?? 0
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Image created successfully',
            'data' => $image
        ], 201);
    }

    public function show($id)
    {
        $image = MenuItemImage::with('menuItem')->find($id);

        if (!$image) {

            return response()->json([
                'success' => false,
                'message' => 'Image not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $image
        ]);
    }

    public function update(UpdateMenuItemImageRequest $request, $id)
    {
        $image = MenuItemImage::find($id);

        if (!$image) {

            return response()->json([
                'success' => false,
                'message' => 'Image not found'
            ], 404);
        }

        if ($request->is_primary) {

            MenuItemImage::where(
                'menu_item_id',
                $request->menu_item_id
            )->update([
                'is_primary' => false
            ]);
        }

        $image->update([
            'menu_item_id' => $request->menu_item_id,
            'image_path' => $request->image_path,
            'is_primary' => $request->is_primary ?? false,
            'display_order' => $request->display_order ?? 0
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Image updated successfully',
            'data' => $image
        ]);
    }

    public function destroy($id)
    {
        $image = MenuItemImage::find($id);

        if (!$image) {

            return response()->json([
                'success' => false,
                'message' => 'Image not found'
            ], 404);
        }

        $image->delete();

        return response()->json([
            'success' => true,
            'message' => 'Image deleted successfully'
        ]);
    }
}