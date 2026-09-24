<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CustomerLoyaltyProfile extends Model
{
    protected $fillable = ['customer_id', 'membership_number', 'tier_id', 'current_points', 'joined_at', 'status'];
    protected function casts(): array { return ['joined_at' => 'datetime']; }
    public function customer(): BelongsTo { return $this->belongsTo(Customer::class); }
}
