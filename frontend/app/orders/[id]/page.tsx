"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, ChevronRight, Package, ArrowLeft } from "lucide-react";
import { apiGet } from "@/lib/api";
import { Order } from "@/types";
import { formatPrice } from "@/lib/utils";

export default function OrderDetailPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const status = searchParams.get("status");

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      apiGet(`/orders/${id}`)
        .then((res) => setOrder(res))
        .catch((err) => console.error("Failed to load order", err))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F2F0EB] pt-28 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0A0A0A]"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#F2F0EB] pt-28 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-black mb-4">Order Not Found</h1>
        <Link href="/shop" className="text-blue-600 underline">Back to Shop</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2F0EB] pt-24 pb-16 px-6 md:px-10">
      <div className="max-w-[800px] mx-auto">
        {status === "success" && (
          <div className="bg-green-50 border border-green-200 text-green-800 rounded-3xl p-6 mb-8 flex flex-col items-center text-center">
            <CheckCircle2 size={48} className="text-green-500 mb-4" />
            <h2 className="text-2xl font-black mb-2">Order Successfully Placed!</h2>
            <p>Thank you for your purchase. We are preparing your order.</p>
          </div>
        )}

        <div className="mb-6">
          <Link href="/orders" className="inline-flex items-center gap-2 text-[#4A4845] hover:text-[#0A0A0A] font-semibold transition-colors">
            <ArrowLeft size={16} /> Back to Orders
          </Link>
        </div>

        <div className="bg-[#E8E5DF] border border-[#C8C4BC] rounded-3xl p-6 sm:p-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[#C8C4BC] pb-6 mb-6">
            <div>
              <h1 className="text-2xl font-black text-[#0A0A0A]">Order #{order.id}</h1>
              <p className="text-[#8A8680] mt-1">{new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <span className="bg-[#0A0A0A] text-[#F2F0EB] px-4 py-2 rounded-full font-bold uppercase text-xs tracking-wider">
                {order.status}
              </span>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-[#0A0A0A] mb-4 flex items-center gap-2">
                <Package size={20} /> Items
              </h3>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center bg-[#F2F0EB] p-4 rounded-xl border border-[#C8C4BC]">
                    <div>
                      <h4 className="font-bold text-[#0A0A0A]">{item.product_name}</h4>
                      <p className="text-sm text-[#4A4845]">Size: {item.variant_size} | Qty: {item.quantity}</p>
                    </div>
                    <span className="mono font-bold">{formatPrice(Number(item.subtotal))}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-[#C8C4BC] pt-6 grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div>
                <h3 className="font-bold text-[#0A0A0A] mb-3">Shipping Info</h3>
                <p className="text-sm text-[#4A4845] leading-relaxed">
                  <span className="font-bold text-[#0A0A0A] block">{order.shipping_name}</span>
                  {order.shipping_phone}<br />
                  {order.shipping_address}<br />
                  {order.shipping_city}, {order.shipping_province} {order.shipping_postal_code}
                </p>
                <div className="mt-4 text-sm">
                  <span className="font-bold text-[#0A0A0A]">Courier: </span> 
                  <span className="uppercase">{order.courier} - {order.courier_service}</span>
                </div>
              </div>

              <div className="bg-[#F2F0EB] p-6 rounded-2xl border border-[#C8C4BC]">
                <h3 className="font-bold text-[#0A0A0A] mb-4">Summary</h3>
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-[#4A4845]">Subtotal</span>
                    <span className="mono font-semibold">{formatPrice(Number(order.subtotal))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#4A4845]">Shipping</span>
                    <span className="mono font-semibold">{formatPrice(Number(order.shipping_cost))}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center border-t border-[#C8C4BC] pt-4">
                  <span className="font-bold text-[#0A0A0A]">Total</span>
                  <span className="mono text-xl font-black text-[#5C1A1A]">{formatPrice(Number(order.total_price))}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
