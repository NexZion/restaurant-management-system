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

        'slug',

        'short_description',

        'long_description',

        'base_price',

        'preparation_time',

        'display_order',

        'status'
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
    public function menus()
    {
        return $this->belongsToMany(
            Menu::class,
            'menu_menu_item'
        )->withPivot('display_order')
            ->withTimestamps();
    } 
}
