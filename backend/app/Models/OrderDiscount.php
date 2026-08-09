<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderDiscount extends Model
{
    public const UPDATED_AT = null;

    protected $fillable = [
        'order_id', 'order_item_id', 'discount_type', 'discount_source', 'promotion_id',
        'coupon_id', 'percentage', 'amount', 'reason', 'approved_by', 'created_by',
    ];

    protected function casts(): array
    {
        return ['percentage' => 'decimal:4', 'amount' => 'decimal:2'];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function orderItem(): BelongsTo
    {
        return $this->belongsTo(OrderItem::class);
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
