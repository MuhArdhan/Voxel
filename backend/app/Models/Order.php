<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Order extends Model
{
    use SoftDeletes;

    // Valid statuses: pending_payment → pending → paid → processing → shipped → completed / cancelled
    const STATUS_PENDING_PAYMENT = 'pending_payment';
    const STATUS_PENDING         = 'pending';
    const STATUS_PAID            = 'paid';
    const STATUS_PROCESSING      = 'processing';
    const STATUS_SHIPPED         = 'shipped';
    const STATUS_COMPLETED       = 'completed';
    const STATUS_CANCELLED       = 'cancelled';

    protected $fillable = [
        'user_id',
        'order_number',
        'status',
        'subtotal',
        'shipping_cost',
        'total_price',
        'shipping_name',
        'shipping_phone',
        'shipping_address',
        'shipping_city',
        'shipping_province',
        'shipping_postal_code',
        'destination_area_id',
        'courier',
        'courier_service',
        'tracking_number',
        'payment_method',
        'payment_token',
        'payment_url',
        'paid_at',
        'notes',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'shipping_cost' => 'decimal:2',
        'total_price' => 'decimal:2',
        'paid_at' => 'datetime',
    ];

    protected static function boot(): void
    {
        parent::boot();
        static::creating(function ($order) {
            $order->order_number = 'VXL-' . strtoupper(uniqid());
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}
