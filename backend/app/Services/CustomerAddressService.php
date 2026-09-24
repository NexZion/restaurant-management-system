<?php

namespace App\Services;

use App\Models\Customer;
use App\Models\CustomerAddress;
use Illuminate\Support\Str;

class CustomerAddressService
{
    public function create(Customer $customer, array $attributes): CustomerAddress
    {
        if (($attributes['is_default'] ?? false) === true) {
            $customer->addresses()->update(['is_default' => false]);
        }

        $attributes['uuid'] ??= (string) Str::uuid();
        return $customer->addresses()->create($attributes);
    }
}
