<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateMenuItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('id');

        return [

            'menu_category_id' => 'required|exists:menu_categories,id',

            'sku' => 'required|string|max:50|unique:menu_items,sku,'.$id,

            'name' => 'required|string|max:255',

            'slug' => 'required|string|max:255|unique:menu_items,slug,'.$id,

            'short_description' => 'nullable|string|max:255',

            'long_description' => 'nullable|string',

            'base_price' => 'required|numeric|min:0',

            'preparation_time' => 'required|integer|min:1',

            'display_order' => 'nullable|integer|min:0',

            'status' => 'required|in:available,unavailable,out_of_stock',
        ];
    }
}
