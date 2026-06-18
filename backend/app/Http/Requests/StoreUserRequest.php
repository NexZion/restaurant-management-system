<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreUserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'username' => [
                'required',
                'string',
                'max:100',
                Rule::unique('users', 'username')->whereNull('deleted_at'),
            ],
            'email' => ['email'],
            'phone' => ['required', 'string', 'max:20'],
            'whatsapp' => ['nullable', 'string', 'max:20'],
            'password' => ['required', 'min:6'],
            'role_id' => ['required', 'exists:roles,id'],
            'branch_id' => ['required', 'exists:branches,id'],
            'pin' => ['required', 'digits:4'],
            'dob' => ['nullable', 'date_format:Y-m-d'],
            'address' => ['nullable', 'string', 'max:255'],
            'status' => ['required', 'in:active,inactive,blocked'],
        ];
    }

public function messages(): array
    {
        return [
            'username.unique' => 'This username is already taken',
            'email.email' => 'Invalid email format',
            'role_id.exists' => 'Selected role does not exist',
            'branch_id.exists' => 'Selected branch does not exist',
            'pin.digits' => 'PIN must be exactly 4 digits',
            'dob.date_format' => 'Date of birth must be in YYYY-MM-DD format',
            'status.in' => 'Status must be active, inactive or blocked'
        ];
    }
}