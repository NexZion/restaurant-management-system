<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreOrderDiscountRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'order_id' => ['nullable', 'exists:orders,id'],
            'order_item_id' => ['nullable', 'exists:order_items,id'],
            'discount_type' => ['required', Rule::in(['percentage', 'fixed_amount', 'complimentary', 'promotion', 'coupon', 'loyalty', 'manual'])],
            'discount_source' => ['nullable', 'string', 'max:255'],
            'promotion_id' => ['nullable', 'integer', 'min:1'],
            'coupon_id' => ['nullable', 'integer', 'min:1'],
            'percentage' => ['nullable', 'numeric', 'between:0,100'],
            'amount' => ['required', 'numeric', 'min:0'],
            'reason' => ['nullable', 'string', 'max:2000'],
            'approved_by' => ['nullable', 'exists:users,id'],
        ];
    }

    public function after(): array
    {
        return [function (Validator $validator): void {
            if (! $this->filled('order_id') && ! $this->filled('order_item_id')) {
                $validator->errors()->add('order_id', 'An order or order item is required.');
            }
        }];
    }
}
