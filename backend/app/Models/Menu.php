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
        'menu_type',
        'availability_type',
        'start_time',
        'end_time',
        'available_days',
        'start_date',
        'end_date',
        'service_types',
        'name',
        'description',
        'display_order',
        'is_active',
    ];

    protected $casts = [
        'display_order' => 'integer',
        'is_active' => 'boolean',
        'available_days' => 'array',
        'service_types' => 'array',
        'start_date' => 'date:Y-m-d',
        'end_date' => 'date:Y-m-d',
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
            'branch_menu_menu_items'
        )->withPivot(['id', 'branch_id', 'display_order']);
    }

    public function menuItemsForBranch(int $branchId)
    {
        return $this->menuItems()->wherePivot('branch_id', $branchId);
    }
}
