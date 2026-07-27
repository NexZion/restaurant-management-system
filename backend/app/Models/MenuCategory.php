<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class MenuCategory extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [

        'name',

        'description',

        'image',

        'display_order',

        'status',
    ];

    public function menuItems()
    {
        return $this->hasMany(MenuItem::class);
    }
}
