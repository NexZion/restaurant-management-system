<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PaymentMethod extends Model
{
    protected $fillable = [
        'branch_id', 'code', 'name', 'type', 'requires_reference', 'is_cash', 'is_active',
    ];

    protected $attributes = ['requires_reference' => false, 'is_cash' => false, 'is_active' => true];

    protected function casts(): array
    {
        return ['requires_reference' => 'boolean', 'is_cash' => 'boolean', 'is_active' => 'boolean'];
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }
}
