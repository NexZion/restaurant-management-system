<?php

use App\Models\Account;
use App\Models\Branch;
use App\Models\Customer;
use App\Models\InventoryItem;
use App\Models\JournalEntry;
use App\Models\Role;
use App\Models\User;
use App\Services\JournalService;
use App\Services\LoyaltyService;
use App\Services\StockService;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Illuminate\Validation\ValidationException;

uses(LazilyRefreshDatabase::class);

function operationalActor(): array
{
    $branch = Branch::factory()->create();
    $user = User::factory()->create([
        'branch_id' => $branch->id,
        'role_id' => Role::factory()->create(['access_level' => 100])->id,
    ]);

    return compact('branch', 'user');
}

test('stock movements update the branch stock level atomically', function () {
    $context = operationalActor();
    $item = InventoryItem::query()->create([
        'sku' => 'INV-TEST', 'name' => 'Rice', 'unit' => 'kg',
        'unit_cost' => 100, 'reorder_level' => 5,
    ]);
    $stock = app(StockService::class);

    $stock->record($context['branch']->id, $item, 'receipt', 10, 100, null, null, $context['user']->id);
    $stock->record($context['branch']->id, $item, 'wastage', 2, 100, null, 'Damaged', $context['user']->id);

    $this->assertDatabaseHas('stock_levels', [
        'branch_id' => $context['branch']->id,
        'inventory_item_id' => $item->id,
        'quantity_on_hand' => 8,
    ]);

    expect(fn () => $stock->record(
        $context['branch']->id, $item, 'sale', 20, null, null, null, $context['user']->id,
    ))->toThrow(ValidationException::class);
});

test('loyalty transactions maintain a locked running balance', function () {
    $customer = Customer::factory()->create(['loyalty_points' => 0]);
    $service = app(LoyaltyService::class);

    $earned = $service->record($customer, 'earn', 100, null, 'Welcome points');
    $redeemed = $service->record($customer, 'redeem', 30, null, 'Reward');

    expect($earned->balance_after)->toBe(100)
        ->and($redeemed->balance_after)->toBe(70)
        ->and($customer->refresh()->loyalty_points)->toBe(70);
});

test('journal posting requires balance and reversal swaps debits and credits', function () {
    $context = operationalActor();
    $cash = Account::query()->create(['code' => '1000', 'name' => 'Cash', 'type' => 'asset']);
    $sales = Account::query()->create(['code' => '4000', 'name' => 'Sales', 'type' => 'revenue']);
    $entry = JournalEntry::query()->create([
        'branch_id' => $context['branch']->id, 'entry_number' => 'JE-TEST',
        'entry_date' => today(), 'description' => 'Cash sale', 'created_by' => $context['user']->id,
    ]);
    $service = app(JournalService::class);

    $posted = $service->post($entry, [
        ['account_id' => $cash->id, 'debit' => 500, 'credit' => 0],
        ['account_id' => $sales->id, 'debit' => 0, 'credit' => 500],
    ], $context['user']->id);
    $reversal = $service->reverse($posted, 'Correction', $context['user']->id);

    expect($posted->status)->toBe('posted')
        ->and($posted->lines)->toHaveCount(2)
        ->and($reversal->lines->firstWhere('account_id', $cash->id)->credit)->toBe('500.00')
        ->and($entry->refresh()->status)->toBe('reversed');
});

test('dashboard summary returns live branch aggregates', function () {
    $context = operationalActor();

    $this->actingAs($context['user'], 'api')
        ->getJson('/api/dashboard/summary')
        ->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonStructure(['data' => [
            'revenue', 'refunds', 'orders', 'payments_by_method', 'orders_by_type',
            'kitchen_queue', 'tables', 'reservations_today', 'low_stock', 'current_shift', 'top_items',
        ]]);
});
