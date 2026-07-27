<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StorePaymentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'payment_method_id' => ['nullable', 'exists:payment_methods,id'],
            'payment_method' => ['required_without:payment_method_id', 'nullable', 'string', 'max:50'],
            'amount_paid' => ['required', 'numeric', 'gt:0'],
            'amount_received' => ['nullable', 'numeric', 'gte:amount_paid'],
            'transaction_reference' => ['nullable', 'string', 'max:255'],
            'gateway_transaction_id' => ['nullable', 'string', 'max:255'],
            'gateway_response' => ['nullable', 'array'],
            'card_last_four' => ['nullable', 'digits:4'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
