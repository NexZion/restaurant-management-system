<?php

namespace App\Policies;

use App\Models\CustomerAddress;
use App\Models\User;

class CustomerAddressPolicy
{
    public function view(User $user, CustomerAddress $address): bool { return $user->hasPermission('customers.manage'); }
    public function create(User $user): bool { return $user->hasPermission('customers.manage'); }
    public function update(User $user, CustomerAddress $address): bool { return $user->hasPermission('customers.manage'); }
    public function delete(User $user, CustomerAddress $address): bool { return $user->hasPermission('customers.manage'); }
}
