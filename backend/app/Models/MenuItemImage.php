<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class MenuItemImage extends Model
{
    use HasFactory;

    public const UPDATED_AT = null;

    protected $fillable = [

        'menu_item_id',

        'image_path',
        'alt_text',
        'is_primary',

        'display_order'
    ];

    public function menuItem()
    {
        return $this->belongsTo(MenuItem::class);
    }
}
