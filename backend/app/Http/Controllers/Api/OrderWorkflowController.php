<?php

namespace App\Http\Controllers\Api;

use App\Actions\Billing\SplitBill;
use App\Actions\Orders\MergeOrders;
use App\Actions\Orders\TransferOrderItem;
use App\Http\Controllers\Controller;
use App\Http\Requests\MergeOrdersRequest;
use App\Http\Requests\SplitBillRequest;
use App\Http\Requests\TransferOrderItemRequest;
use App\Models\Order;
use App\Models\OrderBill;
use App\Models\OrderItem;
use Illuminate\Http\JsonResponse;

class OrderWorkflowController extends Controller
{
    public function transfer(TransferOrderItemRequest $request, Order $order, OrderItem $item, TransferOrderItem $action): JsonResponse
    {
        $data = $request->validated();
        $transferred = $action->execute(
            $order, $item, Order::query()->findOrFail($data['to_order_id']),
            $data['quantity'], $request->user()->id, $data['reason'] ?? null,
        );

        return response()->json(['success' => true, 'message' => 'Item transferred.', 'data' => $transferred]);
    }

    public function merge(MergeOrdersRequest $request, Order $order, MergeOrders $action): JsonResponse
    {
        $data = $request->validated();
        $merged = $action->execute(
            $order, Order::query()->findOrFail($data['source_order_id']),
            $request->user()->id, $data['reason'] ?? null,
        );

        return response()->json(['success' => true, 'message' => 'Orders merged.', 'data' => $merged]);
    }

    public function split(SplitBillRequest $request, OrderBill $bill, SplitBill $action): JsonResponse
    {
        $bills = $action->execute($bill, $request->validated('splits'), $request->user()->id);

        return response()->json(['success' => true, 'message' => 'Bill split.', 'data' => $bills], 201);
    }
}
