<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class MenuCategory extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [

        'name',
        'code',
        'description',
        'image_path',
        'display_order',
        'is_active',
    ];

    protected $casts = [
        'display_order' => 'integer',
        'is_active' => 'boolean',
    ];

    public function branches()
    {
        return $this->belongsToMany(Branch::class, 'branch_menu_categories')
            ->withPivot(['id', 'is_active', 'display_order']);
    }

    public function menuItems()
    {
        return $this->hasMany(MenuItem::class);
    }
}
