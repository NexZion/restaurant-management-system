<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Order extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'branch_id', 'order_number', 'table_id', 'table_session_id', 'reservation_id',
        'customer_id', 'created_by', 'waiter_id', 'cashier_id', 'order_type',
        'order_source', 'status', 'payment_status', 'is_online', 'guest_count',
        'priority', 'requested_fulfillment_at', 'accepted_at', 'preparing_at',
        'ready_at', 'served_at', 'completed_at', 'cancelled_at',
        'cancellation_reason', 'notes',
    ];

    protected $attributes = [
        'order_type' => 'dining',
        'order_source' => 'pos',
        'status' => 'pending',
        'payment_status' => 'unpaid',
        'is_online' => false,
        'priority' => 'normal',
    ];

    protected function casts(): array
    {
        return [
            'is_online' => 'boolean',
            'requested_fulfillment_at' => 'datetime',
            'accepted_at' => 'datetime',
            'preparing_at' => 'datetime',
            'ready_at' => 'datetime',
            'served_at' => 'datetime',
            'completed_at' => 'datetime',
            'cancelled_at' => 'datetime',
        ];
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function table(): BelongsTo
    {
        return $this->belongsTo(RestaurantTable::class, 'table_id');
    }

    public function tableSession(): BelongsTo
    {
        return $this->belongsTo(TableSession::class);
    }

    public function reservation(): BelongsTo
    {
        return $this->belongsTo(Reservation::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function waiter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'waiter_id');
    }

    public function cashier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'cashier_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function bill(): HasOne
    {
        return $this->hasOne(OrderBill::class);
    }

    public function delivery(): HasOne
    {
        return $this->hasOne(OrderDelivery::class);
    }

    public function kitchenTickets(): HasMany
    {
        return $this->hasMany(KitchenTicket::class);
    }

    public function statusHistory(): HasMany
    {
        return $this->hasMany(OrderStatusHistory::class);
    }

    public function discounts(): HasMany
    {
        return $this->hasMany(OrderDiscount::class);
    }

    public function outgoingTransfers(): HasMany
    {
        return $this->hasMany(OrderItemTransfer::class, 'from_order_id');
    }

    public function incomingTransfers(): HasMany
    {
        return $this->hasMany(OrderItemTransfer::class, 'to_order_id');
    }
}
