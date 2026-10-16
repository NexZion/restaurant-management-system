<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMenuCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [


            'name' => 'required|string|max:150',

            'code' => 'required|string|max:50|unique:menu_categories,code',

            'branch_ids' => 'required|array|min:1',
            'branch_ids.*' => 'required|integer|distinct|exists:branches,id',

            'description' => 'nullable|string',

            'image_path' => 'nullable|string|max:500',

            'display_order' => 'nullable|integer|min:0',

            'is_active' => 'required|boolean',
        ];
    }
}
