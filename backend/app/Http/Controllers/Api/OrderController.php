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
use Illuminate\Validation\ValidationException;

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
        $branchId = (int) $validated['branch_id'];
        $orderItems = collect($validated['items'] ?? [])->values()->map(function ($itemPayload, $index) use ($branchId) {
            $menuItem = MenuItem::with(['branches', 'menuCategory.branches', 'menus.branches'])
                ->find($itemPayload['menu_item_id']);
            $branchAssignment = $menuItem?->branches->firstWhere('id', $branchId);
            $categoryBranch = $menuItem?->menuCategory?->branches->firstWhere('id', $branchId);
            $hasActiveMenu = $menuItem?->menus->contains(function ($menu) use ($branchId) {
                $menuBranch = $menu->branches->firstWhere('id', $branchId);
                return $menu->is_active && $menuBranch && $menuBranch->pivot->is_active;
            });

            if (
                !$menuItem || !$menuItem->is_active || !$menuItem->is_available || !$branchAssignment
                || !$branchAssignment->pivot->is_active || !$branchAssignment->pivot->is_available
                || !$menuItem->menuCategory?->is_active || !$categoryBranch || !$categoryBranch->pivot->is_active
                || !$hasActiveMenu
            ) {
                throw ValidationException::withMessages([
                    "items.{$index}.menu_item_id" => 'This item is not orderable at the selected branch.',
                ]);
            }

            $unitPrice = $branchAssignment->pivot->selling_price ?? $menuItem->base_price;
            $quantity = (int) $itemPayload['quantity'];
            return [
                'menu_item_id' => $menuItem->id,
                'quantity' => $quantity,
                'unit_price' => $unitPrice,
                'discount' => 0,
                'total_price' => $unitPrice * $quantity,
                'notes' => $itemPayload['notes'] ?? null,
                'status' => 'pending',
            ];
        });
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
                $order->items()->create($itemPayload);
            }

            if ($orderItems->isNotEmpty() || !empty($billPayload)) {
                $subtotal = $orderItems->sum('total_price');

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
