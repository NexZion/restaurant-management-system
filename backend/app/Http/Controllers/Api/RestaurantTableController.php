<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\RestaurantTable;
use App\Http\Requests\StoreRestaurantTableRequest;
use App\Http\Requests\UpdateRestaurantTableRequest;

class RestaurantTableController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Please login first'
            ], 401);
        }

        if (!in_array($user->role_id, [1, 2])) {
            return response()->json([
                'success' => false,
                'message' => 'Only Admin or Manager can view tables'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => RestaurantTable::latest()->get()
        ]);
    }
    public function show(Request $request,string $id)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Please login first'
            ], 401);
        }

        if (!in_array($user->role_id, [1, 2])) {
            return response()->json([
                'success' => false,
                'message' => 'Only Admin or Manager can view tables'
            ], 403);
        }

        $table = RestaurantTable::find($id);

        if (!$table) {
            return response()->json([
                'success' => false,
                'message' => 'Restaurant table not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $table
        ]);
    }
    public function store(StoreRestaurantTableRequest $request)
    {
        $user = $request->user();

        if (!in_array($user->role_id, [1, 2])) {
            return response()->json([
                'success' => false,
                'message' => 'Only Admin or Manager can create tables'
            ], 403);
        }

        $table = RestaurantTable::create($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Restaurant table created successfully',
            'data' => $table
        ], 201);
    }
    public function update(
        UpdateRestaurantTableRequest $request,
        $id
    ) {
        $user = $request->user();

        if (!in_array($user->role_id, [1, 2])) {
            return response()->json([
                'success' => false,
                'message' => 'Only Admin or Manager can update tables'
            ], 403);
        }

        $table = RestaurantTable::find($id);

        if (!$table) {
            return response()->json([
                'success' => false,
                'message' => 'Restaurant table not found'
            ], 404);
        }

        $table->update($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Restaurant table updated successfully',
            'data' => $table
        ]);
    }
    public function destroy(Request $request, $id)
    {
        $user = $request->user();

        if (!in_array($user->role_id, [1, 2])) {
            return response()->json([
                'success' => false,
                'message' => 'Only Admin or Manager can delete tables'
            ], 403);
        }

        $table = RestaurantTable::find($id);

        if (!$table) {
            return response()->json([
                'success' => false,
                'message' => 'Restaurant table not found'
            ], 404);
        }

        $table->update([
            'is_active' => false
        ]);
        $table->status = 'inactive';
        $table->save();

        $table->delete();

        return response()->json([
            'success' => true,
            'message' => 'Restaurant table deleted successfully'
        ]);
    }
}
