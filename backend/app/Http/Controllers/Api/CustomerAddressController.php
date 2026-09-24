<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCustomerAddressRequest;
use App\Http\Requests\UpdateCustomerAddressRequest;
use App\Http\Resources\CustomerAddressResource;
use App\Models\Customer;
use App\Models\CustomerAddress;
use App\Services\CustomerAddressService;

class CustomerAddressController extends Controller
{
    public function index(Customer $customer) { return CustomerAddressResource::collection($customer->addresses()->get()); }
    public function store(StoreCustomerAddressRequest $request, Customer $customer) { return new CustomerAddressResource(app(CustomerAddressService::class)->create($customer, $request->validated())); }
    public function update(UpdateCustomerAddressRequest $request, CustomerAddress $customerAddress) { $customerAddress->update($request->validated()); return new CustomerAddressResource($customerAddress); }
    public function destroy(CustomerAddress $customerAddress) { $customerAddress->delete(); return response()->noContent(); }
}
