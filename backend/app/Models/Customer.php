<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Customer extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [

        'uuid',
        'customer_number',
        'first_name',
        'last_name',
        'display_name',
        'phone',
        'secondary_phone',
        'email',
        'date_of_birth',
        'gender',
        'customer_type',
        'status',
        'preferred_branch_id',
        'profile_photo',
        'notes',
    ];

    protected function casts(): array
    {
        return ['date_of_birth' => 'date'];
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function reservations(): HasMany
    {
        return $this->hasMany(Reservation::class);
    }

    public function preferredBranch(): BelongsTo { return $this->belongsTo(Branch::class, 'preferred_branch_id'); }
    public function addresses(): HasMany { return $this->hasMany(CustomerAddress::class); }
    public function preference(): HasOne { return $this->hasOne(CustomerPreference::class); }
    public function communicationPreference(): HasOne { return $this->hasOne(CustomerCommunicationPreference::class); }
    public function notes(): HasMany { return $this->hasMany(CustomerNote::class); }
    public function tags(): BelongsToMany { return $this->belongsToMany(CustomerTag::class, 'customer_customer_tag'); }
    public function loyaltyProfile(): HasOne { return $this->hasOne(CustomerLoyaltyProfile::class); }
}
