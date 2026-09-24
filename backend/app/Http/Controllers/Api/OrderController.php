<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\IndexFilterRequest;
use App\Http\Requests\StoreOrderRequest;
use App\Http\Requests\UpdateOrderRequest;
use App\Models\MenuItem;
use App\Models\DocumentSequence;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    private const RELATIONSHIPS = [
        'branch',
        'table',
        'tableSession.tables',
        'reservation',
        'customer',
        'creator',
        'waiter',
        'cashier',
        'items.menuItem',
        'items.modifiers',
        'bill.payments',
        'delivery',
    ];

    public function index(IndexFilterRequest $request): JsonResponse
    {
        $orders = $this->filterAndPaginate(
            Order::with(self::RELATIONSHIPS),
            $request,
            [
                'id', 'branch_id', 'order_number', 'table_id', 'table_session_id',
                'reservation_id', 'customer_id', 'created_by', 'waiter_id', 'cashier_id',
                'order_type', 'order_source', 'status', 'payment_status', 'is_online',
                'guest_count', 'priority', 'requested_fulfillment_at', 'accepted_at',
                'preparing_at', 'ready_at', 'served_at', 'completed_at', 'cancelled_at',
                'cancellation_reason', 'notes', 'created_at', 'updated_at',
            ],
            ['order_number', 'order_type', 'order_source', 'status', 'payment_status', 'priority', 'cancellation_reason', 'notes'],
        );

        return response()->json([
            'success' => true,
            'data' => $orders,
        ]);
    }

    public function store(StoreOrderRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $order = DB::transaction(function () use ($validated, $request): Order {
            $itemPayloads = collect($validated['items']);
            $billPayload = $validated['bill'] ?? [];
            $menuItems = MenuItem::query()
                ->whereIn('id', $itemPayloads->pluck('menu_item_id'))
                ->get()
                ->keyBy('id');

            $orderPayload = Arr::except($validated, ['items', 'bill']);
            $order = Order::create(array_merge($orderPayload, [
                'order_number' => $orderPayload['order_number'] ?? DocumentSequence::nextNumber($orderPayload['branch_id'], 'order', 'ORD-'),
                'created_by' => $request->user()->id,
            ]));

            $subtotal = 0.0;

            foreach ($itemPayloads as $itemPayload) {
                $menuItem = $menuItems->get($itemPayload['menu_item_id']);
                $quantity = (int) $itemPayload['quantity'];
                $unitPrice = (float) $menuItem->base_price;
                $discountAmount = (float) ($itemPayload['discount_amount'] ?? $itemPayload['discount'] ?? 0);
                $taxRate = (float) ($itemPayload['tax_rate'] ?? 0);
                $taxAmount = round(($unitPrice * $quantity - $discountAmount) * ($taxRate / 100), 2);
                $serviceChargeAmount = (float) ($itemPayload['service_charge_amount'] ?? 0);
                $totalPrice = max(0, round(
                    ($unitPrice * $quantity) - $discountAmount + $taxAmount + $serviceChargeAmount,
                    2,
                ));

                $order->items()->create([
                    'menu_item_id' => $menuItem->id,
                    'menu_item_variant_id' => $itemPayload['menu_item_variant_id'] ?? null,
                    'menu_item_name_snapshot' => $menuItem->name,
                    'sku_snapshot' => $menuItem->sku,
                    'quantity' => $quantity,
                    'unit_price' => $unitPrice,
                    'discount' => $discountAmount,
                    'discount_amount' => $discountAmount,
                    'tax_rate' => $taxRate,
                    'tax_amount' => $taxAmount,
                    'service_charge_amount' => $serviceChargeAmount,
                    'total_price' => $totalPrice,
                    'priority' => $itemPayload['priority'] ?? 'normal',
                    'kitchen_station_id' => $itemPayload['kitchen_station_id'] ?? null,
                    'notes' => $itemPayload['notes'] ?? null,
                    'created_by' => $request->user()->id,
                ]);

                $subtotal += $totalPrice;
            }

            $billDiscount = (float) ($billPayload['discount'] ?? 0);
            $billTax = (float) ($billPayload['tax'] ?? 0);
            $serviceCharge = (float) ($billPayload['service_charge'] ?? 0);
            $roundingAmount = (float) ($billPayload['rounding_amount'] ?? 0);
            $grandTotal = max(0, round($subtotal - $billDiscount + $billTax + $serviceCharge + $roundingAmount, 2));

            $order->bill()->create([
                'bill_number' => DocumentSequence::nextNumber($order->branch_id, 'bill', 'BILL-'),
                'subtotal' => $subtotal,
                'discount' => $billDiscount,
                'tax' => $billTax,
                'service_charge' => $serviceCharge,
                'rounding_amount' => $roundingAmount,
                'grand_total' => $grandTotal,
                'balance_due' => $grandTotal,
                'generated_by' => $request->user()->id,
                'generated_at' => now(),
            ]);

            $order->statusHistory()->create([
                'new_status' => $order->status,
                'changed_by' => $request->user()->id,
                'changed_at' => now(),
            ]);

            return $order;
        });

        return response()->json([
            'success' => true,
            'message' => 'Order created successfully',
            'data' => $order->load(self::RELATIONSHIPS),
        ], 201);
    }

    public function show(Order $order): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $order->load(self::RELATIONSHIPS),
        ]);
    }

    public function update(UpdateOrderRequest $request, Order $order): JsonResponse
    {
        $previousStatus = $order->status;
        $payload = $request->validated();

        if (isset($payload['status']) && $payload['status'] !== $previousStatus) {
            $timestampColumn = match ($payload['status']) {
                'accepted' => 'accepted_at',
                'preparing' => 'preparing_at',
                'ready' => 'ready_at',
                'served' => 'served_at',
                'completed' => 'completed_at',
                'cancelled' => 'cancelled_at',
                default => null,
            };

            if ($timestampColumn !== null) {
                $payload[$timestampColumn] = now();
            }
        }

        DB::transaction(function () use ($order, $payload, $previousStatus, $request): void {
            $order->update($payload);

            if ($order->status !== $previousStatus) {
                $order->statusHistory()->create([
                    'previous_status' => $previousStatus,
                    'new_status' => $order->status,
                    'reason' => $payload['cancellation_reason'] ?? null,
                    'changed_by' => $request->user()->id,
                    'changed_at' => now(),
                ]);
            }
        });

        return response()->json([
            'success' => true,
            'message' => 'Order updated successfully',
            'data' => $order->fresh()->load(self::RELATIONSHIPS),
        ]);
    }

    public function destroy(Order $order): JsonResponse
    {
        if ($order->bill?->payments()->where('payment_status', 'successful')->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Orders with successful payments cannot be deleted.',
            ], 409);
        }

        $order->delete();

        return response()->json([
            'success' => true,
            'message' => 'Order deleted successfully',
        ]);
    }
}
