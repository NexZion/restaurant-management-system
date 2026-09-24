<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CustomerHistoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return ['id' => $this->id, 'type' => $this->type ?? 'note', 'description' => $this->note ?? $this->description, 'created_at' => $this->created_at, 'created_by' => $this->whenLoaded('author', fn () => $this->author?->name)];
    }
}
