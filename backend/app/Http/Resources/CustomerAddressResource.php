<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CustomerAddressResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return ['id' => $this->id, 'uuid' => $this->uuid, 'address_type' => $this->address_type, 'label' => $this->label, 'recipient_name' => $this->recipient_name, 'phone' => $this->phone, 'address_line_1' => $this->address_line_1, 'address_line_2' => $this->address_line_2, 'city' => $this->city, 'district' => $this->district, 'province' => $this->province, 'postal_code' => $this->postal_code, 'country' => $this->country, 'latitude' => $this->latitude, 'longitude' => $this->longitude, 'delivery_instructions' => $this->delivery_instructions, 'is_default' => $this->is_default];
    }
}
