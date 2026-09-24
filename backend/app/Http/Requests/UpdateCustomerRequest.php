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

            'first_name' => 'required|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'display_name' => 'nullable|string|max:255',
            'email' => 'nullable|email|unique:customers,email,'.$customerId,
            'phone' => 'required|string|max:20|unique:customers,phone,'.$customerId,
            'secondary_phone' => 'nullable|string|max:20',
            'date_of_birth' => 'nullable|date',
            'gender' => 'nullable|string|max:20',
            'customer_type' => 'required|in:regular,vip,corporate',
            'preferred_branch_id' => 'nullable|exists:branches,id',
            'profile_photo' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'status' => 'nullable|in:active,inactive,suspended',
        ];
    }

    public function messages(): array
    {
        return [

            'first_name.required' => 'First name is required',

            'phone.required' => 'Phone number is required',
            'phone.unique' => 'Phone number already exists',

            'email.email' => 'Invalid email format',
            'email.unique' => 'Email already exists',

            'customer_type.in' => 'Customer type must be regular, vip or corporate',

            'status.in' => 'Status must be active, inactive or suspended',
        ];
    }
}
