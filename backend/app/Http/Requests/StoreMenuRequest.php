<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMenuRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [

            'branch_ids' => 'required|array|min:1',

            'branch_ids.*' => 'required|integer|distinct|exists:branches,id',

            'menu_item_ids' => 'nullable|array',
            'menu_item_ids.*' => 'required|integer|distinct|exists:menu_items,id',

            'name' => 'required|string|max:150',

            'code' => 'required|string|max:50|unique:menus,code',

            'description' => 'nullable|string',

            'is_active' => 'required|boolean',
            'display_order' => 'sometimes|integer|min:0',
        ];
    }
}
