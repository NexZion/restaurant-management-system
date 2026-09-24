<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCustomerAddressRequest;
use App\Http\Requests\UpdateCustomerAddressRequest;
use App\Models\Customer;
use App\Models\CustomerAddress;
use Illuminate\Support\Str;

class CustomerAddressController extends Controller
{
    public function index(Customer $customer) { return response()->json($customer->addresses()->get()); }
    public function store(StoreCustomerAddressRequest $request, Customer $customer) { $data = $request->validated(); if ($request->boolean('is_default')) { $customer->addresses()->update(['is_default' => false]); } $data['uuid'] = (string) Str::uuid(); return response()->json($customer->addresses()->create($data), 201); }
    public function update(UpdateCustomerAddressRequest $request, CustomerAddress $customerAddress) { $customerAddress->update($request->validated()); return response()->json($customerAddress); }
    public function destroy(CustomerAddress $customerAddress) { $customerAddress->delete(); return response()->noContent(); }
}
