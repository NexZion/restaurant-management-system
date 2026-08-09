<?php

namespace App\Actions\Billing;

use App\Models\OrderBill;
use App\Services\DocumentSequenceService;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class SplitBill
{
    public function __construct(private DocumentSequenceService $sequences) {}

    public function execute(OrderBill $bill, array $splits, int $actorId): Collection
    {
        return DB::transaction(function () use ($bill, $splits, $actorId) {
            $bill = OrderBill::query()->lockForUpdate()->findOrFail($bill->id);
            if ($bill->parent_bill_id || $bill->payments()->exists() || $bill->bill_status !== 'unpaid') {
                throw ValidationException::withMessages(['bill' => 'Only an unpaid original bill can be split.']);
            }

            $orderItems = $bill->order->items()->lockForUpdate()->get()->keyBy('id');
            $allocated = [];
            foreach ($splits as $split) {
                foreach ($split['items'] as $entry) {
                    $item = $orderItems->get($entry['order_item_id']);
                    if (! $item) {
                        throw ValidationException::withMessages(['splits' => 'Every split item must belong to the billed order.']);
                    }
                    $allocated[$item->id] = ($allocated[$item->id] ?? 0) + $entry['quantity'];
                    if ($allocated[$item->id] > $item->quantity) {
                        throw ValidationException::withMessages(['splits' => "Allocated quantity exceeds order item {$item->id}."]);
                    }
                }
            }
            foreach ($orderItems as $item) {
                if (($allocated[$item->id] ?? 0) !== $item->quantity) {
                    throw ValidationException::withMessages(['splits' => "Order item {$item->id} must be allocated completely."]);
                }
            }

            $subtotal = max((float) $bill->subtotal, 0.01);
            $children = collect();
            foreach ($splits as $index => $split) {
                $splitSubtotal = collect($split['items'])->sum(function ($entry) use ($orderItems) {
                    $item = $orderItems->get($entry['order_item_id']);

                    return round((float) $item->total_price * $entry['quantity'] / $item->quantity, 2);
                });
                $ratio = $splitSubtotal / $subtotal;
                $discount = round((float) $bill->discount * $ratio, 2);
                $tax = round((float) $bill->tax * $ratio, 2);
                $serviceCharge = round((float) $bill->service_charge * $ratio, 2);
                $rounding = round((float) $bill->rounding_amount * $ratio, 2);
                $total = round($splitSubtotal - $discount + $tax + $serviceCharge + $rounding, 2);
                $child = OrderBill::query()->create([
                    'order_id' => $bill->order_id, 'parent_bill_id' => $bill->id,
                    'bill_number' => $this->sequences->next($bill->order->branch_id, 'bill', 'BILL-'),
                    'split_number' => $index + 1, 'subtotal' => $splitSubtotal,
                    'discount' => $discount, 'tax' => $tax, 'service_charge' => $serviceCharge,
                    'rounding_amount' => $rounding, 'grand_total' => $total,
                    'balance_due' => $total, 'bill_status' => 'unpaid',
                    'generated_by' => $actorId, 'generated_at' => now(),
                ]);
                foreach ($split['items'] as $entry) {
                    $item = $orderItems->get($entry['order_item_id']);
                    $child->items()->create([
                        'order_item_id' => $item->id, 'quantity' => $entry['quantity'],
                        'amount' => round((float) $item->total_price * $entry['quantity'] / $item->quantity, 2),
                    ]);
                }
                $children->push($child->load('items'));
            }
            $bill->update(['bill_status' => 'split', 'balance_due' => 0]);

            return $children;
        });
    }
}
