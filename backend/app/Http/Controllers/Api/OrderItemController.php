<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreOrderItemRequest;
use App\Http\Requests\UpdateOrderItemRequest;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\MenuItem;
use Illuminate\Http\Request;

class OrderItemController extends Controller
{
    public function addItem(StoreOrderItemRequest $request, Order $order)
    {
        $menuItem = MenuItem::find(
            $request->menu_item_id
        );

        if (!$menuItem) {

            return response()->json([
                'success' => false,
                'message' => 'Menu item not found'
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
                'message' => 'Menu item already added to this order'
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

            'notes' => $request->notes
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Item added successfully',
            'data' => $orderItem
        ], 201);
    }

    public function getItems(Order $order)
    {
        $order->load([
            'items.menuItem'
        ]);

        return response()->json([
            'success' => true,
            'order' => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'status' => $order->status,
                'items' => $order->items->map(function ($item) {

                    return [

                        'id' => $item->id,

                        'menu_item_id' => $item->menu_item_id,

                        'name' => $item->menuItem->name,

                        'quantity' => $item->quantity,

                        'unit_price' => $item->unit_price,

                        'total_price' => $item->total_price,

                        'notes' => $item->notes,

                        'status' => $item->status
                    ];
                })
            ]
        ]);
    }
    
  public function show(Order $order, $item)
{
    $orderItem = $order->items()
        ->with('menuItem')
        ->where('id', $item)
        ->first();

    if (!$orderItem) {

        return response()->json([
            'success' => false,
            'message' => 'Order item not found'
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
        ]
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

        if (!$orderItem) {

            return response()->json([
                'success' => false,
                'message' => 'Order item not found'
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
            'data' => $orderItem
        ]);
    }

    public function removeItem(Order $order, $item)
    {
        $orderItem = OrderItem::where('order_id', $order->id)
            ->where('id', $item)
            ->first();

        if (!$orderItem) {
            return response()->json([
                'success' => false,
                'message' => 'Order item not found'
            ], 404);
        }

        $orderItem->delete();

        return response()->json([
            'success' => true,
            'message' => 'Item removed successfully'
        ]);
    }

    public function updateStatus(Request $request, Order $order, $item)
    {
        $request->validate([
            'status' => 'required|in:pending,preparing,ready'
        ]);

        $orderItem = $order->items()
            ->where('id', $item)
            ->first();

        if (!$orderItem) {

            return response()->json([
                'success' => false,
                'message' => 'Order item not found'
            ], 404);
        }

        // Step 1
        $orderItem->update([
            'status' => $request->status
        ]);

        // Step 2
        $notReady = $order->items()
            ->where('status', '!=', 'ready')
            ->count();

        // Step 3
        if ($notReady == 0) {

            $order->update([
                'status' => 'ready'
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Item status updated'
        ]);
    }
}
