<?php

use App\Models\Branch;
use App\Models\Order;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;

uses(LazilyRefreshDatabase::class);

test('it accepts multiple payments and keeps bill balances synchronized', function () {
    $branch = Branch::factory()->create();
    $user = User::factory()->create([
        'branch_id' => $branch->id,
        'role_id' => Role::factory()->create()->id,
    ]);
    $order = Order::factory()->create([
        'branch_id' => $branch->id,
        'created_by' => $user->id,
        'table_id' => null,
        'customer_id' => null,
        'waiter_id' => null,
        'status' => 'completed',
        'payment_status' => 'unpaid',
    ]);
    $bill = $order->bill()->create([
        'bill_number' => 'BILL-SPLIT-001',
        'subtotal' => 3000,
        'grand_total' => 3000,
        'balance_due' => 3000,
    ]);

    $this->actingAs($user, 'api')->postJson("/api/bills/{$bill->id}/pay", [
        'payment_method' => 'cash',
        'amount_paid' => 1000,
        'amount_received' => 1000,
    ])->assertCreated();

    $this->actingAs($user, 'api')->postJson("/api/bills/{$bill->id}/pay", [
        'payment_method' => 'card',
        'amount_paid' => 2000,
        'amount_received' => 2000,
        'transaction_reference' => 'CARD-123',
    ])->assertCreated();

    expect($bill->payments()->count())->toBe(2)
        ->and($bill->fresh()->paid_amount)->toBe('3000.00')
        ->and($bill->fresh()->balance_due)->toBe('0.00')
        ->and($bill->fresh()->bill_status)->toBe('paid')
        ->and($order->fresh()->payment_status)->toBe('paid');
});
