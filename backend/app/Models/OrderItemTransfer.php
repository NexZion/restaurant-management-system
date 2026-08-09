<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderItemTransfer extends Model
{
    public const UPDATED_AT = null;

    protected $fillable = [
        'order_item_id', 'from_order_id', 'to_order_id', 'quantity', 'transferred_by', 'reason',
    ];

    public function orderItem(): BelongsTo
    {
        return $this->belongsTo(OrderItem::class);
    }

    public function fromOrder(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'from_order_id');
    }

    public function toOrder(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'to_order_id');
    }

    public function transferredBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'transferred_by');
    }
}
