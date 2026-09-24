<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateReservationDepositStatusRequest;
use App\Models\ReservationDeposit;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class SalesOperationController extends Controller
{
    public function deposit(UpdateReservationDepositStatusRequest $request, ReservationDeposit $reservationDeposit): JsonResponse
    {
        $data = $request->validated();
        $deposit = DB::transaction(function () use ($reservationDeposit, $data) {
            $deposit = ReservationDeposit::query()->lockForUpdate()->findOrFail($reservationDeposit->id);
            $allowed = [
                'pending' => ['paid', 'forfeited'], 'paid' => ['applied', 'refunded', 'forfeited'],
                'applied' => ['refunded'], 'refunded' => [], 'forfeited' => [],
            ];
            if (! in_array($data['status'], $allowed[$deposit->status] ?? [], true)) {
                throw ValidationException::withMessages(['status' => 'Invalid reservation-deposit status transition.']);
            }
            $payload = ['status' => $data['status']];
            if (isset($data['payment_id'])) {
                $payload['payment_id'] = $data['payment_id'];
            }
            if ($data['status'] === 'paid') {
                $payload['paid_at'] = now();
            }
            if ($data['status'] === 'refunded') {
                $payload['refunded_at'] = now();
            }
            $deposit->update($payload);

            return $deposit->refresh();
        });

        return response()->json(['success' => true, 'data' => $deposit]);
    }
}
