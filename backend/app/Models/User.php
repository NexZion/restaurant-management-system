<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Tymon\JWTAuth\Contracts\JWTSubject;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Builder;


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

    public function scopeApplyFilters(Builder $query, array $filters): Builder
    {
        return $query
            ->search($filters['search'] ?? null)
            ->ofRole($filters['role'] ?? null)
            ->inBranch($filters['branch'] ?? null)
            ->withStatus($filters['status'] ?? null);
    }

    public function scopeSearch(Builder $query, ?string $search): Builder
    {
        if (blank($search)) {
            return $query;
        }

        return $query->where(function (Builder $q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
                ->orWhere('username', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%")
                ->orWhere('phone', 'like', "%{$search}%");
        });
    }

    public function scopeOfRole(Builder $query, ?int $role): Builder
    {
        return filled($role) ? $query->where('role_id', $role) : $query;
    }

    public function scopeInBranch(Builder $query, ?int $branch): Builder
    {
        return filled($branch) ? $query->where('branch_id', $branch) : $query;
    }

    public function scopeWithStatus(Builder $query, ?string $status): Builder
    {
        return filled($status) ? $query->where('status', $status) : $query;
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
