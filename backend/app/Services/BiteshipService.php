<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Exception;

class BiteshipService
{
    protected string $baseUrl;
    protected string $apiKey;
    protected string $originAreaId;

    public function __construct()
    {
        $this->baseUrl = config('services.biteship.base_url', 'https://api.biteship.com');
        $this->apiKey = config('services.biteship.api_key', '');
        $this->originAreaId = config('services.biteship.origin_area_id', '');
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
                'input' => $query,
                'type' => 'single',
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
                'name' => $item['name'] ?? 'Product',
                'description' => $item['description'] ?? 'Item',
                'value' => (int) ($item['price'] ?? 0),
                'length' => 10,
                'width' => 10,
                'height' => 10,
                'weight' => (int) $weight,
                'quantity' => (int) ($item['quantity'] ?? 1),
            ];
        }, $items);

        try {
            $response = Http::withHeaders([
                'Authorization' => $this->apiKey,
                'Content-Type' => 'application/json',
            ])->post("{$this->baseUrl}/v1/rates/couriers", [
                'origin_area_id' => $this->originAreaId,
                'destination_area_id' => $destinationAreaId,
                'couriers' => 'jne,sicepat,jnt',
                'items' => $biteshipItems,
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

}
