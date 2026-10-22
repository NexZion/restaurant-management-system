<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Variant extends Model
{
    public $timestamps = false;
    protected $fillable = ['name', 'code', 'selection_type', 'min_select', 'max_select', 'is_active'];
    protected $casts = ['min_select' => 'integer', 'max_select' => 'integer', 'is_active' => 'boolean'];

    public function options()
    {
        return $this->hasMany(VariantOption::class)->orderBy('display_order')->orderBy('id');
    }
}
