<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Promotion extends Model
{
    protected $fillable = ['branch_id', 'name', 'code', 'discount_type', 'discount_value', 'minimum_order_amount', 'maximum_discount_amount', 'starts_at', 'ends_at', 'is_active'];

    protected function casts(): array
    {
        return ['discount_value' => 'decimal:2', 'minimum_order_amount' => 'decimal:2', 'maximum_discount_amount' => 'decimal:2', 'starts_at' => 'datetime', 'ends_at' => 'datetime', 'is_active' => 'boolean'];
    }
}
