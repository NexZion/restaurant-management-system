<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Role;
use Illuminate\Http\Request;
use App\Http\Requests\StoreRoleRequest;
use App\Http\Requests\UpdateRoleRequest;

class RoleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
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
                'message' => 'Only admins can view roles'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => Role::all()
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreRoleRequest $request)
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
                'message' => 'Only admins can create roles'
            ], 403);
        }

        $role = Role::create([
            'name' => $request->name,
            'description'=> $request->description,
            'access_level' => $request->access_level
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Role created successfully',
            'data' => $role
        ], 201);
    }


    /**
     * Display the specified resource.
     */
    public function show(Request $request, $id)
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
                'message' => 'Only admins can view roles'
            ], 403);
        }

        $role = Role::find($id);

        if (!$role) {
            return response()->json([
                'success' => false,
                'message' => 'Role not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $role
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateRoleRequest $request, $id)
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
                'message' => 'Only admins can update roles'
            ], 403);
        }

        $role = Role::find($id);

        if (!$role) {
            return response()->json([
                'success' => false,
                'message' => 'Role not found'
            ], 404);
        }

        $role->update([
            'name' => $request->name,
            'description'=> $request->description,
            'access_level' => $request->access_level
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Role updated successfully',
            'data' => $role
        ]);
    }


    /**
     * Remove the specified resource from storage.
     */
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
                'message' => 'Only admins can delete roles'
            ], 403);
        }

        $role = Role::find($id);

        if (!$role) {
            return response()->json([
                'success' => false,
                'message' => 'Role not found'
            ], 404);
        }

        $role->delete();

        return response()->json([
            'success' => true,
            'message' => 'Role deleted successfully'
        ]);
    }
}
