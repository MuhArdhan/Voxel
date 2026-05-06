"use client";

import { useState, useEffect } from "react";
import { apiGet, apiPut, STORAGE_URL } from "@/lib/api";
import { type Order } from "@/types";
import { formatPrice, formatDate } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft, User, MapPin, CreditCard, Package } from "lucide-react";
import { useParams } from "next/navigation";

const STATUS_COLORS: Record<string, string> = {
  pending: "#F59E0B",
  paid: "#3B82F6",
  processing: "#8B5CF6",
  shipped: "#06B6D4",
  completed: "#10B981",
  cancelled: "#EF4444",
};

export default function AdminOrderDetailPage() {
  const params = useParams();
  const id = params.id as string;
  
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Update state
  const [status, setStatus] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await apiGet<Order>(`/admin/orders/${id}`);
        setOrder(res);
        setStatus(res.status);
        setTrackingNumber(res.tracking_number || "");
      } catch (err) {
        console.error("Failed to load order", err);
      } finally {
        setIsLoading(false);
      }
    }
    if (id) fetchOrder();
  }, [id]);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setMessage(null);

    try {
      const payload: any = { status };
      if (status === 'shipped') {
        payload.tracking_number = trackingNumber;
      }

      const res = await apiPut<{ message: string; order: Order }>(`/admin/orders/${id}/status`, payload);
      setOrder(res.order);
      setMessage({ type: "success", text: "Order status updated successfully." });
    } catch (err: any) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to update status." });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-8 animate-pulse">
        <div className="h-4 w-32 bg-[#E8E5DF] rounded mb-6" />
        <div className="flex justify-between">
          <div>
            <div className="h-8 w-64 bg-[#E8E5DF] rounded mb-2" />
            <div className="h-3 w-48 bg-[#E8E5DF] rounded" />
          </div>
          <div className="h-8 w-24 bg-[#E8E5DF] rounded-full" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white border border-[#C8C4BC] rounded-2xl p-6 shadow-sm">
               <div className="h-6 w-40 bg-[#E8E5DF] rounded mb-6 border-b border-[#C8C4BC]/60 pb-4" />
               <div className="space-y-6">
                 {[1,2].map(i => (
                   <div key={i} className="flex gap-4">
                     <div className="w-20 h-20 bg-[#E8E5DF]/50 rounded-xl shrink-0" />
                     <div className="flex-1 space-y-2">
                       <div className="h-4 w-32 bg-[#E8E5DF] rounded" />
                       <div className="h-3 w-20 bg-[#E8E5DF] rounded" />
                       <div className="h-6 w-24 bg-[#E8E5DF]/50 rounded-md" />
                     </div>
                     <div className="w-20 space-y-2 text-right">
                       <div className="h-4 w-16 bg-[#E8E5DF] rounded ml-auto" />
                       <div className="h-3 w-10 bg-[#E8E5DF] rounded ml-auto" />
                       <div className="h-4 w-20 bg-[#E8E5DF] rounded ml-auto mt-2" />
                     </div>
                   </div>
                 ))}
               </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-[#C8C4BC] rounded-2xl p-6 shadow-sm">
                <div className="h-6 w-32 bg-[#E8E5DF] rounded mb-6" />
                <div className="space-y-3">
                  <div className="h-4 w-40 bg-[#E8E5DF] rounded" />
                  <div className="h-3 w-48 bg-[#E8E5DF] rounded" />
                  <div className="h-3 w-32 bg-[#E8E5DF] rounded" />
                </div>
              </div>
              <div className="bg-white border border-[#C8C4BC] rounded-2xl p-6 shadow-sm">
                <div className="h-6 w-40 bg-[#E8E5DF] rounded mb-6" />
                <div className="space-y-3">
                  <div className="h-4 w-48 bg-[#E8E5DF] rounded" />
                  <div className="h-3 w-32 bg-[#E8E5DF] rounded" />
                  <div className="h-3 w-full bg-[#E8E5DF] rounded" />
                  <div className="h-3 w-40 bg-[#E8E5DF] rounded" />
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-white border border-[#C8C4BC] rounded-2xl p-6 shadow-sm">
              <div className="h-6 w-32 bg-[#E8E5DF] rounded mb-6 border-b border-[#C8C4BC]/60 pb-4" />
              <div className="space-y-4">
                <div><div className="h-3 w-24 bg-[#E8E5DF] rounded mb-2" /><div className="h-10 w-full bg-[#E8E5DF]/50 rounded-xl" /></div>
                <div><div className="h-3 w-24 bg-[#E8E5DF] rounded mb-2" /><div className="h-10 w-full bg-[#E8E5DF]/50 rounded-xl" /></div>
                <div className="h-12 w-full bg-[#E8E5DF] rounded-xl mt-4" />
              </div>
            </div>
            <div className="bg-white border border-[#C8C4BC] rounded-2xl p-6 shadow-sm">
              <div className="h-6 w-40 bg-[#E8E5DF] rounded mb-6 border-b border-[#C8C4BC]/60 pb-4" />
              <div className="space-y-3 mb-6">
                <div className="flex justify-between"><div className="h-3 w-16 bg-[#E8E5DF] rounded" /><div className="h-3 w-20 bg-[#E8E5DF] rounded" /></div>
                <div className="flex justify-between"><div className="h-3 w-24 bg-[#E8E5DF] rounded" /><div className="h-3 w-16 bg-[#E8E5DF] rounded" /></div>
                <div className="flex justify-between pt-3 border-t border-[#C8C4BC]/60"><div className="h-4 w-12 bg-[#E8E5DF] rounded" /><div className="h-4 w-24 bg-[#E8E5DF] rounded" /></div>
              </div>
              <div className="h-24 w-full bg-[#E8E5DF]/50 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-[#0A0A0A]">Order Not Found</h2>
        <Link href="/admin/orders" className="text-[#00D4FF] hover:underline mt-4 inline-block">Return to Orders</Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <Link 
          href="/admin/orders"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#8A8680] hover:text-[#0A0A0A] transition-colors mb-6"
        >
          <ArrowLeft size={14} /> Back to Orders
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-[#0A0A0A] tracking-tight mb-2">
              Order #{order.order_number}
            </h1>
            <p className="mono text-[10px] text-[#8A8680] tracking-[0.2em] uppercase">
              Placed on {formatDate(order.created_at)}
            </p>
          </div>
          <span 
            className="inline-block px-4 py-2 rounded-full text-xs uppercase tracking-wider font-bold"
            style={{ 
              backgroundColor: `${STATUS_COLORS[order.status]}20`,
              color: STATUS_COLORS[order.status] 
            }}
          >
            {order.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content: Items & Customer Info */}
        <div className="lg:col-span-2 space-y-8">
          {/* Order Items */}
          <div className="bg-white border border-[#C8C4BC] rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-[#C8C4BC]/60 flex items-center gap-3">
              <Package className="text-[#0A0A0A]" size={20} />
              <h2 className="text-lg font-bold text-[#0A0A0A]">Order Items</h2>
            </div>
            <div className="divide-y divide-[#C8C4BC]/60">
              {order.items.map((item) => (
                <div key={item.id} className="p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                  <div className="w-20 h-20 bg-[#F2F0EB] border border-[#C8C4BC]/60 rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
                    {item.product?.primary_image ? (
                      <img src={`${STORAGE_URL}/${item.product.primary_image.image_path}`} alt={item.product_name} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="text-[#C8C4BC]" size={24} />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-[#0A0A0A] mb-1">{item.product_name}</h3>
                    <p className="text-xs text-[#8A8680] mb-2">SKU: {item.product_sku}</p>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span className="px-2 py-1 bg-[#F2F0EB] rounded-md text-xs font-medium text-[#4A4845]">Size: {item.variant_size}</span>
                      {item.variant_color && (
                        <span className="px-2 py-1 bg-[#F2F0EB] rounded-md text-xs font-medium text-[#4A4845]">Color: {item.variant_color}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-[#0A0A0A]">{formatPrice(item.unit_price)}</p>
                    <p className="text-xs text-[#8A8680] mt-1">Qty: {item.quantity}</p>
                    <p className="font-black text-[#5C1A1A] mt-2">{formatPrice(item.subtotal)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Customer & Shipping */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-[#C8C4BC] rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <User className="text-[#0A0A0A]" size={20} />
                <h2 className="text-lg font-bold text-[#0A0A0A]">Customer</h2>
              </div>
              {order.user ? (
                <div>
                  <p className="font-bold text-[#0A0A0A] mb-1">{order.user.name}</p>
                  <p className="text-sm text-[#4A4845] mb-1">{order.user.email}</p>
                  <p className="text-sm text-[#4A4845]">{order.user.phone || 'No phone'}</p>
                </div>
              ) : (
                <p className="text-sm text-[#8A8680]">Guest Checkout</p>
              )}
            </div>

            <div className="bg-white border border-[#C8C4BC] rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <MapPin className="text-[#0A0A0A]" size={20} />
                <h2 className="text-lg font-bold text-[#0A0A0A]">Shipping Address</h2>
              </div>
              <p className="font-bold text-[#0A0A0A] mb-1">{order.shipping_name}</p>
              <p className="text-sm text-[#4A4845] mb-1">{order.shipping_phone}</p>
              <p className="text-sm text-[#4A4845] mb-1">{order.shipping_address}</p>
              <p className="text-sm text-[#4A4845]">{order.shipping_city}, {order.shipping_province} {order.shipping_postal_code}</p>
            </div>
          </div>
        </div>

        {/* Sidebar: Status Update & Summary */}
        <div className="space-y-6">
          <div className="bg-white border border-[#C8C4BC] rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-[#0A0A0A] mb-6 border-b border-[#C8C4BC]/60 pb-4">Manage Status</h2>
            
            <form onSubmit={handleUpdateStatus} className="space-y-4">
              {message && (
                <div className={`p-3 rounded-lg text-xs font-bold ${
                  message.type === "success" 
                    ? "bg-[#10B981]/10 text-[#10B981]" 
                    : "bg-[#FF6B6B]/10 text-[#FF6B6B]"
                }`}>
                  {message.text}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#8A8680] uppercase">Order Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#F2F0EB] border border-[#C8C4BC] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A0A0A] text-sm"
                >
                  <option value="pending">Pending (Unpaid)</option>
                  <option value="paid">Paid (Awaiting Processing)</option>
                  <option value="processing">Processing (Packing)</option>
                  <option value="shipped">Shipped (In Transit)</option>
                  <option value="completed">Completed (Delivered)</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {(status === 'shipped' || order.tracking_number) && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#8A8680] uppercase">Tracking Number (Resi)</label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="e.g. JNT1234567890"
                    className="w-full px-4 py-2.5 bg-[#F2F0EB] border border-[#C8C4BC] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A0A0A] text-sm"
                  />
                </div>
              )}

              <button 
                type="submit" 
                disabled={isUpdating}
                className="w-full bg-[#0A0A0A] text-[#F2F0EB] rounded-xl px-4 py-3 text-sm font-bold hover:bg-[#5C1A1A] disabled:opacity-50 transition-colors mt-2"
              >
                {isUpdating ? "UPDATING..." : "SAVE STATUS"}
              </button>
            </form>
          </div>

          <div className="bg-white border border-[#C8C4BC] rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6 border-b border-[#C8C4BC]/60 pb-4">
              <CreditCard className="text-[#0A0A0A]" size={20} />
              <h2 className="text-lg font-bold text-[#0A0A0A]">Payment Details</h2>
            </div>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-[#8A8680]">Subtotal</span>
                <span className="font-medium text-[#0A0A0A]">{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#8A8680]">Shipping ({order.courier.toUpperCase()} {order.courier_service})</span>
                <span className="font-medium text-[#0A0A0A]">{formatPrice(order.shipping_cost)}</span>
              </div>
              <div className="pt-3 border-t border-[#C8C4BC]/60 flex justify-between">
                <span className="font-bold text-[#0A0A0A]">Total</span>
                <span className="font-black text-[#5C1A1A]">{formatPrice(order.total_price)}</span>
              </div>
            </div>

            <div className="bg-[#F2F0EB] p-4 rounded-xl space-y-2">
              <p className="text-xs text-[#8A8680] uppercase tracking-wider font-bold mb-1">Method</p>
              <p className="text-sm font-medium text-[#0A0A0A]">{order.payment_method || 'Midtrans / Xendit Gateway'}</p>
              {order.paid_at && (
                <p className="text-xs text-[#10B981] font-bold mt-2">Paid on {formatDate(order.paid_at)}</p>
              )}
            </div>
            
            {order.notes && (
              <div className="mt-6">
                <p className="text-xs text-[#8A8680] uppercase tracking-wider font-bold mb-2">Customer Notes</p>
                <div className="bg-[#FFFCEB] border border-[#FDE68A] p-4 rounded-xl">
                  <p className="text-sm text-[#92400E]">{order.notes}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
