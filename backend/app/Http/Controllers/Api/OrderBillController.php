<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\GenerateOrderBillRequest;
use App\Models\Order;
use App\Models\OrderBill;
use App\Models\DocumentSequence;

class OrderBillController extends Controller
{
    public function generateBill(GenerateOrderBillRequest $request, Order $order)
    {
        $validated = $request->validated();

        if ($order->bill) {
            return response()->json([
                'success' => false,
                'message' => 'Bill already generated',
            ], 409);
        }

        $subtotal = 0;

        foreach ($order->items as $item) {

            $subtotal += $item->quantity * $item->unit_price;
        }

        $discount = $validated['discount'] ?? 0;

        $tax = $subtotal * 0.15;

        $serviceCharge = $subtotal * 0.10;

        $grandTotal =

            $subtotal

            - $discount

            + $tax

            + $serviceCharge;

        $bill = OrderBill::create([

            'order_id' => $order->id,

            'bill_number' => DocumentSequence::nextNumber($order->branch_id, 'bill', 'BILL-'),

            'subtotal' => $subtotal,

            'discount' => $discount,

            'tax' => $tax,

            'service_charge' => $serviceCharge,

            'grand_total' => $grandTotal,

            'balance_due' => $grandTotal,

            'generated_by' => $request->user()->id,

            'generated_at' => now(),

        ]);

        return response()->json([

            'success' => true,

            'message' => 'Bill generated successfully',

            'data' => $bill,

        ]);
    }

    public function show(Order $order)
    {
        return response()->json([

            'success' => true,

            'data' => $order->bill,

        ]);
    }

    public function destroy(Order $order)
    {
        $bill = $order->bill;

        if (! $bill) {
            return response()->json([
                'success' => false,
                'message' => 'Bill not found.',
            ], 404);
        }

        if ($bill->payments()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Bills with payment records cannot be deleted; void the bill instead.',
            ], 409);
        }

        $bill->delete(); // Soft Delete

        return response()->json([
            'success' => true,
            'message' => 'Bill deleted successfully.',
        ]);
    }
}
