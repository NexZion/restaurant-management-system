<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreOrderDeliveryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'order_id' => ['required', 'exists:orders,id', 'unique:order_deliveries,order_id'],
            'delivery_address_id' => ['nullable', 'integer', 'min:1'],
            'recipient_name' => ['required', 'string', 'max:255'],
            'recipient_phone' => ['required', 'string', 'max:30'],
            'address_line_1' => ['required', 'string', 'max:255'],
            'address_line_2' => ['nullable', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:255'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'delivery_fee' => ['sometimes', 'numeric', 'min:0'],
            'rider_id' => ['nullable', 'exists:users,id'],
            'delivery_status' => ['sometimes', Rule::in(['pending', 'assigned', 'picked_up', 'on_the_way', 'delivered', 'failed', 'cancelled'])],
            'estimated_delivery_at' => ['nullable', 'date'],
            'delivery_notes' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
