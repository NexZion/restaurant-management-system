<?php

namespace App\Http\Controllers\Api;

use App\Actions\Payments\CloseCashierShift;
use App\Http\Controllers\Controller;
use App\Http\Requests\CloseCashierShiftRequest;
use App\Http\Requests\OpenCashierShiftRequest;
use App\Models\CashierShift;
use App\Models\PosTerminal;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CashierShiftController extends Controller
{
    public function open(OpenCashierShiftRequest $request): JsonResponse
    {
        $data = $request->validated();
        $terminal = PosTerminal::query()->where('branch_id', $request->user()->branch_id)->findOrFail($data['pos_terminal_id']);
        $shift = DB::transaction(function () use ($request, $data, $terminal) {
            if (CashierShift::query()->where('pos_terminal_id', $terminal->id)->where('status', 'open')->lockForUpdate()->exists()) {
                throw ValidationException::withMessages(['pos_terminal_id' => 'This terminal already has an open shift.']);
            }

            return CashierShift::query()->create([
                'branch_id' => $request->user()->branch_id, 'pos_terminal_id' => $terminal->id,
                'user_id' => $request->user()->id, 'status' => 'open', 'opened_at' => now(),
                'opening_cash' => $data['opening_cash'], 'notes' => $data['notes'] ?? null,
            ]);
        });

        return response()->json(['success' => true, 'data' => $shift], 201);
    }

    public function close(CloseCashierShiftRequest $request, CashierShift $cashierShift, CloseCashierShift $action): JsonResponse
    {
        abort_unless($cashierShift->branch_id === $request->user()->branch_id, 404);
        $shift = $action->execute($cashierShift, (float) $request->validated('closing_cash'), $request->validated('notes'));

        return response()->json(['success' => true, 'data' => $shift]);
    }
}
