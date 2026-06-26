<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
use App\Http\Requests\StoreOrderRequest;
use App\Http\Requests\UpdateOrderRequest;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $orders = Order::with([
            'branch',
            'table',
            'customer',
            'creator',
            'waiter'
        ])->latest()->get();

        return response()->json([
            'success' => true,
            'data' => $orders
        ]);
    }
    public function store(StoreOrderRequest $request)
    {
        $orderNumber =
            'ORD-' .
            now()->format('Y') .
            str_pad(
                Order::count() + 1,
                5,
                '0',
                STR_PAD_LEFT
            );

        $order = Order::create(array_merge($request->validated(), [
            'order_number' => $orderNumber,
            'created_by' => $request->user()?->id,
            'waiter_id' => $request->waiter_id
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Order created successfully',
            'data' => $order
        ], 201);
    }
    public function show($id)
    {
        $order = Order::find($id);

        if (!$order) {

            return response()->json([
                'success' => false,
                'message' => 'Order not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $order
        ]);
    }
    public function update(UpdateOrderRequest $request, Order $order)
    {

        $order->update($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Order updated successfully',
            'data' => $order
        ]);
    }
    public function destroy(Order $order)
    {
        $order->delete();

        return response()->json([
            'success' => true,
            'message' => 'Order deleted successfully'
        ]);
    }
}
