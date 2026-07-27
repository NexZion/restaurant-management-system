<?php

namespace App\Services;

use App\Models\Coupon;
use App\Models\Order;
use App\Models\OrderDiscount;
use App\Models\Promotion;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PromotionService
{
    public function apply(Order $order, ?int $promotionId, ?string $couponCode, ?int $orderItemId, ?string $reason, int $actorId): OrderDiscount
    {
        return DB::transaction(function () use ($order, $promotionId, $couponCode, $orderItemId, $reason, $actorId) {
            $order = Order::query()->lockForUpdate()->findOrFail($order->id);
            $coupon = $couponCode ? Coupon::query()->where('code', $couponCode)->lockForUpdate()->firstOrFail() : null;
            $promotion = Promotion::query()->findOrFail($coupon?->promotion_id ?? $promotionId);
            $now = now();
            if (! $promotion->is_active || $now->lt($promotion->starts_at) || $now->gt($promotion->ends_at)
                || ($promotion->branch_id && $promotion->branch_id !== $order->branch_id)) {
                throw ValidationException::withMessages(['promotion_id' => 'The promotion is not currently valid for this order.']);
            }
            if ($coupon && (! $coupon->is_active || ($coupon->expires_at && $now->gt($coupon->expires_at))
                || ($coupon->usage_limit && $coupon->used_count >= $coupon->usage_limit))) {
                throw ValidationException::withMessages(['coupon_code' => 'The coupon is expired or has reached its usage limit.']);
            }
            $base = $orderItemId
                ? (float) $order->items()->whereKey($orderItemId)->value('total_price')
                : (float) $order->items()->sum('total_price');
            if ($base < (float) $promotion->minimum_order_amount) {
                throw ValidationException::withMessages(['promotion_id' => 'The minimum order amount has not been reached.']);
            }
            $amount = $promotion->discount_type === 'percentage'
                ? round($base * (float) $promotion->discount_value / 100, 2)
                : min($base, (float) $promotion->discount_value);
            if ($promotion->maximum_discount_amount !== null) {
                $amount = min($amount, (float) $promotion->maximum_discount_amount);
            }
            $discount = OrderDiscount::query()->create([
                'order_id' => $order->id, 'order_item_id' => $orderItemId,
                'discount_type' => $promotion->discount_type,
                'discount_source' => $coupon ? 'coupon' : 'promotion',
                'promotion_id' => $promotion->id, 'coupon_id' => $coupon?->id,
                'percentage' => $promotion->discount_type === 'percentage' ? $promotion->discount_value : null,
                'amount' => $amount, 'reason' => $reason, 'created_by' => $actorId,
            ]);
            if ($coupon) {
                $coupon->increment('used_count');
            }
            $bill = $order->bill()->where('bill_status', 'unpaid')->lockForUpdate()->first();
            if ($bill) {
                $totalDiscount = (float) $order->discounts()->sum('amount');
                $grandTotal = max(0, (float) $bill->subtotal - $totalDiscount + (float) $bill->tax + (float) $bill->service_charge + (float) $bill->rounding_amount);
                $bill->update(['discount' => $totalDiscount, 'grand_total' => $grandTotal, 'balance_due' => $grandTotal]);
            }

            return $discount;
        });
    }
}
