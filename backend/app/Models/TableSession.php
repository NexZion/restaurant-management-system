<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TableSession extends Model
{
    protected $fillable = [
        'branch_id', 'reservation_id', 'opened_by', 'guest_count',
        'status', 'opened_at', 'closed_at',
    ];

    protected $attributes = ['status' => 'open'];

    protected function casts(): array
    {
        return ['opened_at' => 'datetime', 'closed_at' => 'datetime'];
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function reservation(): BelongsTo
    {
        return $this->belongsTo(Reservation::class);
    }

    public function opener(): BelongsTo
    {
        return $this->belongsTo(User::class, 'opened_by');
    }

    public function assignments(): HasMany
    {
        return $this->hasMany(TableSessionTable::class);
    }

    public function tables(): BelongsToMany
    {
        return $this->belongsToMany(RestaurantTable::class, 'table_session_tables', 'table_session_id', 'table_id')
            ->withPivot(['assigned_at', 'released_at']);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }
}
