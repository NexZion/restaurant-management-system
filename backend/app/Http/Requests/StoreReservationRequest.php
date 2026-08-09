<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreReservationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    protected function prepareForValidation(): void
    {
        $this->merge(['branch_id' => $this->user()?->branch_id, 'created_by' => $this->user()?->id]);
    }

    public function rules(): array
    {
        return [
            'branch_id' => ['required', 'exists:branches,id'],
            'customer_id' => ['nullable', 'exists:customers,id'],
            'reservation_number' => ['sometimes', 'string', 'max:100', Rule::unique('reservations')->where('branch_id', $this->integer('branch_id'))],
            'reservation_date' => ['required', 'date'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['nullable', 'date_format:H:i', 'after:start_time'],
            'guest_count' => ['required', 'integer', 'min:1'],
            'status' => ['sometimes', Rule::in(['pending', 'confirmed', 'seated', 'completed', 'cancelled', 'no_show'])],
            'special_requests' => ['nullable', 'string', 'max:2000'],
            'created_by' => ['required', 'exists:users,id'],
        ];
    }
}
