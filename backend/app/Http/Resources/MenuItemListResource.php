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
        ];
    }
}
