<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class RestaurantTable extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'branch_id', 'table_number', 'capacity', 'table_type', 'section',
        'section_id', 'floor_id', 'status',
    ];

    protected $attributes = ['table_type' => 'normal', 'status' => 'available'];

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class, 'table_id');
    }

    public function assignments(): HasMany
    {
        return $this->hasMany(TableSessionTable::class, 'table_id');
    }

    public function tableSessions(): BelongsToMany
    {
        return $this->belongsToMany(TableSession::class, 'table_session_tables', 'table_id', 'table_session_id')
            ->withPivot(['assigned_at', 'released_at']);
    }
}
