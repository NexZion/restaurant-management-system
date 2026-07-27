<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Recipe extends Model
{
    protected $fillable = ['menu_item_id', 'menu_item_variant_id', 'yield_quantity', 'yield_unit', 'instructions', 'is_active'];

    protected function casts(): array
    {
        return ['yield_quantity' => 'decimal:3', 'is_active' => 'boolean'];
    }

    public function ingredients(): HasMany
    {
        return $this->hasMany(RecipeIngredient::class);
    }
}
