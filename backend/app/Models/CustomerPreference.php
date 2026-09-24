<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CustomerPreference extends Model
{
    protected $fillable = ['customer_id', 'preferred_branch_id', 'preferred_order_type', 'preferred_language', 'spice_preference', 'dietary_preference', 'favorite_cuisine'];

    public function customer(): BelongsTo { return $this->belongsTo(Customer::class); }
    public function preferredBranch(): BelongsTo { return $this->belongsTo(Branch::class, 'preferred_branch_id'); }
}
