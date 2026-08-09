<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BranchMenuItem extends Model
{
    protected $fillable = ['branch_id', 'menu_item_id', 'price', 'is_available', 'available_from', 'available_until'];

    protected function casts(): array
    {
        return ['price' => 'decimal:2', 'is_available' => 'boolean', 'available_from' => 'datetime', 'available_until' => 'datetime'];
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function menuItem(): BelongsTo
    {
        return $this->belongsTo(MenuItem::class);
    }
}
