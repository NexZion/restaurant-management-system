<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\IndexFilterRequest;
use App\Http\Requests\StoreTableSessionRequest;
use App\Http\Requests\UpdateTableSessionRequest;
use App\Models\TableSession;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class TableSessionController extends Controller
{
    public function index(IndexFilterRequest $request): JsonResponse
    {
        $sessions = $this->filterAndPaginate(
            TableSession::with(['reservation', 'opener', 'tables'])->where('branch_id', $request->user()->branch_id),
            $request,
            ['id', 'branch_id', 'reservation_id', 'opened_by', 'guest_count', 'status', 'opened_at', 'closed_at', 'created_at', 'updated_at'],
            ['status'],
        );

        return response()->json(['success' => true, 'data' => $sessions]);
    }

    public function store(StoreTableSessionRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $session = DB::transaction(function () use ($validated): TableSession {
            $session = TableSession::create(array_merge(Arr::except($validated, 'table_ids'), ['opened_at' => $validated['opened_at'] ?? now()]));
            $session->tables()->attach($validated['table_ids'], ['assigned_at' => now()]);

            return $session;
        });

        return response()->json(['success' => true, 'data' => $session->load(['reservation', 'opener', 'tables'])], 201);
    }

    public function show(TableSession $tableSession): JsonResponse
    {
        $this->ensureBranchAccess($tableSession);

        return response()->json(['success' => true, 'data' => $tableSession->load(['reservation', 'opener', 'tables', 'orders'])]);
    }

    public function update(UpdateTableSessionRequest $request, TableSession $tableSession): JsonResponse
    {
        $this->ensureBranchAccess($tableSession);
        $validated = $request->validated();
        DB::transaction(function () use ($tableSession, $validated): void {
            $tableSession->update(Arr::except($validated, 'table_ids'));
            if (isset($validated['table_ids'])) {
                $tableSession->tables()->syncWithPivotValues($validated['table_ids'], ['assigned_at' => now()]);
            }
        });

        return response()->json(['success' => true, 'data' => $tableSession->fresh()->load('tables')]);
    }

    public function destroy(TableSession $tableSession): JsonResponse
    {
        $this->ensureBranchAccess($tableSession);
        abort_if($tableSession->orders()->exists(), 409, 'Sessions with orders cannot be deleted.');
        $tableSession->delete();

        return response()->json(['success' => true, 'message' => 'Table session deleted successfully.']);
    }

    private function ensureBranchAccess(TableSession $session): void
    {
        abort_unless($session->branch_id === request()->user()->branch_id, 404);
    }
}
