<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class Menu extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [

        'branch_id',

        'name',

        'description',

        'display_order',

        'status'
    ];

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function menuItems()
    {
        return $this->belongsToMany(
            MenuItem::class,
            'menu_menu_item'
        )->withPivot('display_order')
            ->withTimestamps();

    }
}