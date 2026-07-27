<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\IndexFilterRequest;
use App\Http\Requests\StoreReservationRequest;
use App\Http\Requests\UpdateReservationRequest;
use App\Models\Reservation;
use App\Services\DocumentSequenceService;
use Illuminate\Http\JsonResponse;

class ReservationController extends Controller
{
    public function __construct(private DocumentSequenceService $sequences) {}

    public function index(IndexFilterRequest $request): JsonResponse
    {
        $reservations = $this->filterAndPaginate(
            Reservation::with(['customer', 'creator'])->where('branch_id', $request->user()->branch_id),
            $request,
            ['id', 'branch_id', 'customer_id', 'reservation_number', 'reservation_date', 'start_time', 'end_time', 'guest_count', 'status', 'special_requests', 'created_by', 'created_at', 'updated_at'],
            ['reservation_number', 'status', 'special_requests'],
        );

        return response()->json(['success' => true, 'data' => $reservations]);
    }

    public function store(StoreReservationRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['reservation_number'] ??= $this->sequences->next($data['branch_id'], 'reservation', 'RES-');
        $reservation = Reservation::create($data);

        return response()->json(['success' => true, 'data' => $reservation->load(['customer', 'creator'])], 201);
    }

    public function show(Reservation $reservation): JsonResponse
    {
        $this->ensureBranchAccess($reservation->branch_id, request()->user()->branch_id);

        return response()->json(['success' => true, 'data' => $reservation->load(['customer', 'creator', 'tableSessions'])]);
    }

    public function update(UpdateReservationRequest $request, Reservation $reservation): JsonResponse
    {
        $this->ensureBranchAccess($reservation->branch_id, $request->user()->branch_id);
        $reservation->update($request->validated());

        return response()->json(['success' => true, 'data' => $reservation->fresh()]);
    }

    public function destroy(Reservation $reservation): JsonResponse
    {
        $this->ensureBranchAccess($reservation->branch_id, request()->user()->branch_id);
        abort_if($reservation->tableSessions()->whereNotIn('status', ['closed', 'cancelled'])->exists(), 409, 'Active table sessions prevent deletion.');
        $reservation->delete();

        return response()->json(['success' => true, 'message' => 'Reservation deleted successfully.']);
    }

    private function ensureBranchAccess(int $resourceBranchId, int $userBranchId): void
    {
        abort_unless($resourceBranchId === $userBranchId, 404);
    }
}
