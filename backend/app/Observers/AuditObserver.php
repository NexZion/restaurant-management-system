<?php

namespace App\Observers;

use App\Models\AuditLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Arr;

class AuditObserver
{
    private const HIDDEN = ['password', 'pin', 'remember_token', 'api_token'];

    public function created(Model $model): void
    {
        $this->write($model, 'created', null, $model->getAttributes());
    }

    public function updated(Model $model): void
    {
        $changes = $model->getChanges();
        unset($changes['updated_at']);

        if ($changes !== []) {
            $this->write($model, 'updated', Arr::only($model->getOriginal(), array_keys($changes)), $changes);
        }
    }

    public function deleted(Model $model): void
    {
        $this->write($model, 'deleted', $model->getOriginal(), null);
    }

    private function write(Model $model, string $action, ?array $old, ?array $new): void
    {
        AuditLog::query()->create([
            'branch_id' => $model->getAttribute('branch_id'),
            'user_id' => auth()->id(),
            'auditable_type' => $model->getMorphClass(),
            'auditable_id' => $model->getKey(),
            'action' => $action,
            'old_values' => $old === null ? null : Arr::except($old, self::HIDDEN),
            'new_values' => $new === null ? null : Arr::except($new, self::HIDDEN),
            'ip_address' => app()->runningInConsole() ? null : request()->ip(),
            'user_agent' => app()->runningInConsole() ? null : request()->userAgent(),
        ]);
    }
}
