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
        $userId = $this->route('id');
        
        return [
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:100|unique:users,username,' . $userId,
            'email' => 'required|email|unique:users,email,' . $userId,
            'phone' => 'required|string|max:20',
            'whatsapp' => 'nullable|string|max:20',
            'role_id' => 'required|exists:roles,id',
            'branch_id' => 'required|exists:branches,id',
            'pin' => 'required|digits:4',
            'dob' => 'nullable|date_format:Y-m-d',
            'address' => 'nullable|string|max:255',
            'status' => 'required|in:active,inactive,blocked'
        ];
    }
}