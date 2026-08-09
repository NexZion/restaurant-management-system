<?php

namespace App\Services;

use App\Models\InventoryItem;
use App\Models\Order;
use App\Models\Recipe;
use App\Models\StockMovement;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderInventoryService
{
    public function __construct(private StockService $stock) {}

    public function consume(Order $order, int $actorId, mixed $occurredAt = null, bool $allowNegative = false): Collection
    {
        return DB::transaction(function () use ($order, $actorId, $occurredAt, $allowNegative) {
            $order = Order::query()->with('items')->lockForUpdate()->findOrFail($order->id);
            if (StockMovement::query()->where('reference_type', $order->getMorphClass())
                ->where('reference_id', $order->id)->where('movement_type', 'sale')->exists()) {
                throw ValidationException::withMessages(['order' => 'Inventory has already been consumed for this order.']);
            }
            $movements = collect();
            foreach ($order->items as $orderItem) {
                $recipe = Recipe::query()->where('menu_item_id', $orderItem->menu_item_id)
                    ->where(function ($query) use ($orderItem) {
                        $query->where('menu_item_variant_id', $orderItem->menu_item_variant_id)
                            ->orWhereNull('menu_item_variant_id');
                    })->with('ingredients')->orderByDesc('menu_item_variant_id')->first();
                if (! $recipe) {
                    continue;
                }
                foreach ($recipe->ingredients as $ingredient) {
                    $quantity = (float) $ingredient->quantity * $orderItem->quantity / (float) $recipe->yield_quantity;
                    $quantity *= 1 + ((float) $ingredient->waste_percentage / 100);
                    $movements->push($this->stock->record(
                        $order->branch_id, InventoryItem::query()->findOrFail($ingredient->inventory_item_id),
                        'sale', $quantity, null, $order, "Recipe consumption for order item {$orderItem->id}",
                        $actorId, $occurredAt ?? now(), $allowNegative,
                    ));
                }
            }

            return $movements;
        });
    }
}
