<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Menu;
use App\Http\Requests\StoreMenuRequest;
use App\Http\Requests\UpdateMenuRequest;

class MenuController extends Controller
{
    public function index()
    {
        $menus = Menu::with('branch')
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $menus
        ]);
    }

    public function store(StoreMenuRequest $request)
    {
        $menu = Menu::create($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Menu created successfully',
            'data' => $menu
        ], 201);
    }

    public function show($id)
    {
        $menu = Menu::with('menuItems')
            ->find($id);

        if (!$menu) {

            return response()->json([
                'success' => false,
                'message' => 'Menu not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $menu
        ]);
    }
    public function update(
        UpdateMenuRequest $request,
        $id
    ) {

        $menu = Menu::find($id);

        if (!$menu) {

            return response()->json([
                'success' => false,
                'message' => 'Menu not found'
            ], 404);
        }

        $menu->update(
            $request->validated()
        );

        return response()->json([
            'success' => true,
            'message' => 'Menu updated successfully',
            'data' => $menu
        ]);
    }
    public function destroy($id)
    {
        $menu = Menu::find($id);

        if (!$menu) {

            return response()->json([
                'success' => false,
                'message' => 'Menu not found'
            ], 404);
        }

        $menu->delete();

        return response()->json([
            'success' => true,
            'message' => 'Menu deleted successfully'
        ]);
    }
}
