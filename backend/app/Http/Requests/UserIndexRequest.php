<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UserIndexRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:100'],
            'role' => ['nullable', 'integer', 'exists:roles,id'],
            'branch' => ['nullable', 'integer', 'exists:branches,id'],
            'status' => ['nullable', 'in:active,inactive,blocked'],
            'sort_by' => ['nullable', 'in:name,created_at'],
            'sort_direction' => ['nullable', 'in:asc,desc'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ];
    }
}
