<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AdjustLoyaltyRequest extends FormRequest
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
            'type' => ['required', Rule::in(['earn', 'redeem', 'adjustment', 'expiry'])],
            'points' => ['required', 'integer', 'not_in:0'],
            'order_id' => ['nullable', 'exists:orders,id'],
            'description' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
