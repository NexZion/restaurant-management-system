<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Wastage extends Model
{
    protected $fillable = ['branch_id', 'inventory_item_id', 'quantity', 'unit_cost', 'reason_code', 'notes', 'recorded_by', 'recorded_at'];

    protected function casts(): array
    {
        return ['quantity' => 'decimal:3', 'unit_cost' => 'decimal:4', 'recorded_at' => 'datetime'];
    }
}
