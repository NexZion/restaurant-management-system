<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreMenuRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [

            'name' => 'required|string|max:150',

            'code' => 'required|string|max:50|unique:menus,code',

            'menu_type' => ['required', Rule::in(['regular', 'seasonal', 'special', 'event'])],
            'availability_type' => ['required', Rule::in(['all_day', 'scheduled', 'manual'])],
            'start_time' => [Rule::requiredIf($this->input('availability_type') === 'scheduled'), 'nullable', 'date_format:H:i'],
            'end_time' => [Rule::requiredIf($this->input('availability_type') === 'scheduled'), 'nullable', 'date_format:H:i', 'after:start_time'],
            'available_days' => [Rule::requiredIf($this->input('availability_type') === 'scheduled'), 'nullable', 'array', 'min:1'],
            'available_days.*' => ['required', 'distinct', Rule::in(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])],
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'service_types' => 'required|array|min:1',
            'service_types.*' => ['required', 'distinct', Rule::in(['dine_in', 'takeaway', 'delivery'])],

            'description' => 'nullable|string',

            'is_active' => 'required|boolean',
            'display_order' => 'sometimes|integer|min:0',
        ];
    }
}
