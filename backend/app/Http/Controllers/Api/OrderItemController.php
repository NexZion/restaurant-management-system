<?php

namespace App\Http\Controllers\Api;

use App\Actions\Orders\UpdateOrderItemStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\IndexFilterRequest;
use App\Http\Requests\StoreOrderItemRequest;
use App\Http\Requests\UpdateOrderItemRequest;
use App\Http\Requests\UpdateOrderItemStatusRequest;
use App\Models\MenuItem;
use App\Models\Order;
use App\Models\OrderItem;

class OrderItemController extends Controller
{
    public function addItem(StoreOrderItemRequest $request, Order $order)
    {
        $menuItem = MenuItem::find(
            $request->menu_item_id
        );

        if (! $menuItem) {

            return response()->json([
                'success' => false,
                'message' => 'Menu item not found',
            ], 404);
        }

        // Check if already exists in order

        $existingItem = OrderItem::where(
            'order_id',
            $order->id
        )
            ->where(
                'menu_item_id',
                $menuItem->id
            )
            ->first();

        if ($existingItem) {

            return response()->json([
                'success' => false,
                'message' => 'Menu item already added to this order',
            ], 409);
        }

        $unitPrice = $menuItem->base_price;

        $quantity = $request->quantity;

        $totalPrice = $unitPrice * $quantity;

        $orderItem = OrderItem::create([

            'order_id' => $order->id,

            'menu_item_id' => $menuItem->id,

            'quantity' => $quantity,

            'unit_price' => $unitPrice,

            'total_price' => $totalPrice,

            'notes' => $request->notes,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Item added successfully',
            'data' => $orderItem,
        ], 201);
    }

    public function getItems(IndexFilterRequest $request, Order $order)
    {
        $items = $this->filterAndPaginate(
            $order->items()->with(['menuItem', 'modifiers']),
            $request,
            [
                'id', 'order_id', 'parent_order_item_id', 'menu_item_id',
                'menu_item_variant_id', 'menu_item_name_snapshot', 'variant_name_snapshot',
                'sku_snapshot', 'quantity', 'unit_price', 'unit_cost', 'discount',
                'discount_amount', 'tax_rate', 'tax_amount', 'service_charge_amount',
                'total_price', 'notes', 'status', 'served_quantity', 'cancelled_quantity',
                'priority', 'kitchen_station_id', 'rejection_reason', 'created_by',
                'cancelled_by', 'prepared_at', 'ready_at', 'served_at', 'cancelled_at',
                'created_at', 'updated_at',
            ],
            [
                'menu_item_name_snapshot', 'variant_name_snapshot', 'sku_snapshot',
                'notes', 'status', 'priority', 'rejection_reason',
            ],
        );

        return response()->json([
            'success' => true,
            'order' => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'status' => $order->status,
                'items' => $items,
            ],
        ]);
    }

    public function show(Order $order, $item)
    {
        $orderItem = $order->items()
            ->with('menuItem')
            ->where('id', $item)
            ->first();

        if (! $orderItem) {

            return response()->json([
                'success' => false,
                'message' => 'Order item not found',
            ], 404);

        }

        return response()->json([
            'success' => true,
            'data' => [

                'id' => $orderItem->id,

                'order_id' => $orderItem->order_id,

                'menu_item_id' => $orderItem->menu_item_id,

                'menu_item_name' => $orderItem->menuItem->name,

                'quantity' => $orderItem->quantity,

                'unit_price' => $orderItem->unit_price,

                'total_price' => $orderItem->total_price,

                'status' => $orderItem->status,

                'notes' => $orderItem->notes,

                'created_at' => $orderItem->created_at,

                'updated_at' => $orderItem->updated_at,
            ],
        ]);
    }

    public function updateQuantity(
        UpdateOrderItemRequest $request,
        Order $order,
        $item
    ) {
        $orderItem = OrderItem::where('order_id', $order->id)
            ->where('id', $item)
            ->first();

        if (! $orderItem) {

            return response()->json([
                'success' => false,
                'message' => 'Order item not found',
            ], 404);
        }

        $orderItem->quantity = $request->quantity;

        $orderItem->total_price =
            $orderItem->unit_price * $request->quantity;

        $orderItem->notes = $request->notes;

        $orderItem->save();

        return response()->json([
            'success' => true,
            'message' => 'Quantity updated successfully',
            'data' => $orderItem,
        ]);
    }

    public function removeItem(Order $order, $item)
    {
        $orderItem = OrderItem::where('order_id', $order->id)
            ->where('id', $item)
            ->first();

        if (! $orderItem) {
            return response()->json([
                'success' => false,
                'message' => 'Order item not found',
            ], 404);
        }

        $orderItem->delete();

        return response()->json([
            'success' => true,
            'message' => 'Item removed successfully',
        ]);
    }

    public function updateStatus(UpdateOrderItemStatusRequest $request, Order $order, $item, UpdateOrderItemStatus $action)
    {
        $validated = $request->validated();
        $orderItem = $order->items()
            ->where('id', $item)
            ->first();

        if (! $orderItem) {

            return response()->json([
                'success' => false,
                'message' => 'Order item not found',
            ], 404);
        }

        $orderItem = $action->execute(
            $orderItem,
            $validated['status'],
            $validated['reason'] ?? null,
            $request->user()?->id,
        );

        return response()->json([
            'success' => true,
            'message' => 'Item status updated',
            'data' => $orderItem,
        ]);
    }
}
