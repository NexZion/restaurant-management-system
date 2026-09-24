<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class CustomerNote extends Model
{
    use SoftDeletes;

    protected $fillable = ['uuid', 'customer_id', 'created_by', 'note', 'is_private'];
    protected function casts(): array { return ['is_private' => 'boolean']; }
    public function customer(): BelongsTo { return $this->belongsTo(Customer::class); }
    public function author(): BelongsTo { return $this->belongsTo(User::class, 'created_by'); }
}
