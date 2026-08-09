<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\IndexFilterRequest;
use App\Http\Requests\StoreOrderDiscountRequest;
use App\Http\Requests\UpdateOrderDiscountRequest;
use App\Models\OrderDiscount;
use Illuminate\Http\JsonResponse;

class OrderDiscountController extends Controller
{
    public function index(IndexFilterRequest $request): JsonResponse
    {
        $discounts = $this->filterAndPaginate(
            OrderDiscount::with(['order', 'orderItem', 'approver', 'creator'])->where(fn ($query) => $query
                ->whereHas('order', fn ($orderQuery) => $orderQuery->where('branch_id', $request->user()->branch_id))
                ->orWhereHas('orderItem.order', fn ($orderQuery) => $orderQuery->where('branch_id', $request->user()->branch_id))),
            $request,
            ['id', 'order_id', 'order_item_id', 'discount_type', 'discount_source', 'promotion_id', 'coupon_id', 'percentage', 'amount', 'reason', 'approved_by', 'created_by', 'created_at'],
            ['discount_type', 'discount_source', 'reason'],
        );

        return response()->json(['success' => true, 'data' => $discounts]);
    }

    public function store(StoreOrderDiscountRequest $request): JsonResponse
    {
        $discount = OrderDiscount::create(array_merge($request->validated(), ['created_by' => $request->user()->id]));

        return response()->json(['success' => true, 'data' => $discount->load(['order', 'orderItem', 'approver'])], 201);
    }

    public function show(OrderDiscount $orderDiscount): JsonResponse
    {
        return response()->json(['success' => true, 'data' => $orderDiscount->load(['order', 'orderItem', 'approver', 'creator'])]);
    }

    public function update(UpdateOrderDiscountRequest $request, OrderDiscount $orderDiscount): JsonResponse
    {
        $orderDiscount->update($request->validated());

        return response()->json(['success' => true, 'data' => $orderDiscount->fresh()]);
    }

    public function destroy(OrderDiscount $orderDiscount): JsonResponse
    {
        $orderDiscount->delete();

        return response()->json(['success' => true, 'message' => 'Discount deleted successfully.']);
    }
}
