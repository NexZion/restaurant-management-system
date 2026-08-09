<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\DashboardReportRequest;
use App\Http\Requests\IndexFilterRequest;
use App\Models\CashierShift;
use App\Models\KitchenTicket;
use App\Models\Order;
use App\Models\OrderBill;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Refund;
use App\Models\Reservation;
use App\Models\RestaurantTable;
use App\Models\StockLevel;
use Illuminate\Http\JsonResponse;

class ReportingController extends Controller
{
    public function dashboard(DashboardReportRequest $request): JsonResponse
    {
        $branchId = $request->user()->branch_id;
        $from = $request->date('date_from')?->startOfDay() ?? today()->startOfDay();
        $to = $request->date('date_to')?->endOfDay() ?? today()->endOfDay();
        $orders = Order::query()->where('branch_id', $branchId)->whereBetween('created_at', [$from, $to]);
        $billIds = OrderBill::query()->whereHas('order', fn ($query) => $query->where('branch_id', $branchId))
            ->whereBetween('created_at', [$from, $to])->pluck('id');
        $payments = Payment::query()->whereIn('order_bill_id', $billIds)->where('payment_status', 'successful');

        return response()->json(['success' => true, 'data' => [
            'period' => ['from' => $from, 'to' => $to],
            'revenue' => (float) (clone $payments)->sum('amount_paid'),
            'refunds' => (float) Refund::query()->whereIn('order_bill_id', $billIds)->where('status', 'processed')->sum('amount'),
            'orders' => [
                'total' => (clone $orders)->count(),
                'open' => (clone $orders)->whereNotIn('status', ['completed', 'cancelled', 'merged'])->count(),
                'completed' => (clone $orders)->where('status', 'completed')->count(),
                'cancelled' => (clone $orders)->where('status', 'cancelled')->count(),
            ],
            'payments_by_method' => (clone $payments)->selectRaw('payment_method, SUM(amount_paid) as total')
                ->groupBy('payment_method')->get(),
            'orders_by_type' => (clone $orders)->selectRaw('order_type, COUNT(*) as total')
                ->groupBy('order_type')->get(),
            'kitchen_queue' => KitchenTicket::query()->where('branch_id', $branchId)
                ->whereNotIn('status', ['closed', 'cancelled'])->count(),
            'tables' => [
                'occupied' => RestaurantTable::query()->where('branch_id', $branchId)->where('status', 'occupied')->count(),
                'available' => RestaurantTable::query()->where('branch_id', $branchId)->where('status', 'available')->count(),
            ],
            'reservations_today' => Reservation::query()->where('branch_id', $branchId)->whereDate('reservation_date', today())->count(),
            'low_stock' => StockLevel::query()->where('branch_id', $branchId)
                ->whereHas('inventoryItem', fn ($query) => $query->whereColumn('stock_levels.quantity_on_hand', '<=', 'inventory_items.reorder_level'))
                ->with('inventoryItem')->limit(20)->get(),
            'current_shift' => CashierShift::query()->where('branch_id', $branchId)
                ->where('user_id', $request->user()->id)->where('status', 'open')->latest('id')->first(),
            'top_items' => OrderItem::query()->whereHas('order', fn ($query) => $query->where('branch_id', $branchId)->whereBetween('created_at', [$from, $to]))
                ->selectRaw('menu_item_id, menu_item_name_snapshot, SUM(quantity) as quantity, SUM(total_price) as revenue')
                ->groupBy('menu_item_id', 'menu_item_name_snapshot')->orderByDesc('quantity')->limit(10)->get(),
        ]]);
    }

    public function payments(IndexFilterRequest $request): JsonResponse
    {
        $query = Payment::query()->with(['bill.order', 'method', 'cashier', 'terminal', 'cashierShift'])
            ->whereHas('bill.order', fn ($order) => $order->where('branch_id', $request->user()->branch_id));

        return response()->json(['success' => true, 'data' => $this->filterAndPaginate(
            $query, $request,
            array_merge(['id'], (new Payment)->getFillable(), ['created_at', 'updated_at']),
            ['payment_number', 'payment_method', 'payment_status', 'transaction_reference', 'gateway_transaction_id'],
        )]);
    }

    public function orderHistory(Order $order): JsonResponse
    {
        abort_unless($order->branch_id === request()->user()->branch_id, 404);

        return response()->json(['success' => true, 'data' => [
            'status_history' => $order->statusHistory()->with('actor')->latest('changed_at')->get(),
            'transfers_in' => $order->incomingTransfers()->with('orderItem')->latest()->get(),
            'transfers_out' => $order->outgoingTransfers()->with('orderItem')->latest()->get(),
        ]]);
    }

    public function itemHistory(Order $order, OrderItem $item): JsonResponse
    {
        abort_unless($order->branch_id === request()->user()->branch_id && $item->order_id === $order->id, 404);

        return response()->json(['success' => true, 'data' => $item->statusHistory()->with('actor')->latest('changed_at')->get()]);
    }
}
