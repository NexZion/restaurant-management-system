<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

class UpdateOrderDeliveryRequest extends StoreOrderDeliveryRequest
{
    public function rules(): array
    {
        return [
            'recipient_name' => ['sometimes', 'string', 'max:255'],
            'recipient_phone' => ['sometimes', 'string', 'max:30'],
            'address_line_1' => ['sometimes', 'string', 'max:255'],
            'address_line_2' => ['sometimes', 'nullable', 'string', 'max:255'],
            'city' => ['sometimes', 'string', 'max:255'],
            'latitude' => ['sometimes', 'nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['sometimes', 'nullable', 'numeric', 'between:-180,180'],
            'delivery_fee' => ['sometimes', 'numeric', 'min:0'],
            'rider_id' => ['sometimes', 'nullable', 'exists:users,id'],
            'delivery_status' => ['sometimes', Rule::in(['pending', 'assigned', 'picked_up', 'on_the_way', 'delivered', 'failed', 'cancelled'])],
            'estimated_delivery_at' => ['sometimes', 'nullable', 'date'],
            'dispatched_at' => ['sometimes', 'nullable', 'date'],
            'delivered_at' => ['sometimes', 'nullable', 'date'],
            'delivery_notes' => ['sometimes', 'nullable', 'string', 'max:2000'],
        ];
    }
}
