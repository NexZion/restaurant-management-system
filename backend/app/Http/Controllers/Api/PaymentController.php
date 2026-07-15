<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\OrderBill;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PaymentController extends Controller
{
    public function pay(Request $request, OrderBill $bill)
    {
        $request->validate([

            'payment_method' => 'required|in:cash,card,online',

            'amount_received' => 'required|numeric|min:0',

            'transaction_reference' => 'nullable|string|max:255'

        ]);

        // Bill already paid
        if ($bill->bill_status == 'paid') {

            return response()->json([
                'success' => false,
                'message' => 'Bill already paid.'
            ], 409);
        }

        // Payment already exists
        if ($bill->payment) {

            return response()->json([
                'success' => false,
                'message' => 'Payment already exists.'
            ], 409);
        }

        $amountPaid = $bill->grand_total;

        if ($request->amount_received < $amountPaid) {

            return response()->json([
                'success' => false,
                'message' => 'Insufficient payment amount.'
            ], 400);
        }

        $balance =

            $request->amount_received

            -

            $amountPaid;

        $payment = Payment::create([

            'order_bill_id' => $bill->id,

            'payment_method' => $request->payment_method,

            'amount_paid' => $amountPaid,

            'amount_received' => $request->amount_received,

            'balance_amount' => $balance,

            'payment_status' => 'paid',

            'transaction_reference'
            => $request->transaction_reference,

            'created_by'
            => $request->user()->id
        ]);

        $bill->update([
            'bill_status' => 'paid'
        ]);

        $bill->order->update([
            'status' => 'completed'
        ]);

        return response()->json([

            'success' => true,

            'message' => 'Payment successful.',

            'data' => $payment

        ]);
    }

    public function show(OrderBill $bill)
    {
        if (!$bill->payment) {

            return response()->json([
                'success' => false,
                'message' => 'Payment not found.'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $bill->payment
        ]);
    }
    public function update(Request $request, OrderBill $bill)
    {
        if (!$bill->payment) {

            return response()->json([
                'success' => false,
                'message' => 'Payment not found.'
            ], 404);
        }

        $request->validate([

            'payment_method' => 'required|in:cash,card,online',

            'amount_received' => 'required|numeric|min:0',

            'transaction_reference' => 'nullable|string|max:255',

            'notes' => 'nullable|string'

        ]);

        $payment = $bill->payment;

        if ($request->amount_received < $payment->amount_paid) {

            return response()->json([
                'success' => false,
                'message' => 'Insufficient payment amount.'
            ], 400);
        }

        $balance =

            $request->amount_received

            -

            $payment->amount_paid;

        $payment->update([

            'payment_method' => $request->payment_method,

            'amount_received' => $request->amount_received,

            'balance_amount' => $balance,

            'transaction_reference' => $request->transaction_reference,

            'notes' => $request->notes

        ]);

        return response()->json([

            'success' => true,

            'message' => 'Payment updated successfully.',

            'data' => $payment

        ]);
    }
    public function destroy(OrderBill $bill)
    {
        if (!$bill->payment) {

            return response()->json([
                'success' => false,
                'message' => 'Payment not found.'
            ], 404);
        }

        $bill->payment->delete();

        return response()->json([
            'success' => true,
            'message' => 'Payment deleted successfully.'
        ]);
    }
}
