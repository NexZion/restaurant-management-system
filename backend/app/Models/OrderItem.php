<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class OrderItem extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'order_id', 'parent_order_item_id', 'menu_item_id', 'menu_item_variant_id',
        'menu_item_name_snapshot', 'variant_name_snapshot', 'sku_snapshot', 'quantity',
        'unit_price', 'unit_cost', 'discount', 'discount_amount', 'tax_rate',
        'tax_amount', 'service_charge_amount', 'total_price', 'status',
        'served_quantity', 'cancelled_quantity', 'priority', 'kitchen_station_id',
        'notes', 'rejection_reason', 'created_by', 'cancelled_by', 'prepared_at',
        'ready_at', 'served_at', 'cancelled_at',
    ];

    protected $attributes = [
        'quantity' => 1, 'discount' => 0, 'discount_amount' => 0,
        'tax_amount' => 0, 'service_charge_amount' => 0, 'status' => 'pending',
        'served_quantity' => 0, 'cancelled_quantity' => 0, 'priority' => 'normal',
    ];

    protected function casts(): array
    {
        return [
            'unit_price' => 'decimal:2', 'unit_cost' => 'decimal:2',
            'discount' => 'decimal:2', 'discount_amount' => 'decimal:2',
            'tax_rate' => 'decimal:4', 'tax_amount' => 'decimal:2',
            'service_charge_amount' => 'decimal:2', 'total_price' => 'decimal:2',
            'prepared_at' => 'datetime', 'ready_at' => 'datetime',
            'served_at' => 'datetime', 'cancelled_at' => 'datetime',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(OrderItem::class, 'parent_order_item_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(OrderItem::class, 'parent_order_item_id');
    }

    public function menuItem(): BelongsTo
    {
        return $this->belongsTo(MenuItem::class);
    }

    public function variant(): BelongsTo
    {
        return $this->belongsTo(MenuItemVariant::class, 'menu_item_variant_id');
    }

    public function kitchenStation(): BelongsTo
    {
        return $this->belongsTo(KitchenStation::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function canceller(): BelongsTo
    {
        return $this->belongsTo(User::class, 'cancelled_by');
    }

    public function modifiers(): HasMany
    {
        return $this->hasMany(OrderItemModifier::class);
    }

    public function kitchenTicketItems(): HasMany
    {
        return $this->hasMany(KitchenTicketItem::class);
    }

    public function statusHistory(): HasMany
    {
        return $this->hasMany(OrderItemStatusHistory::class);
    }

    public function discounts(): HasMany
    {
        return $this->hasMany(OrderDiscount::class);
    }

    public function transfers(): HasMany
    {
        return $this->hasMany(OrderItemTransfer::class);
    }
}
