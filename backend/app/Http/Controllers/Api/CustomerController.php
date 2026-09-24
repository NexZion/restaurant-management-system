<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\IndexFilterRequest;
use App\Http\Requests\StoreCustomerRequest;
use App\Http\Requests\UpdateCustomerRequest;
use App\Models\Customer;
use Illuminate\Support\Str;

class CustomerController extends Controller
{
    public function index(IndexFilterRequest $request)
    {
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
        $data = $request->validated();
        $data['uuid'] = (string) Str::uuid();
        $data['customer_number'] = 'CUS-'.str_pad((string) (Customer::withTrashed()->max('id') + 1), 6, '0', STR_PAD_LEFT);
        $data['display_name'] ??= trim($data['first_name'].' '.($data['last_name'] ?? ''));

        $customer = Customer::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Customer created successfully',
            'data' => $customer->load(['addresses', 'tags']),
        ], 201);
    }

    public function show($id)
    {
        $customer = Customer::with(['addresses', 'tags'])->find($id);

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
            'data' => $customer->fresh(['addresses', 'tags']),
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
