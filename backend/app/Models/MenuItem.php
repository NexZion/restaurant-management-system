<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class MenuItem extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [

        'menu_category_id',
        'sku',
        'name',
        'description',
        'base_price',
        'base_cost',
        'preparation_time',
        'display_order',
        'is_active',
        'is_available',
    ];

    protected $casts = [
        'base_price' => 'decimal:2',
        'base_cost' => 'decimal:2',
        'preparation_time' => 'integer',
        'display_order' => 'integer',
        'is_active' => 'boolean',
        'is_available' => 'boolean',
    ];

    public function menuCategory()
    {
        return $this->belongsTo(
            MenuCategory::class,
            'menu_category_id'
        );
    }

    public function images()
    {
        return $this->hasMany(MenuItemImage::class);
    }
    public function variantOptions()
    {
        return $this->belongsToMany(VariantOption::class, 'menu_item_variant_options')
            ->withPivot(['id', 'additional_price', 'is_default', 'is_active', 'display_order']);
    }
    public function menus()
    {
        return $this->belongsToMany(
            Menu::class,
            'branch_menu_menu_items'
        )->withPivot(['id', 'branch_id', 'display_order']);
    }

    public function branches()
    {
        return $this->belongsToMany(Branch::class, 'branch_menu_items')
            ->withPivot(['id', 'selling_price', 'is_active', 'is_available', 'display_order'])
            ->withTimestamps();
    }

    public function recipe()
    {
        return $this->hasOne(Recipe::class);
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }
}
