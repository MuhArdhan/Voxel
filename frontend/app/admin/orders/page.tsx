"use client";

import { useState, useEffect, useCallback } from "react";
import { apiGet } from "@/lib/api";
import { type PaginatedResponse, type Order } from "@/types";
import { formatPrice, formatDate } from "@/lib/utils";
import Link from "next/link";
import { Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  pending: "#F59E0B",
  paid: "#3B82F6",
  processing: "#8B5CF6",
  shipped: "#06B6D4",
  completed: "#10B981",
  cancelled: "#EF4444",
};

export default function AdminOrdersPage() {
  const [data, setData] = useState<PaginatedResponse<Order> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString() });
      if (search) params.append("search", search);
      if (status) params.append("status", status);
      
      const res = await apiGet<PaginatedResponse<Order>>(`/admin/orders?${params.toString()}`);
      setData(res);
    } catch (err) {
      console.error("Failed to load admin orders", err);
    } finally {
      setIsLoading(false);
    }
  }, [page, search, status]);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1); // Reset to page 1 on new search
      fetchOrders();
    }, 500);
    return () => clearTimeout(timer);
  }, [search, status, fetchOrders]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#0A0A0A] tracking-tight mb-2">Orders Management</h1>
          <p className="mono text-[10px] text-[#8A8680] tracking-[0.2em] uppercase">
            System Protocol // Logs
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 bg-white border border-[#C8C4BC] rounded-2xl p-4 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8680]" size={18} />
          <input
            type="text"
            placeholder="Search by Order ID or Customer Name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#F2F0EB] border border-[#C8C4BC] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A0A0A] text-sm"
          />
        </div>
        <div className="relative shrink-0 w-full md:w-48">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8680]" size={18} />
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
            }}
            className="w-full pl-10 pr-4 py-2.5 bg-[#F2F0EB] border border-[#C8C4BC] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A0A0A] text-sm appearance-none"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#C8C4BC] rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F9F8F6] border-b border-[#C8C4BC]/60 mono text-[9px] text-[#8A8680] uppercase tracking-wider">
                <th className="p-4 pl-6 font-medium">Order ID</th>
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Total</th>
                <th className="p-4 pr-6 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && !data ? (
                <>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <tr key={i} className="border-b border-[#C8C4BC]/20 animate-pulse">
                      <td className="p-4 pl-6"><div className="h-4 w-20 bg-[#E8E5DF] rounded" /></td>
                      <td className="p-4"><div className="h-4 w-32 bg-[#E8E5DF] rounded" /></td>
                      <td className="p-4"><div className="h-4 w-24 bg-[#E8E5DF] rounded" /></td>
                      <td className="p-4"><div className="h-6 w-20 bg-[#E8E5DF] rounded-full" /></td>
                      <td className="p-4"><div className="h-4 w-24 bg-[#E8E5DF] rounded" /></td>
                      <td className="p-4 pr-6 text-right"><div className="h-8 w-16 bg-[#E8E5DF] rounded-full inline-block" /></td>
                    </tr>
                  ))}
                </>
              ) : data && data.data.length > 0 ? (
                data.data.map((order) => (
                  <tr key={order.id} className="border-b border-[#C8C4BC]/20 hover:bg-[#F9F8F6]/50 transition-colors">
                    <td className="p-4 pl-6">
                      <span className="font-bold text-[#0A0A0A]">{order.order_number}</span>
                    </td>
                    <td className="p-4 text-sm text-[#4A4845]">{order.user?.name || order.shipping_name}</td>
                    <td className="p-4 text-sm text-[#8A8680]">{formatDate(order.created_at)}</td>
                    <td className="p-4">
                      <span 
                        className="inline-block px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold"
                        style={{ 
                          backgroundColor: `${STATUS_COLORS[order.status]}20`,
                          color: STATUS_COLORS[order.status] 
                        }}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-[#0A0A0A]">{formatPrice(order.total_price)}</td>
                    <td className="p-4 pr-6 text-right">
                      <Link 
                        href={`/admin/orders/${order.id}`}
                        className="inline-flex items-center justify-center px-4 py-1.5 border border-[#0A0A0A] text-[#0A0A0A] text-xs font-bold rounded-full hover:bg-[#0A0A0A] hover:text-[#F2F0EB] transition-colors"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-[#8A8680]">No orders found matching your criteria.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.last_page > 1 && (
          <div className="p-4 border-t border-[#C8C4BC]/60 flex items-center justify-between">
            <p className="text-xs text-[#8A8680]">
              Showing <span className="font-bold text-[#0A0A0A]">{data.from || 0}</span> to <span className="font-bold text-[#0A0A0A]">{data.to || 0}</span> of <span className="font-bold text-[#0A0A0A]">{data.total}</span> entries
            </p>
            <div className="flex gap-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#C8C4BC] disabled:opacity-50 hover:bg-[#F2F0EB]"
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                onClick={() => setPage(p => Math.min(data.last_page, p + 1))}
                disabled={page === data.last_page}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#C8C4BC] disabled:opacity-50 hover:bg-[#F2F0EB]"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
