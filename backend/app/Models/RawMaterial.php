<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class RawMaterial extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'sku',
        'base_unit_id',
        'default_unit_cost',
        'description',
        'is_active',
    ];

    protected $casts = [
        'default_unit_cost' => 'decimal:4',
        'is_active' => 'boolean',
    ];

    public function branches()
    {
        return $this->belongsToMany(Branch::class, 'branch_raw_materials')
            ->withPivot(['id', 'unit_cost', 'is_active'])
            ->withTimestamps();
    }

    public function baseUnit()
    {
        return $this->belongsTo(Unit::class, 'base_unit_id');
    }

    public function recipeMaterials()
    {
        return $this->hasMany(RecipeRawMaterial::class);
    }
}
