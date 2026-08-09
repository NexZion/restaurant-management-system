<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Payment extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'order_bill_id', 'payment_method_id', 'payment_number', 'payment_method',
        'amount_paid', 'amount_received', 'change_amount', 'balance_amount',
        'payment_status', 'transaction_reference', 'gateway_transaction_id',
        'gateway_response', 'card_last_four', 'paid_at', 'notes', 'created_by',
        'voided_by', 'voided_at', 'void_reason', 'pos_terminal_id', 'cashier_shift_id',
    ];

    protected $attributes = [
        'change_amount' => 0, 'balance_amount' => 0, 'payment_status' => 'pending',
    ];

    protected function casts(): array
    {
        return [
            'amount_paid' => 'decimal:2', 'amount_received' => 'decimal:2',
            'change_amount' => 'decimal:2', 'balance_amount' => 'decimal:2',
            'gateway_response' => 'array', 'paid_at' => 'datetime', 'voided_at' => 'datetime',
        ];
    }

    public function bill(): BelongsTo
    {
        return $this->belongsTo(OrderBill::class, 'order_bill_id');
    }

    public function method(): BelongsTo
    {
        return $this->belongsTo(PaymentMethod::class, 'payment_method_id');
    }

    public function cashier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function voider(): BelongsTo
    {
        return $this->belongsTo(User::class, 'voided_by');
    }

    public function refunds(): HasMany
    {
        return $this->hasMany(Refund::class);
    }

    public function terminal(): BelongsTo
    {
        return $this->belongsTo(PosTerminal::class, 'pos_terminal_id');
    }

    public function cashierShift(): BelongsTo
    {
        return $this->belongsTo(CashierShift::class);
    }
}
