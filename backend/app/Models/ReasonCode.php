<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReasonCode extends Model
{
    protected $fillable = ['branch_id', 'category', 'code', 'label', 'requires_note', 'is_active'];

    protected function casts(): array
    {
        return ['requires_note' => 'boolean', 'is_active' => 'boolean'];
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }
}
