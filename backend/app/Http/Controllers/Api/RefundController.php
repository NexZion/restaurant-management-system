<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\IndexFilterRequest;
use App\Http\Requests\StoreRefundRequest;
use App\Http\Requests\UpdateRefundRequest;
use App\Models\Payment;
use App\Models\Refund;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class RefundController extends Controller
{
    public function index(IndexFilterRequest $request): JsonResponse
    {
        $refunds = $this->filterAndPaginate(
            Refund::with(['payment', 'bill', 'approver', 'processor'])->whereHas('bill.order', fn ($query) => $query->where('branch_id', $request->user()->branch_id)),
            $request,
            ['id', 'payment_id', 'order_bill_id', 'amount', 'reason', 'status', 'transaction_reference', 'approved_by', 'processed_by', 'processed_at', 'created_at', 'updated_at'],
            ['reason', 'status', 'transaction_reference'],
        );

        return response()->json(['success' => true, 'data' => $refunds]);
    }

    public function store(StoreRefundRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $refund = DB::transaction(function () use ($validated, $request): Refund {
            $payment = Payment::query()->lockForUpdate()->findOrFail($validated['payment_id']);
            abort_unless($payment->order_bill_id === (int) $validated['order_bill_id'], 422, 'Payment does not belong to the bill.');
            $refunded = (float) $payment->refunds()->whereIn('status', ['approved', 'processed'])->sum('amount');
            abort_if((float) $validated['amount'] > (float) $payment->amount_paid - $refunded, 422, 'Refund exceeds the refundable payment amount.');

            return Refund::create(array_merge($validated, ['status' => 'pending', 'approved_by' => $request->user()->id]));
        });

        return response()->json(['success' => true, 'data' => $refund], 201);
    }

    public function show(Refund $refund): JsonResponse
    {
        return response()->json(['success' => true, 'data' => $refund->load(['payment', 'bill', 'approver', 'processor'])]);
    }

    public function update(UpdateRefundRequest $request, Refund $refund): JsonResponse
    {
        $payload = $request->validated();
        if ($payload['status'] === 'processed') {
            $payload['processed_by'] = $request->user()->id;
            $payload['processed_at'] = now();
        }
        $refund->update($payload);

        return response()->json(['success' => true, 'data' => $refund->fresh()]);
    }

    public function destroy(Refund $refund): JsonResponse
    {
        abort_if($refund->status === 'processed', 409, 'Processed refunds cannot be cancelled.');
        $refund->update(['status' => 'cancelled']);

        return response()->json(['success' => true, 'message' => 'Refund cancelled successfully.']);
    }
}
