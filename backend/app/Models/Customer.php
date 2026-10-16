<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
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

    public function scopeApplyFilters(Builder $query, array $filters): Builder
    {
        return $query
            ->search($filters['search'] ?? null)
            ->inDistrict($filters['district'] ?? null)
            ->ofType($filters['customer_type'] ?? null)
            ->withStatus($filters['status'] ?? null);
    }

    public function scopeSearch(
        Builder $query,
        ?string $search
    ): Builder {
        if (blank($search)) {
            return $query;
        }

        return $query->where(function (Builder $q) use ($search) {
            $q->where('first_name', 'like', "%{$search}%")
                ->orWhere('last_name', 'like', "%{$search}%")
                ->orWhere('customer_code', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%")
                ->orWhere('phone', 'like', "%{$search}%");
        });
    }


    public function scopeOfType(
        Builder $query,
        ?string $type
    ): Builder {
        return filled($type) && $type !== 'all'
            ? $query->where('customer_type', $type)
            : $query;
    }

    public function scopeInDistrict(
        Builder $query,
        ?string $district
    ): Builder {
        return filled($district) && $district !== 'all'
            ? $query->where('district', $district)
            : $query;
    }

    public function scopeWithStatus(
        Builder $query,
        ?string $status
    ): Builder {
        return filled($status) && $status !== 'all'
            ? $query->where('status', $status)
            : $query;
    }
}
