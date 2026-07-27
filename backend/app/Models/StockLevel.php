<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockLevel extends Model
{
    protected $fillable = ['branch_id', 'inventory_item_id', 'quantity_on_hand', 'quantity_reserved', 'average_cost'];

    protected function casts(): array
    {
        return ['quantity_on_hand' => 'decimal:3', 'quantity_reserved' => 'decimal:3', 'average_cost' => 'decimal:4'];
    }

    public function inventoryItem(): BelongsTo
    {
        return $this->belongsTo(InventoryItem::class);
    }
}
