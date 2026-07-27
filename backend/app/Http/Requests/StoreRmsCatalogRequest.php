<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreRmsCatalogRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $resource = explode('.', (string) $this->route()?->getName())[0];
        $required = $this->isMethod('post') ? 'required' : 'sometimes';
        $commonActive = ['is_active' => ['sometimes', 'boolean'], 'sort_order' => ['sometimes', 'integer', 'min:0']];
        $rules = [
            'menu-item-variants' => ['menu_item_id' => [$required, 'integer', 'exists:menu_items,id'], 'name' => [$required, 'string', 'max:255'], 'sku' => ['nullable', 'string', 'max:255'], 'price' => [$required, 'numeric', 'min:0'], 'cost' => ['nullable', 'numeric', 'min:0'], 'is_default' => ['sometimes', 'boolean']] + $commonActive,
            'attributes' => ['name' => [$required, 'string', 'max:255'], 'display_name' => [$required, 'string', 'max:255']] + $commonActive,
            'attribute-values' => ['attribute_id' => [$required, 'integer', 'exists:attributes,id'], 'value' => [$required, 'string', 'max:255'], 'display_value' => ['nullable', 'string', 'max:255'], 'sort_order' => ['sometimes', 'integer', 'min:0']],
            'variant-attributes' => ['menu_item_variant_id' => [$required, 'integer', 'exists:menu_item_variants,id'], 'attribute_id' => [$required, 'integer', 'exists:attributes,id'], 'attribute_value_id' => [$required, 'integer', 'exists:attribute_values,id']],
            'modifier-groups' => ['name' => [$required, 'string', 'max:255'], 'minimum_selections' => ['sometimes', 'integer', 'min:0'], 'maximum_selections' => ['sometimes', 'integer', 'min:1'], 'is_required' => ['sometimes', 'boolean']] + $commonActive,
            'modifier-options' => ['modifier_group_id' => [$required, 'integer', 'exists:modifier_groups,id'], 'name' => [$required, 'string', 'max:255'], 'price_adjustment' => ['sometimes', 'numeric'], 'is_default' => ['sometimes', 'boolean']] + $commonActive,
            'menu-item-modifier-groups' => ['menu_item_id' => [$required, 'integer', 'exists:menu_items,id'], 'modifier_group_id' => [$required, 'integer', 'exists:modifier_groups,id'], 'sort_order' => ['sometimes', 'integer', 'min:0']],
            'reservation-tables' => ['reservation_id' => [$required, 'integer', 'exists:reservations,id'], 'restaurant_table_id' => [$required, 'integer', 'exists:restaurant_tables,id']],
            'restaurant-sections' => ['branch_id' => [$required, 'integer', 'exists:branches,id'], 'name' => [$required, 'string', 'max:255'], 'code' => ['nullable', 'string', 'max:255']] + $commonActive,
            'restaurant-floors' => ['branch_id' => [$required, 'integer', 'exists:branches,id'], 'name' => [$required, 'string', 'max:255'], 'code' => ['nullable', 'string', 'max:255'], 'level' => ['sometimes', 'integer']] + $commonActive,
            'taxes' => ['branch_id' => ['nullable', 'integer', 'exists:branches,id'], 'name' => [$required, 'string', 'max:255'], 'code' => [$required, 'string', 'max:255'], 'type' => ['sometimes', Rule::in(['percentage', 'fixed'])], 'rate' => [$required, 'numeric', 'min:0'], 'is_inclusive' => ['sometimes', 'boolean'], 'is_active' => ['sometimes', 'boolean'], 'effective_from' => ['nullable', 'date'], 'effective_to' => ['nullable', 'date', 'after_or_equal:effective_from']],
            'branch-menu-items' => ['branch_id' => [$required, 'integer', 'exists:branches,id'], 'menu_item_id' => [$required, 'integer', 'exists:menu_items,id'], 'price' => ['nullable', 'numeric', 'min:0'], 'is_available' => ['sometimes', 'boolean'], 'available_from' => ['nullable', 'date'], 'available_until' => ['nullable', 'date', 'after:available_from']],
            'pos-terminals' => ['branch_id' => [$required, 'integer', 'exists:branches,id'], 'name' => [$required, 'string', 'max:255'], 'code' => [$required, 'string', 'max:255'], 'device_identifier' => ['nullable', 'string', 'max:255'], 'is_active' => ['sometimes', 'boolean'], 'last_seen_at' => ['nullable', 'date']],
            'cashier-shifts' => ['branch_id' => [$required, 'integer', 'exists:branches,id'], 'pos_terminal_id' => [$required, 'integer', 'exists:pos_terminals,id'], 'user_id' => [$required, 'integer', 'exists:users,id'], 'status' => ['sometimes', Rule::in(['open', 'closed'])], 'opened_at' => [$required, 'date'], 'closed_at' => ['nullable', 'date', 'after_or_equal:opened_at'], 'opening_cash' => ['sometimes', 'numeric', 'min:0'], 'expected_cash' => ['nullable', 'numeric', 'min:0'], 'closing_cash' => ['nullable', 'numeric', 'min:0'], 'cash_variance' => ['nullable', 'numeric'], 'notes' => ['nullable', 'string']],
            'customer-addresses' => ['customer_id' => [$required, 'integer', 'exists:customers,id'], 'label' => ['nullable', 'string', 'max:255'], 'contact_name' => ['nullable', 'string', 'max:255'], 'phone' => ['nullable', 'string', 'max:30'], 'address_line_1' => [$required, 'string', 'max:255'], 'address_line_2' => ['nullable', 'string', 'max:255'], 'city' => [$required, 'string', 'max:255'], 'state' => ['nullable', 'string', 'max:255'], 'postal_code' => ['nullable', 'string', 'max:30'], 'country' => ['sometimes', 'string', 'size:2'], 'latitude' => ['nullable', 'numeric', 'between:-90,90'], 'longitude' => ['nullable', 'numeric', 'between:-180,180'], 'delivery_instructions' => ['nullable', 'string'], 'is_default' => ['sometimes', 'boolean']],
            'printers' => ['branch_id' => [$required, 'integer', 'exists:branches,id'], 'name' => [$required, 'string', 'max:255'], 'type' => ['sometimes', Rule::in(['network', 'usb', 'bluetooth'])], 'ip_address' => ['nullable', 'ip'], 'port' => ['nullable', 'integer', 'between:1,65535'], 'connection_identifier' => ['nullable', 'string', 'max:255'], 'is_active' => ['sometimes', 'boolean']],
            'permissions' => ['name' => [$required, 'string', 'max:255'], 'display_name' => [$required, 'string', 'max:255'], 'group' => ['nullable', 'string', 'max:255'], 'description' => ['nullable', 'string']],
            'reason-codes' => ['branch_id' => ['nullable', 'integer', 'exists:branches,id'], 'category' => [$required, Rule::in(['void', 'refund', 'discount', 'cancellation', 'waste'])], 'code' => [$required, 'string', 'max:255'], 'label' => [$required, 'string', 'max:255'], 'requires_note' => ['sometimes', 'boolean'], 'is_active' => ['sometimes', 'boolean']],
            'document-sequences' => ['branch_id' => ['nullable', 'integer', 'exists:branches,id'], 'document_type' => [$required, Rule::in(['order', 'bill', 'payment', 'reservation', 'kitchen_ticket'])], 'prefix' => ['sometimes', 'string', 'max:30'], 'next_number' => ['sometimes', 'integer', 'min:1'], 'padding' => ['sometimes', 'integer', 'between:1,20'], 'reset_period' => ['sometimes', Rule::in(['never', 'daily', 'monthly', 'yearly'])], 'last_reset_date' => ['nullable', 'date']],
        ];

        return $rules[$resource] ?? [];
    }
}
