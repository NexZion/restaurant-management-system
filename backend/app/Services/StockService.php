<?php

namespace App\Services;

use App\Models\InventoryItem;
use App\Models\StockLevel;
use App\Models\StockMovement;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class StockService
{
    public function record(
        int $branchId,
        InventoryItem $item,
        string $type,
        float $quantity,
        ?float $unitCost,
        ?Model $reference,
        ?string $reason,
        ?int $actorId,
        mixed $occurredAt = null,
        bool $allowNegative = false,
    ): StockMovement {
        return DB::transaction(function () use ($branchId, $item, $type, $quantity, $unitCost, $reference, $reason, $actorId, $occurredAt, $allowNegative) {
            StockLevel::query()->firstOrCreate(
                ['branch_id' => $branchId, 'inventory_item_id' => $item->id],
                ['quantity_on_hand' => 0, 'quantity_reserved' => 0, 'average_cost' => $item->unit_cost],
            );
            $level = StockLevel::query()
                ->where('branch_id', $branchId)->where('inventory_item_id', $item->id)
                ->lockForUpdate()->firstOrFail();
            $direction = in_array($type, ['sale', 'wastage', 'transfer_out'], true) ? -1 : 1;
            $delta = $type === 'adjustment' ? $quantity : abs($quantity) * $direction;
            $newQuantity = round((float) $level->quantity_on_hand + $delta, 3);
            if (! $allowNegative && $newQuantity < 0) {
                throw ValidationException::withMessages(['quantity' => "Insufficient stock for {$item->name}."]);
            }

            $averageCost = (float) $level->average_cost;
            if ($type === 'receipt' && $unitCost !== null && $newQuantity > 0) {
                $averageCost = round(
                    (((float) $level->quantity_on_hand * $averageCost) + (abs($quantity) * $unitCost)) / $newQuantity,
                    4,
                );
            }
            $level->update(['quantity_on_hand' => $newQuantity, 'average_cost' => $averageCost]);

            return StockMovement::query()->create([
                'branch_id' => $branchId, 'inventory_item_id' => $item->id,
                'movement_type' => $type, 'quantity' => $delta, 'unit_cost' => $unitCost,
                'reference_type' => $reference?->getMorphClass(), 'reference_id' => $reference?->getKey(),
                'reason' => $reason, 'created_by' => $actorId, 'occurred_at' => $occurredAt ?? now(),
            ]);
        });
    }
}
