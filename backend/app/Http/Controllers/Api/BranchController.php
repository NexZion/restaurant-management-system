<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\IndexFilterRequest;
use App\Http\Requests\StoreBranchRequest;
use App\Http\Requests\UpdateBranchRequest;
use App\Models\Branch;
use Illuminate\Http\Request;

class BranchController extends Controller
{
    public function store(StoreBranchRequest $request)
    {
        $user = $request->user();

        if (! $user) {
            return response()->json([
                'success' => false,
                'message' => 'Please login first',
            ], 401);
        }

        if ($user->role->access_level < 80) {
            return response()->json([
                'success' => false,
                'message' => 'Only admins and managers can create branches',
            ], 403);
        }

        $branch = Branch::create($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Branch created successfully',
            'data' => $branch,
        ], 201);
    }

    public function index(IndexFilterRequest $request)
    {
        $user = $request->user();

        if (! $user) {
            return response()->json([
                'success' => false,
                'message' => 'Please login first',
            ], 401);
        }

        $branches = $this->filterAndPaginate(
            Branch::query(),
            $request,
            [
                'id', 'code', 'name', 'slug', 'address_line1', 'address_line2', 'city',
                'state_province', 'postal_code', 'country', 'latitude', 'longitude',
                'phone', 'email', 'whatsapp', 'branch_type', 'has_dining', 'has_rooms',
                'has_delivery', 'opening_time', 'closing_time', 'timezone',
                'manager_name', 'contact_person_phone', 'status', 'is_active',
                'created_at', 'updated_at',
            ],
            [
                'code', 'name', 'slug', 'address_line1', 'address_line2', 'city',
                'state_province', 'postal_code', 'country', 'phone', 'email', 'whatsapp',
                'manager_name', 'contact_person_phone',
            ],
        );

        return response()->json([
            'success' => true,
            'data' => $branches,
        ]);
    }

    public function show(Request $request, $id)
    {
        $user = $request->user();

        if (! $user) {
            return response()->json([
                'success' => false,
                'message' => 'Please login first',
            ], 401);
        }

        $branch = Branch::find($id);

        if (! $branch) {
            return response()->json([
                'success' => false,
                'message' => 'Branch not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $branch,
        ]);
    }

    public function update(UpdateBranchRequest $request, $id)
    {
        $user = $request->user();

        if (! $user) {
            return response()->json([
                'success' => false,
                'message' => 'Please login first',
            ], 401);
        }

        if ($user->role->access_level < 80) {
            return response()->json([
                'success' => false,
                'message' => 'Only admins and managers can update branches',
            ], 403);
        }

        $branch = Branch::find($id);

        if (! $branch) {
            return response()->json([
                'success' => false,
                'message' => 'Branch not found',
            ], 404);
        }

        $branch->update($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Branch updated successfully',
            'data' => $branch,
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $user = $request->user();

        if (! $user) {
            return response()->json([
                'success' => false,
                'message' => 'Please login first',
            ], 401);
        }

        if ($user->role->access_level < 80) {
            return response()->json([
                'success' => false,
                'message' => 'Only admins and managers can delete branches',
            ], 403);
        }

        $branch = Branch::find($id);

        if (! $branch) {
            return response()->json([
                'success' => false,
                'message' => 'Branch not found',
            ], 404);
        }

        $branch->status = 'inactive';
        $branch->is_active = 0;
        $branch->save();

        $branch->delete();

        return response()->json([
            'success' => true,
            'message' => 'Branch deleted successfully',
        ]);
    }
}
