<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BillCharge extends Model
{
    public const UPDATED_AT = null;

    protected $fillable = ['order_bill_id', 'charge_type', 'charge_name', 'rate', 'amount'];

    protected function casts(): array
    {
        return ['rate' => 'decimal:4', 'amount' => 'decimal:2'];
    }

    public function bill(): BelongsTo
    {
        return $this->belongsTo(OrderBill::class, 'order_bill_id');
    }
}
