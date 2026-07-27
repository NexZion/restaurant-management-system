<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class OrderBill extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'order_id', 'parent_bill_id', 'bill_number', 'split_number', 'subtotal', 'discount', 'tax', 'service_charge',
        'rounding_amount', 'grand_total', 'paid_amount', 'balance_due', 'bill_status',
        'generated_by', 'generated_at', 'voided_by', 'voided_at', 'void_reason',
    ];

    protected $attributes = [
        'subtotal' => 0, 'discount' => 0, 'tax' => 0, 'service_charge' => 0,
        'rounding_amount' => 0, 'grand_total' => 0, 'paid_amount' => 0,
        'balance_due' => 0, 'bill_status' => 'unpaid',
    ];

    protected function casts(): array
    {
        return [
            'subtotal' => 'decimal:2', 'discount' => 'decimal:2', 'tax' => 'decimal:2',
            'service_charge' => 'decimal:2', 'rounding_amount' => 'decimal:2',
            'grand_total' => 'decimal:2', 'paid_amount' => 'decimal:2',
            'balance_due' => 'decimal:2', 'generated_at' => 'datetime', 'voided_at' => 'datetime',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(OrderBill::class, 'parent_bill_id');
    }

    public function splits(): HasMany
    {
        return $this->hasMany(OrderBill::class, 'parent_bill_id');
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(BillItem::class);
    }

    public function taxes(): HasMany
    {
        return $this->hasMany(BillTax::class);
    }

    public function charges(): HasMany
    {
        return $this->hasMany(BillCharge::class);
    }

    public function refunds(): HasMany
    {
        return $this->hasMany(Refund::class);
    }

    public function generator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'generated_by');
    }

    public function voider(): BelongsTo
    {
        return $this->belongsTo(User::class, 'voided_by');
    }
}
