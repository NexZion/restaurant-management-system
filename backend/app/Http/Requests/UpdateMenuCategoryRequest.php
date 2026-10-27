<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateMenuCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [

        
            'name' => 'sometimes|required|string|max:150',

            'code' => ['sometimes', 'required', 'string', 'max:50', Rule::unique('menu_categories', 'code')->ignore($this->route('menu_category') ?? $this->route('id'))],

            'description' => 'nullable|string',

            'image_path' => 'nullable|string|max:500',
            'image_file' => 'nullable|image|max:5120',

            'display_order' => 'nullable|integer|min:0',

            'is_active' => 'sometimes|boolean',
        ];
    }
}
