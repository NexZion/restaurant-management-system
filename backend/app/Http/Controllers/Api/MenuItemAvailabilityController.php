<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BranchMenuItemVariantOption;
use App\Models\MenuItem;
use App\Models\VariantOption;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class MenuItemAvailabilityController extends Controller
{
    public function show(Request $request, MenuItem $menuItem)
    {
        $data = $request->validate([
            'branch_id' => ['required', 'integer', 'exists:branches,id'],
        ]);
        $branchId = (int) $data['branch_id'];
        $branchItem = $menuItem->branches()->whereKey($branchId)->first();
        $branchOptions = $menuItem->branchVariantAvailabilities()
            ->where('branch_id', $branchId)
            ->get()
            ->keyBy('variant_option_id');

        $options = $menuItem->variantOptions()->with('variant')->get()->map(function (VariantOption $option) use ($branchOptions) {
            $override = $branchOptions->get($option->id);

            return [
                'id' => $option->id,
                'variant_id' => $option->variant_id,
                'name' => $option->name,
                'variant_name' => $option->variant?->name,
                'is_available' => (bool) ($override?->is_available ?? ($option->pivot->is_active && $option->is_active && $option->variant?->is_active)),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'menu_item_id' => $menuItem->id,
                'branch_id' => $branchId,
                'is_available' => (bool) ($branchItem?->pivot?->is_available ?? false),
                'variant_options' => $options,
            ],
        ]);
    }

    public function update(Request $request, MenuItem $menuItem)
    {
        $data = $request->validate([
            'branch_id' => ['required', 'integer', 'exists:branches,id'],
            'is_available' => ['required', 'boolean'],
            'variant_options' => ['present', 'array'],
            'variant_options.*.variant_option_id' => ['required', 'integer', 'distinct', 'exists:variant_options,id'],
            'variant_options.*.is_available' => ['required', 'boolean'],
        ]);

        $assignedOptionIds = $menuItem->variantOptions()->pluck('variant_options.id')->map(fn ($id) => (int) $id)->all();
        $requestedOptionIds = collect($data['variant_options'])->pluck('variant_option_id')->map(fn ($id) => (int) $id)->all();
        if (array_diff($requestedOptionIds, $assignedOptionIds)) {
            throw ValidationException::withMessages([
                'variant_options' => 'Availability can only be set for options assigned to this menu item.',
            ]);
        }

        $branchId = (int) $data['branch_id'];
        DB::transaction(function () use ($menuItem, $data, $branchId) {
            $branchItem = $menuItem->branches()->whereKey($branchId)->first();
            $branchItemValues = [
                'selling_price' => $branchItem?->pivot?->selling_price,
                'is_active' => (bool) ($branchItem?->pivot?->is_active ?? true),
                'is_available' => (bool) $data['is_available'],
                'display_order' => (int) ($branchItem?->pivot?->display_order ?? $menuItem->display_order ?? 0),
            ];

            if ($branchItem) {
                $menuItem->branches()->updateExistingPivot($branchId, $branchItemValues);
            } else {
                $menuItem->branches()->attach($branchId, $branchItemValues);
            }

            foreach ($data['variant_options'] as $option) {
                BranchMenuItemVariantOption::updateOrCreate(
                    [
                        'branch_id' => $branchId,
                        'menu_item_id' => $menuItem->id,
                        'variant_option_id' => $option['variant_option_id'],
                    ],
                    ['is_available' => $option['is_available']],
                );
            }
        });

        return response()->json(['success' => true, 'message' => 'Branch availability updated.']);
    }
}
