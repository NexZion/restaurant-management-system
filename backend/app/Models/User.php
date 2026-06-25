<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Tymon\JWTAuth\Contracts\JWTSubject;
use Illuminate\Database\Eloquent\SoftDeletes;


class User extends Authenticatable implements JWTSubject
{
    use SoftDeletes, HasFactory;

    protected $fillable = [

        'name',
        'username',
        'email',
        'phone',
        'whatsapp',

        'password',
        'pin',

        'role_id',
        'branch_id',

        'image',
        'dob',
        'address',

        'status',

        'failed_attempts',
        'is_locked'
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'pin'
    ];

    /**
     * User belongs to a Role
     */
    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    /**
     * User belongs to a Branch
     */
    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function createdOrders()
    {
        return $this->hasMany(
            Order::class,
            'created_by'
        );
    }

    public function waiterOrders()
    {
        return $this->hasMany(
            Order::class,
            'waiter_id'
        );
    }

    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims()
    {
        return [];
    }
}
