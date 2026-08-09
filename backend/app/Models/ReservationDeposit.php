<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReservationDeposit extends Model
{
    protected $fillable = ['reservation_id', 'payment_id', 'amount', 'status', 'paid_at', 'refunded_at'];

    protected function casts(): array
    {
        return ['amount' => 'decimal:2', 'paid_at' => 'datetime', 'refunded_at' => 'datetime'];
    }
}
