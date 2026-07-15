<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
use App\Http\Requests\StoreOrderRequest;
use App\Http\Requests\UpdateOrderRequest;
use App\Models\MenuItem;
use App\Models\OrderItem;

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

        foreach ($request->items as $item) {
            $menuItem = MenuItem::find($item['menu_item_id']);

            if (!$menuItem) {
                return response()->json([
                    'success' => false,
                    'message' => 'Menu item not found'
                ], 404);
            }

            $unitPrice = $menuItem->base_price;

            $quantity = $request->quantity;

            $totalPrice = $unitPrice * $quantity;

            $orderItem = OrderItem::Create([

                'order_id' => $order->id,

                'menu_item_id' => $menuItem->id,

                'quantity' => $quantity,

                'unit_price' => $unitPrice,

                'total_price' => $totalPrice,

                'notes' => $request->notes
            ]);
        }

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
