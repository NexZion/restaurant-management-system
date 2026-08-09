<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsurePermission
{
    public function handle(Request $request, Closure $next, string $permission): Response|JsonResponse
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated.'], 401);
        }

        if ((int) $user->role?->access_level !== 100 && ! $user->hasPermission($permission)) {
            return response()->json(['success' => false, 'message' => "Missing permission: {$permission}."], 403);
        }

        return $next($request);
    }
}
