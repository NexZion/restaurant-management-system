<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\AttachMenuItemRequest;
use App\Http\Requests\IndexFilterRequest;
use App\Http\Requests\UpdateMenuItemOrderRequest;
use App\Models\Menu;
use App\Models\MenuItem;

class MenuMenuItemController extends Controller
{
    public function index(IndexFilterRequest $request, Menu $menu)
    {
        $items = $this->filterAndPaginate(
            $menu->menuItems()->with(['menuCategory', 'images']),
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
            'menu' => $menu->name,
            'items' => $items,
        ]);
    }

    public function attach(AttachMenuItemRequest $request, Menu $menu)
    {
        $validated = $request->validated();

        $menuItem = MenuItem::find($validated['menu_item_id']);

        // Item does not exist OR soft deleted
        if (! $menuItem || $menuItem->deleted_at !== null) {
            return response()->json([
                'success' => false,
                'message' => 'Menu item not found',
            ], 404);
        }

        // Already attached
        $exists = $menu->menuItems()
            ->where('menu_item_id', $validated['menu_item_id'])
            ->exists();

        if ($exists) {
            return response()->json([
                'success' => false,
                'message' => 'Menu item already exists in this menu',
            ], 409);
        }

        $menu->menuItems()->attach(
            $validated['menu_item_id'],
            [
                'display_order' => $validated['display_order'] ?? 0,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Menu item attached successfully',
        ]);
    }

    public function detach(Menu $menu, $itemId)
    {
        $menuItem = MenuItem::find($itemId);

        // Menu item doesn't exist
        if (! $menuItem) {
            return response()->json([
                'success' => false,
                'message' => 'No such menu item found',
            ], 404);
        }

        // Check relationship exists
        $exists = $menu->menuItems()
            ->where('menu_item_id', $itemId)
            ->exists();

        if (! $exists) {
            return response()->json([
                'success' => false,
                'message' => 'This menu item is not attached to this menu',
            ], 404);
        }

        $menu->menuItems()->detach($itemId);

        return response()->json([
            'success' => true,
            'message' => 'Menu item removed successfully',
        ]);
    }

    public function updateOrder(UpdateMenuItemOrderRequest $request, Menu $menu, $itemId)
    {
        $validated = $request->validated();

        $menuItem = MenuItem::find($itemId);

        // Menu item not found
        if (! $menuItem || $menuItem->deleted_at !== null) {
            return response()->json([
                'success' => false,
                'message' => 'Menu item not found',
            ], 404);
        }

        // Check relationship exists
        $exists = $menu->menuItems()
            ->where('menu_item_id', $itemId)
            ->exists();

        if (! $exists) {
            return response()->json([
                'success' => false,
                'message' => 'This menu item is not attached to this menu',
            ], 404);
        }

        $menu->menuItems()->updateExistingPivot(
            $itemId,
            [
                'display_order' => $validated['display_order'],
                'updated_at' => now(),
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Display order updated successfully',
        ]);
    }
}
