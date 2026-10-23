<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Unit extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'name',
        'symbol',
        'unit_type',
        'base_unit_id',
        'conversion_factor',
        'is_active',
    ];

    protected $casts = [
        'conversion_factor' => 'decimal:6',
        'is_active' => 'boolean',
    ];

    public function baseUnit()
    {
        return $this->belongsTo(self::class, 'base_unit_id');
    }

    public function units()
    {
        return $this->hasMany(self::class, 'base_unit_id');
    }

    public function rawMaterials()
    {
        return $this->hasMany(RawMaterial::class, 'base_unit_id');
    }

    public function recipeMaterials()
    {
        return $this->hasMany(RecipeRawMaterial::class);
    }
}
