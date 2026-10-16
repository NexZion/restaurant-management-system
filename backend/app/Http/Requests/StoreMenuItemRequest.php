<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMenuItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [

        
            'menu_category_id' => 'required|exists:menu_categories,id',

            'sku' => 'required|string|max:80|unique:menu_items,sku',

            'name' => 'required|string|max:200',

            'description' => 'nullable|string',

            'base_price' => 'required|numeric|min:0',

            'base_cost' => 'required|numeric|min:0',

            'preparation_time' => 'nullable|integer|min:0|max:65535',

            'is_active' => 'required|boolean',
            'is_available' => 'required|boolean',

            'display_order' => 'nullable|integer|min:0',

            'branch_assignments' => 'required|array|min:1',
            'branch_assignments.*.branch_id' => 'required|integer|distinct|exists:branches,id',
            'branch_assignments.*.selling_price' => 'nullable|numeric|min:0',
            'branch_assignments.*.is_active' => 'required|boolean',
            'branch_assignments.*.is_available' => 'required|boolean',
            'branch_assignments.*.display_order' => 'sometimes|integer|min:0',
        ];
    }
}
