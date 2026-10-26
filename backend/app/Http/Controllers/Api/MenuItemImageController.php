<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MenuItemImage;
use App\Http\Requests\StoreMenuItemImageRequest;
use App\Http\Requests\UpdateMenuItemImageRequest;
use Illuminate\Support\Facades\Storage;

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
        $data = $request->validated();
        if ($request->hasFile('image')) {
            $data['image_path'] = $request->file('image')->store('menu-items', 'public');
            unset($data['image']);
        }

        if ($request->boolean('is_primary')) {

            MenuItemImage::where(
                'menu_item_id',
            $data['menu_item_id']
            )->update([
                'is_primary' => false
            ]);
        }

        $image = MenuItemImage::create($data);

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

        $data = $request->validated();
        if ($request->hasFile('image')) {
            $oldPath = $image->image_path;
            $data['image_path'] = $request->file('image')->store('menu-items', 'public');
            unset($data['image']);
            Storage::disk('public')->delete($oldPath);
        }

        if ($request->boolean('is_primary')) {

            MenuItemImage::where(
                'menu_item_id',
                $data['menu_item_id'] ?? $image->menu_item_id
            )->update([
                'is_primary' => false
            ]);
        }

        $image->update($data);

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

        Storage::disk('public')->delete($image->image_path);
        $image->delete();

        return response()->json([
            'success' => true,
            'message' => 'Image deleted successfully'
        ]);
    }
}
