<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RawMaterial;
use Illuminate\Http\Request;

class RawMaterialController extends Controller
{
    public function index(Request $request)
    {
        $query = RawMaterial::with(['baseUnit', 'branches']);
        if ($request->filled('branch_id')) {
            $query->whereHas('branches', fn ($branchQuery) => $branchQuery->where('branches.id', $request->integer('branch_id')));
        }
        return response()->json(['success' => true, 'data' => $query->orderBy('name')->get()]);
    }

    public function store(Request $request)
    {
        $data = $this->validatedData($request);
        $branchAssignments = $this->extractBranchAssignments($data);
        $material = RawMaterial::create($data);
        $material->branches()->sync($branchAssignments);
        return response()->json(['success' => true, 'data' => $material->load(['baseUnit', 'branches'])], 201);
    }

    public function show(RawMaterial $rawMaterial)
    {
        return response()->json(['success' => true, 'data' => $rawMaterial->load(['baseUnit', 'branches'])]);
    }

    public function update(Request $request, RawMaterial $rawMaterial)
    {
        $data = $this->validatedData($request, $rawMaterial);
        $branchAssignments = $this->extractBranchAssignments($data);
        $rawMaterial->update($data);
        $rawMaterial->branches()->sync($branchAssignments);
        return response()->json(['success' => true, 'data' => $rawMaterial->load(['baseUnit', 'branches'])]);
    }

    public function destroy(RawMaterial $rawMaterial)
    {
        $rawMaterial->delete();
        return response()->json(['success' => true]);
    }

    private function validatedData(Request $request, ?RawMaterial $material = null): array
    {
        $skuRule = 'required|string|max:80|unique:raw_materials,sku' . ($material ? ',' . $material->id : '');
        $data = $request->validate([
            'name' => 'required|string|max:200',
            'sku' => $skuRule,
            'description' => 'nullable|string',
            'base_unit_id' => 'required|exists:units,id',
            'default_unit_cost' => 'required|numeric|min:0',
            'is_active' => 'required|boolean',
            'branch_assignments' => 'required|array|min:1',
            'branch_assignments.*.branch_id' => 'required|integer|distinct|exists:branches,id',
            'branch_assignments.*.unit_cost' => 'nullable|numeric|min:0',
            'branch_assignments.*.is_active' => 'required|boolean',
        ]);
        return $data;
    }

    private function extractBranchAssignments(array &$data): array
    {
        $assignments = collect($data['branch_assignments'])->mapWithKeys(function ($assignment) {
            $branchId = $assignment['branch_id'];
            unset($assignment['branch_id']);
            return [$branchId => $assignment];
        })->all();
        unset($data['branch_assignments']);
        return $assignments;
    }
}
