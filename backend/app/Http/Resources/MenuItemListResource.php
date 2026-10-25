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
        return [
            'id' => $this->id,
            'code' => $this->slug,
            'name' => $this->name,
            'category' => $this->whenLoaded('menuCategory')->name,
            'description' => $this->short_description,
            'price' => $this->base_price,
            'available' => $this->status === 'available' ? true : false,
            'images' => $this->whenLoaded('images', fn() => $this->images
                ->sortBy([
                    ['is_primary', 'desc'],
                    ['display_order', 'asc'],
                ])
                ->values()
                ->map(fn($image) => [
                    'id' => $image->id,
                    'image_path' => $image->image_path,
                    'is_primary' => $image->is_primary,
                    'display_order' => $image->display_order,
                ])),
        ];
    }
}
