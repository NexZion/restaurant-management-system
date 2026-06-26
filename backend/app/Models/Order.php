<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Order extends Model
{
    use SoftDeletes;

    protected $fillable = [

        'branch_id',
        'order_number',
        'table_id',
        'customer_id',
        'created_by',
        'waiter_id',
        'order_type',
        'status',
        'is_online',
        'notes'
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

    public function waiter()
    {
        return $this->belongsTo(
            User::class,
            'waiter_id'
        );
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }
}
