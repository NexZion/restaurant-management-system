<?php

namespace App\Events;

use App\Models\Customer;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CustomerMerged
{
    use Dispatchable, SerializesModels;
    public function __construct(public Customer $source, public Customer $target) {}
}
