<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateMenuRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [

            'name' => 'sometimes|string|max:150',

            'code' => [
                'sometimes',
                'required',
                'string',
                'max:50',
                Rule::unique('menus', 'code')->ignore($this->route('menu')),
            ],

            'menu_type' => ['sometimes', 'required', Rule::in(['regular', 'seasonal', 'special', 'event'])],
            'availability_type' => ['sometimes', 'required', Rule::in(['all_day', 'scheduled', 'manual'])],
            'start_time' => [Rule::requiredIf($this->input('availability_type') === 'scheduled'), 'nullable', 'date_format:H:i'],
            'end_time' => [Rule::requiredIf($this->input('availability_type') === 'scheduled'), 'nullable', 'date_format:H:i', 'after:start_time'],
            'available_days' => [Rule::requiredIf($this->input('availability_type') === 'scheduled'), 'nullable', 'array', 'min:1'],
            'available_days.*' => ['required', 'distinct', Rule::in(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])],
            'start_date' => 'sometimes|nullable|date',
            'end_date' => 'sometimes|nullable|date|after_or_equal:start_date',
            'service_types' => 'sometimes|required|array|min:1',
            'service_types.*' => ['required', 'distinct', Rule::in(['dine_in', 'takeaway', 'delivery'])],

            'description' => 'nullable|string',

            'display_order' => 'sometimes|integer|min:0',

            'is_active' => 'sometimes|boolean',
        ];
    }
}
