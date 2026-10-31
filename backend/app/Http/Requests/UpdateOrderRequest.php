<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [

            'branch_id' => 'required|exists:branches,id',

            'table_id' => 'nullable|exists:restaurant_tables,id',

            'customer_id' => 'nullable|exists:customers,id',

            'order_type' => 'required|in:dine_in,takeaway,delivery',

            'status' => 'required|in:draft,confirmed,preparing,ready,served,completed,cancelled',
            'payment_status' => 'required|in:unpaid,partial,paid,partially_refunded,refunded',
            'customer_note' => 'nullable|string',
            'internal_note' => 'nullable|string',
            'cancellation_reason' => 'required_if:status,cancelled|nullable|string|max:1000',
            'grand_total' => 'nullable|numeric|min:0',
            'tax_total' => 'nullable|numeric|min:0',
            'service_charge_total' => 'nullable|numeric|min:0',
            'paid_total' => 'nullable|numeric|min:0',
            'balance_due' => 'nullable|numeric|min:0'
        ];
    }
}
