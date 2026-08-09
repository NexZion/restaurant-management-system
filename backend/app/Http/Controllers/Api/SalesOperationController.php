<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\AdjustLoyaltyRequest;
use App\Http\Requests\ApplyPromotionRequest;
use App\Http\Requests\UpdateReservationDepositStatusRequest;
use App\Models\Customer;
use App\Models\Order;
use App\Models\ReservationDeposit;
use App\Services\LoyaltyService;
use App\Services\PromotionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class SalesOperationController extends Controller
{
    public function __construct(private LoyaltyService $loyalty, private PromotionService $promotions) {}

    public function loyalty(AdjustLoyaltyRequest $request, Customer $customer): JsonResponse
    {
        $data = $request->validated();
        $transaction = $this->loyalty->record(
            $customer, $data['type'], $data['points'], $data['order_id'] ?? null, $data['description'] ?? null,
        );

        return response()->json(['success' => true, 'data' => $transaction], 201);
    }

    public function promotion(ApplyPromotionRequest $request, Order $order): JsonResponse
    {
        abort_unless($order->branch_id === $request->user()->branch_id, 404);
        $data = $request->validated();
        $discount = $this->promotions->apply(
            $order, $data['promotion_id'] ?? null, $data['coupon_code'] ?? null,
            $data['order_item_id'] ?? null, $data['reason'] ?? null, $request->user()->id,
        );

        return response()->json(['success' => true, 'data' => $discount], 201);
    }

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
