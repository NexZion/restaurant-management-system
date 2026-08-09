<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

class UpdateOrderDiscountRequest extends StoreOrderDiscountRequest
{
    public function rules(): array
    {
        return [
            'discount_type' => ['sometimes', Rule::in(['percentage', 'fixed_amount', 'complimentary', 'promotion', 'coupon', 'loyalty', 'manual'])],
            'discount_source' => ['sometimes', 'nullable', 'string', 'max:255'],
            'promotion_id' => ['sometimes', 'nullable', 'integer', 'min:1'],
            'coupon_id' => ['sometimes', 'nullable', 'integer', 'min:1'],
            'percentage' => ['sometimes', 'nullable', 'numeric', 'between:0,100'],
            'amount' => ['sometimes', 'numeric', 'min:0'],
            'reason' => ['sometimes', 'nullable', 'string', 'max:2000'],
            'approved_by' => ['sometimes', 'nullable', 'exists:users,id'],
        ];
    }

    public function after(): array
    {
        return [];
    }
}
