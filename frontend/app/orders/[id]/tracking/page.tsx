"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { apiGet } from "@/lib/api";
import { getErrorMessage } from "@/lib/utils";
import type { Order, BiteshipTracking } from "@/types";
import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { ChevronRight, ArrowLeft } from "lucide-react";

export default function OrderTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const { isLoggedIn, isLoading: authLoading } = useAuth();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [tracking, setTracking] = useState<BiteshipTracking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const orderId = params.id as string;

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.push(`/login?redirect=/orders/${orderId}/tracking`);
    }
  }, [authLoading, isLoggedIn, router, orderId]);

  useEffect(() => {
    if (!isLoggedIn) return;
    fetchData();
  }, [isLoggedIn, orderId]);

  async function fetchData() {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch order details first to ensure it exists and we have the tracking number
      const orderRes = await apiGet<Order>(`/orders/${orderId}`);
      setOrder(orderRes);

      if (orderRes.tracking_number && (orderRes.status === 'shipped' || orderRes.status === 'completed')) {
        try {
          const trackingRes = await apiGet<BiteshipTracking>(`/orders/${orderId}/tracking`);
          setTracking(trackingRes);
        } catch (e) {
          console.error("Failed to fetch tracking data", e);
        }
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  if (authLoading || !isLoggedIn || isLoading) {
    return (
      <div className="min-h-screen bg-[#F2F0EB] flex items-center justify-center py-24">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[#0A0A0A] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <div className="mono text-[10px] text-[#8A8680] tracking-[0.3em] uppercase animate-pulse">
            System Protocol // Loading
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#F2F0EB] py-24 md:py-32 relative">
        <div className="max-w-[800px] mx-auto px-6 md:px-10 relative z-10">
          <div className="bg-[#DC2626]/10 border border-[#DC2626]/30 text-[#DC2626] px-6 py-4 rounded-xl font-mono text-sm tracking-wider mb-6">
            ERR // {error || "Order details not found."}
          </div>
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 mono text-[10px] text-[#0A0A0A] tracking-[0.2em] uppercase font-bold hover:opacity-70 transition-opacity"
          >
            ← Return to History
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2F0EB] py-24 md:py-32 relative">
      <Navbar />
      {/* Grain texture overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.15]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.2'/%3E%3C/svg%3E")`,
          backgroundSize: "200px 200px",
        }}
      />

      <div className="max-w-[800px] mx-auto px-6 md:px-10 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Breadcrumb & Navigation */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4">
            <nav className="flex flex-wrap items-center gap-2 text-[10px] font-semibold tracking-[0.15em] uppercase text-[#8A8680]">
              <Link href="/" className="hover:text-[#0A0A0A] transition-colors">Home</Link>
              <ChevronRight size={12} />
              <Link href="/orders" className="hover:text-[#0A0A0A] transition-colors">Orders</Link>
              <ChevronRight size={12} />
              <Link href={`/orders/${order.id}`} className="hover:text-[#0A0A0A] transition-colors">{order.order_number}</Link>
              <ChevronRight size={12} />
              <span className="text-[#0A0A0A]">Tracking</span>
            </nav>

            <Link
              href={`/orders/${order.id}`}
              className="inline-flex items-center gap-2 mono text-[10px] text-[#0A0A0A] tracking-[0.2em] uppercase font-bold hover:text-[#5C1A1A] transition-colors bg-[#E8E5DF]/60 border border-[#C8C4BC]/60 px-4 py-2 rounded-lg w-fit"
            >
              <ArrowLeft size={14} /> Back to Order
            </Link>
          </div>

          <div className="mb-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-8 h-px bg-[#C8C4BC]" />
              <div className="mono text-[10px] text-[#8A8680] tracking-[0.25em] uppercase">
                Shipment Tracking
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-[#0A0A0A] mb-4">
              {order.tracking_number || "No Waybill"}
            </h1>
            <div className="flex items-center gap-3">
              <span className="mono text-[10px] bg-[#0A0A0A] text-[#F2F0EB] px-3 py-1 rounded-md uppercase tracking-widest font-bold">
                {order.courier} - {order.courier_service}
              </span>
              <span className="mono text-[10px] text-[#65A30D] bg-[#65A30D]/10 border border-[#65A30D]/30 px-3 py-1 rounded-md uppercase tracking-widest font-bold">
                POWERED BY BITESHIP
              </span>
            </div>
          </div>

          {/* Live Tracking Timeline */}
          <div className="bg-[#E8E5DF]/60 border border-[#C8C4BC]/60 rounded-2xl p-6 md:p-10 shadow-sm">
            <h2 className="text-xl font-black text-[#0A0A0A] mb-8 border-b border-[#C8C4BC]/60 pb-4">Tracking History</h2>

            {!order.tracking_number ? (
              <div className="py-8 text-center bg-white/40 rounded-xl border border-dashed border-[#C8C4BC]">
                <p className="mono text-[10px] text-[#8A8680] uppercase tracking-widest font-bold mb-2">Tracking not available</p>
                <p className="text-sm text-[#4A4845]">This order has not been shipped yet.</p>
              </div>
            ) : tracking && tracking.history && tracking.history.length > 0 ? (
              <div className="relative pl-2 md:pl-4">
                <div className="absolute left-[15px] md:left-[23px] top-3 bottom-3 w-[2px] bg-gradient-to-b from-[#0A0A0A] to-[#C8C4BC]" />
                <div className="space-y-8">
                  {[...tracking.history].reverse().map((h, i) => (
                    <div key={i} className="flex gap-6 relative group">
                      <div className={`w-4 h-4 md:w-5 md:h-5 rounded-full border-4 flex-shrink-0 mt-0.5 z-10 transition-colors duration-300 ${
                        i === 0 ? 'bg-[#0A0A0A] border-[#0A0A0A]' : 'bg-[#F2F0EB] border-[#C8C4BC] group-hover:border-[#8A8680]'
                      }`} />
                      <div className="flex-1 bg-white/50 border border-[#C8C4BC]/40 rounded-xl p-4 md:p-5 hover:bg-white transition-colors duration-300">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                          <p className={`text-base md:text-lg font-bold leading-tight ${
                            i === 0 ? 'text-[#0A0A0A]' : 'text-[#4A4845]'
                          }`}>{h.status.toUpperCase().replace(/_/g, ' ')}</p>
                          <p className="mono text-[10px] md:text-xs text-[#8A8680] uppercase tracking-wider font-bold">
                            {new Date(h.updated_at).toLocaleString('id-ID', {
                              day: '2-digit', month: 'short', year: 'numeric',
                              hour: '2-digit', minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <p className={`text-sm ${
                          i === 0 ? 'text-[#0A0A0A] font-medium' : 'text-[#8A8680]'
                        }`}>{h.note}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center bg-white/40 rounded-xl border border-dashed border-[#C8C4BC]">
                <div className="w-12 h-12 bg-[#0A0A0A] rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
                <p className="mono text-[12px] text-[#0A0A0A] font-bold uppercase tracking-widest mb-2">Awaiting Courier Scan</p>
                <p className="text-sm text-[#8A8680] max-w-sm mx-auto">Waybill has been generated but the courier hasn't picked up the package yet. Check back soon.</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
