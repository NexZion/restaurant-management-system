<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreRestaurantTableRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    protected function prepareForValidation(): void
    {
        $this->merge(['branch_id' => $this->user()?->branch_id]);
    }

    public function rules(): array
    {
        return [

            'branch_id' => ['required', 'exists:branches,id'],

            'table_number' => [
                'required',
                'string',
                'max:50',
                Rule::unique('restaurant_tables')->where(
                    fn ($query) => $query->where('branch_id', $this->integer('branch_id'))
                ),
            ],

            'capacity' => 'required|integer|min:1',

            'table_type' => 'required|in:normal,family,vip,private,outdoor',

            'section' => 'nullable|string|max:255',

            'section_id' => 'nullable|integer|min:1',

            'floor_id' => 'nullable|integer|min:1',

            'status' => 'nullable|in:available,occupied,reserved,billing,cleaning,unavailable,out_of_service',

            'is_active' => 'nullable|boolean',
        ];
    }
}
