<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class KitchenTicket extends Model
{
    protected $fillable = [
        'order_id', 'branch_id', 'ticket_number', 'kitchen_station_id', 'status',
        'priority', 'generated_by', 'generated_at', 'started_at', 'ready_at',
        'closed_at', 'reprint_count', 'last_printed_at',
    ];

    protected $attributes = ['status' => 'pending', 'priority' => 'normal', 'reprint_count' => 0];

    protected function casts(): array
    {
        return [
            'generated_at' => 'datetime', 'started_at' => 'datetime', 'ready_at' => 'datetime',
            'closed_at' => 'datetime', 'last_printed_at' => 'datetime',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function station(): BelongsTo
    {
        return $this->belongsTo(KitchenStation::class, 'kitchen_station_id');
    }

    public function generator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'generated_by');
    }

    public function items(): HasMany
    {
        return $this->hasMany(KitchenTicketItem::class);
    }
}
