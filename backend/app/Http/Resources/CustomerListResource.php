<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CustomerListResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return ['id' => $this->id, 'uuid' => $this->uuid, 'customer_number' => $this->customer_number, 'display_name' => $this->display_name, 'phone' => $this->phone, 'email' => $this->email, 'customer_type' => $this->customer_type, 'status' => $this->status];
    }
}
