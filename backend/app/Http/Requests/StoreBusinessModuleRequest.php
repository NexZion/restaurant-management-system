<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreBusinessModuleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'branch_id' => $this->user()?->branch_id,
            'created_by' => $this->user()?->id,
            'recorded_by' => $this->user()?->id,
        ]);
    }

    public function rules(): array
    {
        $resource = explode('.', (string) $this->route()?->getName())[0];
        $r = $this->isMethod('post') ? 'required' : 'sometimes';
        $rules = [
            'promotions' => ['branch_id' => [$r, 'exists:branches,id'], 'name' => [$r, 'string', 'max:255'], 'code' => ['nullable', 'string', 'max:100'], 'discount_type' => [$r, Rule::in(['percentage', 'fixed'])], 'discount_value' => [$r, 'numeric', 'min:0'], 'minimum_order_amount' => ['sometimes', 'numeric', 'min:0'], 'maximum_discount_amount' => ['nullable', 'numeric', 'min:0'], 'starts_at' => [$r, 'date'], 'ends_at' => [$r, 'date', 'after:starts_at'], 'is_active' => ['sometimes', 'boolean']],
            'coupons' => ['promotion_id' => [$r, 'exists:promotions,id'], 'code' => [$r, 'string', 'max:100'], 'usage_limit' => ['nullable', 'integer', 'min:1'], 'usage_limit_per_customer' => ['nullable', 'integer', 'min:1'], 'used_count' => ['sometimes', 'integer', 'min:0'], 'is_active' => ['sometimes', 'boolean'], 'expires_at' => ['nullable', 'date']],
            'reservation-deposits' => ['reservation_id' => [$r, 'exists:reservations,id'], 'payment_id' => ['nullable', 'exists:payments,id'], 'amount' => [$r, 'numeric', 'gt:0'], 'status' => ['sometimes', Rule::in(['pending', 'paid', 'applied', 'refunded', 'forfeited'])], 'paid_at' => ['nullable', 'date'], 'refunded_at' => ['nullable', 'date']],
            'inventory-items' => ['sku' => [$r, 'string', 'max:100'], 'name' => [$r, 'string', 'max:255'], 'unit' => [$r, 'string', 'max:30'], 'unit_cost' => ['sometimes', 'numeric', 'min:0'], 'reorder_level' => ['sometimes', 'numeric', 'min:0'], 'is_active' => ['sometimes', 'boolean']],
            'stock-levels' => ['branch_id' => [$r, 'exists:branches,id'], 'inventory_item_id' => [$r, 'exists:inventory_items,id'], 'quantity_on_hand' => ['sometimes', 'numeric'], 'quantity_reserved' => ['sometimes', 'numeric', 'min:0'], 'average_cost' => ['sometimes', 'numeric', 'min:0']],
            'stock-movements' => ['branch_id' => [$r, 'exists:branches,id'], 'inventory_item_id' => [$r, 'exists:inventory_items,id'], 'movement_type' => [$r, Rule::in(['receipt', 'sale', 'wastage', 'adjustment', 'transfer_in', 'transfer_out'])], 'quantity' => [$r, 'numeric', 'not_in:0'], 'unit_cost' => ['nullable', 'numeric', 'min:0'], 'reference_type' => ['nullable', 'string', 'max:255'], 'reference_id' => ['nullable', 'integer'], 'reason' => ['nullable', 'string'], 'created_by' => [$r, 'exists:users,id'], 'occurred_at' => [$r, 'date']],
            'suppliers' => ['code' => [$r, 'string', 'max:100'], 'name' => [$r, 'string', 'max:255'], 'contact_name' => ['nullable', 'string'], 'email' => ['nullable', 'email'], 'phone' => ['nullable', 'string', 'max:30'], 'address' => ['nullable', 'string'], 'tax_number' => ['nullable', 'string'], 'is_active' => ['sometimes', 'boolean']],
            'purchase-orders' => ['branch_id' => [$r, 'exists:branches,id'], 'supplier_id' => [$r, 'exists:suppliers,id'], 'purchase_order_number' => [$r, 'string', 'max:100'], 'status' => ['sometimes', Rule::in(['draft', 'approved', 'ordered', 'partial', 'received', 'cancelled'])], 'ordered_at' => ['nullable', 'date'], 'expected_at' => ['nullable', 'date'], 'subtotal' => ['sometimes', 'numeric', 'min:0'], 'tax' => ['sometimes', 'numeric', 'min:0'], 'total' => ['sometimes', 'numeric', 'min:0'], 'notes' => ['nullable', 'string'], 'created_by' => [$r, 'exists:users,id']],
            'purchase-order-items' => ['purchase_order_id' => [$r, 'exists:purchase_orders,id'], 'inventory_item_id' => [$r, 'exists:inventory_items,id'], 'quantity' => [$r, 'numeric', 'gt:0'], 'received_quantity' => ['sometimes', 'numeric', 'min:0'], 'unit_cost' => [$r, 'numeric', 'min:0'], 'total' => [$r, 'numeric', 'min:0']],
            'recipes' => ['menu_item_id' => [$r, 'exists:menu_items,id'], 'menu_item_variant_id' => ['nullable', 'exists:menu_item_variants,id'], 'yield_quantity' => ['sometimes', 'numeric', 'gt:0'], 'yield_unit' => ['sometimes', 'string', 'max:30'], 'instructions' => ['nullable', 'string'], 'is_active' => ['sometimes', 'boolean']],
            'recipe-ingredients' => ['recipe_id' => [$r, 'exists:recipes,id'], 'inventory_item_id' => [$r, 'exists:inventory_items,id'], 'quantity' => [$r, 'numeric', 'gt:0'], 'unit' => [$r, 'string', 'max:30'], 'waste_percentage' => ['sometimes', 'numeric', 'between:0,100']],
            'wastages' => ['branch_id' => [$r, 'exists:branches,id'], 'inventory_item_id' => [$r, 'exists:inventory_items,id'], 'quantity' => [$r, 'numeric', 'gt:0'], 'unit_cost' => [$r, 'numeric', 'min:0'], 'reason_code' => ['nullable', 'string', 'max:100'], 'notes' => ['nullable', 'string'], 'recorded_by' => [$r, 'exists:users,id'], 'recorded_at' => [$r, 'date']],
            'loyalty-transactions' => ['customer_id' => [$r, 'exists:customers,id'], 'order_id' => ['nullable', 'exists:orders,id'], 'type' => [$r, Rule::in(['earn', 'redeem', 'adjustment', 'expiry'])], 'points' => [$r, 'integer', 'not_in:0'], 'balance_after' => [$r, 'integer', 'min:0'], 'description' => ['nullable', 'string'], 'occurred_at' => [$r, 'date']],
            'accounts' => ['parent_id' => ['nullable', 'exists:accounts,id'], 'code' => [$r, 'string', 'max:100'], 'name' => [$r, 'string', 'max:255'], 'type' => [$r, Rule::in(['asset', 'liability', 'equity', 'revenue', 'expense'])], 'is_active' => ['sometimes', 'boolean']],
            'journal-entries' => ['branch_id' => [$r, 'exists:branches,id'], 'entry_number' => [$r, 'string', 'max:100'], 'entry_date' => [$r, 'date'], 'reference_type' => ['nullable', 'string', 'max:255'], 'reference_id' => ['nullable', 'integer'], 'description' => [$r, 'string'], 'status' => ['sometimes', Rule::in(['draft', 'posted', 'reversed'])], 'created_by' => [$r, 'exists:users,id'], 'posted_by' => ['nullable', 'exists:users,id'], 'posted_at' => ['nullable', 'date']],
            'journal-entry-lines' => ['journal_entry_id' => [$r, 'exists:journal_entries,id'], 'account_id' => [$r, 'exists:accounts,id'], 'debit' => ['sometimes', 'numeric', 'min:0'], 'credit' => ['sometimes', 'numeric', 'min:0'], 'memo' => ['nullable', 'string']],
        ];

        return $rules[$resource] ?? [];
    }
}
