<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\IndexFilterRequest;
use App\Http\Requests\StoreKitchenStationRequest;
use App\Http\Requests\UpdateKitchenStationRequest;
use App\Models\KitchenStation;
use Illuminate\Http\JsonResponse;

class KitchenStationController extends Controller
{
    public function index(IndexFilterRequest $request): JsonResponse
    {
        $stations = $this->filterAndPaginate(
            KitchenStation::where('branch_id', $request->user()->branch_id),
            $request,
            ['id', 'branch_id', 'name', 'code', 'printer_id', 'display_order', 'status', 'created_at', 'updated_at'],
            ['name', 'code', 'status'],
        );

        return response()->json(['success' => true, 'data' => $stations]);
    }

    public function store(StoreKitchenStationRequest $request): JsonResponse
    {
        return response()->json(['success' => true, 'data' => KitchenStation::create($request->validated())], 201);
    }

    public function show(KitchenStation $kitchenStation): JsonResponse
    {
        $this->ensureBranchAccess($kitchenStation);

        return response()->json(['success' => true, 'data' => $kitchenStation->load('tickets')]);
    }

    public function update(UpdateKitchenStationRequest $request, KitchenStation $kitchenStation): JsonResponse
    {
        $this->ensureBranchAccess($kitchenStation);
        $kitchenStation->update($request->validated());

        return response()->json(['success' => true, 'data' => $kitchenStation->fresh()]);
    }

    public function destroy(KitchenStation $kitchenStation): JsonResponse
    {
        $this->ensureBranchAccess($kitchenStation);
        abort_if($kitchenStation->tickets()->exists(), 409, 'Stations with tickets cannot be deleted.');
        $kitchenStation->delete();

        return response()->json(['success' => true, 'message' => 'Kitchen station deleted successfully.']);
    }

    private function ensureBranchAccess(KitchenStation $station): void
    {
        abort_unless($station->branch_id === request()->user()->branch_id, 404);
    }
}
