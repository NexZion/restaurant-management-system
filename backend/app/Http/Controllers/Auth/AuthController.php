<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Tymon\JWTAuth\Facades\JWTAuth;
use App\Models\LoginAttempt;

class AuthController extends Controller
{

    /**
     * User Login
     */
    public function login(Request $request)
    {
        // validate request
        $request->validate([
            'login' => 'required',
            'password' => 'required',
            'rememberMe' => 'sometimes|boolean'
        ]);

        $rememberMe = $request->boolean('rememberMe');
        $tokenTtl = $rememberMe
            ? (int) config('jwt.remember_ttl', config('jwt.ttl', 60))
            : (int) config('jwt.login_ttl', config('jwt.ttl', 60));
        $jwtFactory = Auth::factory();
        $originalTtl = config('jwt.ttl');

        $jwtFactory->setTTL($tokenTtl);

        // determine login field
        $login = $request->login;

        $field = filter_var($login, FILTER_VALIDATE_EMAIL)
            ? 'email'
            : 'username';

        // find user
        $user = User::where($field, $login)->first();

        // check user exists
        if (!$user) {

            return response()->json([
                'success' => false,
                'message' => 'Invalid credentials'
            ], 401);
        }

        // check account locked
        if ($user->is_locked) {

            return response()->json([
                'success' => false,
                'message' => 'Account is locked'
            ], 403);
        }

        // login credentials
        $credentials = [
            $field => $login,
            'password' => $request->password
        ];

        // attempt login
        try {
            if (!$token = Auth::attempt($credentials)) {

                // increment failed attempts
                $user->failed_attempts += 1;

                // lock account after 10 attempts
                if ($user->failed_attempts >= 10) {
                    $user->is_locked = true;
                }

                $user->save();

                LoginAttempt::create([
                    'email' => $user->email,
                    'status' => 'failed',
                    'ip_address' => $request->ip()
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Invalid credentials',
                    'failed_attempts' => $user->failed_attempts
                ], 401);
            }
        } finally {
            $jwtFactory->setTTL($originalTtl);
        }

        // reset failed attempts after success
        $user->failed_attempts = 0;
        $user->save();

        LoginAttempt::create([
            'email' => $user->email,
            'status' => 'success',
            'ip_address' => $request->ip()
        ]);

        $user->load(['role', 'branch']);

        return response()->json([
            'success' => true,
            'message' => 'Login Successful',
            'token' => $token,
            'user' => $user
        ]);
    }

    public function logout()
    {
        Auth::guard('api')->logout();

        return response()->json([
            'success' => true,
            'message' => 'Logged Out Successfully'
        ]);
    }

    /**
     * Refresh JWT Token
     */

    public function refresh()
    {
        return response()->json([

            'success' => true,

            'message' => 'Token refreshed successfully',

            'token' => Auth::refresh()

        ]);
    }
    /**
     * Get Logged User
     */
    public function me()
    {
        /**
         * @var \App\Models\User|null $user
         */

        $user = Auth::guard('api')->user();
        if ($user) {
           $user?->load(['role', 'branch']);
        }
       

        return response()->json([
            'success' => true,
            'user' => $user
        ]);
    }

    /**
     * PIN Login
     */
    public function pinLogin(Request $request)
    {
        // validate request
        $request->validate([
            'pin' => 'required'
        ]);

        // find user by pin
        $user = User::where('pin', $request->pin)->first();

        // check user exists
        if (!$user) {

            return response()->json([
                'success' => false,
                'message' => 'Invalid PIN'
            ], 401);
        }

        // check role
        $allowedRoles = ['waiter', 'cashier'];

        if (!in_array($user->role->name, $allowedRoles)) {

            return response()->json([
                'success' => false,
                'message' => 'PIN login allowed only for waiter or cashier'
            ], 403);
        }

        // generate token
        $token = JWTAuth::fromUser($user);
        $user->load(['role', 'branch']);

        return response()->json([
            'success' => true,
            'message' => 'PIN Login Successful',
            'token' => $token,
            'user' => $user
        ]);
    }
    public function changePassword(Request $request)
    {
        // validate request
        $request->validate([
            'old_password' => 'required',
            'new_password' => 'required|min:6'
        ]);

        // get logged user from JWT token
        $user = JWTAuth::parseToken()->authenticate();

        // Check if user exists
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not authenticated'
            ], 401);
        }

        // check old password
        if (!Hash::check($request->old_password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Old password incorrect'
            ], 401);
        }

        // update password
        $user->password = bcrypt($request->new_password);
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Password changed successfully'
        ]);
    }
}
