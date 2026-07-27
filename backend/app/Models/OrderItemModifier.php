<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderItemModifier extends Model
{
    protected $fillable = [
        'order_item_id', 'modifier_group_id', 'modifier_option_id',
        'modifier_name_snapshot', 'option_name_snapshot', 'quantity', 'unit_price', 'total_price',
    ];

    protected $attributes = ['quantity' => 1, 'unit_price' => 0, 'total_price' => 0];

    protected function casts(): array
    {
        return ['unit_price' => 'decimal:2', 'total_price' => 'decimal:2'];
    }

    public function orderItem(): BelongsTo
    {
        return $this->belongsTo(OrderItem::class);
    }
}
