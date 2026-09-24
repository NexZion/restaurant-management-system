<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCustomerAddressRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return ['address_type' => 'nullable|string|max:30', 'label' => 'nullable|string|max:255', 'recipient_name' => 'nullable|string|max:255', 'phone' => 'nullable|string|max:20', 'address_line_1' => 'required|string|max:255', 'address_line_2' => 'nullable|string|max:255', 'city' => 'required|string|max:100', 'district' => 'nullable|string|max:100', 'province' => 'nullable|string|max:100', 'postal_code' => 'nullable|string|max:20', 'country' => 'nullable|string|max:2', 'latitude' => 'nullable|numeric|between:-90,90', 'longitude' => 'nullable|numeric|between:-180,180', 'delivery_instructions' => 'nullable|string', 'is_default' => 'nullable|boolean'];
    }
}
