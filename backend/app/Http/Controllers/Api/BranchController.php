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

        $branch = Branch::create($request->validated());

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

        $branches = Branch::paginate(
            $request->input('per_page', 10)
            );

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

        $branch->update($request->validated());

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

        $branch->status = 'inactive';
        $branch->is_active = 0;
        $branch->save();

        $branch->delete();

        return response()->json([
            'success' => true,
            'message' => 'Branch deleted successfully'
        ]);
    }
}
