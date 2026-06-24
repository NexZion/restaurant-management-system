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

            'branch_id' => 'required|exists:branches,id',

            'name' => 'required|string|max:255',

            'description' => 'nullable|string',

            'display_order' => 'nullable|integer|min:0',

            'status' => 'required|in:active,inactive'
        ];
    }
}