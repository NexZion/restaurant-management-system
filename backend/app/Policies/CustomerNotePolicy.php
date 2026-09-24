<?php

namespace App\Policies;

use App\Models\CustomerNote;
use App\Models\User;

class CustomerNotePolicy
{
    public function view(User $user, CustomerNote $note): bool { return ! $note->is_private || $note->created_by === $user->id || $user->hasPermission('customers.manage'); }
    public function create(User $user): bool { return $user->hasPermission('customers.manage'); }
    public function delete(User $user, CustomerNote $note): bool { return $note->created_by === $user->id || $user->hasPermission('customers.manage'); }
}
