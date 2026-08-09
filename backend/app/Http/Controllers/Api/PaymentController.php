<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\IndexFilterRequest;
use App\Http\Requests\StorePaymentRequest;
use App\Http\Requests\UpdatePaymentRequest;
use App\Http\Requests\VoidPaymentRequest;
use App\Models\OrderBill;
use App\Models\Payment;
use App\Services\DocumentSequenceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    public function __construct(private DocumentSequenceService $sequences) {}

    public function pay(StorePaymentRequest $request, OrderBill $bill): JsonResponse
    {
        $validated = $request->validated();

        $payment = DB::transaction(function () use ($bill, $validated, $request): Payment {
            $lockedBill = OrderBill::query()->lockForUpdate()->findOrFail($bill->id);
            $successfulTotal = (float) $lockedBill->payments()
                ->where('payment_status', 'successful')
                ->sum('amount_paid');
            $remaining = max(0, (float) $lockedBill->grand_total - $successfulTotal);
            $amountPaid = (float) $validated['amount_paid'];

            abort_if($lockedBill->bill_status === 'voided', 409, 'Voided bills cannot accept payments.');
            abort_if($remaining <= 0, 409, 'Bill is already fully paid.');
            abort_if($amountPaid > $remaining, 422, 'Payment exceeds the outstanding balance.');

            $amountReceived = (float) ($validated['amount_received'] ?? $amountPaid);
            $payment = $lockedBill->payments()->create(array_merge($validated, [
                'payment_number' => $this->sequences->next($lockedBill->order->branch_id, 'payment', 'PAY-'),
                'payment_method' => $validated['payment_method'] ?? 'configured',
                'amount_paid' => $amountPaid,
                'amount_received' => $amountReceived,
                'change_amount' => max(0, $amountReceived - $amountPaid),
                'balance_amount' => 0,
                'payment_status' => 'successful',
                'paid_at' => now(),
                'created_by' => $request->user()->id,
            ]));

            $newPaidTotal = $successfulTotal + $amountPaid;
            $balanceDue = max(0, (float) $lockedBill->grand_total - $newPaidTotal);
            $billStatus = $balanceDue > 0 ? 'partial' : 'paid';

            $lockedBill->update([
                'paid_amount' => $newPaidTotal,
                'balance_due' => $balanceDue,
                'bill_status' => $billStatus,
            ]);
            $lockedBill->order()->update([
                'payment_status' => $balanceDue > 0 ? 'partially_paid' : 'paid',
                'cashier_id' => $request->user()->id,
            ]);

            return $payment;
        });

        return response()->json([
            'success' => true,
            'message' => 'Payment successful.',
            'data' => $payment->load('method'),
        ], 201);
    }

    public function show(IndexFilterRequest $request, OrderBill $bill): JsonResponse
    {
        $payments = $this->filterAndPaginate(
            $bill->payments()->with(['method', 'refunds']),
            $request,
            [
                'id', 'order_bill_id', 'payment_method_id', 'payment_number',
                'payment_method', 'amount_paid', 'amount_received', 'change_amount',
                'balance_amount', 'payment_status', 'transaction_reference',
                'gateway_transaction_id', 'card_last_four', 'paid_at', 'notes',
                'created_by', 'voided_by', 'voided_at', 'void_reason',
                'created_at', 'updated_at',
            ],
            [
                'payment_number', 'payment_method', 'payment_status',
                'transaction_reference', 'gateway_transaction_id',
                'card_last_four', 'notes', 'void_reason',
            ],
        );

        return response()->json([
            'success' => true,
            'data' => $payments,
        ]);
    }

    public function update(UpdatePaymentRequest $request, OrderBill $bill, Payment $payment): JsonResponse
    {
        abort_unless($payment->order_bill_id === $bill->id, 404);

        $validated = $request->validated();

        abort_if($payment->payment_status === 'successful', 409, 'Successful payments cannot be edited; void or refund them.');
        $payment->update($validated);

        return response()->json(['success' => true, 'data' => $payment]);
    }

    public function destroy(VoidPaymentRequest $request, OrderBill $bill, Payment $payment): JsonResponse
    {
        abort_unless($payment->order_bill_id === $bill->id, 404);

        $validated = $request->validated();

        DB::transaction(function () use ($bill, $payment, $validated, $request): void {
            $payment->update([
                'payment_status' => 'voided',
                'voided_by' => $request->user()->id,
                'voided_at' => now(),
                'void_reason' => $validated['void_reason'],
            ]);

            $paidAmount = (float) $bill->payments()->where('payment_status', 'successful')->sum('amount_paid');
            $balanceDue = max(0, (float) $bill->grand_total - $paidAmount);
            $bill->update([
                'paid_amount' => $paidAmount,
                'balance_due' => $balanceDue,
                'bill_status' => $paidAmount > 0 ? 'partial' : 'unpaid',
            ]);
            $bill->order()->update([
                'payment_status' => $paidAmount > 0 ? 'partially_paid' : 'unpaid',
            ]);
        });

        return response()->json(['success' => true, 'message' => 'Payment voided successfully.']);
    }
}
