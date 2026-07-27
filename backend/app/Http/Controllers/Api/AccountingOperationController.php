<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\PostJournalEntryRequest;
use App\Http\Requests\ReverseJournalEntryRequest;
use App\Models\JournalEntry;
use App\Services\JournalService;
use Illuminate\Http\JsonResponse;

class AccountingOperationController extends Controller
{
    public function __construct(private JournalService $journals) {}

    public function post(PostJournalEntryRequest $request, JournalEntry $journalEntry): JsonResponse
    {
        abort_unless($journalEntry->branch_id === $request->user()->branch_id, 404);
        $entry = $this->journals->post($journalEntry, $request->validated('lines'), $request->user()->id);

        return response()->json(['success' => true, 'data' => $entry]);
    }

    public function reverse(ReverseJournalEntryRequest $request, JournalEntry $journalEntry): JsonResponse
    {
        abort_unless($journalEntry->branch_id === $request->user()->branch_id, 404);
        $entry = $this->journals->reverse($journalEntry, $request->validated('reason'), $request->user()->id);

        return response()->json(['success' => true, 'data' => $entry], 201);
    }
}
