<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class KitchenTicketItem extends Model
{
    protected $fillable = [
        'kitchen_ticket_id', 'order_item_id', 'quantity', 'status', 'notes', 'started_at', 'ready_at',
    ];

    protected $attributes = ['status' => 'pending'];

    protected function casts(): array
    {
        return ['started_at' => 'datetime', 'ready_at' => 'datetime'];
    }

    public function ticket(): BelongsTo
    {
        return $this->belongsTo(KitchenTicket::class, 'kitchen_ticket_id');
    }

    public function orderItem(): BelongsTo
    {
        return $this->belongsTo(OrderItem::class);
    }
}
