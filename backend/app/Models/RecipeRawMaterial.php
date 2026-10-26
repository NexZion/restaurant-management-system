<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RecipeRawMaterial extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $table = 'recipe_raw_materials';

    protected $fillable = [
        'recipe_id',
        'raw_material_id',
        'quantity',
        'unit_id',
        'display_order',
        'notes',
    ];

    protected $casts = [
        'quantity' => 'decimal:4',
    ];

    public function recipe()
    {
        return $this->belongsTo(Recipe::class);
    }

    public function rawMaterial()
    {
        return $this->belongsTo(RawMaterial::class);
    }

    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }
}
