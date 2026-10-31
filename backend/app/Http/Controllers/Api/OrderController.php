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
            'items.menuItem'
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
            $subTotal = $orderItems->sum(function ($itemPayload) {
                return (float) $itemPayload['unit_price'] * (int) $itemPayload['quantity'];
            });
            $itemDiscount = $orderItems->sum(function ($itemPayload) {
                return (float) ($itemPayload['discount'] ?? 0) * (int) $itemPayload['quantity'];
            });
            $discount = $itemDiscount + (float) ($orderPayload['discount_total'] ?? 0);
            $canEditCharges = (int) ($request->user()?->role?->access_level ?? 0) > 70;
            $includeTax = $canEditCharges && filter_var($orderPayload['include_tax'] ?? false, FILTER_VALIDATE_BOOLEAN);
            $taxableAmount = max(0, $subTotal - $discount);
            $taxTotal = $includeTax ? round($taxableAmount * 0.18, 2) : 0;
            $serviceChargeTotal = $canEditCharges
                ? (float) ($orderPayload['service_charge_total'] ?? 0)
                : 0;
            $grandTotal = max(0, $subTotal - $discount + $taxTotal + $serviceChargeTotal);
            $status = $orderPayload['status'] ?? 'draft';
            $now = now();

            $order = Order::create(array_merge($orderPayload, [
                'order_number' => $orderNumber,
                'created_by' => $request->user()?->id,
                'assigned_by' => $request->user()?->id,
                'status' => $status,
                'payment_status' => $orderPayload['payment_status'] ?? 'unpaid',
                'subtotal' => $subTotal,
                'discount_total' => $discount,
                'tax_total' => $taxTotal,
                'service_charge_total' => $serviceChargeTotal,
                'grand_total' => $grandTotal,
                'paid_total' => $orderPayload['paid_total'] ?? 0,
                'balance_due' => $orderPayload['balance_due'] ?? $grandTotal,
                'ordered_at' => $orderPayload['ordered_at'] ?? now(),
                'confirmed_at' => $status === 'confirmed' ? $now : null,
                'completed_at' => $status === 'completed' ? $now : null,
                'cancelled_at' => $status === 'cancelled' ? $now : null,
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
            'items.menuItem'
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
        $validated = $request->validated();
        $status = $validated['status'];
        $now = now();
        $canEditCharges = (int) ($request->user()?->role?->access_level ?? 0) > 70;

        $validated['assigned_by'] = $request->user()?->id;
        if ($canEditCharges) {
            $includeTax = filter_var($validated['include_tax'] ?? false, FILTER_VALIDATE_BOOLEAN);
            $taxableAmount = max(0, (float) $order->subtotal - (float) $order->discount_total);
            $validated['tax_total'] = $includeTax ? round($taxableAmount * 0.18, 2) : 0;
            $validated['service_charge_total'] = (float) ($validated['service_charge_total'] ?? 0);
            $validated['grand_total'] = $taxableAmount
                + $validated['tax_total']
                + $validated['service_charge_total'];
        } else {
            unset($validated['include_tax'], $validated['tax_total'], $validated['service_charge_total']);
        }

        if ($status === 'confirmed' && $order->status !== 'confirmed') {
            $validated['confirmed_at'] = $now;
        }

        if ($status === 'completed' && $order->status !== 'completed') {
            $validated['completed_at'] = $now;
        }

        if ($status === 'cancelled' && $order->status !== 'cancelled') {
            $validated['cancelled_at'] = $now;
        }

        $order->update($validated);

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
