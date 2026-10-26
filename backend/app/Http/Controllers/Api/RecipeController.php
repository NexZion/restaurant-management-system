<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Recipe;
use App\Models\RawMaterial;
use App\Models\Unit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class RecipeController extends Controller
{
    public function index()
    {
        return response()->json(['success' => true, 'data' => Recipe::with(['menuItem', 'recipeMaterials.rawMaterial', 'recipeMaterials.unit'])->latest()->get()]);
    }

    public function store(Request $request)
    {
        $data = $this->validatedData($request);
        $materials = $data['materials'];
        unset($data['materials']);
        $this->ensureCompatibleUnitsAndBranches($data['menu_item_id'], $materials);
        $recipe = DB::transaction(function () use ($data, $materials) {
            $recipe = Recipe::create($data);
            $recipe->recipeMaterials()->createMany($materials);
            return $recipe;
        });
        return response()->json(['success' => true, 'data' => $recipe->load(['menuItem', 'recipeMaterials.rawMaterial', 'recipeMaterials.unit'])], 201);
    }

    public function show(Recipe $recipe)
    {
        return response()->json(['success' => true, 'data' => $recipe->load(['menuItem', 'recipeMaterials.rawMaterial', 'recipeMaterials.unit'])]);
    }

    public function update(Request $request, Recipe $recipe)
    {
        $data = $this->validatedData($request, $recipe);
        $materials = $data['materials'];
        unset($data['materials']);
        $this->ensureCompatibleUnitsAndBranches($data['menu_item_id'], $materials);
        DB::transaction(function () use ($recipe, $data, $materials) {
            $recipe->update($data);
            $recipe->recipeMaterials()->delete();
            $recipe->recipeMaterials()->createMany($materials);
        });
        return response()->json(['success' => true, 'data' => $recipe->load(['menuItem', 'recipeMaterials.rawMaterial', 'recipeMaterials.unit'])]);
    }

    public function destroy(Recipe $recipe)
    {
        $recipe->delete();
        return response()->json(['success' => true]);
    }

    private function validatedData(Request $request, ?Recipe $recipe = null): array
    {
        $menuItemRule = 'required|exists:menu_items,id' . ($recipe ? '|unique:recipes,menu_item_id,' . $recipe->id : '|unique:recipes,menu_item_id');
        return $request->validate([
            'menu_item_id' => $menuItemRule,
            'instructions' => 'required|string',
            'yield_quantity' => 'required|numeric|gt:0',
            'preparation_notes' => 'nullable|string',
            'materials' => 'required|array|min:1',
            'materials.*.raw_material_id' => 'required|integer|distinct|exists:raw_materials,id',
            'materials.*.quantity' => 'required|numeric|gt:0',
            'materials.*.unit_id' => 'required|integer|exists:units,id',
            'materials.*.display_order' => 'sometimes|integer|min:0',
            'materials.*.notes' => 'nullable|string',
        ]);
    }

    private function ensureCompatibleUnitsAndBranches(int|string $menuItemId, array $materials): void
    {
        $menuItem = \App\Models\MenuItem::with('branches')->find($menuItemId);
        $branchIds = $menuItem?->branches->pluck('id')->map(fn ($id) => (int) $id)->all() ?? [];
        foreach ($materials as $index => $material) {
            $rawMaterial = RawMaterial::with('baseUnit')->find($material['raw_material_id']);
            $unit = Unit::find($material['unit_id']);
            if (!$rawMaterial || !$unit || $rawMaterial->baseUnit->unit_type !== $unit->unit_type) {
                throw ValidationException::withMessages([
                    "materials.{$index}.unit_id" => 'The ingredient quantity must use a unit of the same type as the raw material base unit.',
                ]);
            }

            $activeBranchIds = $rawMaterial->branches()
                ->wherePivot('is_active', true)
                ->pluck('branches.id')->map(fn ($id) => (int) $id)->all();
            if (array_diff($branchIds, $activeBranchIds)) {
                throw ValidationException::withMessages([
                    "materials.{$index}.raw_material_id" => 'Every recipe ingredient must be active at all branches assigned to this menu item.',
                ]);
            }
        }
    }
}
