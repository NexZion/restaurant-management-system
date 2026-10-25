<?php

use App\Models\Branch;
use App\Models\Customer;
use App\Models\MenuCategory;
use App\Models\MenuItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('it persists the full order with items in a transaction', function () {
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
        'order_type' => 'dine_in',
        'status' => 'draft',
        'customer_note' => 'VIP table',
        'items' => [
            [
                'menu_item_id' => $menuItem->id,
                'quantity' => 2,
                'unit_price' => 1500,
                'discount' => 200,
                'total_price' => 2800,
                'notes' => 'No sauce',
            ],
        ],
        'subtotal' => 3000,
        'discount_total' => 200,
        'tax_total' => 420,
        'service_charge_total' => 300,
        'grand_total' => 3520,
        'payment_status' => 'unpaid',
    ]);

    $response->assertStatus(201);

    $order = Order::query()->latest('id')->first();
    $this->assertNotNull($order);
    $this->assertMatchesRegularExpression('/^ORD - \d{6}$/', $order->order_number);
    $this->assertEquals($customer->id, $order->customer_id);
    $this->assertEquals($branch->id, $order->branch_id);
    $this->assertEquals('draft', $order->status);
    $this->assertEquals('VIP table', $order->customer_note);

    $this->assertCount(1, $order->items);
    $this->assertDatabaseHas('order_items', [
        'order_id' => $order->id,
        'menu_item_id' => $menuItem->id,
        'quantity' => 2,
        'unit_price' => '1500.00',
        'total_price' => '2800.00',
        'notes' => 'No sauce',
    ]);

    $this->assertDatabaseHas('orders', [
        'id' => $order->id,
        'subtotal' => '3000.00',
        'discount_total' => '200.00',
        'tax_total' => '420.00',
        'service_charge_total' => '300.00',
        'grand_total' => '3520.00',
        'payment_status' => 'unpaid',
    ]);
});
