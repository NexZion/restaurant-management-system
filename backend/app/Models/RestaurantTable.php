<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class RestaurantTable extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'table_number',
        'capacity',
        'table_type',
        'section',
        'status'
    ];
}