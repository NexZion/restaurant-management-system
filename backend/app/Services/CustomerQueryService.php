<?php

namespace App\Services;

use App\Models\Customer;
use Illuminate\Database\Eloquent\Builder;

class CustomerQueryService
{
    public function search(?string $term = null): Builder
    {
        return Customer::query()->when($term, fn (Builder $query) => $query->where(fn (Builder $q) => $q->where('customer_number', 'like', "%{$term}%")->orWhere('first_name', 'like', "%{$term}%")->orWhere('last_name', 'like', "%{$term}%")->orWhere('phone', 'like', "%{$term}%")));
    }
}
