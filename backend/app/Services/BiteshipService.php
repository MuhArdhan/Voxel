<?php

namespace App\Services;

use App\Models\Order;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Exception;

class BiteshipService
{
    protected string $baseUrl;
    protected string $apiKey;
    protected string $originAreaId;
    protected string $shipperName;
    protected string $shipperPhone;
    protected string $shipperEmail;
    protected string $originAddress;

    public function __construct()
    {
        $this->baseUrl       = config('services.biteship.base_url', 'https://api.biteship.com');
        $this->apiKey        = config('services.biteship.api_key', '');
        $this->originAreaId  = config('services.biteship.origin_area_id', '');
        $this->shipperName   = config('services.biteship.shipper_name', 'VOXEL Store');
        $this->shipperPhone  = config('services.biteship.shipper_phone', '');
        $this->shipperEmail  = config('services.biteship.shipper_email', '');
        $this->originAddress = config('services.biteship.origin_address', '');
    }

    /**
     * Search areas based on query string.
     */
    public function searchAreas(string $query): array
    {
        if (empty($this->apiKey)) {
            Log::error('Biteship API Key is empty.');
            throw new Exception('Biteship API Key belum dikonfigurasi.');
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => $this->apiKey,
            ])->get("{$this->baseUrl}/v1/maps/areas", [
                'countries' => 'ID',
                'input'     => $query,
                'type'      => 'single',
            ]);

            if ($response->successful()) {
                return $response->json('areas') ?? [];
            }

            Log::error('Biteship searchAreas failed: ' . $response->body());
            return [];
        } catch (Exception $e) {
            Log::error('Biteship searchAreas exception: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Get shipping rates based on destination area and cart items.
     */
    public function getRates(string $destinationAreaId, array $items): array
    {
        if (empty($this->apiKey)) {
            Log::error('Biteship API Key is empty.');
            throw new Exception('Biteship API Key belum dikonfigurasi.');
        }

        $biteshipItems = array_map(function ($item) {
            $weight = $item['weight'] ?? 500;
            if ($weight <= 0) $weight = 500;

            return [
                'name'        => $item['name'] ?? 'Product',
                'description' => $item['description'] ?? 'Item',
                'value'       => (int) ($item['price'] ?? 0),
                'length'      => max(1, (int) ($item['length'] ?? 10)),
                'width'       => max(1, (int) ($item['width'] ?? 10)),
                'height'      => max(1, (int) ($item['height'] ?? 10)),
                'weight'      => (int) $weight,
                'quantity'    => (int) ($item['quantity'] ?? 1),
            ];
        }, $items);

        try {
            $response = Http::withHeaders([
                'Authorization' => $this->apiKey,
                'Content-Type'  => 'application/json',
            ])->post("{$this->baseUrl}/v1/rates/couriers", [
                'origin_area_id'      => $this->originAreaId,
                'destination_area_id' => $destinationAreaId,
                'couriers'            => 'jne,sicepat,jnt',
                'items'               => $biteshipItems,
            ]);

            if ($response->successful()) {
                return $response->json('pricing') ?? [];
            }

            Log::error('Biteship getRates failed: ' . $response->body());
            throw new Exception('Gagal mengambil tarif pengiriman dari Biteship.');
        } catch (Exception $e) {
            Log::error('Biteship getRates exception: ' . $e->getMessage());
            throw new Exception('Koneksi ke sistem pengiriman gagal: ' . $e->getMessage());
        }
    }

    /**
     * Create a shipping order in Biteship and return waybill_id.
     */
    public function createOrder(Order $order): array
    {
        if (empty($this->apiKey)) {
            throw new Exception('Biteship API Key belum dikonfigurasi.');
        }

        $order->load('items.product');

        $items = $order->items->map(function ($item) {
            $product = $item->product;
            $weight  = max(1, (int) ($product->weight ?? 500));

            return [
                'name'     => $item->product_name,
                'value'    => (int) $item->unit_price,
                'length'   => max(1, (int) ($product->length ?? 10)),
                'width'    => max(1, (int) ($product->width ?? 10)),
                'height'   => max(1, (int) ($product->height ?? 10)),
                'weight'   => $weight,
                'quantity' => (int) $item->quantity,
            ];
        })->toArray();

        $payload = [
            'shipper_contact_name'      => $this->shipperName,
            'shipper_contact_phone'     => $this->shipperPhone,
            'shipper_contact_email'     => $this->shipperEmail,
            'origin_contact_name'       => $this->shipperName,
            'origin_contact_phone'      => $this->shipperPhone,
            'origin_address'            => $this->originAddress,
            'origin_postal_code'        => 57481,
            'destination_contact_name'  => $order->shipping_name,
            'destination_contact_phone' => $order->shipping_phone,
            'destination_address'       => $order->shipping_address . ', ' . $order->shipping_city . ', ' . $order->shipping_province,
            'destination_postal_code'   => (int) $order->shipping_postal_code,
            'courier_company'           => $order->courier,
            'courier_type'              => strtolower($order->courier_service),
            'delivery_type'             => 'now',
            'items'                     => $items,
        ];

        if (! empty($order->notes)) {
            $payload['order_note'] = $order->notes;
        }

        if (! empty($order->user?->email)) {
            $payload['destination_contact_email'] = $order->user->email;
        }

        Log::info('Biteship createOrder payload: ' . json_encode($payload));

        try {
            $response = Http::withHeaders([
                'Authorization' => $this->apiKey,
                'Content-Type'  => 'application/json',
            ])->post("{$this->baseUrl}/v1/orders", $payload);

            Log::info('Biteship createOrder response: ' . $response->body());

            if ($response->successful()) {
                return [
                    'biteship_order_id' => $response->json('id'),
                    'waybill_id'        => $response->json('courier.waybill_id') ?? $response->json('waybill_id'),
                ];
            }

            Log::error('Biteship createOrder failed: ' . $response->body());
            throw new Exception($response->json('error') ?? 'Gagal membuat order pengiriman di Biteship.');
        } catch (Exception $e) {
            Log::error('Biteship createOrder exception: ' . $e->getMessage());
            throw new Exception('Gagal terhubung ke Biteship: ' . $e->getMessage());
        }
    }

    /**
     * Get tracking info by waybill ID.
     */
    public function getTracking(string $waybillId, string $courierCompany): array
    {
        if (empty($this->apiKey)) {
            throw new Exception('Biteship API Key belum dikonfigurasi.');
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => $this->apiKey,
            ])->get("{$this->baseUrl}/v1/trackings/{$waybillId}/couriers/{$courierCompany}");

            if ($response->successful()) {
                return $response->json() ?? [];
            }

            Log::error('Biteship getTracking failed: ' . $response->body());
            throw new Exception('Gagal mengambil info tracking dari Biteship.');
        } catch (Exception $e) {
            Log::error('Biteship getTracking exception: ' . $e->getMessage());
            throw new Exception('Koneksi ke tracking gagal: ' . $e->getMessage());
        }
    }
}
