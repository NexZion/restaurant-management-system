<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Reservation extends Model
{
    protected $fillable = [
        'branch_id', 'customer_id', 'reservation_number', 'reservation_date',
        'start_time', 'end_time', 'guest_count', 'status', 'special_requests', 'created_by',
        'guest_name', 'guest_phone', 'guest_email', 'source', 'confirmed_at', 'seated_at',
        'completed_at', 'cancelled_at', 'cancellation_reason',
    ];

    protected $attributes = ['status' => 'pending'];

    protected function casts(): array
    {
        return [
            'reservation_date' => 'date', 'confirmed_at' => 'datetime', 'seated_at' => 'datetime',
            'completed_at' => 'datetime', 'cancelled_at' => 'datetime',
        ];
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function tableSessions(): HasMany
    {
        return $this->hasMany(TableSession::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function reservationTables(): HasMany
    {
        return $this->hasMany(ReservationTable::class);
    }
}
