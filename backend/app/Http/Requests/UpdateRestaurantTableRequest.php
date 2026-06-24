<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRestaurantTableRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('id');

        return [

            'table_number' => 'required|string|max:50|unique:restaurant_tables,table_number,' . $id,

            'capacity' => 'required|integer|min:1',

            'table_type' => 'required|in:normal,family,vip,private,outdoor',

            'section' => 'nullable|string|max:255',

            'status' => 'required|in:available,occupied,reserved,cleaning,out_of_service',

            'is_active' => 'required|boolean'
        ];
    }
    public function messages(): array
    {
        return [
            'table_number.required' => 'Table number is required',
            'table_number.unique' => 'Table number already exists',
            'capacity.required' => 'Capacity is required',
            'capacity.min' => 'Capacity must be at least 1',
            'table_type.required' => 'Table type is required',
            'table_type.in' => 'Table type must be one of: normal, family, vip, private, outdoor',
            'status.required' => 'Status is required',
            'status.in' => 'Status must be one of: available, occupied, reserved, cleaning, out_of_service',
            'is_active.required' => 'Is active is required',
            'is_active.boolean' => 'Is active must be true or false'
        ];
    }
}