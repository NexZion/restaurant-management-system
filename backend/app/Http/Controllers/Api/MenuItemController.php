<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MenuItem;
use Illuminate\Http\Request;
use App\Http\Requests\StoreMenuItemRequest;
use App\Http\Requests\UpdateMenuItemRequest;

class MenuItemController extends Controller
{
    public function index()
    {
        return response()->json([
            'success' => true,
            'data' => MenuItem::with([
                'menuCategory',
                'images'

            ])->get()
        ]);
    }

    public function store(StoreMenuItemRequest $request)
    {
        $item = MenuItem::create($request->validated());

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
            'images'

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

        $item->update($request->validated());

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
        
        $item->status = 'unavailable';
        $item->save();

        $item->delete();

        return response()->json([
            'success' => true,
            'message' => 'Menu item deleted successfully'
        ]);
    }
}