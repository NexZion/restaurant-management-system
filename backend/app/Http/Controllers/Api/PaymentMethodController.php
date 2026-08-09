<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\IndexFilterRequest;
use App\Http\Requests\StorePaymentMethodRequest;
use App\Http\Requests\UpdatePaymentMethodRequest;
use App\Models\PaymentMethod;
use Illuminate\Http\JsonResponse;

class PaymentMethodController extends Controller
{
    public function index(IndexFilterRequest $request): JsonResponse
    {
        $methods = $this->filterAndPaginate(
            PaymentMethod::where(fn ($query) => $query->whereNull('branch_id')->orWhere('branch_id', $request->user()->branch_id)),
            $request,
            ['id', 'branch_id', 'code', 'name', 'type', 'requires_reference', 'is_cash', 'is_active', 'created_at', 'updated_at'],
            ['code', 'name', 'type'],
        );

        return response()->json(['success' => true, 'data' => $methods]);
    }

    public function store(StorePaymentMethodRequest $request): JsonResponse
    {
        return response()->json(['success' => true, 'data' => PaymentMethod::create($request->validated())], 201);
    }

    public function show(PaymentMethod $paymentMethod): JsonResponse
    {
        return response()->json(['success' => true, 'data' => $paymentMethod]);
    }

    public function update(UpdatePaymentMethodRequest $request, PaymentMethod $paymentMethod): JsonResponse
    {
        $paymentMethod->update($request->validated());

        return response()->json(['success' => true, 'data' => $paymentMethod->fresh()]);
    }

    public function destroy(PaymentMethod $paymentMethod): JsonResponse
    {
        abort_if($paymentMethod->payments()->exists(), 409, 'Used payment methods cannot be deleted.');
        $paymentMethod->delete();

        return response()->json(['success' => true, 'message' => 'Payment method deleted successfully.']);
    }
}
