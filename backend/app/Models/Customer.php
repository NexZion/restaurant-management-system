<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Customer extends Model
{   
    use HasFactory,SoftDeletes;

    protected $fillable = [
        
        'customer_code',

        'first_name',
        'last_name',

        'email',
        'phone',
        'whatsapp',

        'address_line1',
        'address_line2',
        'city',
        'district',
        'postal_code',
        'state',

        'customer_type',

        'loyalty_points',
        'total_spend',
        'receipt_count',
        'last_visited_at',

        'id_number',
        'id_type',

        'status',
        'is_active'
    ];

    public function orders()
{
    return $this->hasMany(Order::class);
}
}