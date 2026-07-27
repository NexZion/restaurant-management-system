<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

class UpdateKitchenStationRequest extends StoreKitchenStationRequest
{
    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'code' => ['sometimes', 'string', 'max:50', Rule::unique('kitchen_stations')->where('branch_id', $this->user()->branch_id)->ignore($this->route('kitchen_station'))],
            'printer_id' => ['sometimes', 'nullable', 'integer', 'min:1'],
            'display_order' => ['sometimes', 'integer', 'min:0'],
            'status' => ['sometimes', Rule::in(['active', 'inactive'])],
        ];
    }
}
