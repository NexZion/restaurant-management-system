<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateMenuItemImageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [

            'menu_item_id' => 'required|exists:menu_items,id',

            'image_path' => 'required|string|max:255',

            'is_primary' => 'nullable|boolean',

            'display_order' => 'nullable|integer|min:0'
        ];
    }
}