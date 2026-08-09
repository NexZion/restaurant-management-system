<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\IndexFilterRequest;
use App\Http\Requests\StoreKitchenTicketRequest;
use App\Http\Requests\UpdateKitchenTicketRequest;
use App\Models\KitchenTicket;
use App\Services\DocumentSequenceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class KitchenTicketController extends Controller
{
    public function __construct(private DocumentSequenceService $sequences) {}

    public function index(IndexFilterRequest $request): JsonResponse
    {
        $tickets = $this->filterAndPaginate(
            KitchenTicket::with(['order', 'station', 'generator', 'items.orderItem'])->where('branch_id', $request->user()->branch_id),
            $request,
            ['id', 'order_id', 'branch_id', 'ticket_number', 'kitchen_station_id', 'status', 'priority', 'generated_by', 'generated_at', 'started_at', 'ready_at', 'closed_at', 'reprint_count', 'last_printed_at', 'created_at', 'updated_at'],
            ['ticket_number', 'status', 'priority'],
        );

        return response()->json(['success' => true, 'data' => $tickets]);
    }

    public function store(StoreKitchenTicketRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $validated['ticket_number'] ??= $this->sequences->next($validated['branch_id'], 'kitchen_ticket', 'KIT-');
        $ticket = DB::transaction(function () use ($validated): KitchenTicket {
            $ticket = KitchenTicket::create(array_merge(Arr::except($validated, 'items'), ['generated_at' => $validated['generated_at'] ?? now()]));
            $ticket->items()->createMany($validated['items']);

            return $ticket;
        });

        return response()->json(['success' => true, 'data' => $ticket->load(['station', 'items.orderItem'])], 201);
    }

    public function show(KitchenTicket $kitchenTicket): JsonResponse
    {
        $this->ensureBranchAccess($kitchenTicket);

        return response()->json(['success' => true, 'data' => $kitchenTicket->load(['order', 'station', 'generator', 'items.orderItem'])]);
    }

    public function update(UpdateKitchenTicketRequest $request, KitchenTicket $kitchenTicket): JsonResponse
    {
        $this->ensureBranchAccess($kitchenTicket);
        $validated = $request->validated();
        DB::transaction(function () use ($kitchenTicket, $validated): void {
            $kitchenTicket->update(Arr::except($validated, 'items'));
            if (isset($validated['items'])) {
                foreach ($validated['items'] as $item) {
                    $kitchenTicket->items()->updateOrCreate(['order_item_id' => $item['order_item_id']], $item);
                }
            }
        });

        return response()->json(['success' => true, 'data' => $kitchenTicket->fresh()->load('items')]);
    }

    public function destroy(KitchenTicket $kitchenTicket): JsonResponse
    {
        $this->ensureBranchAccess($kitchenTicket);
        $kitchenTicket->update(['status' => 'cancelled']);

        return response()->json(['success' => true, 'message' => 'Kitchen ticket cancelled successfully.']);
    }

    private function ensureBranchAccess(KitchenTicket $ticket): void
    {
        abort_unless($ticket->branch_id === request()->user()->branch_id, 404);
    }
}
