<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

class UpdateTableSessionRequest extends StoreTableSessionRequest
{
    public function rules(): array
    {
        return [
            'reservation_id' => ['sometimes', 'nullable', 'exists:reservations,id'],
            'guest_count' => ['sometimes', 'integer', 'min:1'],
            'status' => ['sometimes', Rule::in(['open', 'billing', 'closed', 'transferred', 'cancelled'])],
            'closed_at' => ['sometimes', 'nullable', 'date'],
            'table_ids' => ['sometimes', 'array', 'min:1'],
            'table_ids.*' => ['integer', 'exists:restaurant_tables,id'],
        ];
    }
}
