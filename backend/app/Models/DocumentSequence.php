<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\DB;

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

    public static function nextNumber(?int $branchId, string $type, string $prefix = ''): string
    {
        return DB::transaction(function () use ($branchId, $type, $prefix) {
            $sequence = static::query()->where('branch_id', $branchId)->where('document_type', $type)->lockForUpdate()->first();
            $sequence ??= static::query()->create(['branch_id' => $branchId, 'document_type' => $type, 'prefix' => $prefix, 'next_number' => 1, 'padding' => 6, 'reset_period' => 'never']);
            $number = $sequence->next_number;
            $sequence->increment('next_number');

            return $sequence->prefix.str_pad((string) $number, $sequence->padding, '0', STR_PAD_LEFT);
        });
    }
}
