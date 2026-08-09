<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\IndexFilterRequest;
use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;

class AuditLogController extends Controller
{
    public function index(IndexFilterRequest $request): JsonResponse
    {
        $query = AuditLog::query()->with('user')->where(function ($query) use ($request) {
            $query->where('branch_id', $request->user()->branch_id)->orWhereNull('branch_id');
        });

        return response()->json(['success' => true, 'data' => $this->filterAndPaginate(
            $query, $request,
            ['id', 'branch_id', 'user_id', 'auditable_type', 'auditable_id', 'action', 'ip_address', 'created_at'],
            ['auditable_type', 'action', 'ip_address', 'user_agent'],
        )]);
    }

    public function show(AuditLog $auditLog): JsonResponse
    {
        abort_unless($auditLog->branch_id === null || $auditLog->branch_id === request()->user()->branch_id, 404);

        return response()->json(['success' => true, 'data' => $auditLog->load('user')]);
    }
}
