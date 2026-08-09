<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InventoryItem extends Model
{
    protected $fillable = ['sku', 'name', 'unit', 'unit_cost', 'reorder_level', 'is_active'];

    protected function casts(): array
    {
        return ['unit_cost' => 'decimal:4', 'reorder_level' => 'decimal:3', 'is_active' => 'boolean'];
    }
}
