<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MenuItemVariant extends Model
{
    protected $fillable = ['menu_item_id', 'name', 'sku', 'price', 'cost', 'is_default', 'is_active', 'sort_order'];

    protected function casts(): array
    {
        return ['price' => 'decimal:2', 'cost' => 'decimal:2', 'is_default' => 'boolean', 'is_active' => 'boolean'];
    }

    public function menuItem(): BelongsTo
    {
        return $this->belongsTo(MenuItem::class);
    }

    public function attributes(): HasMany
    {
        return $this->hasMany(VariantAttribute::class);
    }
}
