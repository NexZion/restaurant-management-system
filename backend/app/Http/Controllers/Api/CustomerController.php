<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\IndexFilterRequest;
use App\Http\Requests\StoreCustomerRequest;
use App\Http\Requests\UpdateCustomerRequest;
use App\Models\Customer;

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
                'id', 'customer_code', 'first_name', 'last_name', 'email', 'phone',
                'whatsapp', 'address_line1', 'address_line2', 'city', 'district',
                'postal_code', 'state', 'customer_type', 'loyalty_points', 'total_spend',
                'receipt_count', 'last_visited_at', 'id_number', 'id_type', 'status',
                'is_active', 'created_at', 'updated_at',
            ],
            [
                'customer_code', 'first_name', 'last_name', 'email', 'phone', 'whatsapp',
                'address_line1', 'address_line2', 'city', 'district', 'postal_code',
                'state', 'id_number', 'id_type',
            ],
        );

        return response()->json([
            'success' => true,
            'data' => $customers,
        ]);
    }

    public function store(StoreCustomerRequest $request)
    {
        $data = $request->validated();
        $data['customer_code'] = Customer::generateCustomerCode();

        $customer = Customer::create($data);

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

        $customer->update([
            'is_active' => false,
            'status' => 'inactive',
        ]);

        $customer->delete();

        return response()->json([
            'success' => true,
            'message' => 'Customer deleted successfully',
        ]);
    }
}
