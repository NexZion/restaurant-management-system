<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreKitchenTicketRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    protected function prepareForValidation(): void
    {
        $this->merge(['branch_id' => $this->user()?->branch_id, 'generated_by' => $this->user()?->id]);
    }

    public function rules(): array
    {
        return [
            'order_id' => ['required', 'exists:orders,id'],
            'branch_id' => ['required', 'exists:branches,id'],
            'ticket_number' => ['sometimes', 'string', 'max:100', Rule::unique('kitchen_tickets')->where('branch_id', $this->integer('branch_id'))],
            'kitchen_station_id' => ['required', 'exists:kitchen_stations,id'],
            'status' => ['sometimes', Rule::in(['pending', 'printed', 'cooking', 'ready', 'closed', 'cancelled'])],
            'priority' => ['sometimes', Rule::in(['normal', 'high', 'urgent'])],
            'generated_by' => ['required', 'exists:users,id'],
            'generated_at' => ['sometimes', 'date'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.order_item_id' => ['required', 'exists:order_items,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
