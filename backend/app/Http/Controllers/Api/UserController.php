<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use App\Models\User;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\Branch;


class UserController extends Controller
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

        if ($user->role->access_level != 100) {
            return response()->json([
                'success' => false,
                'message' => 'Only admins can view users'
            ], 403);
        }

        $validated = $request->validate([
            'role' => ['nullable', 'integer', 'exists:roles,id'],
            'branch' => ['nullable', 'integer', 'exists:branches,id'],
            'status' => ['nullable', 'in:active,inactive,blocked'],
        ]);

        $users = User::with(['role', 'branch'])
            ->when(
                !empty($validated['role']),
                fn($query) => $query->where('role_id', $validated['role'])
            )
            ->when(
                !empty($validated['branch']),
                fn($query) => $query->where('branch_id', $validated['branch'])
            )
            ->when(
                !empty($validated['status']),
                fn($query) => $query->where('status', $validated['status'])
            )
            ->get();

        return response()->json([
            'success' => true,
            'data' => $users
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreUserRequest $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Please login first'
            ], 401);
        }


        if ($user->role->access_level != 100) {
            return response()->json([
                'success' => false,
                'message' => 'Only admins can create users'
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
            'data' => $newUser
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, string $id)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Please login first'
            ], 401);
        }

        if ($user->role->access_level != 100) {
            return response()->json([
                'success' => false,
                'message' => 'Only admins can view users'
            ], 403);
        }

        $selectedUser = User::with(['role', 'branch'])->find($id);

        if (!$selectedUser) {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $selectedUser
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateUserRequest $request, string $id)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Please login first'
            ], 401);
        }

        if ($user->role->access_level != 100) {
            return response()->json([
                'success' => false,
                'message' => 'Only admins can update users'
            ], 403);
        }

        $selectedUser = User::with(['role', 'branch'])->find($id);

        if (!$selectedUser) {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 404);
        }

        $data = $request->validated();
        $oldImage = null;

        if ($request->hasFile('image')) {
            $newImage = $request->file('image')->store('users', 'public');
            $oldImage = $selectedUser->image;
            $data['image'] = $newImage;
        } elseif ($request->boolean('remove_image') && $selectedUser->image) {
            $oldImage = $selectedUser->image;
            $data['image'] = null;
        }
        unset($data['remove_image']);

        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        }
        $selectedUser->update($data);
        if ($oldImage) {
            Storage::disk('public')->delete($oldImage);
        }

        return response()->json([
            'success' => true,
            'message' => 'User updated successfully',
            'data' => $selectedUser
        ]);
    }
    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, string $id)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Please login first'
            ], 401);
        }

        if ($user->role->access_level != 100) {
            return response()->json([
                'success' => false,
                'message' => 'Only admins can delete users'
            ], 403);
        }

        $selectedUser = User::with(['role', 'branch'])->find($id);

        if (!$selectedUser) {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 404);
        }

        $isProtectedUser =
            (int) $selectedUser->role->access_level === 5 ||
            strtolower($selectedUser->role->name) === 'admin';

        if ($isProtectedUser) {
            return response()->json([
                'success' => false,
                'message' => 'Level 5 and admin users cannot be deleted'
            ], 403);
        }

        $selectedUser->status = 'inactive';
        $selectedUser->is_active = 0;
        $selectedUser->save();

        $selectedUser->delete();

        return response()->json([
            'success' => true,
            'message' => 'User deleted successfully'
        ]);
    }
}
