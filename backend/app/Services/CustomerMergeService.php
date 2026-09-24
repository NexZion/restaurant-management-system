<?php

namespace App\Services;

use App\Models\Customer;
use Illuminate\Support\Facades\DB;

class CustomerMergeService
{
    public function merge(Customer $source, Customer $target): Customer
    {
        return DB::transaction(function () use ($source, $target) {
            $source->addresses()->update(['customer_id' => $target->id]);
            $source->notes()->update(['customer_id' => $target->id]);
            $source->orders()->update(['customer_id' => $target->id]);
            $source->delete();

            return $target->refresh();
        });
    }
}
