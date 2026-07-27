<?php

namespace App\Actions\Orders;

use App\Models\OrderItem;
use Illuminate\Support\Facades\DB;

class UpdateOrderItemStatus
{
    public function execute(OrderItem $item, string $status, ?string $reason, ?int $actorId): OrderItem
    {
        return DB::transaction(function () use ($item, $status, $reason, $actorId) {
            $item = OrderItem::query()->lockForUpdate()->findOrFail($item->id);
            $previousStatus = $item->status;

            if ($previousStatus === $status) {
                return $item;
            }

            $timestamps = match ($status) {
                'prepared' => ['prepared_at' => now()],
                'ready' => ['ready_at' => now()],
                'served' => ['served_at' => now(), 'served_quantity' => $item->quantity],
                'cancelled' => ['cancelled_at' => now(), 'cancelled_quantity' => $item->quantity],
                default => [],
            };
            $item->update(['status' => $status] + $timestamps);
            $item->statusHistory()->create([
                'previous_status' => $previousStatus,
                'new_status' => $status,
                'reason' => $reason,
                'changed_by' => $actorId,
                'changed_at' => now(),
            ]);

            $incompleteItems = $item->order->items()
                ->whereNotIn('status', ['ready', 'served', 'cancelled'])
                ->exists();
            if (! $incompleteItems) {
                $item->order->update(['status' => 'ready', 'ready_at' => now()]);
            }

            return $item->refresh();
        });
    }
}
