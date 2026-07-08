<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCustomerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $customerId = $this->route('customer');

        return [

            'customer_code' => 'nullable|string|max:50|unique:customers,customer_code,' . $customerId,

            'first_name' => 'required|string|max:255',
            'last_name' => 'nullable|string|max:255',

            'email' => 'nullable|email|unique:customers,email,' . $customerId,

            'phone' => 'required|string|max:20|unique:customers,phone,' . $customerId,

            'whatsapp' => 'nullable|string|max:20',

            'address_line1' => 'nullable|string|max:255',
            'address_line2' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'district' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'state' => 'nullable|string|max:100',

            'customer_type' => 'required|in:regular,vip,corporate',

            'loyalty_points' => 'nullable|integer|min:0',

            'id_number' => 'nullable|string|max:50',
            'id_type' => 'nullable|in:nic,passport',

            'status' => 'nullable|in:active,inactive,suspended'
        ];
    }

    public function messages(): array
    {
        return [

            'customer_code.required' => 'Customer code is required',
            'customer_code.unique' => 'Customer code already exists',

            'first_name.required' => 'First name is required',

            'phone.required' => 'Phone number is required',
            'phone.unique' => 'Phone number already exists',

            'email.email' => 'Invalid email format',
            'email.unique' => 'Email already exists',

            'customer_type.in' => 'Customer type must be regular, vip or corporate',

            'id_type.in' => 'ID type must be nic or passport',

            'status.in' => 'Status must be active, inactive or suspended'
        ];
    }
}