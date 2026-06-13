<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;


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

        if ($user->role_id != 1) {
            return response()->json([
                'success' => false,
                'message' => 'Only admins can view users'
            ], 403);
        }

        $users = User::with('role')->get();

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

        if ($user->role_id != 1) {
            return response()->json([
                'success' => false,
                'message' => 'Only admins can create users'
            ], 403);
        }

        $newUser = User::create([
            'name' => $request->name,
            'username' => $request->username,
            'email' => $request->email,
            'phone' => $request->phone,
            'whatsapp' => $request->whatsapp,
            'password' => Hash::make($request->password),
            'role_id' => $request->role_id,
            'branch_id' => $request->branch_id,
            'pin' => $request->pin,
            'dob' => $request->dob,
            'address' => $request->address,
            'status' => $request->status ?? 'active',
            'image' => null
        ]);

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

        if ($user->role_id != 1) {
            return response()->json([
                'success' => false,
                'message' => 'Only admins can view users'
            ], 403);
        }

        $selectedUser = User::with('role')->find($id);

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
    public function update(UpdateUserRequest $request, $id)
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
                'message' => 'Only admins can update users'
            ], 403);
        }

        $selectedUser = User::find($id);

        if (!$selectedUser) {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 404);
        }

        $selectedUser->update([
            'name' => $request->name,
            'username' => $request->username,
            'email' => $request->email,
            'phone' => $request->phone,
            'whatsapp' => $request->whatsapp,
            'role_id' => $request->role_id,
            'branch_id' => $request->branch_id,
            'pin' => $request->pin,
            'dob' => $request->dob,
            'address' => $request->address,
            'status' => $request->status
        ]);

        return response()->json([
            'success' => true,
            'message' => 'User updated successfully',
            'data' => $selectedUser
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
                'message' => 'Only admins can delete users'
            ], 403);
        }

        $selectedUser = User::find($id);

        if (!$selectedUser) {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 404);
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
