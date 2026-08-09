<?php

namespace App\Actions\Orders;

use App\Models\Order;
use App\Models\OrderMerge;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class MergeOrders
{
    public function execute(Order $target, Order $source, int $actorId, ?string $reason): Order
    {
        return DB::transaction(function () use ($target, $source, $actorId, $reason) {
            $orders = Order::query()->whereKey([$target->id, $source->id])->lockForUpdate()->get()->keyBy('id');
            $target = $orders->get($target->id);
            $source = $orders->get($source->id);

            if ($target->branch_id !== $source->branch_id) {
                throw ValidationException::withMessages(['source_order_id' => 'Orders must belong to the same branch.']);
            }
            if ($target->bill()->exists() || $source->bill()->exists()) {
                throw ValidationException::withMessages(['source_order_id' => 'Billed orders cannot be merged.']);
            }

            $source->items()->update(['order_id' => $target->id]);
            $source->update(['status' => 'merged', 'completed_at' => now(), 'notes' => trim($source->notes."\n".$reason)]);
            OrderMerge::query()->create([
                'source_order_id' => $source->id, 'target_order_id' => $target->id,
                'merged_by' => $actorId, 'merged_at' => now(),
            ]);

            return $target->refresh()->load('items');
        });
    }
}
