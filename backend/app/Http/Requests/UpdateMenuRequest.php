<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateMenuRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [

            'branch_id' => 'sometimes|exists:branches,id',

            'name' => 'sometimes|string|max:255',

            'description' => 'nullable|string',

            'display_order' => 'sometimes|integer|min:0',

            'status' => 'sometimes|in:active,inactive'
        ];
    }
}