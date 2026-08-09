<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $userId = $this->route('user');

        return [
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:100|unique:users,username,'.$userId.',id,deleted_at,NULL',
            'email' => 'required|email|unique:users,email,'.$userId.',id,deleted_at,NULL',
            'phone' => 'required|string|max:20',
            'whatsapp' => 'nullable|string|max:20',
            'role_id' => 'required|exists:roles,id',
            'branch_id' => 'required|exists:branches,id',
            'dob' => 'nullable|date_format:Y-m-d',
            'address' => 'nullable|string|max:255',
            'status' => 'required|in:active,inactive,blocked',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'remove_image' => 'nullable|boolean',
        ];
    }
}
