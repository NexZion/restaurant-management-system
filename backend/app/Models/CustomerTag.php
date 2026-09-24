<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class CustomerTag extends Model
{
    protected $fillable = ['restaurant_id', 'name', 'description', 'color', 'is_active'];
    protected function casts(): array { return ['is_active' => 'boolean']; }
    public function customers(): BelongsToMany { return $this->belongsToMany(Customer::class, 'customer_customer_tag'); }
}
