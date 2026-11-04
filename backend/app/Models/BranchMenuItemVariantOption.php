<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BranchMenuItemVariantOption extends Model
{
    protected $fillable = ['branch_id', 'menu_item_id', 'variant_option_id', 'is_available'];

    protected $casts = ['is_available' => 'boolean'];
}
