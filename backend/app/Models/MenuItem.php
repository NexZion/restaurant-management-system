<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class MenuItem extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [

        'branch_id',

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

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function menuCategory()
    {
        return $this->belongsTo(
            MenuCategory::class,
            'menu_category_id'
        );
    }

    // public function images()
    // {
    //     return $this->hasMany(MenuItemImage::class);
    // }
}