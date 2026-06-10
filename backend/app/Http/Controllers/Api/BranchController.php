<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBranchRequest;
use App\Http\Requests\UpdateBranchRequest;
use App\Models\Branch;
use Illuminate\Http\Request;

class BranchController extends Controller
{
public function store(StoreBranchRequest $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Please login first'
            ], 401);
        }

        if ($user->role_id != 1) {
            return response()->json([
                'success' => false,
                'message' => 'Only admins can create branches'
            ], 403);
        }

        $branch = Branch::create([
            'code' => $request->code,
            'name' => $request->name,
            'slug' => $request->slug,
            'address_line1' => $request->address_line1,
            'address_line2' => $request->address_line2,
            'city' => $request->city,
            'state_province' => $request->state_province,
            'postal_code' => $request->postal_code,
            'country' => $request->country ?? 'Sri Lanka',
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
            'phone' => $request->phone,
            'email' => $request->email,
            'whatsapp' => $request->whatsapp,
            'branch_type' => $request->branch_type ?? 'restaurant',
            'has_dining' => $request->has_dining ?? true,
            'has_rooms' => $request->has_rooms ?? false,
            'has_delivery' => $request->has_delivery ?? false
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Branch created successfully',
            'data' => $branch
        ], 201);
    }
    public function index(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Please login first'
            ], 401);
        }

        if ($user->role_id != 1) {
            return response()->json([
                'success' => false,
                'message' => 'Only admins can view branches'
            ], 403);
        }

        $branches = Branch::all();

        return response()->json([
            'success' => true,
            'data' => $branches
        ]);
    }

    public function show(Request $request, $id)
{
    $user = $request->user();

    if (!$user) {
        return response()->json([
            'success' => false,
            'message' => 'Please login first'
        ], 401);
    }

    $branch = Branch::find($id);

    if (!$branch) {
        return response()->json([
            'success' => false,
            'message' => 'Branch not found'
        ], 404);
    }

    return response()->json([
        'success' => true,
        'data' => $branch
    ]);
}

    public function update(UpdateBranchRequest $request, $id)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Please login first'
            ], 401);
        }

        if ($user->role_id != 1) {
            return response()->json([
                'success' => false,
                'message' => 'Only admins can update branches'
            ], 403);
        }

        $branch = Branch::find($id);

        if (!$branch) {
            return response()->json([
                'success' => false,
                'message' => 'Branch not found'
            ], 404);
        }

        $branch->update([
            'code' => $request->code ?? $branch->code,
            'name' => $request->name,
            'slug' => $request->slug ?? $branch->slug,
            'address_line1' => $request->address_line1,
            'address_line2' => $request->address_line2,
            'city' => $request->city,
            'state_province' => $request->state_province,
            'postal_code' => $request->postal_code,
            'country' => $request->country,
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
            'phone' => $request->phone,
            'email' => $request->email,
            'whatsapp' => $request->whatsapp,
            'branch_type' => $request->branch_type,
            'has_dining' => $request->has_dining,
            'has_rooms' => $request->has_rooms,
            'has_delivery' => $request->has_delivery
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Branch updated successfully',
            'data' => $branch
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Please login first'
            ], 401);
        }

        if ($user->role_id != 1) {
            return response()->json([
                'success' => false,
                'message' => 'Only admins can delete branches'
            ], 403);
        }

        $branch = Branch::find($id);

        if (!$branch) {
            return response()->json([
                'success' => false,
                'message' => 'Branch not found'
            ], 404);
        }

        $branch->delete();

        return response()->json([
            'success' => true,
            'message' => 'Branch deleted successfully'
        ]);
    }
}
