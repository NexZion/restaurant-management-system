<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class Menu extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [

        'code',
        'name',
        'description',
        'display_order',
        'is_active',
    ];

    protected $casts = [
        'display_order' => 'integer',
        'is_active' => 'boolean',
    ];

    public function branches()
    {
        return $this->belongsToMany(Branch::class, 'branch_menus')
            ->withPivot(['id', 'is_active', 'display_order'])
            ->withTimestamps();
    }

    public function menuItems()
    {
        return $this->belongsToMany(
            MenuItem::class,
            'menu_menu_items'
        )->withPivot(['id', 'display_order']);

    }
}
