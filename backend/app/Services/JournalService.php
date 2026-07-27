<?php

namespace App\Services;

use App\Models\JournalEntry;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class JournalService
{
    public function __construct(private DocumentSequenceService $sequences) {}

    public function post(JournalEntry $entry, array $lines, int $actorId): JournalEntry
    {
        return DB::transaction(function () use ($entry, $lines, $actorId) {
            $entry = JournalEntry::query()->lockForUpdate()->findOrFail($entry->id);
            if ($entry->status !== 'draft') {
                throw ValidationException::withMessages(['journal_entry' => 'Only draft journal entries can be posted.']);
            }
            $debit = round(collect($lines)->sum(fn ($line) => (float) ($line['debit'] ?? 0)), 2);
            $credit = round(collect($lines)->sum(fn ($line) => (float) ($line['credit'] ?? 0)), 2);
            if ($debit <= 0 || $debit !== $credit) {
                throw ValidationException::withMessages(['lines' => 'Journal debits and credits must be equal and greater than zero.']);
            }
            foreach ($lines as $line) {
                if ((float) ($line['debit'] ?? 0) > 0 && (float) ($line['credit'] ?? 0) > 0) {
                    throw ValidationException::withMessages(['lines' => 'A journal line cannot contain both debit and credit.']);
                }
            }
            $entry->lines()->delete();
            $entry->lines()->createMany($lines);
            $entry->update(['status' => 'posted', 'posted_by' => $actorId, 'posted_at' => now()]);

            return $entry->refresh()->load('lines');
        });
    }

    public function reverse(JournalEntry $entry, string $reason, int $actorId): JournalEntry
    {
        return DB::transaction(function () use ($entry, $reason, $actorId) {
            $entry = JournalEntry::query()->with('lines')->lockForUpdate()->findOrFail($entry->id);
            if ($entry->status !== 'posted') {
                throw ValidationException::withMessages(['journal_entry' => 'Only posted journal entries can be reversed.']);
            }
            $reversal = JournalEntry::query()->create([
                'branch_id' => $entry->branch_id,
                'entry_number' => $this->sequences->next($entry->branch_id, 'journal_entry', 'JE-'),
                'entry_date' => today(), 'reference_type' => $entry->getMorphClass(),
                'reference_id' => $entry->id, 'description' => "Reversal: {$reason}",
                'status' => 'posted', 'created_by' => $actorId, 'posted_by' => $actorId, 'posted_at' => now(),
            ]);
            $reversal->lines()->createMany($entry->lines->map(fn ($line) => [
                'account_id' => $line->account_id, 'debit' => $line->credit,
                'credit' => $line->debit, 'memo' => "Reversal of {$entry->entry_number}",
            ])->all());
            $entry->update(['status' => 'reversed']);

            return $reversal->load('lines');
        });
    }
}
