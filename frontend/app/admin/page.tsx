"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import { type AdminDashboard } from "@/types";
import { formatPrice, formatDate } from "@/lib/utils";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import { DollarSign, ShoppingCart, Users, Package } from "lucide-react";
import Link from "next/link";

const STATUS_COLORS: Record<string, string> = {
  pending: "#F59E0B", // amber-500
  paid: "#3B82F6",    // blue-500
  processing: "#8B5CF6", // violet-500
  shipped: "#06B6D4", // cyan-500
  completed: "#10B981", // emerald-500
  cancelled: "#EF4444", // red-500
};

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await apiGet<AdminDashboard>("/admin/dashboard");
        setData(res);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div>
          <div className="h-10 w-48 bg-[#E8E5DF] rounded-lg mb-2" />
          <div className="h-4 w-32 bg-[#E8E5DF] rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-white border border-[#C8C4BC] rounded-2xl p-6 shadow-sm flex flex-col justify-between h-[120px]">
              <div className="flex justify-between items-center">
                <div className="h-3 w-24 bg-[#E8E5DF] rounded" />
                <div className="h-8 w-8 rounded-full bg-[#E8E5DF]" />
              </div>
              <div className="h-8 w-32 bg-[#E8E5DF] rounded mt-4" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-[#C8C4BC] rounded-2xl p-6 shadow-sm h-[400px] flex flex-col">
            <div className="h-5 w-48 bg-[#E8E5DF] rounded mb-6" />
            <div className="flex-1 bg-[#E8E5DF]/50 rounded-xl" />
          </div>
          <div className="bg-white border border-[#C8C4BC] rounded-2xl p-6 shadow-sm h-[400px] flex flex-col">
            <div className="h-5 w-32 bg-[#E8E5DF] rounded mb-6" />
            <div className="h-40 w-40 bg-[#E8E5DF]/50 rounded-full mx-auto mb-8 mt-4 shrink-0" />
            <div className="space-y-3 mt-auto">
              <div className="flex justify-between"><div className="h-3 w-16 bg-[#E8E5DF] rounded" /><div className="h-3 w-8 bg-[#E8E5DF] rounded" /></div>
              <div className="flex justify-between"><div className="h-3 w-20 bg-[#E8E5DF] rounded" /><div className="h-3 w-8 bg-[#E8E5DF] rounded" /></div>
              <div className="flex justify-between"><div className="h-3 w-16 bg-[#E8E5DF] rounded" /><div className="h-3 w-8 bg-[#E8E5DF] rounded" /></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return <div>Failed to load data.</div>;

  // Transform object to array for PieChart
  const pieData = Object.entries(data.orders_by_status).map(([key, value]) => ({
    name: key,
    value: value,
    color: STATUS_COLORS[key] || "#8A8680"
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-[#0A0A0A] tracking-tight mb-2">Overview</h1>
        <p className="mono text-[10px] text-[#8A8680] tracking-[0.2em] uppercase">
          System Analytics
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-[#C8C4BC] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="mono text-[10px] text-[#8A8680] tracking-[0.1em] uppercase font-bold">Total Revenue</p>
            <div className="w-8 h-8 rounded-full bg-[#10B981]/10 flex items-center justify-center text-[#10B981]">
              <DollarSign size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-[#0A0A0A]">{formatPrice(data.stats.total_revenue)}</p>
        </div>

        <div className="bg-white border border-[#C8C4BC] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="mono text-[10px] text-[#8A8680] tracking-[0.1em] uppercase font-bold">Orders</p>
            <div className="w-8 h-8 rounded-full bg-[#3B82F6]/10 flex items-center justify-center text-[#3B82F6]">
              <ShoppingCart size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-[#0A0A0A]">{data.stats.total_orders}</p>
        </div>

        <div className="bg-white border border-[#C8C4BC] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="mono text-[10px] text-[#8A8680] tracking-[0.1em] uppercase font-bold">Customers</p>
            <div className="w-8 h-8 rounded-full bg-[#8B5CF6]/10 flex items-center justify-center text-[#8B5CF6]">
              <Users size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-[#0A0A0A]">{data.stats.total_users}</p>
        </div>

        <div className="bg-white border border-[#C8C4BC] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="mono text-[10px] text-[#8A8680] tracking-[0.1em] uppercase font-bold">Products</p>
            <div className="w-8 h-8 rounded-full bg-[#F59E0B]/10 flex items-center justify-center text-[#F59E0B]">
              <Package size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-[#0A0A0A]">{data.stats.total_products}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white border border-[#C8C4BC] rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-[#0A0A0A] mb-6">Revenue Overview (7 Days)</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.revenue_chart}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8E5DF" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { weekday: 'short' })}
                  tick={{ fontSize: 12, fill: '#8A8680' }}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis 
                  tickFormatter={(val) => `Rp ${val / 1000}k`}
                  tick={{ fontSize: 12, fill: '#8A8680' }}
                  tickLine={false}
                  axisLine={false}
                  dx={-10}
                />
                <RechartsTooltip 
                  formatter={(value: number) => [formatPrice(value), "Revenue"]}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #C8C4BC', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#0A0A0A', marginBottom: '8px' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#0A0A0A" 
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#0A0A0A', strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: '#00D4FF', strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Orders by Status */}
        <div className="bg-white border border-[#C8C4BC] rounded-2xl p-6 shadow-sm flex flex-col">
          <h2 className="text-lg font-bold text-[#0A0A0A] mb-6">Orders by Status</h2>
          <div className="flex-1 flex flex-col justify-center">
            {pieData.length > 0 ? (
              <>
                <div className="h-[200px] w-full mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2">
                  {pieData.map((entry) => (
                    <div key={entry.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span className="capitalize text-[#4A4845]">{entry.name}</span>
                      </div>
                      <span className="font-bold text-[#0A0A0A]">{entry.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center text-[#8A8680] py-10">No orders yet.</div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white border border-[#C8C4BC] rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#C8C4BC]/60 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#0A0A0A]">Recent Orders</h2>
          <Link href="/admin/orders" className="text-xs font-bold text-[#00D4FF] hover:text-[#00D4FF]/80">
            View All
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F9F8F6] border-b border-[#C8C4BC]/60 mono text-[9px] text-[#8A8680] uppercase tracking-wider">
                <th className="p-4 pl-6 font-medium">Order ID</th>
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 pr-6 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {data.recent_orders.length > 0 ? (
                data.recent_orders.map((order) => (
                  <tr key={order.id} className="border-b border-[#C8C4BC]/20 hover:bg-[#F9F8F6]/50 transition-colors">
                    <td className="p-4 pl-6">
                      <Link href={`/admin/orders/${order.id}`} className="font-bold text-[#0A0A0A] hover:text-[#00D4FF] transition-colors">
                        {order.order_number}
                      </Link>
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
                    <td className="p-4 pr-6 text-right font-bold text-[#0A0A0A]">{formatPrice(order.total_price)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[#8A8680]">No recent orders found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
