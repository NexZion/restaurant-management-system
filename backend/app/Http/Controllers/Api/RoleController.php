<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\IndexFilterRequest;
use App\Http\Requests\StoreRoleRequest;
use App\Http\Requests\UpdateRoleRequest;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;

class RoleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(IndexFilterRequest $request)
    {
        // Get logged-in user
        $user = $request->user();

        // Check access level
        if ($user->role->access_level != 100) {

            return response()->json([
                'success' => false,
                'message' => 'Only Admin can access this.',
            ], 403);

        }

        // User is Admin
        $roles = $this->filterAndPaginate(
            Role::query(),
            $request,
            ['id', 'name', 'description', 'access_level', 'created_at', 'updated_at'],
            ['name', 'description'],
        );

        return response()->json([
            'success' => true,
            'data' => $roles,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreRoleRequest $request)
    {
        $user = $request->user();

        if (! $user) {
            return response()->json([
                'success' => false,
                'message' => 'Please login first',
            ], 401);
        }

        if ($user->role->access_level != 100) {
            return response()->json([
                'success' => false,
                'message' => 'Only admins can create roles',
            ], 403);
        }

        $data = $request->validated();
        $role = Role::create(Arr::except($data, 'permission_ids'));
        $role->permissions()->sync($data['permission_ids'] ?? []);

        return response()->json([
            'success' => true,
            'message' => 'Role created successfully',
            'data' => $role->load('permissions'),
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, string $id)
    {
        $user = $request->user();

        if (! $user) {
            return response()->json([
                'success' => false,
                'message' => 'Please login first',
            ], 401);
        }

        if ($user->role->access_level != 100) {
            return response()->json([
                'success' => false,
                'message' => 'Only admins can view roles',
            ], 403);
        }

        $role = Role::with('permissions')->find($id);

        if (! $role) {
            return response()->json([
                'success' => false,
                'message' => 'Role not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $role,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateRoleRequest $request, string $id)
    {
        $user = $request->user();

        if (! $user) {
            return response()->json([
                'success' => false,
                'message' => 'Please login first',
            ], 401);
        }

        if ($user->role->access_level != 100) {
            return response()->json([
                'success' => false,
                'message' => 'Only admins can update roles',
            ], 403);
        }

        $role = Role::find($id);

        if (! $role) {
            return response()->json([
                'success' => false,
                'message' => 'Role not found',
            ], 404);
        }

        $data = $request->validated();
        $role->update(Arr::except($data, 'permission_ids'));
        if (array_key_exists('permission_ids', $data)) {
            $role->permissions()->sync($data['permission_ids']);
        }

        return response()->json([
            'success' => true,
            'message' => 'Role updated successfully',
            'data' => $role->load('permissions'),
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, string $id)
    {
        $user = $request->user();

        if (! $user) {
            return response()->json([
                'success' => false,
                'message' => 'Please login first',
            ], 401);
        }

        if ($user->role->access_level != 100) {
            return response()->json([
                'success' => false,
                'message' => 'Only admins can delete roles',
            ], 403);
        }

        $role = Role::find($id);

        if (! $role) {
            return response()->json([
                'success' => false,
                'message' => 'Role not found',
            ], 404);
        }

        $role->delete();

        return response()->json([
            'success' => true,
            'message' => 'Role deleted successfully',
        ]);
    }
}
