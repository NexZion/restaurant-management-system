<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderDelivery extends Model
{
    protected $fillable = [
        'order_id', 'delivery_address_id', 'recipient_name', 'recipient_phone',
        'address_line_1', 'address_line_2', 'city', 'latitude', 'longitude',
        'delivery_fee', 'rider_id', 'delivery_status', 'estimated_delivery_at',
        'dispatched_at', 'delivered_at', 'delivery_notes',
    ];

    protected $attributes = ['delivery_fee' => 0, 'delivery_status' => 'pending'];

    protected function casts(): array
    {
        return [
            'latitude' => 'decimal:7', 'longitude' => 'decimal:7', 'delivery_fee' => 'decimal:2',
            'estimated_delivery_at' => 'datetime', 'dispatched_at' => 'datetime', 'delivered_at' => 'datetime',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function rider(): BelongsTo
    {
        return $this->belongsTo(User::class, 'rider_id');
    }
}
