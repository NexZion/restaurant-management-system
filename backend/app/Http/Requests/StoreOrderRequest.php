<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

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

        'order_number' => 'nullable|string|max:50',

        'table_id' => 'nullable|exists:restaurant_tables,id',

        'customer_id' => 'nullable|exists:customers,id',

        'waiter_id' => 'nullable|exists:users,id',

        'order_type' => 'required|in:dining,takeaway,delivery',

        'status' => 'nullable|in:pending,accepted,preparing,ready,served,completed,cancelled',

        'is_online' => 'nullable|boolean',

        'notes' => 'nullable|string|max:1000',

        'items' => 'nullable|array',
        'items.*.menu_item_id' => 'required_with:items|exists:menu_items,id',
        'items.*.quantity' => 'required_with:items|integer|min:1',
        'items.*.unit_price' => 'required_with:items|numeric|min:0',
        'items.*.discount' => 'nullable|numeric|min:0',
        'items.*.total_price' => 'required_with:items|numeric|min:0',
        'items.*.notes' => 'nullable|string|max:500',

        'bill' => 'nullable|array',
        'bill.subtotal' => 'nullable|numeric|min:0',
        'bill.discount' => 'nullable|numeric|min:0',
        'bill.tax' => 'nullable|numeric|min:0',
        'bill.service_charge' => 'nullable|numeric|min:0',
        'bill.grand_total' => 'nullable|numeric|min:0',
        'bill.bill_status' => 'nullable|in:unpaid,paid,partial',
    ];
}
}