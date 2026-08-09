<?php

namespace App\Services;

use App\Models\Customer;
use App\Models\LoyaltyTransaction;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class LoyaltyService
{
    public function record(Customer $customer, string $type, int $points, ?int $orderId, ?string $description): LoyaltyTransaction
    {
        return DB::transaction(function () use ($customer, $type, $points, $orderId, $description) {
            $customer = Customer::query()->lockForUpdate()->findOrFail($customer->id);
            $delta = in_array($type, ['redeem', 'expiry'], true) ? -abs($points) : $points;
            $balance = $customer->loyalty_points + $delta;
            if ($balance < 0) {
                throw ValidationException::withMessages(['points' => 'The customer does not have enough loyalty points.']);
            }
            $customer->update(['loyalty_points' => $balance]);

            return LoyaltyTransaction::query()->create([
                'customer_id' => $customer->id, 'order_id' => $orderId, 'type' => $type,
                'points' => $delta, 'balance_after' => $balance,
                'description' => $description, 'occurred_at' => now(),
            ]);
        });
    }
}
