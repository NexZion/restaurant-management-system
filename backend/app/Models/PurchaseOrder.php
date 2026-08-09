<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PurchaseOrder extends Model
{
    protected $fillable = ['branch_id', 'supplier_id', 'purchase_order_number', 'status', 'ordered_at', 'expected_at', 'subtotal', 'tax', 'total', 'notes', 'created_by'];

    protected function casts(): array
    {
        return ['ordered_at' => 'date', 'expected_at' => 'date', 'subtotal' => 'decimal:2', 'tax' => 'decimal:2', 'total' => 'decimal:2'];
    }
}
