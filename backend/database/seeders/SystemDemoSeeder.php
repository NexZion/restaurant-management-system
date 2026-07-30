<?php

namespace Database\Seeders;

use App\Models\Account;
use App\Models\Branch;
use App\Models\BranchMenuItem;
use App\Models\CashierShift;
use App\Models\Customer;
use App\Models\CustomerAddress;
use App\Models\DocumentSequence;
use App\Models\InventoryItem;
use App\Models\JournalEntry;
use App\Models\JournalEntryLine;
use App\Models\KitchenStation;
use App\Models\KitchenTicket;
use App\Models\KitchenTicketItem;
use App\Models\MenuCategory;
use App\Models\MenuItem;
use App\Models\Order;
use App\Models\OrderBill;
use App\Models\OrderItem;
use App\Models\PaymentMethod;
use App\Models\Permission;
use App\Models\PosTerminal;
use App\Models\ReasonCode;
use App\Models\Reservation;
use App\Models\RestaurantFloor;
use App\Models\RestaurantSection;
use App\Models\RestaurantTable;
use App\Models\Role;
use App\Models\StockLevel;
use App\Models\Supplier;
use App\Models\Tax;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class SystemDemoSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function (): void {
            $branch = Branch::updateOrCreate(
                ['code' => 'CMB-001'],
                [
                    'name' => 'Colombo Demo Restaurant', 'slug' => 'colombo-demo-restaurant',
                    'address_line1' => '100 Galle Road', 'city' => 'Colombo',
                    'country' => 'Sri Lanka', 'phone' => '0112345678',
                    'email' => 'colombo@rms.test', 'branch_type' => 'restaurant',
                    'has_dining' => true, 'has_rooms' => false, 'has_delivery' => true,
                    'opening_time' => '08:00:00', 'closing_time' => '23:00:00',
                    'timezone' => 'Asia/Colombo', 'status' => 'active',
                ],
            );

            $roles = $this->seedRoles();
            $permissions = $this->seedPermissions();
            $this->assignPermissions($roles, $permissions);
            $users = $this->seedUsers($branch, $roles);

            $floor = RestaurantFloor::updateOrCreate(
                ['branch_id' => $branch->id, 'code' => 'GF'],
                ['name' => 'Ground Floor', 'level' => 0, 'sort_order' => 1, 'is_active' => true],
            );
            $section = RestaurantSection::updateOrCreate(
                ['branch_id' => $branch->id, 'code' => 'MAIN'],
                ['name' => 'Main Dining', 'sort_order' => 1, 'is_active' => true],
            );
            $table = RestaurantTable::updateOrCreate(
                ['branch_id' => $branch->id, 'table_number' => 'T01'],
                ['capacity' => 4, 'table_type' => 'normal', 'section' => 'Main Dining', 'section_id' => $section->id, 'floor_id' => $floor->id, 'status' => 'available'],
            );
            RestaurantTable::updateOrCreate(
                ['branch_id' => $branch->id, 'table_number' => 'T02'],
                ['capacity' => 2, 'table_type' => 'normal', 'section' => 'Main Dining', 'section_id' => $section->id, 'floor_id' => $floor->id, 'status' => 'available'],
            );

            $customer = Customer::updateOrCreate(
                ['customer_code' => 'CUS-DEMO-001'],
                ['first_name' => 'Nimal', 'last_name' => 'Perera', 'email' => 'customer@rms.test', 'phone' => '0771001001', 'city' => 'Colombo', 'customer_type' => 'regular', 'loyalty_points' => 150, 'total_spend' => 12500, 'receipt_count' => 4, 'status' => 'active', 'is_active' => true],
            );
            CustomerAddress::updateOrCreate(
                ['customer_id' => $customer->id, 'label' => 'Home'],
                ['contact_name' => 'Nimal Perera', 'phone' => '0771001001', 'address_line_1' => '25 Flower Road', 'city' => 'Colombo', 'country' => 'LK', 'is_default' => true],
            );
            Reservation::updateOrCreate(
                ['reservation_number' => 'RES-DEMO-001'],
                ['branch_id' => $branch->id, 'customer_id' => $customer->id, 'reservation_date' => now()->addDay()->toDateString(), 'start_time' => '19:00:00', 'end_time' => '21:00:00', 'guest_count' => 4, 'status' => 'confirmed', 'guest_name' => 'Nimal Perera', 'guest_phone' => '0771001001', 'source' => 'phone', 'confirmed_at' => now(), 'created_by' => $users['reception']->id],
            );

            $category = MenuCategory::updateOrCreate(
                ['name' => 'Main Courses'],
                ['description' => 'Popular made-to-order meals', 'display_order' => 1, 'status' => 'active'],
            );
            $burger = MenuItem::updateOrCreate(
                ['sku' => 'FOOD-BURGER-01'],
                ['menu_category_id' => $category->id, 'name' => 'Classic Beef Burger', 'slug' => 'classic-beef-burger', 'short_description' => 'Beef patty, cheese and house sauce', 'base_price' => 1450, 'preparation_time' => 15, 'display_order' => 1, 'status' => 'active'],
            );
            $rice = MenuItem::updateOrCreate(
                ['sku' => 'FOOD-RICE-01'],
                ['menu_category_id' => $category->id, 'name' => 'Chicken Fried Rice', 'slug' => 'chicken-fried-rice', 'short_description' => 'Wok-fried rice with chicken', 'base_price' => 1100, 'preparation_time' => 12, 'display_order' => 2, 'status' => 'active'],
            );
            foreach ([$burger, $rice] as $item) {
                BranchMenuItem::updateOrCreate(
                    ['branch_id' => $branch->id, 'menu_item_id' => $item->id],
                    ['price' => $item->base_price, 'is_available' => true],
                );
            }

            $terminal = PosTerminal::updateOrCreate(
                ['branch_id' => $branch->id, 'code' => 'POS-01'],
                ['name' => 'Main Cashier', 'device_identifier' => 'DEMO-POS-01', 'is_active' => true],
            );
            foreach ([['CASH', 'Cash'], ['CARD', 'Card'], ['WALLET', 'Digital Wallet']] as [$code, $name]) {
                PaymentMethod::updateOrCreate(
                    ['branch_id' => $branch->id, 'code' => $code],
                    ['name' => $name, 'type' => strtolower($code), 'is_cash' => $code === 'CASH', 'is_active' => true, 'requires_reference' => $code !== 'CASH'],
                );
            }
            CashierShift::updateOrCreate(
                ['pos_terminal_id' => $terminal->id, 'status' => 'open'],
                ['branch_id' => $branch->id, 'user_id' => $users['cashier']->id, 'opened_at' => now()->subHours(2), 'opening_cash' => 10000, 'notes' => 'Demo shift'],
            );
            $station = KitchenStation::updateOrCreate(
                ['branch_id' => $branch->id, 'code' => 'HOT'],
                ['name' => 'Hot Kitchen', 'display_order' => 1, 'status' => 'active'],
            );

            $order = Order::updateOrCreate(
                ['order_number' => 'ORD-DEMO-001'],
                ['branch_id' => $branch->id, 'table_id' => $table->id, 'customer_id' => $customer->id, 'created_by' => $users['waiter']->id, 'waiter_id' => $users['waiter']->id, 'order_type' => 'dining', 'order_source' => 'pos', 'status' => 'served', 'payment_status' => 'unpaid', 'guest_count' => 2, 'priority' => 'normal', 'accepted_at' => now()->subMinutes(30), 'preparing_at' => now()->subMinutes(25), 'ready_at' => now()->subMinutes(10), 'served_at' => now()->subMinutes(5)],
            );
            $orderItem = OrderItem::updateOrCreate(
                ['order_id' => $order->id, 'menu_item_id' => $burger->id],
                ['menu_item_name_snapshot' => $burger->name, 'sku_snapshot' => $burger->sku, 'quantity' => 2, 'unit_price' => 1450, 'unit_cost' => 700, 'tax_rate' => 0, 'total_price' => 2900, 'status' => 'served', 'served_quantity' => 2, 'kitchen_station_id' => $station->id, 'created_by' => $users['waiter']->id, 'prepared_at' => now()->subMinutes(10), 'ready_at' => now()->subMinutes(8), 'served_at' => now()->subMinutes(5)],
            );
            OrderBill::updateOrCreate(
                ['order_id' => $order->id, 'split_number' => 0],
                ['bill_number' => 'BILL-DEMO-001', 'subtotal' => 2900, 'discount' => 0, 'tax' => 0, 'service_charge' => 0, 'rounding_amount' => 0, 'grand_total' => 2900, 'paid_amount' => 0, 'balance_due' => 2900, 'bill_status' => 'unpaid', 'generated_by' => $users['cashier']->id, 'generated_at' => now()],
            );

            $kitchenOrder = Order::updateOrCreate(
                ['order_number' => 'ORD-DEMO-KDS'],
                ['branch_id' => $branch->id, 'table_id' => $table->id, 'created_by' => $users['waiter']->id, 'waiter_id' => $users['waiter']->id, 'order_type' => 'dining', 'order_source' => 'pos', 'status' => 'preparing', 'payment_status' => 'unpaid', 'guest_count' => 3, 'priority' => 'high', 'accepted_at' => now()->subMinutes(8), 'preparing_at' => now()->subMinutes(6)],
            );
            $kitchenItem = OrderItem::updateOrCreate(
                ['order_id' => $kitchenOrder->id, 'menu_item_id' => $rice->id],
                ['menu_item_name_snapshot' => $rice->name, 'sku_snapshot' => $rice->sku, 'quantity' => 2, 'unit_price' => 1100, 'unit_cost' => 500, 'tax_rate' => 0, 'total_price' => 2200, 'status' => 'cooking', 'kitchen_station_id' => $station->id, 'created_by' => $users['waiter']->id],
            );
            $ticket = KitchenTicket::updateOrCreate(
                ['ticket_number' => 'KIT-DEMO-001'],
                ['order_id' => $kitchenOrder->id, 'branch_id' => $branch->id, 'kitchen_station_id' => $station->id, 'status' => 'cooking', 'priority' => 'high', 'generated_by' => $users['waiter']->id, 'generated_at' => now()->subMinutes(7), 'started_at' => now()->subMinutes(6)],
            );
            KitchenTicketItem::updateOrCreate(
                ['kitchen_ticket_id' => $ticket->id, 'order_item_id' => $kitchenItem->id],
                ['quantity' => 2, 'status' => 'cooking', 'notes' => 'One portion without chilli'],
            );

            $this->seedInventoryAndAccounting($branch, $users['inventory'], $users['accountant']);
            $this->seedSystemSettings($branch);
            $this->seedExtendedSystemData($branch, $users, $customer, $burger, $rice, $terminal, $station);
        });
    }

    private function seedRoles(): array
    {
        $definitions = [
            'viewer' => ['Viewer', 10], 'reception' => ['Reception', 20],
            'waiter' => ['Waiter', 30], 'cashier' => ['Cashier', 40],
            'kitchen' => ['Kitchen', 50], 'inventory' => ['Inventory', 60],
            'accountant' => ['Accountant', 70], 'manager' => ['Manager', 80],
            'admin' => ['Admin', 90], 'super_admin' => ['Super Admin', 100],
        ];
        $roles = [];
        foreach ($definitions as $key => [$name, $level]) {
            $roles[$key] = Role::updateOrCreate(['name' => $name], ['access_level' => $level, 'description' => "{$name} demo access"]);
        }

        return $roles;
    }

    private function seedPermissions(): array
    {
        $names = [
            'dashboard.view', 'catalog.manage', 'roles.manage', 'users.manage', 'branches.manage',
            'customers.manage', 'menu.manage', 'tables.manage', 'reservations.manage', 'kitchen.manage',
            'payments.manage', 'refunds.manage', 'orders.manage', 'orders.status', 'orders.transfer',
            'orders.merge', 'bills.manage', 'bills.split', 'discounts.manage', 'shifts.manage',
            'audit-logs.view', 'inventory-items.manage', 'stock-levels.manage', 'stock-movements.manage',
            'wastages.manage', 'suppliers.manage', 'purchase-orders.manage', 'purchase-order-items.manage',
            'recipes.manage', 'recipe-ingredients.manage', 'promotions.manage', 'coupons.manage',
            'reservation-deposits.manage', 'loyalty-transactions.manage', 'accounts.manage',
            'journal-entries.manage',
        ];
        $permissions = [];
        foreach ($names as $name) {
            [$group] = explode('.', $name);
            $permissions[$name] = Permission::updateOrCreate(
                ['name' => $name],
                ['display_name' => ucwords(str_replace(['-', '.', '_'], ' ', $name)), 'group' => $group],
            );
        }

        return $permissions;
    }

    private function assignPermissions(array $roles, array $permissions): void
    {
        $sets = [
            'viewer' => ['dashboard.view'],
            'reception' => ['dashboard.view', 'catalog.manage', 'customers.manage', 'tables.manage', 'reservations.manage'],
            'waiter' => ['catalog.manage', 'customers.manage', 'tables.manage', 'reservations.manage', 'orders.manage', 'orders.status'],
            'cashier' => ['catalog.manage', 'orders.manage', 'bills.manage', 'bills.split', 'payments.manage', 'refunds.manage', 'shifts.manage'],
            'kitchen' => ['catalog.manage', 'kitchen.manage', 'orders.status'],
            'inventory' => ['catalog.manage', 'menu.manage', 'inventory-items.manage', 'stock-levels.manage', 'stock-movements.manage', 'wastages.manage', 'suppliers.manage', 'purchase-orders.manage', 'purchase-order-items.manage', 'recipes.manage', 'recipe-ingredients.manage'],
            'accountant' => ['dashboard.view', 'payments.manage', 'refunds.manage', 'discounts.manage', 'promotions.manage', 'coupons.manage', 'accounts.manage', 'journal-entries.manage'],
        ];
        $allIds = collect($permissions)->pluck('id')->all();
        foreach ($roles as $key => $role) {
            $ids = in_array($key, ['manager', 'admin', 'super_admin'], true)
                ? $allIds
                : collect($sets[$key] ?? [])->map(fn (string $name) => $permissions[$name]->id)->all();
            $role->permissions()->sync($ids);
        }
    }

    private function seedUsers(Branch $branch, array $roles): array
    {
        $users = [];
        $pins = ['waiter' => '3030', 'cashier' => '4040', 'kitchen' => '5050'];
        foreach ($roles as $key => $role) {
            $username = str_replace('_', '', $key);
            $users[$key] = User::updateOrCreate(
                ['username' => $username],
                ['name' => $role->name.' Demo', 'email' => "{$username}@rms.test", 'phone' => '077'.str_pad((string) $role->access_level, 7, '0', STR_PAD_LEFT), 'password' => Hash::make('Password@123'), 'pin' => $pins[$key] ?? null, 'role_id' => $role->id, 'branch_id' => $branch->id, 'address' => 'Colombo', 'status' => 'active', 'failed_attempts' => 0, 'is_locked' => false],
            );
        }

        return $users;
    }

    private function seedInventoryAndAccounting(Branch $branch, User $inventoryUser, User $accountant): void
    {
        $item = InventoryItem::updateOrCreate(['sku' => 'INV-RICE-001'], ['name' => 'Basmati Rice', 'unit' => 'kg', 'unit_cost' => 650, 'reorder_level' => 20, 'is_active' => true]);
        StockLevel::updateOrCreate(['branch_id' => $branch->id, 'inventory_item_id' => $item->id], ['quantity_on_hand' => 75, 'quantity_reserved' => 5, 'average_cost' => 650]);
        Supplier::updateOrCreate(['code' => 'SUP-DEMO-001'], ['name' => 'Colombo Food Supplies', 'contact_name' => 'Kasun Silva', 'email' => 'supplier@rms.test', 'phone' => '0772223344', 'address' => 'Pettah, Colombo', 'is_active' => true]);
        $cash = Account::updateOrCreate(['code' => '1000'], ['name' => 'Cash on Hand', 'type' => 'asset', 'is_active' => true]);
        $sales = Account::updateOrCreate(['code' => '4000'], ['name' => 'Food Sales', 'type' => 'revenue', 'is_active' => true]);
        $entry = JournalEntry::updateOrCreate(['entry_number' => 'JE-DEMO-001'], ['branch_id' => $branch->id, 'entry_date' => now()->toDateString(), 'description' => 'Demo opening transaction', 'status' => 'draft', 'created_by' => $accountant->id]);
        JournalEntryLine::updateOrCreate(['journal_entry_id' => $entry->id, 'account_id' => $cash->id], ['debit' => 5000, 'credit' => 0, 'memo' => 'Demo cash']);
        JournalEntryLine::updateOrCreate(['journal_entry_id' => $entry->id, 'account_id' => $sales->id], ['debit' => 0, 'credit' => 5000, 'memo' => 'Demo sales']);
    }

    private function seedSystemSettings(Branch $branch): void
    {
        Tax::updateOrCreate(['branch_id' => $branch->id, 'code' => 'VAT'], ['name' => 'VAT', 'type' => 'percentage', 'rate' => 18, 'is_inclusive' => false, 'is_active' => true, 'effective_from' => now()->startOfYear()->toDateString()]);
        foreach (['order' => 'ORD-', 'bill' => 'BILL-', 'payment' => 'PAY-', 'reservation' => 'RES-', 'kitchen_ticket' => 'KIT-'] as $type => $prefix) {
            DocumentSequence::updateOrCreate(['branch_id' => $branch->id, 'document_type' => $type], ['prefix' => $prefix, 'next_number' => 100, 'padding' => 6, 'reset_period' => 'never']);
        }
        foreach ([['void', 'VOID', 'Order void'], ['refund', 'REFUND', 'Customer refund'], ['waste', 'WASTE', 'Kitchen wastage']] as [$category, $code, $label]) {
            ReasonCode::updateOrCreate(['branch_id' => $branch->id, 'category' => $category, 'code' => $code], ['label' => $label, 'requires_note' => true, 'is_active' => true]);
        }
    }

    private function seedExtendedSystemData(
        Branch $branch,
        array $users,
        Customer $customer,
        MenuItem $burger,
        MenuItem $rice,
        PosTerminal $terminal,
        KitchenStation $station,
    ): void {
        $now = now();

        $desserts = MenuCategory::updateOrCreate(
            ['name' => 'Desserts'],
            ['description' => 'Desserts and sweets', 'display_order' => 2, 'status' => 'active'],
        );
        $cake = MenuItem::updateOrCreate(
            ['sku' => 'FOOD-CAKE-01'],
            ['menu_category_id' => $desserts->id, 'name' => 'Chocolate Lava Cake', 'slug' => 'chocolate-lava-cake', 'short_description' => 'Warm chocolate cake', 'base_price' => 850, 'preparation_time' => 10, 'display_order' => 1, 'status' => 'active'],
        );
        BranchMenuItem::updateOrCreate(['branch_id' => $branch->id, 'menu_item_id' => $cake->id], ['price' => 850, 'is_available' => true]);

        DB::table('attributes')->updateOrInsert(
            ['name' => 'size'],
            ['display_name' => 'Size', 'is_active' => true, 'sort_order' => 1, 'created_at' => $now, 'updated_at' => $now],
        );
        $attributeId = DB::table('attributes')->where('name', 'size')->value('id');
        foreach ([['regular', 'Regular', 1], ['large', 'Large', 2]] as [$value, $display, $sort]) {
            DB::table('attribute_values')->updateOrInsert(
                ['attribute_id' => $attributeId, 'value' => $value],
                ['display_value' => $display, 'sort_order' => $sort, 'created_at' => $now, 'updated_at' => $now],
            );
        }
        DB::table('menu_item_variants')->updateOrInsert(
            ['menu_item_id' => $burger->id, 'sku' => 'FOOD-BURGER-LG'],
            ['name' => 'Large', 'price' => 1750, 'cost' => 850, 'is_default' => false, 'is_active' => true, 'sort_order' => 2, 'created_at' => $now, 'updated_at' => $now],
        );
        $variantId = DB::table('menu_item_variants')->where('sku', 'FOOD-BURGER-LG')->value('id');
        $largeValueId = DB::table('attribute_values')->where(['attribute_id' => $attributeId, 'value' => 'large'])->value('id');
        DB::table('variant_attributes')->updateOrInsert(
            ['menu_item_variant_id' => $variantId, 'attribute_id' => $attributeId],
            ['attribute_value_id' => $largeValueId, 'created_at' => $now, 'updated_at' => $now],
        );

        DB::table('modifier_groups')->updateOrInsert(
            ['name' => 'Burger Extras'],
            ['minimum_selections' => 0, 'maximum_selections' => 3, 'is_required' => false, 'is_active' => true, 'sort_order' => 1, 'created_at' => $now, 'updated_at' => $now],
        );
        $modifierGroupId = DB::table('modifier_groups')->where('name', 'Burger Extras')->value('id');
        foreach ([['Extra Cheese', 250], ['Bacon', 350], ['Jalapeno', 100]] as [$name, $price]) {
            DB::table('modifier_options')->updateOrInsert(
                ['modifier_group_id' => $modifierGroupId, 'name' => $name],
                ['price_adjustment' => $price, 'is_default' => false, 'is_active' => true, 'sort_order' => 1, 'created_at' => $now, 'updated_at' => $now],
            );
        }
        DB::table('menu_item_modifier_groups')->updateOrInsert(
            ['menu_item_id' => $burger->id, 'modifier_group_id' => $modifierGroupId],
            ['sort_order' => 1, 'created_at' => $now, 'updated_at' => $now],
        );

        foreach ([
            ['INV-BEEF-001', 'Beef Patties', 'pcs', 480, 20, 55],
            ['INV-CHICKEN-001', 'Chicken', 'kg', 1250, 15, 8],
            ['INV-CHEESE-001', 'Cheese Slices', 'pcs', 120, 30, 18],
        ] as [$sku, $name, $unit, $cost, $reorder, $quantity]) {
            $inventory = InventoryItem::updateOrCreate(['sku' => $sku], ['name' => $name, 'unit' => $unit, 'unit_cost' => $cost, 'reorder_level' => $reorder, 'is_active' => true]);
            StockLevel::updateOrCreate(['branch_id' => $branch->id, 'inventory_item_id' => $inventory->id], ['quantity_on_hand' => $quantity, 'quantity_reserved' => 2, 'average_cost' => $cost]);
            DB::table('stock_movements')->updateOrInsert(
                ['branch_id' => $branch->id, 'inventory_item_id' => $inventory->id, 'reference_type' => 'demo_opening'],
                ['movement_type' => 'receipt', 'quantity' => $quantity, 'unit_cost' => $cost, 'reason' => 'Demo opening stock', 'created_by' => $users['inventory']->id, 'occurred_at' => $now->copy()->subDays(2), 'created_at' => $now, 'updated_at' => $now],
            );
        }
        $beefId = DB::table('inventory_items')->where('sku', 'INV-BEEF-001')->value('id');
        DB::table('recipes')->updateOrInsert(
            ['menu_item_id' => $burger->id, 'menu_item_variant_id' => null],
            ['yield_quantity' => 1, 'yield_unit' => 'portion', 'instructions' => 'Grill patty and assemble burger.', 'is_active' => true, 'created_at' => $now, 'updated_at' => $now],
        );
        $recipeId = DB::table('recipes')->where('menu_item_id', $burger->id)->whereNull('menu_item_variant_id')->value('id');
        DB::table('recipe_ingredients')->updateOrInsert(
            ['recipe_id' => $recipeId, 'inventory_item_id' => $beefId],
            ['quantity' => 1, 'unit' => 'pcs', 'waste_percentage' => 2, 'created_at' => $now, 'updated_at' => $now],
        );

        DB::table('promotions')->updateOrInsert(
            ['branch_id' => $branch->id, 'code' => 'LUNCH10'],
            ['name' => 'Lunch Special', 'discount_type' => 'percentage', 'discount_value' => 10, 'minimum_order_amount' => 1000, 'maximum_discount_amount' => 500, 'starts_at' => $now->copy()->subDays(7), 'ends_at' => $now->copy()->addMonths(2), 'is_active' => true, 'created_at' => $now, 'updated_at' => $now],
        );
        $promotionId = DB::table('promotions')->where(['branch_id' => $branch->id, 'code' => 'LUNCH10'])->value('id');
        DB::table('coupons')->updateOrInsert(
            ['code' => 'WELCOME10'],
            ['promotion_id' => $promotionId, 'usage_limit' => 100, 'usage_limit_per_customer' => 1, 'used_count' => 2, 'is_active' => true, 'expires_at' => $now->copy()->addMonth(), 'created_at' => $now, 'updated_at' => $now],
        );

        $supplierId = DB::table('suppliers')->where('code', 'SUP-DEMO-001')->value('id');
        DB::table('purchase_orders')->updateOrInsert(
            ['branch_id' => $branch->id, 'purchase_order_number' => 'PO-DEMO-001'],
            ['supplier_id' => $supplierId, 'status' => 'ordered', 'ordered_at' => $now->copy()->subDay()->toDateString(), 'expected_at' => $now->copy()->addDay()->toDateString(), 'subtotal' => 24000, 'tax' => 0, 'total' => 24000, 'notes' => 'Demo order ready for partial receiving', 'created_by' => $users['inventory']->id, 'created_at' => $now, 'updated_at' => $now],
        );
        $poId = DB::table('purchase_orders')->where(['branch_id' => $branch->id, 'purchase_order_number' => 'PO-DEMO-001'])->value('id');
        DB::table('purchase_order_items')->updateOrInsert(
            ['purchase_order_id' => $poId, 'inventory_item_id' => $beefId],
            ['quantity' => 50, 'received_quantity' => 10, 'unit_cost' => 480, 'total' => 24000, 'created_at' => $now, 'updated_at' => $now],
        );

        $completed = Order::updateOrCreate(
            ['order_number' => 'ORD-DEMO-PAID'],
            ['branch_id' => $branch->id, 'customer_id' => $customer->id, 'created_by' => $users['waiter']->id, 'waiter_id' => $users['waiter']->id, 'cashier_id' => $users['cashier']->id, 'order_type' => 'takeaway', 'order_source' => 'pos', 'status' => 'completed', 'payment_status' => 'paid', 'guest_count' => 1, 'priority' => 'normal', 'accepted_at' => $now->copy()->subHour(), 'completed_at' => $now->copy()->subMinutes(30)],
        );
        OrderItem::updateOrCreate(
            ['order_id' => $completed->id, 'menu_item_id' => $cake->id],
            ['menu_item_name_snapshot' => $cake->name, 'sku_snapshot' => $cake->sku, 'quantity' => 2, 'unit_price' => 850, 'unit_cost' => 350, 'total_price' => 1700, 'status' => 'served', 'served_quantity' => 2, 'kitchen_station_id' => $station->id, 'created_by' => $users['waiter']->id, 'served_at' => $now->copy()->subMinutes(35)],
        );
        $paidBill = OrderBill::updateOrCreate(
            ['order_id' => $completed->id, 'split_number' => 0],
            ['bill_number' => 'BILL-DEMO-PAID', 'subtotal' => 1700, 'discount' => 0, 'tax' => 0, 'service_charge' => 0, 'rounding_amount' => 0, 'grand_total' => 1700, 'paid_amount' => 1700, 'balance_due' => 0, 'bill_status' => 'paid', 'generated_by' => $users['cashier']->id, 'generated_at' => $now->copy()->subMinutes(40)],
        );
        $cashMethodId = DB::table('payment_methods')->where(['branch_id' => $branch->id, 'code' => 'CASH'])->value('id');
        $shiftId = DB::table('cashier_shifts')->where(['pos_terminal_id' => $terminal->id, 'status' => 'open'])->value('id');
        DB::table('payments')->updateOrInsert(
            ['payment_number' => 'PAY-DEMO-001'],
            ['order_bill_id' => $paidBill->id, 'payment_method_id' => $cashMethodId, 'payment_method' => 'cash', 'amount_paid' => 1700, 'amount_received' => 2000, 'change_amount' => 300, 'balance_amount' => 0, 'payment_status' => 'successful', 'paid_at' => $now->copy()->subMinutes(30), 'created_by' => $users['cashier']->id, 'pos_terminal_id' => $terminal->id, 'cashier_shift_id' => $shiftId, 'created_at' => $now, 'updated_at' => $now],
        );
        $paymentId = DB::table('payments')->where('payment_number', 'PAY-DEMO-001')->value('id');
        DB::table('refunds')->updateOrInsert(
            ['transaction_reference' => 'REF-DEMO-001'],
            ['payment_id' => $paymentId, 'order_bill_id' => $paidBill->id, 'amount' => 200, 'reason' => 'Demo partial refund', 'status' => 'processed', 'approved_by' => $users['manager']->id, 'processed_by' => $users['cashier']->id, 'processed_at' => $now, 'created_at' => $now, 'updated_at' => $now],
        );
        DB::table('loyalty_transactions')->updateOrInsert(
            ['customer_id' => $customer->id, 'order_id' => $completed->id, 'type' => 'earn'],
            ['points' => 17, 'balance_after' => 167, 'description' => 'Points earned from demo paid order', 'occurred_at' => $now, 'created_at' => $now, 'updated_at' => $now],
        );

        DB::table('printers')->updateOrInsert(
            ['branch_id' => $branch->id, 'name' => 'Kitchen Network Printer'],
            ['type' => 'network', 'ip_address' => '127.0.0.1', 'port' => 9100, 'connection_identifier' => 'DEMO-KITCHEN', 'is_active' => true, 'created_at' => $now, 'updated_at' => $now],
        );
        DB::table('audit_logs')->updateOrInsert(
            ['branch_id' => $branch->id, 'auditable_type' => Order::class, 'auditable_id' => $completed->id, 'action' => 'seeded'],
            ['user_id' => $users['super_admin']->id, 'old_values' => json_encode([]), 'new_values' => json_encode(['status' => 'completed']), 'ip_address' => '127.0.0.1', 'user_agent' => 'SystemDemoSeeder', 'created_at' => $now],
        );
    }
}
