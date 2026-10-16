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

            'branch_ids' => 'sometimes|required|array|min:1',

            'branch_ids.*' => 'required|integer|distinct|exists:branches,id',

            'menu_item_ids' => 'sometimes|array',
            'menu_item_ids.*' => 'required|integer|distinct|exists:menu_items,id',

            'name' => 'sometimes|string|max:150',

            'code' => [
                'sometimes',
                'required',
                'string',
                'max:50',
                Rule::unique('menus', 'code')->ignore($this->route('menu')),
            ],

            'description' => 'nullable|string',

            'display_order' => 'sometimes|integer|min:0',

            'is_active' => 'sometimes|boolean',
            'display_order' => 'sometimes|integer|min:0',
        ];
    }
}
