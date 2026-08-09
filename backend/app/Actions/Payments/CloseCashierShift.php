<?php

namespace App\Actions\Payments;

use App\Models\CashierShift;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CloseCashierShift
{
    public function execute(CashierShift $shift, float $closingCash, ?string $notes): CashierShift
    {
        return DB::transaction(function () use ($shift, $closingCash, $notes) {
            $shift = CashierShift::query()->lockForUpdate()->findOrFail($shift->id);
            if ($shift->status !== 'open') {
                throw ValidationException::withMessages(['shift' => 'Only an open shift can be closed.']);
            }

            $cashPayments = $shift->payments()
                ->where('payment_status', 'successful')
                ->where(function ($query) {
                    $query->where('payment_method', 'cash')
                        ->orWhereHas('method', fn ($method) => $method->where('is_cash', true));
                });
            $cashReceived = (float) (clone $cashPayments)->sum('amount_paid');
            $cashRefunded = (float) DB::query()->fromSub($cashPayments->select('payments.id'), 'cash_payments')
                ->join('refunds', 'refunds.payment_id', '=', 'cash_payments.id')
                ->where('refunds.status', 'processed')
                ->sum('refunds.amount');
            $expectedCash = round((float) $shift->opening_cash + $cashReceived - $cashRefunded, 2);

            $shift->update([
                'status' => 'closed', 'closed_at' => now(), 'expected_cash' => $expectedCash,
                'closing_cash' => $closingCash, 'cash_variance' => round($closingCash - $expectedCash, 2),
                'notes' => $notes ?? $shift->notes,
            ]);

            return $shift->refresh();
        });
    }
}
