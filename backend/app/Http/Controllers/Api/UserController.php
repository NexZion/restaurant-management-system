<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\IndexFilterRequest;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(IndexFilterRequest $request)
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
                'message' => 'Only admins can view users',
            ], 403);
        }

        $users = $this->filterAndPaginate(
            User::with(['role', 'branch']),
            $request,
            [
                'id', 'name', 'username', 'email', 'phone', 'whatsapp', 'role_id',
                'branch_id', 'image', 'dob', 'address', 'status', 'is_active',
                'failed_attempts', 'is_locked', 'created_at', 'updated_at',
            ],
            ['name', 'username', 'email', 'phone', 'whatsapp', 'address', 'status'],
        );

        return response()->json([
            'success' => true,
            'data' => $users,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreUserRequest $request)
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
                'message' => 'Only admins can create users',
            ], 403);
        }

        $data = $request->validated();

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('users', 'public');
        }

        $data['password'] = Hash::make($data['password']);
        $newUser = User::create($data);

        return response()->json([
            'success' => true,
            'message' => 'User created successfully',
            'data' => $newUser,
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
                'message' => 'Only admins can view users',
            ], 403);
        }

        $selectedUser = User::with(['role', 'branch'])->find($id);

        if (! $selectedUser) {
            return response()->json([
                'success' => false,
                'message' => 'User not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $selectedUser,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateUserRequest $request, string $id)
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
                'message' => 'Only admins can update users',
            ], 403);
        }

        $selectedUser = User::with(['role', 'branch'])->find($id);

        if (! $selectedUser) {
            return response()->json([
                'success' => false,
                'message' => 'User not found',
            ], 404);
        }

        $data = $request->validated();
        unset($data['remove_image']);

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('users', 'public');
            if ($selectedUser->image) {
                Storage::disk('public')->delete($selectedUser->image);
            }
        } elseif ($request->boolean('remove_image')) {
            if ($selectedUser->image) {
                Storage::disk('public')->delete($selectedUser->image);
            }
            $data['image'] = null;
        }

        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        }
        $selectedUser->update($data);

        return response()->json([
            'success' => true,
            'message' => 'User updated successfully',
            'data' => $selectedUser,
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
                'message' => 'Only admins can delete users',
            ], 403);
        }

        $selectedUser = User::with(['role', 'branch'])->find($id);

        if (! $selectedUser) {
            return response()->json([
                'success' => false,
                'message' => 'User not found',
            ], 404);
        }

        $selectedUser->status = 'inactive';
        $selectedUser->is_active = 0;
        $selectedUser->save();

        $selectedUser->delete();

        return response()->json([
            'success' => true,
            'message' => 'User deleted successfully',
        ]);
    }
}
