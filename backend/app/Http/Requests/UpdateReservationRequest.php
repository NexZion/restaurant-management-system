<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

class UpdateReservationRequest extends StoreReservationRequest
{
    public function rules(): array
    {
        return [
            'customer_id' => ['sometimes', 'nullable', 'exists:customers,id'],
            'reservation_number' => ['sometimes', 'string', 'max:100', Rule::unique('reservations')->where('branch_id', $this->user()->branch_id)->ignore($this->route('reservation'))],
            'reservation_date' => ['sometimes', 'date'],
            'start_time' => ['sometimes', 'date_format:H:i'],
            'end_time' => ['sometimes', 'nullable', 'date_format:H:i'],
            'guest_count' => ['sometimes', 'integer', 'min:1'],
            'status' => ['sometimes', Rule::in(['pending', 'confirmed', 'seated', 'completed', 'cancelled', 'no_show'])],
            'special_requests' => ['sometimes', 'nullable', 'string', 'max:2000'],
        ];
    }
}
