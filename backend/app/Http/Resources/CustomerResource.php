<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CustomerResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return ['id' => $this->id, 'uuid' => $this->uuid, 'customer_number' => $this->customer_number, 'first_name' => $this->first_name, 'last_name' => $this->last_name, 'display_name' => $this->display_name, 'phone' => $this->phone, 'secondary_phone' => $this->secondary_phone, 'email' => $this->email, 'date_of_birth' => $this->date_of_birth, 'gender' => $this->gender, 'customer_type' => $this->customer_type, 'status' => $this->status, 'preferred_branch_id' => $this->preferred_branch_id, 'profile_photo' => $this->profile_photo, 'notes' => $this->notes, 'addresses' => CustomerAddressResource::collection($this->whenLoaded('addresses')), 'tags' => $this->whenLoaded('tags')];
    }
}
