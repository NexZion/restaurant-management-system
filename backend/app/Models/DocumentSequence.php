<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DocumentSequence extends Model
{
    protected $fillable = ['branch_id', 'document_type', 'prefix', 'next_number', 'padding', 'reset_period', 'last_reset_date'];

    protected function casts(): array
    {
        return ['last_reset_date' => 'date'];
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }
}
