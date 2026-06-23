<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Branch extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [

        'code',
        'name',
        'slug',

        'address_line1',
        'address_line2',
        'city',
        'state_province',
        'postal_code',
        'country',
        'latitude',
        'longitude',

        'phone',
        'email',
        'whatsapp',

        'branch_type',
        'has_dining',
        'has_rooms',
        'has_delivery',

        'opening_time',
        'closing_time',
        'timezone',

        'manager_name',
        'contact_person_phone',

        'status'
    ];

 
     
    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function menus()
    {
        return $this->hasMany(Menu::class);
    }
}