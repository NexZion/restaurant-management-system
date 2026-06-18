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
    $customers = Customer::paginate($request->input('per_page', 10));

    return response()->json([
        'success' => true,
        'data' => $customers
    ]);
}
public function store(StoreCustomerRequest $request)
{
    $customer = Customer::create([

        'customer_code' => $request->customer_code,

        'first_name' => $request->first_name,
        'last_name' => $request->last_name,

        'email' => $request->email,
        'phone' => $request->phone,
        'whatsapp' => $request->whatsapp,

        'address_line1' => $request->address_line1,
        'address_line2' => $request->address_line2,
        'city' => $request->city,
        'district' => $request->district,
        'postal_code' => $request->postal_code,
        'state' => $request->state,

        'customer_type' => $request->customer_type,

        'loyalty_points' => $request->loyalty_points ?? 0,

        'id_number' => $request->id_number,
        'id_type' => $request->id_type,

        'status' => $request->status ?? 'active',

        'is_active' => true
    ]);

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