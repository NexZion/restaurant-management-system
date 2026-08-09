<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreRefundRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'payment_id' => ['required', 'exists:payments,id'],
            'order_bill_id' => ['required', 'exists:order_bills,id'],
            'amount' => ['required', 'numeric', 'gt:0'],
            'reason' => ['required', 'string', 'max:2000'],
            'transaction_reference' => ['nullable', 'string', 'max:255'],
        ];
    }
}
