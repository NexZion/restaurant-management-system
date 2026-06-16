<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
class UpdateRoleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $roleId = $this->route('id');

        return [
            'name' => 'required|string|max:255|unique:roles,name,' . $roleId,
            'description' => 'nullable|string|max:255'
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Role name is required',
            'name.unique' => 'Role already exists'
        ];
    }
}