<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

class UpdateRefundRequest extends StoreRefundRequest
{
    public function rules(): array
    {
        return [
            'status' => ['required', Rule::in(['pending', 'approved', 'processed', 'failed', 'cancelled'])],
            'transaction_reference' => ['sometimes', 'nullable', 'string', 'max:255'],
            'processed_by' => ['sometimes', 'nullable', 'exists:users,id'],
            'processed_at' => ['sometimes', 'nullable', 'date'],
        ];
    }
}
