"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { apiGet } from "@/lib/api";
import { formatPrice, formatDate, getErrorMessage } from "@/lib/utils";
import type { Order, PaginatedResponse } from "@/types";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

export default function OrdersPage() {
  const { isLoggedIn, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.push("/login?redirect=/orders");
    }
  }, [authLoading, isLoggedIn, router]);

  useEffect(() => {
    if (!isLoggedIn) return;
    fetchOrders(currentPage);
  }, [isLoggedIn, currentPage]);

  async function fetchOrders(page: number) {
    try {
      setIsLoading(true);
      setError(null);
      const res = await apiGet<PaginatedResponse<Order>>("/orders", { page });
      setOrders(res.data);
      setCurrentPage(res.current_page);
      setLastPage(res.last_page);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
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

  return (
    <div className="min-h-screen bg-neutral-50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Pesanan Saya</h1>
          <p className="text-neutral-600">Riwayat dan status pesanan Anda</p>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border border-neutral-200 rounded-lg p-6 animate-pulse">
                <div className="h-4 bg-neutral-200 rounded w-1/4 mb-4" />
                <div className="h-3 bg-neutral-200 rounded w-1/2 mb-2" />
                <div className="h-3 bg-neutral-200 rounded w-1/3" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && orders.length === 0 && (
          <div className="bg-white border border-neutral-200 rounded-lg p-12 text-center">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Belum Ada Pesanan</h3>
            <p className="text-neutral-600 mb-6">Anda belum pernah melakukan pemesanan</p>
            <Link
              href="/shop"
              className="inline-block bg-black text-white px-6 py-3 rounded-lg hover:bg-neutral-800 transition-colors"
            >
              Mulai Belanja
            </Link>
          </div>
        )}

        {/* Orders List */}
        {!isLoading && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => {
              const status = statusConfig[order.status];
              return (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="block bg-white border border-neutral-200 rounded-lg p-6 hover:border-black transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="font-mono text-sm text-neutral-500 mb-1">
                        {order.order_number}
                      </p>
                      <p className="text-sm text-neutral-600">
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}
                    >
                      {status.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 mb-4">
                    {order.items.slice(0, 3).map((item) => (
                      <div key={item.id} className="w-16 h-16 bg-neutral-100 rounded-lg overflow-hidden flex-shrink-0">
                        {item.product?.primary_image ? (
                          <img
                            src={item.product.primary_image.image_url}
                            alt={item.product_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-neutral-400">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <div className="w-16 h-16 bg-neutral-100 rounded-lg flex items-center justify-center text-sm text-neutral-600">
                        +{order.items.length - 3}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
                    <div>
                      <p className="text-sm text-neutral-600 mb-1">Total Pesanan</p>
                      <p className="text-lg font-semibold">{formatPrice(order.total_price)}</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-neutral-600">
                      Lihat Detail
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && lastPage > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-neutral-200 rounded-lg hover:border-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Sebelumnya
            </button>
            <span className="px-4 py-2 text-sm text-neutral-600">
              Halaman {currentPage} dari {lastPage}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(lastPage, p + 1))}
              disabled={currentPage === lastPage}
              className="px-4 py-2 border border-neutral-200 rounded-lg hover:border-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Selanjutnya
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
