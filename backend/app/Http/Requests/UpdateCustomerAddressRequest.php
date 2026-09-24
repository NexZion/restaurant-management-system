<?php

namespace App\Http\Requests;

class UpdateCustomerAddressRequest extends StoreCustomerAddressRequest
{
    public function rules(): array
    {
        return array_map(fn ($rules) => str_replace('required', 'sometimes|required', $rules), parent::rules());
    }
}
