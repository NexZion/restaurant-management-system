<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CustomerCommunicationPreference extends Model
{
    protected $fillable = ['customer_id', 'email_transactional', 'email_marketing', 'sms_transactional', 'sms_marketing', 'push_transactional', 'push_marketing', 'marketing_consent', 'consent_date', 'consent_source', 'withdrawn_at'];

    protected function casts(): array { return ['email_transactional' => 'boolean', 'email_marketing' => 'boolean', 'sms_transactional' => 'boolean', 'sms_marketing' => 'boolean', 'push_transactional' => 'boolean', 'push_marketing' => 'boolean', 'marketing_consent' => 'boolean', 'consent_date' => 'datetime', 'withdrawn_at' => 'datetime']; }
    public function customer(): BelongsTo { return $this->belongsTo(Customer::class); }
}
