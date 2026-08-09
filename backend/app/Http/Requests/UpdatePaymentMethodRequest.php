<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

class UpdatePaymentMethodRequest extends StorePaymentMethodRequest
{
    public function rules(): array
    {
        return [
            'branch_id' => ['sometimes', 'nullable', 'exists:branches,id'],
            'code' => ['sometimes', 'string', 'max:50', Rule::unique('payment_methods')->where('branch_id', $this->input('branch_id'))->ignore($this->route('payment_method'))],
            'name' => ['sometimes', 'string', 'max:255'],
            'type' => ['sometimes', 'string', 'max:50'],
            'requires_reference' => ['sometimes', 'boolean'],
            'is_cash' => ['sometimes', 'boolean'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
