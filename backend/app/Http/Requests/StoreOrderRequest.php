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

            'table_id' => 'nullable|exists:restaurant_tables,id',

            'customer_id' => 'nullable|exists:customers,id',

            'waiter_id' => 'nullable|exists:users,id',

            'order_type' => 'required|in:dining,takeaway,delivery',

            'is_online' => 'nullable|boolean',

            'notes' => 'nullable|string|max:1000'
        ];
    }
}