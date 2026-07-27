<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTableSessionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    protected function prepareForValidation(): void
    {
        $this->merge(['branch_id' => $this->user()?->branch_id, 'opened_by' => $this->user()?->id]);
    }

    public function rules(): array
    {
        return [
            'branch_id' => ['required', 'exists:branches,id'],
            'reservation_id' => ['nullable', 'exists:reservations,id'],
            'opened_by' => ['required', 'exists:users,id'],
            'guest_count' => ['required', 'integer', 'min:1'],
            'status' => ['sometimes', Rule::in(['open', 'billing', 'closed', 'transferred', 'cancelled'])],
            'opened_at' => ['sometimes', 'date'],
            'closed_at' => ['nullable', 'date', 'after_or_equal:opened_at'],
            'table_ids' => ['required', 'array', 'min:1'],
            'table_ids.*' => ['integer', 'exists:restaurant_tables,id'],
        ];
    }
}
