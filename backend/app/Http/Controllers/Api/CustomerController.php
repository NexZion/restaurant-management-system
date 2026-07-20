<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\Request;
use App\Http\Requests\StoreCustomerRequest;
use App\Http\Requests\UpdateCustomerRequest;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Please login first'
            ], 401);
        }

        $customers = Customer::paginate($request->input('per_page', 70));

        return response()->json([
            'success' => true,
            'data' => $customers
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
            'data' => $customer
        ], 201);
    }
    public function show($id)
    {
        $customer = Customer::find($id);

        if (!$customer) {

            return response()->json([
                'success' => false,
                'message' => 'Customer not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $customer
        ]);
    }

    public function update(UpdateCustomerRequest $request, $id)
    {
        $customer = Customer::find($id);

        if (!$customer) {

            return response()->json([
                'success' => false,
                'message' => 'Customer not found'
            ], 404);
        }

        $customer->update($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Customer updated successfully',
            'data' => $customer
        ]);
    }
    public function destroy($id)
    {
        $customer = Customer::find($id);

        if (!$customer) {

            return response()->json([
                'success' => false,
                'message' => 'Customer not found'
            ], 404);
        }

        $customer->update([
            'is_active' => false,
            'status' => 'inactive'
        ]);

        $customer->delete();

        return response()->json([
            'success' => true,
            'message' => 'Customer deleted successfully'
        ]);
    }
}
