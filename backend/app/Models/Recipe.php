<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Recipe extends Model
{
    use HasFactory;

    protected $fillable = [
        'menu_item_id',
        'instructions',
        'yield_quantity',
        'preparation_notes',
    ];

    protected $casts = [
        'yield_quantity' => 'decimal:3',
    ];

    public function menuItem()
    {
        return $this->belongsTo(MenuItem::class);
    }

    public function materials()
    {
        return $this->belongsToMany(RawMaterial::class, 'recipe_raw_materials')
            ->withPivot(['id', 'quantity', 'unit_id', 'display_order', 'notes']);
    }

    public function recipeMaterials()
    {
        return $this->hasMany(RecipeRawMaterial::class);
    }
}
