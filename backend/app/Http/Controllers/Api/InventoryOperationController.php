<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ConsumeOrderInventoryRequest;
use App\Http\Requests\ReceivePurchaseOrderRequest;
use App\Http\Requests\RecordStockMovementRequest;
use App\Http\Requests\RecordWastageRequest;
use App\Models\InventoryItem;
use App\Models\Order;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\Wastage;
use App\Services\OrderInventoryService;
use App\Services\StockService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class InventoryOperationController extends Controller
{
    public function __construct(private StockService $stock, private OrderInventoryService $orderInventory) {}

    public function movement(RecordStockMovementRequest $request): JsonResponse
    {
        $data = $request->validated();
        $movement = $this->stock->record(
            $request->user()->branch_id, InventoryItem::query()->findOrFail($data['inventory_item_id']),
            $data['movement_type'], (float) $data['quantity'], isset($data['unit_cost']) ? (float) $data['unit_cost'] : null,
            null, $data['reason'] ?? null, $request->user()->id, $data['occurred_at'] ?? null,
        );

        return response()->json(['success' => true, 'data' => $movement], 201);
    }

    public function wastage(RecordWastageRequest $request): JsonResponse
    {
        $data = $request->validated();
        $wastage = DB::transaction(function () use ($request, $data) {
            $item = InventoryItem::query()->findOrFail($data['inventory_item_id']);
            $wastage = Wastage::query()->create([
                'branch_id' => $request->user()->branch_id, 'inventory_item_id' => $item->id,
                'quantity' => $data['quantity'], 'unit_cost' => $data['unit_cost'] ?? $item->unit_cost,
                'reason_code' => $data['reason_code'], 'notes' => $data['notes'] ?? null,
                'recorded_by' => $request->user()->id, 'recorded_at' => $data['recorded_at'] ?? now(),
            ]);
            $this->stock->record(
                $request->user()->branch_id, $item, 'wastage', (float) $data['quantity'],
                (float) $wastage->unit_cost, $wastage, $data['notes'] ?? $data['reason_code'],
                $request->user()->id, $wastage->recorded_at,
            );

            return $wastage;
        });

        return response()->json(['success' => true, 'data' => $wastage], 201);
    }

    public function receive(ReceivePurchaseOrderRequest $request, PurchaseOrder $purchaseOrder): JsonResponse
    {
        abort_unless($purchaseOrder->branch_id === $request->user()->branch_id, 404);
        $data = $request->validated();
        $purchaseOrder = DB::transaction(function () use ($request, $purchaseOrder, $data) {
            $purchaseOrder = PurchaseOrder::query()->lockForUpdate()->findOrFail($purchaseOrder->id);
            if (in_array($purchaseOrder->status, ['received', 'cancelled'], true)) {
                throw ValidationException::withMessages(['purchase_order' => 'This purchase order cannot receive more stock.']);
            }
            foreach ($data['items'] as $entry) {
                $line = PurchaseOrderItem::query()->lockForUpdate()->findOrFail($entry['purchase_order_item_id']);
                if ($line->purchase_order_id !== $purchaseOrder->id || (float) $line->received_quantity + $entry['quantity'] > (float) $line->quantity) {
                    throw ValidationException::withMessages(['items' => 'A received line is invalid or exceeds the ordered quantity.']);
                }
                $line->increment('received_quantity', $entry['quantity']);
                $this->stock->record(
                    $purchaseOrder->branch_id, InventoryItem::query()->findOrFail($line->inventory_item_id),
                    'receipt', (float) $entry['quantity'], (float) $line->unit_cost, $purchaseOrder,
                    'Purchase order receipt', $request->user()->id, $data['received_at'] ?? now(),
                );
            }
            $remaining = PurchaseOrderItem::query()->where('purchase_order_id', $purchaseOrder->id)
                ->whereColumn('received_quantity', '<', 'quantity')->exists();
            $purchaseOrder->update(['status' => $remaining ? 'partial' : 'received']);

            return $purchaseOrder->refresh();
        });

        return response()->json(['success' => true, 'data' => $purchaseOrder]);
    }

    public function consume(ConsumeOrderInventoryRequest $request, Order $order): JsonResponse
    {
        abort_unless($order->branch_id === $request->user()->branch_id, 404);
        $data = $request->validated();
        $movements = $this->orderInventory->consume(
            $order, $request->user()->id, $data['occurred_at'] ?? null, $data['allow_negative'] ?? false,
        );

        return response()->json(['success' => true, 'data' => $movements], 201);
    }
}
