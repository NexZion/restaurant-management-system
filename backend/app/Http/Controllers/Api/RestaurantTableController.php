<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\IndexFilterRequest;
use App\Http\Requests\StoreRestaurantTableRequest;
use App\Http\Requests\UpdateRestaurantTableRequest;
use App\Models\RestaurantTable;
use Illuminate\Http\Request;

class RestaurantTableController extends Controller
{
    public function index(IndexFilterRequest $request)
    {
        $user = $request->user();

        if (! $user) {
            return response()->json([
                'success' => false,
                'message' => 'Please login first',
            ], 401);
        }

        if (! in_array($user->role_id, [1, 2])) {
            return response()->json([
                'success' => false,
                'message' => 'Only Admin or Manager can view tables',
            ], 403);
        }

        $tables = $this->filterAndPaginate(
            RestaurantTable::where('branch_id', $user->branch_id),
            $request,
            [
                'id', 'branch_id', 'table_number', 'capacity', 'table_type', 'section',
                'section_id', 'floor_id', 'status', 'created_at', 'updated_at',
            ],
            ['table_number', 'table_type', 'section', 'status'],
        );

        return response()->json([
            'success' => true,
            'data' => $tables,
        ]);
    }

    public function show(Request $request, string $id)
    {
        $user = $request->user();

        if (! $user) {
            return response()->json([
                'success' => false,
                'message' => 'Please login first',
            ], 401);
        }

        if (! in_array($user->role_id, [1, 2])) {
            return response()->json([
                'success' => false,
                'message' => 'Only Admin or Manager can view tables',
            ], 403);
        }

        $table = RestaurantTable::where('branch_id', $user->branch_id)->find($id);

        if (! $table) {
            return response()->json([
                'success' => false,
                'message' => 'Restaurant table not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $table,
        ]);
    }

    public function store(StoreRestaurantTableRequest $request)
    {
        $user = $request->user();

        if (! in_array($user->role_id, [1, 2])) {
            return response()->json([
                'success' => false,
                'message' => 'Only Admin or Manager can create tables',
            ], 403);
        }

        $table = RestaurantTable::create(array_merge($request->validated(), [
            'branch_id' => $user->branch_id,
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Restaurant table created successfully',
            'data' => $table,
        ], 201);
    }

    public function update(
        UpdateRestaurantTableRequest $request,
        $id
    ) {
        $user = $request->user();

        if (! in_array($user->role_id, [1, 2])) {
            return response()->json([
                'success' => false,
                'message' => 'Only Admin or Manager can update tables',
            ], 403);
        }

        $table = RestaurantTable::where('branch_id', $user->branch_id)->find($id);

        if (! $table) {
            return response()->json([
                'success' => false,
                'message' => 'Restaurant table not found',
            ], 404);
        }

        $table->update($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Restaurant table updated successfully',
            'data' => $table,
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $user = $request->user();

        if (! in_array($user->role_id, [1, 2])) {
            return response()->json([
                'success' => false,
                'message' => 'Only Admin or Manager can delete tables',
            ], 403);
        }

        $table = RestaurantTable::where('branch_id', $user->branch_id)->find($id);

        if (! $table) {
            return response()->json([
                'success' => false,
                'message' => 'Restaurant table not found',
            ], 404);
        }

        $table->update([
            'is_active' => false,
        ]);
        $table->status = 'inactive';
        $table->save();

        $table->delete();

        return response()->json([
            'success' => true,
            'message' => 'Restaurant table deleted successfully',
        ]);
    }
}
