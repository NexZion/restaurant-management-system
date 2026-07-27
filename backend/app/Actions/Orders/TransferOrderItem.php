<?php

namespace App\Actions\Orders;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderItemTransfer;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class TransferOrderItem
{
    public function execute(Order $fromOrder, OrderItem $item, Order $toOrder, int $quantity, int $actorId, ?string $reason): OrderItem
    {
        return DB::transaction(function () use ($fromOrder, $item, $toOrder, $quantity, $actorId, $reason) {
            $orders = Order::query()->whereKey([$fromOrder->id, $toOrder->id])->lockForUpdate()->get()->keyBy('id');
            $fromOrder = $orders->get($fromOrder->id);
            $toOrder = $orders->get($toOrder->id);
            $item = OrderItem::query()->lockForUpdate()->findOrFail($item->id);

            if ($item->order_id !== $fromOrder->id || $fromOrder->branch_id !== $toOrder->branch_id) {
                throw ValidationException::withMessages(['to_order_id' => 'Orders must belong to the same branch and contain the selected item.']);
            }
            if ($quantity > $item->quantity) {
                throw ValidationException::withMessages(['quantity' => 'Transfer quantity exceeds the item quantity.']);
            }
            if ($fromOrder->bill()->exists() || $toOrder->bill()->exists()) {
                throw ValidationException::withMessages(['order' => 'Billed orders cannot be transferred.']);
            }

            if ($quantity === $item->quantity) {
                $transferredItem = $item;
                $transferredItem->update(['order_id' => $toOrder->id]);
            } else {
                $attributes = $item->only($item->getFillable());
                $attributes['order_id'] = $toOrder->id;
                $attributes['quantity'] = $quantity;
                $attributes['total_price'] = round((float) $item->total_price * $quantity / $item->quantity, 2);
                $transferredItem = OrderItem::query()->create($attributes);
                $transferredItem->modifiers()->createMany(
                    $item->modifiers->map(fn ($modifier) => $modifier->only($modifier->getFillable()))->all(),
                );
                $item->update([
                    'quantity' => $item->quantity - $quantity,
                    'total_price' => round((float) $item->total_price * ($item->quantity - $quantity) / $item->quantity, 2),
                ]);
            }

            OrderItemTransfer::query()->create([
                'order_item_id' => $transferredItem->id, 'from_order_id' => $fromOrder->id,
                'to_order_id' => $toOrder->id, 'quantity' => $quantity,
                'transferred_by' => $actorId, 'reason' => $reason,
            ]);

            return $transferredItem->refresh();
        });
    }
}
