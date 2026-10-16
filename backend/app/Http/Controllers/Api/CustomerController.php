<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\Request;
use App\Http\Requests\CustomerIndexRequest;
use App\Http\Requests\StoreCustomerRequest;
use App\Http\Requests\UpdateCustomerRequest;

class CustomerController extends Controller
{
    public function index(CustomerIndexRequest $request)
    {
        $filters = $request->validated();

        $customers = Customer::query()
            ->withoutTrashed()
            ->applyFilters($filters)
            ->when(($filters['sort_by'] ?? 'created_at') === 'name', function ($query) use ($filters) {
                $direction = $filters['sort_direction'] ?? 'asc';
                $query->orderBy('first_name', $direction)
                    ->orderBy('last_name', $direction);
            }, function ($query) use ($filters) {
                $query->orderBy('created_at', $filters['sort_direction'] ?? 'desc');
            })
            ->orderByDesc('id')
            ->paginate($filters['per_page'] ?? 70)
            ->withQueryString();

        return response()->json($customers);
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
