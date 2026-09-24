<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\CustomerNote;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CustomerNoteController extends Controller
{
    public function index(Customer $customer) { return response()->json($customer->notes()->latest()->get()); }
    public function store(Request $request, Customer $customer) { $data = $request->validate(['note' => ['required', 'string'], 'is_private' => ['sometimes', 'boolean']]); $data += ['uuid' => (string) Str::uuid(), 'created_by' => $request->user()?->id]; return response()->json($customer->notes()->create($data), 201); }
    public function destroy(CustomerNote $customerNote) { $customerNote->delete(); return response()->noContent(); }
}
