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

            'image_path' => 'sometimes|required_without:image|nullable|string|max:500',
            'image' => 'sometimes|required_without:image_path|nullable|image|max:5120',

            'alt_text' => 'nullable|string|max:255',

            'is_primary' => 'nullable|boolean',

            'display_order' => 'nullable|integer|min:0'
        ];
    }
}
