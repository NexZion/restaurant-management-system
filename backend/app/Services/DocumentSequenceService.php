<?php

namespace App\Services;

use App\Models\DocumentSequence;
use Illuminate\Support\Facades\DB;

class DocumentSequenceService
{
    public function next(?int $branchId, string $type, string $defaultPrefix = ''): string
    {
        return DB::transaction(function () use ($branchId, $type, $defaultPrefix) {
            $sequence = DocumentSequence::query()
                ->where('branch_id', $branchId)
                ->where('document_type', $type)
                ->lockForUpdate()
                ->first();

            if (! $sequence) {
                $sequence = DocumentSequence::query()->create([
                    'branch_id' => $branchId, 'document_type' => $type,
                    'prefix' => $defaultPrefix, 'next_number' => 1,
                    'padding' => 6, 'reset_period' => 'never',
                ]);
            }

            if ($this->shouldReset($sequence)) {
                $sequence->forceFill(['next_number' => 1, 'last_reset_date' => today()])->save();
            }

            $number = $sequence->next_number;
            $sequence->increment('next_number');

            return $sequence->prefix.str_pad((string) $number, $sequence->padding, '0', STR_PAD_LEFT);
        });
    }

    private function shouldReset(DocumentSequence $sequence): bool
    {
        if ($sequence->reset_period === 'never' || ! $sequence->last_reset_date) {
            return false;
        }

        return match ($sequence->reset_period) {
            'daily' => ! $sequence->last_reset_date->isToday(),
            'monthly' => ! $sequence->last_reset_date->isSameMonth(today()),
            'yearly' => $sequence->last_reset_date->year !== today()->year,
            default => false,
        };
    }
}
