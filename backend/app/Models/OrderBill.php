<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class OrderBill extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'order_id',
        'subtotal',
        'discount',
        'tax',
        'service_charge',
        'grand_total',
        'bill_status'
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}