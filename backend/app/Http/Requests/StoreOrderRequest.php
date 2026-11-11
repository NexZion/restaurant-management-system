<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }


    public function rules(): array
    {
        return [

            'branch_id' => 'required|exists:branches,id',

            'order_number' => [
                'nullable',
                'string',
                'max:50',
                Rule::unique('orders', 'order_number'),
            ],

            'table_id' => 'nullable|exists:restaurant_tables,id',

            'customer_id' => 'nullable|exists:customers,id',

            'order_type' => 'required|in:dine_in,takeaway,delivery',

            'status' => 'nullable|in:draft,confirmed,preparing,ready,served,completed,cancelled',

            'payment_status' => 'nullable|in:unpaid,partial,paid,partially_refunded,refunded',
            'subtotal' => 'nullable|numeric|min:0',
            'discount_total' => 'nullable|numeric|min:0',
            'include_tax' => 'nullable|boolean',
            'tax_total' => 'nullable|numeric|min:0',
            'service_charge_total' => 'nullable|numeric|min:0',
            'grand_total' => 'nullable|numeric|min:0',
            'paid_total' => 'nullable|numeric|min:0',
            'balance_due' => 'nullable|numeric|min:0',
            'customer_note' => 'nullable|string',
            'internal_note' => 'nullable|string',

            'items' => 'required|array',
            'items.*.menu_item_id' => 'required|exists:menu_items,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.discount' => 'nullable|numeric|min:0',
            'items.*.total_price' => 'nullable|numeric|min:0',
            'items.*.notes' => 'nullable|string|max:500',

        ];
    }
}
