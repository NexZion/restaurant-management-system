<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    protected function prepareForValidation(): void
    {
        if ($this->user()?->branch_id) {
            $this->merge(['branch_id' => $this->user()->branch_id]);
        }
    }

    public function rules(): array
    {
        return [
            'branch_id' => ['required', 'exists:branches,id'],
            'order_number' => [
                'nullable', 'string', 'max:50',
                Rule::unique('orders')->where(fn ($query) => $query->where('branch_id', $this->integer('branch_id'))),
            ],
            'table_id' => [
                'nullable',
                Rule::exists('restaurant_tables', 'id')->where(
                    fn ($query) => $query->where('branch_id', $this->integer('branch_id'))
                ),
            ],
            'table_session_id' => [
                'nullable',
                Rule::exists('table_sessions', 'id')->where(
                    fn ($query) => $query->where('branch_id', $this->integer('branch_id'))
                ),
            ],
            'reservation_id' => [
                'nullable',
                Rule::exists('reservations', 'id')->where(
                    fn ($query) => $query->where('branch_id', $this->integer('branch_id'))
                ),
            ],
            'customer_id' => ['nullable', 'exists:customers,id'],
            'waiter_id' => ['nullable', 'exists:users,id'],
            'cashier_id' => ['nullable', 'exists:users,id'],
            'order_type' => ['nullable', Rule::in(['dining', 'takeaway', 'delivery'])],
            'order_source' => ['nullable', Rule::in(['pos', 'waiter_app', 'customer_qr', 'website', 'mobile_app', 'kiosk', 'phone', 'third_party'])],
            'status' => ['nullable', Rule::in(['pending', 'accepted', 'preparing', 'ready', 'served', 'completed', 'cancelled'])],
            'payment_status' => ['nullable', Rule::in(['unpaid', 'partially_paid', 'paid', 'partially_refunded', 'refunded'])],
            'is_online' => ['nullable', 'boolean'],
            'guest_count' => ['nullable', 'integer', 'min:1'],
            'priority' => ['nullable', Rule::in(['normal', 'high', 'urgent'])],
            'requested_fulfillment_at' => ['nullable', 'date'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.menu_item_id' => ['required', 'exists:menu_items,id'],
            'items.*.menu_item_variant_id' => ['nullable', 'integer', 'min:1'],
            'items.*.parent_order_item_id' => ['nullable', 'integer', 'min:1'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.discount' => ['nullable', 'numeric', 'min:0'],
            'items.*.discount_amount' => ['nullable', 'numeric', 'min:0'],
            'items.*.tax_rate' => ['nullable', 'numeric', 'min:0'],
            'items.*.service_charge_amount' => ['nullable', 'numeric', 'min:0'],
            'items.*.priority' => ['nullable', Rule::in(['normal', 'high', 'urgent'])],
            'items.*.kitchen_station_id' => [
                'nullable',
                Rule::exists('kitchen_stations', 'id')->where(
                    fn ($query) => $query->where('branch_id', $this->integer('branch_id'))
                ),
            ],
            'items.*.notes' => ['nullable', 'string', 'max:500'],
            'bill' => ['nullable', 'array'],
            'bill.discount' => ['nullable', 'numeric', 'min:0'],
            'bill.tax' => ['nullable', 'numeric', 'min:0'],
            'bill.service_charge' => ['nullable', 'numeric', 'min:0'],
            'bill.rounding_amount' => ['nullable', 'numeric'],
        ];
    }
}
