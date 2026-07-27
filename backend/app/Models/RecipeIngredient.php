<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RecipeIngredient extends Model
{
    protected $fillable = ['recipe_id', 'inventory_item_id', 'quantity', 'unit', 'waste_percentage'];

    protected function casts(): array
    {
        return ['quantity' => 'decimal:3', 'waste_percentage' => 'decimal:4'];
    }
}
