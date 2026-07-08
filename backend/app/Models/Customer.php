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

    public static function generateCustomerCode(): string
    {
        $nextNumber = (int) static::withTrashed()->max('id') + 1;

        do {
            $code = 'CUS-' . str_pad((string) $nextNumber, 6, '0', STR_PAD_LEFT);
            $nextNumber++;
        } while (static::withTrashed()->where('customer_code', $code)->exists());

        return $code;
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }
}
