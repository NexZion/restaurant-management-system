<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\IndexFilterRequest;
use App\Http\Requests\StoreOrderDeliveryRequest;
use App\Http\Requests\UpdateOrderDeliveryRequest;
use App\Models\OrderDelivery;
use Illuminate\Http\JsonResponse;

class OrderDeliveryController extends Controller
{
    public function index(IndexFilterRequest $request): JsonResponse
    {
        $deliveries = $this->filterAndPaginate(
            OrderDelivery::with(['order', 'rider'])->whereHas('order', fn ($query) => $query->where('branch_id', $request->user()->branch_id)),
            $request,
            ['id', 'order_id', 'delivery_address_id', 'recipient_name', 'recipient_phone', 'address_line_1', 'address_line_2', 'city', 'latitude', 'longitude', 'delivery_fee', 'rider_id', 'delivery_status', 'estimated_delivery_at', 'dispatched_at', 'delivered_at', 'delivery_notes', 'created_at', 'updated_at'],
            ['recipient_name', 'recipient_phone', 'address_line_1', 'address_line_2', 'city', 'delivery_status', 'delivery_notes'],
        );

        return response()->json(['success' => true, 'data' => $deliveries]);
    }

    public function store(StoreOrderDeliveryRequest $request): JsonResponse
    {
        $delivery = OrderDelivery::create($request->validated());

        return response()->json(['success' => true, 'data' => $delivery->load(['order', 'rider'])], 201);
    }

    public function show(OrderDelivery $orderDelivery): JsonResponse
    {
        return response()->json(['success' => true, 'data' => $orderDelivery->load(['order', 'rider'])]);
    }

    public function update(UpdateOrderDeliveryRequest $request, OrderDelivery $orderDelivery): JsonResponse
    {
        $payload = $request->validated();
        if (($payload['delivery_status'] ?? null) === 'on_the_way' && ! isset($payload['dispatched_at'])) {
            $payload['dispatched_at'] = now();
        }
        if (($payload['delivery_status'] ?? null) === 'delivered' && ! isset($payload['delivered_at'])) {
            $payload['delivered_at'] = now();
        }
        $orderDelivery->update($payload);

        return response()->json(['success' => true, 'data' => $orderDelivery->fresh()]);
    }

    public function destroy(OrderDelivery $orderDelivery): JsonResponse
    {
        abort_if($orderDelivery->delivery_status === 'delivered', 409, 'Delivered records cannot be cancelled.');
        $orderDelivery->update(['delivery_status' => 'cancelled']);

        return response()->json(['success' => true, 'message' => 'Delivery cancelled successfully.']);
    }
}
