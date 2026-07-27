<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BillTax extends Model
{
    public const UPDATED_AT = null;

    protected $fillable = ['order_bill_id', 'tax_id', 'tax_name', 'tax_rate', 'taxable_amount', 'tax_amount'];

    protected function casts(): array
    {
        return ['tax_rate' => 'decimal:4', 'taxable_amount' => 'decimal:2', 'tax_amount' => 'decimal:2'];
    }

    public function bill(): BelongsTo
    {
        return $this->belongsTo(OrderBill::class, 'order_bill_id');
    }
}
