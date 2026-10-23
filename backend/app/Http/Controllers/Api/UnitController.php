<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Unit;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class UnitController extends Controller
{
    public function index()
    {
        return response()->json(['success' => true, 'data' => Unit::with('baseUnit')->orderBy('name')->get()]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:80',
            'symbol' => 'required|string|max:20|unique:units,symbol',
            'unit_type' => 'required|string|max:30',
            'base_unit_id' => 'nullable|exists:units,id',
            'conversion_factor' => 'required|numeric|gt:0',
            'is_active' => 'required|boolean',
        ]);
        $this->ensureCompatibleBaseUnit($data);
        $unit = Unit::create($data);
        return response()->json(['success' => true, 'data' => $unit->load('baseUnit')], 201);
    }

    public function show(Unit $unit)
    {
        return response()->json(['success' => true, 'data' => $unit->load('baseUnit')]);
    }

    public function update(Request $request, Unit $unit)
    {
        $data = $request->validate([
            'name' => 'sometimes|required|string|max:80',
            'symbol' => 'sometimes|required|string|max:20|unique:units,symbol,' . $unit->id,
            'unit_type' => 'sometimes|required|string|max:30',
            'base_unit_id' => 'nullable|exists:units,id|not_in:' . $unit->id,
            'conversion_factor' => 'sometimes|required|numeric|gt:0',
            'is_active' => 'sometimes|required|boolean',
        ]);
        $this->ensureCompatibleBaseUnit($data, $unit);
        $unit->update($data);
        return response()->json(['success' => true, 'data' => $unit->load('baseUnit')]);
    }

    public function destroy(Unit $unit)
    {
        if ($unit->rawMaterials()->exists() || $unit->recipeMaterials()->exists() || $unit->units()->exists()) {
            throw ValidationException::withMessages(['unit' => 'This unit is in use and cannot be deleted.']);
        }
        $unit->delete();
        return response()->json(['success' => true]);
    }

    private function ensureCompatibleBaseUnit(array $data, ?Unit $unit = null): void
    {
        $baseUnitId = $data['base_unit_id'] ?? $unit?->base_unit_id;
        if (!$baseUnitId) return;
        $unitType = $data['unit_type'] ?? $unit?->unit_type;
        $baseUnit = Unit::find($baseUnitId);
        if ($baseUnit && $baseUnit->unit_type !== $unitType) {
            throw ValidationException::withMessages(['base_unit_id' => 'Units can only convert to another unit of the same type.']);
        }
    }
}
