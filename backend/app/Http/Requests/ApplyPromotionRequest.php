<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class ApplyPromotionRequest extends FormRequest
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
            'promotion_id' => ['nullable', 'exists:promotions,id', 'required_without:coupon_code'],
            'coupon_code' => ['nullable', 'string', 'max:100', 'required_without:promotion_id'],
            'order_item_id' => ['nullable', 'exists:order_items,id'],
            'reason' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
