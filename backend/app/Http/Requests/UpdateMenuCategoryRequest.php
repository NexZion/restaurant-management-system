<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateMenuCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [

            'name' => 'required|string|max:255',

            'description' => 'nullable|string',

            'image' => 'nullable|string',

            'display_order' => 'nullable|integer|min:0',

            'status' => 'required|in:active,inactive',
        ];
    }
}
