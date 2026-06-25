<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class RestaurantTable extends Model
{
    use SoftDeletes,hasFactory; 

    protected $fillable = [
        'table_number',
        'capacity',
        'table_type',
        'section',
        'status'
    ];

    public function orders()
{
    return $this->hasMany(Order::class);
}
}