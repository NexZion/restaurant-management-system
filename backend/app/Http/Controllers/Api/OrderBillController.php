<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderBill;
use Illuminate\Http\Request;

class OrderBillController extends Controller
{
    public function generateBill(Request $request, Order $order)
    {
        $request->validate([
            'discount' => 'nullable|numeric|min:0'
        ]);

        if ($order->bill) {
            return response()->json([
                'success' => false,
                'message' => 'Bill already generated'
            ], 409);
        }

        $subtotal = 0;

        foreach ($order->items as $item) {

            $subtotal += $item->quantity * $item->unit_price;
        }

        $discount = $request->discount ?? 0;

        $tax = $subtotal * 0.15;

        $serviceCharge = $subtotal * 0.10;

        $grandTotal =

            $subtotal

            - $discount

            + $tax

            + $serviceCharge;

        $bill = OrderBill::create([

            'order_id' => $order->id,

            'subtotal' => $subtotal,

            'discount' => $discount,

            'tax' => $tax,

            'service_charge' => $serviceCharge,

            'grand_total' => $grandTotal

        ]);

        

        return response()->json([

            'success' => true,

            'message' => 'Bill generated successfully',

            'data' => $bill

        ]);
    }

    public function show(Order $order)
    {
        return response()->json([

            'success' => true,

            'data' => $order->bill

        ]);
    }

    public function destroy(Order $order)
    {
        $bill = $order->bill;

        if (!$bill) {
            return response()->json([
                'success' => false,
                'message' => 'Bill not found.'
            ], 404);
        }

        if ($bill->bill_status === 'paid') {
            return response()->json([
                'success' => false,
                'message' => 'Paid bills cannot be deleted.'
            ], 409);
        }

        $bill->delete(); // Soft Delete

        return response()->json([
            'success' => true,
            'message' => 'Bill deleted successfully.'
        ]);
    }
}
