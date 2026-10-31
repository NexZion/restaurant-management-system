<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [

        'branch_id',
        'order_number',
        'table_id',
        'customer_id',
        'created_by',
        'assigned_by',
        'order_type',
        'status',
        'payment_status',
        'subtotal',
        'discount_total',
        'tax_total',
        'service_charge_total',
        'grand_total',
        'paid_total',
        'balance_due',
        'customer_note',
        'internal_note',
        'ordered_at',
        'confirmed_at',
        'completed_at',
        'cancelled_at',
        'cancellation_reason',
    ];

    protected $casts = [
        'ordered_at' => 'datetime',
        'confirmed_at' => 'datetime',
        'completed_at' => 'datetime',
        'cancelled_at' => 'datetime',
    ];

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function table()
    {
        return $this->belongsTo(
            RestaurantTable::class,
            'table_id'
        );
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function creator()
    {
        return $this->belongsTo(
            User::class,
            'created_by'
        );
    }

    public function assignedBy()
    {
        return $this->belongsTo(
            User::class,
            'assigned_by'
        );
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }
}
