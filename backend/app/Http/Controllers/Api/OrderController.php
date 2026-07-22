<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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
            'waiter',
            'bill'
        ])->latest()->get();

        return response()->json([
            'success' => true,
            'data' => $orders
        ]);
    }
    public function store(StoreOrderRequest $request)
    {
        $validated = $request->validated();
        $orderItems = collect($validated['items'] ?? []);
        $billPayload = $validated['bill'] ?? [];

        $order = DB::transaction(function () use ($validated, $orderItems, $billPayload, $request) {
            $orderPayload = $validated;
            unset($orderPayload['items'], $orderPayload['bill']);

            $orderNumber = $orderPayload['order_number'] ?? ('ORD-' . now()->format('Y') . str_pad(Order::count() + 1, 5, '0', STR_PAD_LEFT));

            $order = Order::create(array_merge($orderPayload, [
                'order_number' => $orderNumber,
                'created_by' => $request->user()?->id,
                'waiter_id' => $orderPayload['waiter_id'] ?? null,
                'status' => $orderPayload['status'] ?? 'pending',
                'notes' => $orderPayload['notes'] ?? null,
                'order_type' => $orderPayload['order_type'] ?? 'dining',
                'is_online' => $orderPayload['is_online'] ?? false,
            ]));

            foreach ($orderItems as $itemPayload) {
                $order->items()->create([
                    'menu_item_id' => $itemPayload['menu_item_id'],
                    'quantity' => $itemPayload['quantity'],
                    'unit_price' => $itemPayload['unit_price'],
                    'discount' => $itemPayload['discount'] ?? 0,
                    'total_price' => $itemPayload['total_price'] ?? ($itemPayload['unit_price'] * $itemPayload['quantity']),
                    'notes' => $itemPayload['notes'] ?? null,
                    'status' => 'pending',
                ]);
            }

            if ($orderItems->isNotEmpty() || !empty($billPayload)) {
                $subtotal = $orderItems->sum(function ($itemPayload) {
                    return $itemPayload['total_price'] ?? ($itemPayload['unit_price'] * $itemPayload['quantity']);
                });

                $order->bill()->create([
                    'subtotal' => $billPayload['subtotal'] ?? $subtotal,
                    'discount' => $billPayload['discount'] ?? 0,
                    'tax' => $billPayload['tax'] ?? 0,
                    'service_charge' => $billPayload['service_charge'] ?? 0,
                    'grand_total' => $billPayload['grand_total'] ?? max(0, ($billPayload['subtotal'] ?? $subtotal) - ($billPayload['discount'] ?? 0) + ($billPayload['tax'] ?? 0) + ($billPayload['service_charge'] ?? 0)),
                    'bill_status' => $billPayload['bill_status'] ?? 'unpaid',
                ]);
            }

            return $order;
        });

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
            'data' => $order->load(['items', 'bill'])
        ], 201);
    }
    public function show($id)
    {
        $order = Order::with([
            'branch',
            'table',
            'customer',
            'creator',
            'waiter',
            'bill'
        ])->find($id);

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
