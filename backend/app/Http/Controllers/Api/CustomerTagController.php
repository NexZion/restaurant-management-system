<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\CustomerTag;
use Illuminate\Http\Request;

class CustomerTagController extends Controller
{
    public function index() { return response()->json(CustomerTag::query()->where('is_active', true)->get()); }
    public function store(Request $request) { return response()->json(CustomerTag::query()->create($request->validate(['restaurant_id' => ['required', 'integer'], 'name' => ['required', 'string', 'max:255'], 'description' => ['nullable', 'string'], 'color' => ['nullable', 'string', 'max:20'], 'is_active' => ['sometimes', 'boolean']])), 201); }
    public function attach(Customer $customer, CustomerTag $customerTag) { $customer->tags()->syncWithoutDetaching([$customerTag->id]); return response()->noContent(); }
    public function detach(Customer $customer, CustomerTag $customerTag) { $customer->tags()->detach($customerTag); return response()->noContent(); }
}
