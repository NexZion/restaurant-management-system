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

        'branch_id' => 'nullable|exists:branches,id',

        'order_number' => 'nullable|string|max:50',

        'table_id' => 'nullable|exists:restaurant_tables,id',

        'customer_id' => 'nullable|exists:customers,id',

        'waiter_id' => 'nullable|exists:users,id',

        'order_type' => 'nullable|in:dining,takeaway,delivery',

        'status' => 'nullable|in:pending,accepted,preparing,ready,served,completed,cancelled',

        'is_online' => 'nullable|boolean',

        'notes' => 'nullable|string|max:1000',

        'items' => 'required|array',
        'items.*.menu_item_id' => 'required|exists:menu_items,id',
        'items.*.quantity' => 'required|integer|min:1',
        'items.*.notes' => 'nullable|string|max:500'
    ];
}
}
