<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    protected $fillable = ['promotion_id', 'code', 'usage_limit', 'usage_limit_per_customer', 'used_count', 'is_active', 'expires_at'];

    protected function casts(): array
    {
        return ['is_active' => 'boolean', 'expires_at' => 'datetime'];
    }
}
