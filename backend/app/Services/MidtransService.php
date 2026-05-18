<?php

namespace App\Services;

use App\Models\Order;
use Midtrans\Config;
use Midtrans\Snap;

class MidtransService
{
    public function __construct()
    {
        Config::$serverKey    = config('midtrans.server_key');
        Config::$isProduction = config('midtrans.is_production');
        Config::$isSanitized  = config('midtrans.sanitized');
        Config::$is3ds        = config('midtrans.is_3ds');
    }

    /**
     * Create a Midtrans Snap transaction and return the snap token.
     */
    public function createSnapToken(Order $order): array
    {
        $order->loadMissing('user');

        $params = [
            'transaction_details' => [
                'order_id'     => $order->order_number,
                'gross_amount' => (int) $order->total_price,
            ],
            'customer_details' => [
                'first_name' => $order->shipping_name,
                'phone'      => $order->shipping_phone,
                'email'      => $order->user->email,
                'billing_address' => [
                    'first_name'   => $order->shipping_name,
                    'phone'        => $order->shipping_phone,
                    'address'      => $order->shipping_address,
                    'city'         => $order->shipping_city,
                    'postal_code'  => $order->shipping_postal_code,
                    'country_code' => 'IDN',
                ],
                'shipping_address' => [
                    'first_name'   => $order->shipping_name,
                    'phone'        => $order->shipping_phone,
                    'address'      => $order->shipping_address,
                    'city'         => $order->shipping_city,
                    'postal_code'  => $order->shipping_postal_code,
                    'country_code' => 'IDN',
                ],
            ],
            'callbacks' => [
                'finish' => config('app.frontend_url') . "/orders/{$order->id}?status=success",
            ],
        ];

        $snapResponse = Snap::createTransaction($params);

        return [
            'snap_token'  => $snapResponse->token,
            'payment_url' => $snapResponse->redirect_url,
        ];
    }

    /**
     * Handle Midtrans webhook notification.
     *
     * @throws \Exception if signature is invalid
     */
    public function parseNotification(): array
    {
        $notif = new \Midtrans\Notification();

        // Signature Validation
        $serverKey         = config('midtrans.server_key');
        $orderId           = $notif->order_id;
        $statusCode        = $notif->status_code;
        $grossAmount       = $notif->gross_amount;
        $incomingSignature = $notif->signature_key;

        $expectedSignature = hash('sha512', $orderId . $statusCode . $grossAmount . $serverKey);

        if ($incomingSignature !== $expectedSignature) {
            throw new \Exception('Invalid Midtrans signature key.');
        }

        return [
            'order_number'       => $notif->order_id,
            'transaction_status' => $notif->transaction_status,
            'fraud_status'       => $notif->fraud_status ?? null,
            'payment_type'       => $notif->payment_type,
            'transaction_id'     => $notif->transaction_id,
            'gross_amount'       => $notif->gross_amount,
        ];
    }

    /**
     * Query Midtrans for the current transaction status.
     */
    public function getTransactionStatus(string $orderNumber): array
    {
        $status = \Midtrans\Transaction::status($orderNumber);

        return (array) $status;
    }
}
