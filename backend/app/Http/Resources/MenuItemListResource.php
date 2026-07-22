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
        ];
    }
}
