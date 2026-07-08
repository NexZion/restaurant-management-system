<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Menu;
use App\Models\MenuItem;
use Illuminate\Http\Request;

class MenuMenuItemController extends Controller
{

    public function index(Menu $menu)
    {
        return response()->json([
            'success' => true,
            'menu' => $menu->name,
            'items' => $menu->menuItems
        ]);
    }
    public function attach(Request $request, Menu $menu)
    {
        $request->validate([
            'menu_item_id' => 'required|integer'
        ]);

        $menuItem = MenuItem::find($request->menu_item_id);

        // Item does not exist OR soft deleted
        if (!$menuItem || $menuItem->deleted_at !== null) {
            return response()->json([
                'success' => false,
                'message' => 'Menu item not found'
            ], 404);
        }

        // Already attached
        $exists = $menu->menuItems()
            ->where('menu_item_id', $request->menu_item_id)
            ->exists();

        if ($exists) {
            return response()->json([
                'success' => false,
                'message' => 'Menu item already exists in this menu'
            ], 409);
        }

        $menu->menuItems()->attach(
            $request->menu_item_id,
            [
                'display_order' => $request->display_order ?? 0,
                'created_at' => now(),
                'updated_at' => now()
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Menu item attached successfully'
        ]);
    }

    public function detach(Menu $menu, $itemId)
    {
        $menuItem = MenuItem::find($itemId);

        // Menu item doesn't exist
        if (!$menuItem) {
            return response()->json([
                'success' => false,
                'message' => 'No such menu item found'
            ], 404);
        }

        // Check relationship exists
        $exists = $menu->menuItems()
            ->where('menu_item_id', $itemId)
            ->exists();

        if (!$exists) {
            return response()->json([
                'success' => false,
                'message' => 'This menu item is not attached to this menu'
            ], 404);
        }

        $menu->menuItems()->detach($itemId);

        return response()->json([
            'success' => true,
            'message' => 'Menu item removed successfully'
        ]);
    }

    public function updateOrder(Request $request, Menu $menu, $itemId)
    {
        $request->validate([
            'display_order' => 'required|integer|min:0'
        ]);

        $menuItem = MenuItem::find($itemId);

        // Menu item not found
        if (!$menuItem || $menuItem->deleted_at !== null) {
            return response()->json([
                'success' => false,
                'message' => 'Menu item not found'
            ], 404);
        }

        // Check relationship exists
        $exists = $menu->menuItems()
            ->where('menu_item_id', $itemId)
            ->exists();

        if (!$exists) {
            return response()->json([
                'success' => false,
                'message' => 'This menu item is not attached to this menu'
            ], 404);
        }

        $menu->menuItems()->updateExistingPivot(
            $itemId,
            [
                'display_order' => $request->display_order,
                'updated_at' => now()
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Display order updated successfully'
        ]);
    }
}
