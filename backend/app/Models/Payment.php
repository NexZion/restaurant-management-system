<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Payment extends Model
{
    use SoftDeletes;

    protected $fillable = [

        'order_bill_id',

        'payment_method',

        'amount_paid',

        'amount_received',

        'balance_amount',

        'payment_status',

        'transaction_reference',

        'notes',

        'created_by'

    ];

    public function bill()
    {
        return $this->belongsTo(OrderBill::class, 'order_bill_id');
    }

    public function cashier()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}