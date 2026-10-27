<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VariantOption extends Model
{
    public $timestamps = false;
    protected $fillable = ['variant_id', 'name', 'code', 'default_additional_price', 'is_active', 'display_order'];
    protected $casts = ['default_additional_price' => 'decimal:2', 'is_active' => 'boolean', 'display_order' => 'integer'];

    public function variant()
    {
        return $this->belongsTo(Variant::class);
    }

    public function menuItems()
    {
        return $this->belongsToMany(MenuItem::class, 'menu_item_variant_options')
            ->withPivot(['id', 'additional_price', 'is_default', 'is_active', 'display_order']);
    }
}
