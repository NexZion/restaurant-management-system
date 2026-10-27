<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CustomerIndexRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:100'],

            'district' => [
                'nullable',
                'string',
                'max:100',
            ],

            'customer_type' => [
                'nullable',
                'in:all,regular,corporate,vip',
            ],

            'status' => [
                'nullable',
                'in:all,active,inactive,suspended',
            ],

            'sort_by' => [
                'nullable',
                'in:name,created_at',
            ],

            'sort_direction' => [
                'nullable',
                'in:asc,desc',
            ],

            'per_page' => [
                'nullable',
                'integer',
                'min:1',
                'max:100',
            ],
        ];
    }
}
