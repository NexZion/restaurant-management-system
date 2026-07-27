<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateBranchRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $branchId = $this->route('id');

        return [
            'code' => 'nullable|string|max:50|unique:branches,code,'.$branchId,
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:branches,slug,'.$branchId,
            'address_line1' => 'required|string|max:255',
            'address_line2' => 'nullable|string|max:255',
            'city' => 'required|string|max:100',
            'state_province' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'country' => 'nullable|string|max:100',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'phone' => 'required|string|max:20',
            'email' => 'nullable|email|max:255',
            'whatsapp' => 'nullable|string|max:20',
            'branch_type' => 'nullable|in:restaurant,hotel,cafe,resort',
            'has_dining' => 'nullable|boolean',
            'has_rooms' => 'nullable|boolean',
            'has_delivery' => 'nullable|boolean',
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'code.unique' => 'This branch code already exists',
            'name.required' => 'Branch name is required',
            'slug.unique' => 'This branch slug already exists',
            'address_line1.required' => 'Address line 1 is required',
            'city.required' => 'City is required',
            'phone.required' => 'Phone number is required',
            'latitude.between' => 'Latitude must be between -90 and 90',
            'longitude.between' => 'Longitude must be between -180 and 180',
        ];
    }
}
