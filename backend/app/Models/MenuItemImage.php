<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
class MenuItemImage extends Model
{
    use HasFactory, SoftDeletes;
    
    protected $fillable = [

        'menu_item_id',

        'image_url',

        'is_primary',

        'display_order'
    ];

    public function menuItem()
    {
        return $this->belongsTo(MenuItem::class);
    }
}
