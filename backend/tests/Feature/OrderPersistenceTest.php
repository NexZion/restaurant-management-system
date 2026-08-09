<?php

use App\Models\Branch;
use App\Models\Customer;
use App\Models\MenuCategory;
use App\Models\MenuItem;
use App\Models\Order;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('it persists the full order with items and bill in a transaction', function () {
    $role = Role::factory()->create();
    $branch = Branch::factory()->create();
    $user = User::factory()->create([
        'role_id' => $role->id,
        'branch_id' => $branch->id,
    ]);

    $customer = Customer::factory()->create();
    $menuCategory = MenuCategory::factory()->create();
    $menuItem = MenuItem::factory()->create([
        'menu_category_id' => $menuCategory->id,
        'base_price' => 1500,
    ]);

    $response = $this->actingAs($user, 'api')->postJson('/api/orders', [
        'branch_id' => $branch->id,
        'customer_id' => $customer->id,
        'order_type' => 'dining',
        'status' => 'pending',
        'notes' => 'VIP table',
        'items' => [
            [
                'menu_item_id' => $menuItem->id,
                'quantity' => 2,
                'unit_price' => 1,
                'discount' => 200,
                'total_price' => 2800,
                'notes' => 'No sauce',
            ],
        ],
        'bill' => [
            'subtotal' => 1,
            'discount' => 200,
            'tax' => 420,
            'service_charge' => 300,
            'grand_total' => 1,
            'bill_status' => 'unpaid',
        ],
    ]);

    $response->assertStatus(201);

    $order = Order::query()->latest('id')->first();
    $this->assertNotNull($order);
    $this->assertEquals($customer->id, $order->customer_id);
    $this->assertEquals('pending', $order->status);
    $this->assertEquals('VIP table', $order->notes);

    $this->assertCount(1, $order->items);
    $this->assertDatabaseHas('order_items', [
        'order_id' => $order->id,
        'menu_item_id' => $menuItem->id,
        'quantity' => 2,
        'unit_price' => '1500.00',
        'menu_item_name_snapshot' => $menuItem->name,
        'total_price' => '2800.00',
        'notes' => 'No sauce',
    ]);

    $this->assertDatabaseHas('order_bills', [
        'order_id' => $order->id,
        'subtotal' => '2800.00',
        'discount' => '200.00',
        'tax' => '420.00',
        'service_charge' => '300.00',
        'grand_total' => '3320.00',
        'balance_due' => '3320.00',
        'bill_status' => 'unpaid',
    ]);

    $this->actingAs($user, 'api')
        ->getJson('/api/orders?filters[status]=pending&per_page=1&sort_by=id&sort_direction=asc')
        ->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.current_page', 1)
        ->assertJsonPath('data.per_page', 1)
        ->assertJsonPath('data.total', 1)
        ->assertJsonPath('data.data.0.id', $order->id);
});
