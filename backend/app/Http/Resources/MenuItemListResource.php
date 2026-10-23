<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MenuItemListResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $branchId = $request->user()?->branch_id ?? $request->integer('branch_id');
        $branch = $branchId
            ? $this->branches->firstWhere('id', $branchId)
            : null;
        $imagePath = $this->images->firstWhere('is_primary', true)?->image_path
            ?? $this->images->first()?->image_path;

        return [
            'id' => $this->id,
            'sku' => $this->sku,
            'code' => $this->sku,
            'name' => $this->name,
            'category' => $this->menuCategory?->name,
            'menu_category_id' => $this->menu_category_id,
            'description' => $this->description,
            'base_price' => $this->base_price,
            'price' => $branch?->pivot?->selling_price ?? $this->base_price,
            'base_cost' => $this->base_cost,
            'preparation_time' => $this->preparation_time,
            'is_active' => $this->is_active,
            'is_available' => $this->is_available,
            'available' => (bool) $this->is_active && (bool) $this->is_available
                && (!$branch || ((bool) $branch->pivot->is_active && (bool) $branch->pivot->is_available)),
            'status' => !$this->is_active ? 'inactive' : ($this->is_available ? 'available' : 'unavailable'),
            'display_order' => $this->display_order,
            'image_path' => $imagePath,
            'image' => $imagePath,
            'images' => $this->whenLoaded('images'),
            'branches' => $this->whenLoaded('branches', fn () => $this->branches->map(fn ($branch) => [
                'id' => $branch->id,
                'name' => $branch->name,
                'pivot' => $branch->pivot,
            ])),
            'variant_options' => $this->whenLoaded('variantOptions', fn () => $this->variantOptions->map(fn ($option) => [
                'id' => $option->id,
                'variant_id' => $option->variant_id,
                'variant_name' => $option->variant?->name,
                'selection_type' => $option->variant?->selection_type,
                'min_select' => $option->variant?->min_select,
                'max_select' => $option->variant?->max_select,
                'name' => $option->name,
                'code' => $option->code,
                'additional_price' => $option->pivot->additional_price,
                'is_default' => (bool) $option->pivot->is_default,
                'is_active' => (bool) $option->pivot->is_active && (bool) $option->is_active && (bool) $option->variant?->is_active,
                'display_order' => $option->pivot->display_order,
            ])),
        ];
    }
}
