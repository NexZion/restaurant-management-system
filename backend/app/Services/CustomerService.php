<?php

namespace App\Services;

use App\Models\Customer;
use Illuminate\Support\Str;

class CustomerService
{
    public function create(array $attributes): Customer
    {
        $attributes['uuid'] ??= (string) Str::uuid();
        $attributes['customer_number'] ??= $this->nextCustomerNumber();
        $attributes['display_name'] ??= trim(($attributes['first_name'] ?? '').' '.($attributes['last_name'] ?? ''));

        return Customer::query()->create($attributes);
    }

    public function nextCustomerNumber(): string
    {
        return 'CUS-'.str_pad((string) (Customer::withTrashed()->max('id') + 1), 6, '0', STR_PAD_LEFT);
    }
}
