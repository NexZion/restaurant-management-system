<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'table_id' => [
                'sometimes',
                'nullable',
                Rule::exists('restaurant_tables', 'id')->where(
                    fn ($query) => $query->where('branch_id', $this->user()->branch_id)
                ),
            ],
            'table_session_id' => [
                'sometimes',
                'nullable',
                Rule::exists('table_sessions', 'id')->where(
                    fn ($query) => $query->where('branch_id', $this->user()->branch_id)
                ),
            ],
            'reservation_id' => [
                'sometimes',
                'nullable',
                Rule::exists('reservations', 'id')->where(
                    fn ($query) => $query->where('branch_id', $this->user()->branch_id)
                ),
            ],
            'customer_id' => ['sometimes', 'nullable', 'exists:customers,id'],
            'waiter_id' => ['sometimes', 'nullable', 'exists:users,id'],
            'cashier_id' => ['sometimes', 'nullable', 'exists:users,id'],
            'order_type' => ['sometimes', Rule::in(['dining', 'takeaway', 'delivery'])],
            'order_source' => ['sometimes', Rule::in(['pos', 'waiter_app', 'customer_qr', 'website', 'mobile_app', 'kiosk', 'phone', 'third_party'])],
            'status' => ['sometimes', Rule::in(['pending', 'accepted', 'preparing', 'ready', 'served', 'completed', 'cancelled'])],
            'payment_status' => ['sometimes', Rule::in(['unpaid', 'partially_paid', 'paid', 'partially_refunded', 'refunded'])],
            'is_online' => ['sometimes', 'boolean'],
            'guest_count' => ['sometimes', 'nullable', 'integer', 'min:1'],
            'priority' => ['sometimes', Rule::in(['normal', 'high', 'urgent'])],
            'requested_fulfillment_at' => ['sometimes', 'nullable', 'date'],
            'cancellation_reason' => ['required_if:status,cancelled', 'nullable', 'string', 'max:1000'],
            'notes' => ['sometimes', 'nullable', 'string', 'max:1000'],
        ];
    }
}
