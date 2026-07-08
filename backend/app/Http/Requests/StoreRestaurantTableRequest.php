<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreRestaurantTableRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [

            'table_number' => 'required|string|max:50|unique:restaurant_tables,table_number',

            'capacity' => 'required|integer|min:1',

            'table_type' => 'required|in:normal,family,vip,private,outdoor',

            'section' => 'nullable|string|max:255',

            'status' => 'nullable|in:available,occupied,reserved,cleaning,out_of_service',

            'is_active' => 'nullable|boolean'
        ];
    }
}