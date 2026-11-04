<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Order;
use App\Models\MenuItem;
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
            'assignedBy',
            'items'
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
        $accessLevel = (int) ($request->user()?->role?->access_level ?? 0);

        if ($accessLevel <= 70) {
            foreach ($orderItems as $itemPayload) {
                $menuItem = MenuItem::findOrFail($itemPayload['menu_item_id']);

                if (round((float) $itemPayload['unit_price'], 2) !== round((float) $menuItem->base_price, 2)) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Your role cannot change menu item unit prices.',
                    ], 403);
                }
            }
        }

        $order = DB::transaction(function () use ($validated, $orderItems, $request) {
            $orderPayload = $validated;
            unset($orderPayload['items']);

            $orderNumber = $orderPayload['order_number'] ?? $this->generateOrderNumber();
            $orderPayload['branch_id'] =
                $request->user()?->branch_id ?? $orderPayload['branch_id'] ?? null;
            $subtotal = $orderItems->sum(function ($itemPayload) {
                return $itemPayload['total_price'] ?? ($itemPayload['unit_price'] * $itemPayload['quantity']);
            });
            $discount = $orderPayload['discount_total'] ?? 0;
            $grandTotal = $orderPayload['grand_total'] ?? max(0, $subtotal - $discount);

            $order = Order::create(array_merge($orderPayload, [
                'order_number' => $orderNumber,
                'created_by' => $request->user()?->id,
                'status' => $orderPayload['status'] ?? 'draft',
                'payment_status' => $orderPayload['payment_status'] ?? 'unpaid',
                'subtotal' => $orderPayload['subtotal'] ?? $subtotal,
                'discount_total' => $discount,
                'tax_total' => $orderPayload['tax_total'] ?? 0,
                'service_charge_total' => $orderPayload['service_charge_total'] ?? 0,
                'grand_total' => $grandTotal,
                'paid_total' => $orderPayload['paid_total'] ?? 0,
                'balance_due' => $orderPayload['balance_due'] ?? $grandTotal,
                'ordered_at' => $orderPayload['ordered_at'] ?? now(),
            ]));

            foreach ($orderItems as $itemPayload) {
                $order->items()->create($itemPayload);
            }

            return $order;
        });

        return response()->json([
            'success' => true,
            'message' => 'Order created successfully',
            'data' => $order->load('items')
        ], 201);
    }

    private function generateOrderNumber(): string
    {
        do {
            $orderNumber = sprintf('ORD - %06d', random_int(0, 999999));
        } while (Order::where('order_number', $orderNumber)->exists());

        return $orderNumber;
    }

    public function show($id)
    {
        $order = Order::with([
            'branch',
            'table',
            'customer',
            'creator',
            'assignedBy',
            'items'
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
