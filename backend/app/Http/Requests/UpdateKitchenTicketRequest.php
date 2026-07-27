<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

class UpdateKitchenTicketRequest extends StoreKitchenTicketRequest
{
    public function rules(): array
    {
        return [
            'kitchen_station_id' => ['sometimes', 'exists:kitchen_stations,id'],
            'status' => ['sometimes', Rule::in(['pending', 'printed', 'cooking', 'ready', 'closed', 'cancelled'])],
            'priority' => ['sometimes', Rule::in(['normal', 'high', 'urgent'])],
            'started_at' => ['sometimes', 'nullable', 'date'],
            'ready_at' => ['sometimes', 'nullable', 'date'],
            'closed_at' => ['sometimes', 'nullable', 'date'],
            'reprint_count' => ['sometimes', 'integer', 'min:0'],
            'last_printed_at' => ['sometimes', 'nullable', 'date'],
            'items' => ['sometimes', 'array', 'min:1'],
            'items.*.order_item_id' => ['required', 'exists:order_items,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.status' => ['sometimes', Rule::in(['pending', 'cooking', 'ready', 'completed', 'cancelled'])],
            'items.*.notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
