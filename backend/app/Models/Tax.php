<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Tax extends Model
{
    protected $fillable = ['branch_id', 'name', 'code', 'type', 'rate', 'is_inclusive', 'is_active', 'effective_from', 'effective_to'];

    protected function casts(): array
    {
        return ['rate' => 'decimal:4', 'is_inclusive' => 'boolean', 'is_active' => 'boolean', 'effective_from' => 'date', 'effective_to' => 'date'];
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }
}
