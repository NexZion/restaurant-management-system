<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\IndexFilterRequest;
use App\Http\Requests\StoreCustomerRequest;
use App\Http\Requests\UpdateCustomerRequest;
use App\Models\Customer;
use App\Services\CustomerService;

class CustomerController extends Controller
{
    public function index(IndexFilterRequest $request)
    {
        $user = $request->user();

        if (! $user) {
            return response()->json([
                'success' => false,
                'message' => 'Please login first',
            ], 401);
        }

        $customers = $this->filterAndPaginate(
            Customer::query(),
            $request,
            [
                'id', 'uuid', 'customer_number', 'first_name', 'last_name', 'display_name',
                'email', 'phone', 'secondary_phone', 'customer_type', 'status',
                'preferred_branch_id', 'created_at', 'updated_at',
            ],
            [
                'customer_number', 'first_name', 'last_name', 'display_name', 'email', 'phone', 'secondary_phone',
            ],
        );

        return response()->json([
            'success' => true,
            'data' => $customers,
        ]);
    }

    public function store(StoreCustomerRequest $request)
    {
        $customer = app(CustomerService::class)->create($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Customer created successfully',
            'data' => $customer,
        ], 201);
    }

    public function show($id)
    {
        $customer = Customer::find($id);

        if (! $customer) {

            return response()->json([
                'success' => false,
                'message' => 'Customer not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $customer,
        ]);
    }

    public function update(UpdateCustomerRequest $request, $id)
    {
        $customer = Customer::find($id);

        if (! $customer) {

            return response()->json([
                'success' => false,
                'message' => 'Customer not found',
            ], 404);
        }

        $customer->update($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Customer updated successfully',
            'data' => $customer,
        ]);
    }

    public function destroy($id)
    {
        $customer = Customer::find($id);

        if (! $customer) {

            return response()->json([
                'success' => false,
                'message' => 'Customer not found',
            ], 404);
        }

        $customer->update(['status' => 'inactive']);

        $customer->delete();

        return response()->json([
            'success' => true,
            'message' => 'Customer deleted successfully',
        ]);
    }
}
