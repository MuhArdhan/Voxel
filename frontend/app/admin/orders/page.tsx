"use client";

import { useState, useEffect, useCallback } from "react";
import { apiGet } from "@/lib/api";
import { type PaginatedResponse, type Order } from "@/types";
import { formatPrice, formatDate } from "@/lib/utils";
import Link from "next/link";
import { Search, Filter, ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";
import { CustomSelect } from "@/components/ui/CustomSelect";

const STATUS_COLORS: Record<string, string> = {
  pending:    "#F59E0B",
  paid:       "#3B82F6",
  processing: "#8B5CF6",
  shipped:    "#06B6D4",
  completed:  "#10B981",
  cancelled:  "#EF4444",
};

const STATUSES = ["pending", "paid", "processing", "shipped", "completed", "cancelled"];

export default function AdminOrdersPage() {
  const [data, setData]       = useState<PaginatedResponse<Order> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [status, setStatus]   = useState("");
  const [page, setPage]       = useState(1);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const q = new URLSearchParams({ page: page.toString() });
      if (search) q.append("search", search);
      if (status) q.append("status", status);
      const res = await apiGet<PaginatedResponse<Order>>(`/admin/orders?${q.toString()}`);
      setData(res);
    } catch (err) {
      console.error("Failed to load orders", err);
    } finally {
      setIsLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchOrders();
    }, 500);
    return () => clearTimeout(timer);
  }, [search, status, fetchOrders]);

  return (
    <div>
      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-[#0A0A0A] uppercase">Orders Management</h1>
          <p className="mono text-[10px] tracking-[0.2em] text-[#8A8680] mt-1 uppercase">Manage customer orders</p>
        </div>
      </div>

      <div className="bg-white border border-[#C8C4BC] rounded-3xl overflow-hidden shadow-sm">
        {/* Filters */}
        <div className="p-6 border-b border-[#C8C4BC]/60 flex flex-col sm:flex-row gap-4 bg-[#F2F0EB]/50">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8680] pointer-events-none" size={16} />
            <input
              type="text"
              placeholder="Search by Order ID or Customer Name..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-[#C8C4BC] rounded-xl text-sm focus:outline-none focus:border-[#0A0A0A] focus:ring-1 focus:ring-[#0A0A0A] transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <CustomSelect
            className="w-full sm:w-52"
            placeholder="All Statuses"
            icon={<Filter size={14} />}
            value={status}
            onChange={(v) => setStatus(v)}
            options={[
              { label: "All Statuses", value: "" },
              ...STATUSES.map((s) => ({ label: s.charAt(0).toUpperCase() + s.slice(1), value: s }))
            ]}
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F2F0EB]">
                <th className="p-4 pl-6 mono text-[10px] font-bold text-[#8A8680] tracking-[0.1em] uppercase border-b border-[#C8C4BC]/60">Order ID</th>
                <th className="p-4 mono text-[10px] font-bold text-[#8A8680] tracking-[0.1em] uppercase border-b border-[#C8C4BC]/60">Customer</th>
                <th className="p-4 mono text-[10px] font-bold text-[#8A8680] tracking-[0.1em] uppercase border-b border-[#C8C4BC]/60">Date</th>
                <th className="p-4 mono text-[10px] font-bold text-[#8A8680] tracking-[0.1em] uppercase border-b border-[#C8C4BC]/60">Status</th>
                <th className="p-4 mono text-[10px] font-bold text-[#8A8680] tracking-[0.1em] uppercase border-b border-[#C8C4BC]/60">Total</th>
                <th className="p-4 pr-6 mono text-[10px] font-bold text-[#8A8680] tracking-[0.1em] uppercase border-b border-[#C8C4BC]/60 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-[#C8C4BC]/30 animate-pulse">
                    <td className="p-4 pl-6"><div className="h-4 w-36 bg-[#E8E5DF] rounded" /></td>
                    <td className="p-4"><div className="h-4 w-32 bg-[#E8E5DF] rounded" /></td>
                    <td className="p-4"><div className="h-4 w-24 bg-[#E8E5DF] rounded" /></td>
                    <td className="p-4"><div className="h-6 w-20 bg-[#E8E5DF] rounded-full" /></td>
                    <td className="p-4"><div className="h-4 w-24 bg-[#E8E5DF] rounded" /></td>
                    <td className="p-4 pr-6 text-right"><div className="h-8 w-20 bg-[#E8E5DF] rounded-lg ml-auto" /></td>
                  </tr>
                ))
              ) : data?.data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-[#8A8680] mono text-xs uppercase tracking-widest">
                    No orders found
                  </td>
                </tr>
              ) : (
                data?.data.map((order) => (
                  <tr key={order.id} className="border-b border-[#C8C4BC]/30 hover:bg-[#F2F0EB]/50 transition-colors group">
                    <td className="p-4 pl-6">
                      <span className="font-black text-sm text-[#0A0A0A] tracking-tight">{order.order_number}</span>
                    </td>
                    <td className="p-4 text-sm text-[#4A4845]">{order.user?.name || order.shipping_name}</td>
                    <td className="p-4 text-sm text-[#8A8680]">{formatDate(order.created_at)}</td>
                    <td className="p-4">
                      <span
                        className="inline-block px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold"
                        style={{
                          backgroundColor: `${STATUS_COLORS[order.status]}20`,
                          color: STATUS_COLORS[order.status],
                        }}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-sm text-[#0A0A0A]">{formatPrice(order.total_price)}</td>
                    <td className="p-4 pr-6 text-right">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0A0A0A] text-[#F2F0EB] text-xs font-bold rounded-lg hover:bg-[#5C1A1A] transition-colors group-hover:gap-2"
                      >
                        Manage
                        <ArrowUpRight size={12} />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.last_page > 1 && (
          <div className="p-4 border-t border-[#C8C4BC]/60 flex items-center justify-between bg-[#F2F0EB]/30">
            <p className="mono text-[10px] text-[#8A8680] uppercase tracking-widest">
              Showing <span className="font-bold text-[#0A0A0A]">{data.from ?? 0}</span>–<span className="font-bold text-[#0A0A0A]">{data.to ?? 0}</span> of <span className="font-bold text-[#0A0A0A]">{data.total}</span>
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#C8C4BC] disabled:opacity-40 hover:bg-[#F2F0EB] transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(data.last_page, p + 1))}
                disabled={page === data.last_page}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#C8C4BC] disabled:opacity-40 hover:bg-[#F2F0EB] transition-colors"
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
