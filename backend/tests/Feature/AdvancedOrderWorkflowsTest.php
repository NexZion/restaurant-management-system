<?php

use App\Actions\Billing\SplitBill;
use App\Actions\Orders\MergeOrders;
use App\Actions\Orders\TransferOrderItem;
use App\Models\Branch;
use App\Models\MenuCategory;
use App\Models\MenuItem;
use App\Models\Order;
use App\Models\OrderBill;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;

uses(LazilyRefreshDatabase::class);

function workflowContext(): array
{
    $branch = Branch::factory()->create();
    $user = User::factory()->create([
        'branch_id' => $branch->id,
        'role_id' => Role::factory()->create(['access_level' => 100])->id,
    ]);
    $menuItem = MenuItem::factory()->create([
        'menu_category_id' => MenuCategory::factory()->create()->id,
        'base_price' => 100,
    ]);
    $orderData = [
        'branch_id' => $branch->id, 'created_by' => $user->id,
        'order_type' => 'dining', 'status' => 'pending',
    ];
    $source = Order::query()->create($orderData + ['order_number' => 'ORD-WF-1']);
    $target = Order::query()->create($orderData + ['order_number' => 'ORD-WF-2']);

    return compact('branch', 'user', 'menuItem', 'source', 'target');
}

test('it transfers partial quantities and records the transfer', function () {
    $context = workflowContext();
    $item = $context['source']->items()->create([
        'menu_item_id' => $context['menuItem']->id, 'quantity' => 4,
        'unit_price' => 100, 'total_price' => 400,
    ]);

    $transferred = app(TransferOrderItem::class)->execute(
        $context['source'], $item, $context['target'], 2, $context['user']->id, 'Move guests',
    );

    expect($item->refresh()->quantity)->toBe(2)
        ->and($transferred->quantity)->toBe(2)
        ->and($transferred->order_id)->toBe($context['target']->id)
        ->and($context['source']->outgoingTransfers()->count())->toBe(1);
});

test('it merges orders and preserves a merge record', function () {
    $context = workflowContext();
    $context['source']->items()->create([
        'menu_item_id' => $context['menuItem']->id, 'quantity' => 1,
        'unit_price' => 100, 'total_price' => 100,
    ]);

    $target = app(MergeOrders::class)->execute(
        $context['target'], $context['source'], $context['user']->id, 'Same party',
    );

    expect($context['source']->refresh()->status)->toBe('merged')
        ->and($target->items)->toHaveCount(1)
        ->and($context['source']->outgoingTransfers()->count())->toBe(0);
    $this->assertDatabaseHas('order_merges', [
        'source_order_id' => $context['source']->id,
        'target_order_id' => $context['target']->id,
    ]);
});

test('it splits an unpaid bill by item quantity', function () {
    $context = workflowContext();
    $item = $context['source']->items()->create([
        'menu_item_id' => $context['menuItem']->id, 'quantity' => 2,
        'unit_price' => 100, 'total_price' => 200,
    ]);
    $bill = OrderBill::query()->create([
        'order_id' => $context['source']->id, 'bill_number' => 'BILL-WF-1',
        'subtotal' => 200, 'grand_total' => 200, 'balance_due' => 200,
        'bill_status' => 'unpaid',
    ]);

    $splits = app(SplitBill::class)->execute($bill, [
        ['items' => [['order_item_id' => $item->id, 'quantity' => 1]]],
        ['items' => [['order_item_id' => $item->id, 'quantity' => 1]]],
    ], $context['user']->id);

    expect($splits)->toHaveCount(2)
        ->and((float) $splits->sum('grand_total'))->toBe(200.0)
        ->and($bill->refresh()->bill_status)->toBe('split')
        ->and($bill->splits()->count())->toBe(2);
});
