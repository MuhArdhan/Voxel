"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { apiGet, apiPost } from "@/lib/api";
import { formatPrice, formatDate, getErrorMessage } from "@/lib/utils";
import type { Order } from "@/types";
import Link from "next/link";

const statusConfig: Record<
  Order["status"],
  { label: string; color: string; bg: string }
> = {
  pending: { label: "Menunggu Pembayaran", color: "text-yellow-600", bg: "bg-yellow-50" },
  paid: { label: "Dibayar", color: "text-blue-600", bg: "bg-blue-50" },
  processing: { label: "Diproses", color: "text-purple-600", bg: "bg-purple-50" },
  shipped: { label: "Dikirim", color: "text-indigo-600", bg: "bg-indigo-50" },
  completed: { label: "Selesai", color: "text-green-600", bg: "bg-green-50" },
  cancelled: { label: "Dibatalkan", color: "text-red-600", bg: "bg-red-50" },
};

const statusSteps: Order["status"][] = ["pending", "paid", "processing", "shipped", "completed"];

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoggedIn, isLoading: authLoading } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);

  const orderId = params.id as string;

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.push(`/login?redirect=/orders/${orderId}`);
    }
  }, [authLoading, isLoggedIn, router, orderId]);

  useEffect(() => {
    if (searchParams.get("status") === "success") {
      setShowSuccessBanner(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!isLoggedIn) return;
    fetchOrder();
  }, [isLoggedIn, orderId]);

  async function fetchOrder() {
    try {
      setIsLoading(true);
      setError(null);
      const res = await apiGet<Order>(`/orders/${orderId}`);
      setOrder(res);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCancelOrder() {
    if (!order || !confirm("Apakah Anda yakin ingin membatalkan pesanan ini?")) return;

    try {
      setIsCancelling(true);
      await apiPost(`/orders/${order.id}/cancel`);
      await fetchOrder(); // Refresh order data
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setIsCancelling(false);
    }
  }

  if (authLoading || !isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-neutral-600">Memuat...</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-neutral-200 rounded w-1/3" />
            <div className="bg-white border border-neutral-200 rounded-lg p-6 space-y-4">
              <div className="h-4 bg-neutral-200 rounded w-1/2" />
              <div className="h-4 bg-neutral-200 rounded w-2/3" />
              <div className="h-4 bg-neutral-200 rounded w-1/4" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-neutral-50 py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-lg">
            {error || "Pesanan tidak ditemukan"}
          </div>
          <Link
            href="/orders"
            className="inline-block mt-6 text-sm text-neutral-600 hover:text-black"
          >
            ← Kembali ke Daftar Pesanan
          </Link>
        </div>
      </div>
    );
  }

  const status = statusConfig[order.status];
  const currentStepIndex = statusSteps.indexOf(order.status);

  return (
    <div className="min-h-screen bg-neutral-50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Success Banner */}
        {showSuccessBanner && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-6 py-4 rounded-lg mb-6 flex items-start justify-between">
            <div>
              <p className="font-semibold mb-1">✓ Pesanan Berhasil Dibuat!</p>
              <p className="text-sm">
                Terima kasih atas pesanan Anda. Kami akan segera memprosesnya.
              </p>
            </div>
            <button
              onClick={() => setShowSuccessBanner(false)}
              className="text-green-600 hover:text-green-800"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-black mb-4"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Kembali ke Daftar Pesanan
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Detail Pesanan</h1>
              <p className="font-mono text-sm text-neutral-600">{order.order_number}</p>
            </div>
            <span
              className={`px-4 py-2 rounded-full text-sm font-medium ${status.bg} ${status.color}`}
            >
              {status.label}
            </span>
          </div>
        </div>

        {/* Status Tracker */}
        {order.status !== "cancelled" && (
          <div className="bg-white border border-neutral-200 rounded-lg p-6 mb-6">
            <h2 className="font-semibold mb-6">Status Pesanan</h2>
            <div className="relative">
              {/* Progress Line */}
              <div className="absolute top-5 left-0 right-0 h-0.5 bg-neutral-200">
                <div
                  className="h-full bg-black transition-all duration-500"
                  style={{
                    width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%`,
                  }}
                />
              </div>

              {/* Steps */}
              <div className="relative flex justify-between">
                {statusSteps.map((step, index) => {
                  const isActive = index <= currentStepIndex;
                  const stepConfig = statusConfig[step];
                  return (
                    <div key={step} className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors ${
                          isActive ? "bg-black text-white" : "bg-neutral-200 text-neutral-400"
                        }`}
                      >
                        {isActive ? (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <span className="text-sm font-medium">{index + 1}</span>
                        )}
                      </div>
                      <p
                        className={`text-xs text-center max-w-[80px] ${
                          isActive ? "text-black font-medium" : "text-neutral-500"
                        }`}
                      >
                        {stepConfig.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column — Items & Shipping */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-white border border-neutral-200 rounded-lg p-6">
              <h2 className="font-semibold mb-4">Produk yang Dipesan</h2>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b border-neutral-100 last:border-0 last:pb-0">
                    <div className="w-20 h-20 bg-neutral-100 rounded-lg overflow-hidden flex-shrink-0">
                      {item.product?.primary_image ? (
                        <img
                          src={item.product.primary_image.image_url}
                          alt={item.product_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-400">
                          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium mb-1">{item.product_name}</h3>
                      <p className="text-sm text-neutral-600 mb-1">
                        SKU: <span className="font-mono">{item.product_sku}</span>
                      </p>
                      <p className="text-sm text-neutral-600">
                        Ukuran: {item.variant_size}
                        {item.variant_color && ` • Warna: ${item.variant_color}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-neutral-600 mb-1">x{item.quantity}</p>
                      <p className="font-semibold">{formatPrice(item.subtotal)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Info */}
            <div className="bg-white border border-neutral-200 rounded-lg p-6">
              <h2 className="font-semibold mb-4">Informasi Pengiriman</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-neutral-600 mb-1">Penerima</p>
                  <p className="font-medium">{order.shipping_name}</p>
                  <p className="text-neutral-600">{order.shipping_phone}</p>
                </div>
                <div>
                  <p className="text-neutral-600 mb-1">Alamat</p>
                  <p className="font-medium">{order.shipping_address}</p>
                  <p className="text-neutral-600">
                    {order.shipping_city}, {order.shipping_province} {order.shipping_postal_code}
                  </p>
                </div>
                <div>
                  <p className="text-neutral-600 mb-1">Kurir</p>
                  <p className="font-medium">
                    {order.courier.toUpperCase()} - {order.courier_service}
                  </p>
                </div>
                {order.tracking_number && (
                  <div>
                    <p className="text-neutral-600 mb-1">Nomor Resi</p>
                    <p className="font-mono font-medium">{order.tracking_number}</p>
                    <a
                      href={`https://cekresi.com/?noresi=${order.tracking_number}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline mt-1 inline-block"
                    >
                      Lacak Paket →
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column — Summary & Actions */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white border border-neutral-200 rounded-lg p-6">
              <h2 className="font-semibold mb-4">Ringkasan Pesanan</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Subtotal</span>
                  <span className="font-medium">{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Ongkir</span>
                  <span className="font-medium">{formatPrice(order.shipping_cost)}</span>
                </div>
                <div className="pt-3 border-t border-neutral-200 flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-lg">{formatPrice(order.total_price)}</span>
                </div>
              </div>
            </div>

            {/* Order Info */}
            <div className="bg-white border border-neutral-200 rounded-lg p-6">
              <h2 className="font-semibold mb-4">Informasi Pesanan</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Tanggal Pesanan</span>
                  <span className="font-medium">{formatDate(order.created_at)}</span>
                </div>
                {order.paid_at && (
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Tanggal Bayar</span>
                    <span className="font-medium">{formatDate(order.paid_at)}</span>
                  </div>
                )}
                {order.notes && (
                  <div className="pt-2 border-t border-neutral-100">
                    <p className="text-neutral-600 mb-1">Catatan</p>
                    <p className="text-neutral-800">{order.notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Cancel Button */}
            {order.status === "pending" && (
              <button
                onClick={handleCancelOrder}
                disabled={isCancelling}
                className="w-full px-4 py-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isCancelling ? "Membatalkan..." : "Batalkan Pesanan"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
