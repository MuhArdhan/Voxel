"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { apiGet, apiPost } from "@/lib/api";
import { formatPrice, formatDate, getErrorMessage } from "@/lib/utils";
import type { Order } from "@/types";
import Link from "next/link";
import { motion } from "framer-motion";

const statusConfig: Record<
  Order["status"],
  { label: string; text: string; bg: string; border: string; glow: string }
> = {
  pending: { label: "AWAITING PAYMENT", text: "text-[#FFB347]", bg: "bg-[#FFB347]/10", border: "border-[#FFB347]/30", glow: "from-[#FFB347]" },
  paid: { label: "PAID", text: "text-[#00D4FF]", bg: "bg-[#00D4FF]/10", border: "border-[#00D4FF]/30", glow: "from-[#00D4FF]" },
  processing: { label: "PROCESSING", text: "text-[#8B5CF6]", bg: "bg-[#8B5CF6]/10", border: "border-[#8B5CF6]/30", glow: "from-[#8B5CF6]" },
  shipped: { label: "SHIPPED", text: "text-[#C8FF00]", bg: "bg-[#C8FF00]/10", border: "border-[#C8FF00]/30", glow: "from-[#C8FF00]" },
  completed: { label: "COMPLETED", text: "text-[#10B981]", bg: "bg-[#10B981]/10", border: "border-[#10B981]/30", glow: "from-[#10B981]" },
  cancelled: { label: "CANCELLED", text: "text-[#FF6B6B]", bg: "bg-[#FF6B6B]/10", border: "border-[#FF6B6B]/30", glow: "from-[#FF6B6B]" },
};

const statusSteps: Order["status"][] = ["pending", "paid", "processing", "shipped", "completed"];

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

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
    if (!order || !confirm("Are you sure you want to cancel this order?")) return;

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
        <div className="max-w-[1000px] mx-auto px-6 md:px-10 relative z-10">
          <div className="bg-[#FF6B6B]/10 border border-[#FF6B6B]/30 text-[#FF6B6B] px-6 py-4 rounded-xl font-mono text-sm tracking-wider mb-6">
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

  const status = statusConfig[order.status];
  const currentStepIndex = statusSteps.indexOf(order.status);

  return (
    <div className="min-h-screen bg-[#F2F0EB] py-24 md:py-32 relative">
      {/* Grain texture overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.15]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.2'/%3E%3C/svg%3E")`,
          backgroundSize: "200px 200px",
        }}
      />

      <div className="max-w-[1000px] mx-auto px-6 md:px-10 relative z-10">
        {/* Success Banner */}
        {showSuccessBanner && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#10B981]/10 border border-[#10B981]/30 text-[#10B981] px-6 py-4 rounded-xl mb-8 flex items-start justify-between backdrop-blur-sm"
          >
            <div>
              <p className="font-mono text-sm font-bold mb-1 tracking-wider">ORDER SUCCESS</p>
              <p className="text-sm opacity-90">
                Your order has been registered in the system. Processing will commence shortly.
              </p>
            </div>
            <button
              onClick={() => setShowSuccessBanner(false)}
              className="text-[#10B981] hover:text-[#0A0A0A] transition-colors"
            >
              <span className="text-xl leading-none">×</span>
            </button>
          </motion.div>
        )}

        {/* Header */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-10"
        >
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 mono text-[10px] text-[#8A8680] tracking-[0.2em] uppercase hover:text-[#0A0A0A] transition-colors mb-8"
          >
            ← Return to History
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-8 h-px bg-[#C8C4BC]" />
                <div className="mono text-[10px] text-[#8A8680] tracking-[0.25em] uppercase">
                  Order Details
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-[#0A0A0A] mb-2">
                {order.order_number}
              </h1>
            </div>
            <div className="md:pb-2">
              <span
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-[10px] font-bold tracking-[0.2em] uppercase border ${status.bg} ${status.text} ${status.border}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${status.bg.replace('/10', '')} ${order.status !== 'cancelled' && order.status !== 'completed' ? 'animate-pulse' : ''}`} />
                {status.label}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Status Tracker */}
        {order.status !== "cancelled" && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="bg-[#E8E5DF]/60 border border-[#C8C4BC]/60 rounded-2xl p-8 md:p-10 mb-8 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-[#0A0A0A]/10" />
            
            <div className="relative max-w-3xl mx-auto">
              {/* Progress Line */}
              <div className="absolute top-5 left-[10%] right-[10%] h-px bg-[#C8C4BC]">
                <div
                  className="h-full bg-gradient-to-r from-[#0A0A0A] to-[#0A0A0A] transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(10,10,10,0.5)]"
                  style={{
                    width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%`,
                  }}
                />
              </div>

              {/* Steps */}
              <div className="relative flex justify-between z-10">
                {statusSteps.map((step, index) => {
                  const isActive = index <= currentStepIndex;
                  const stepConfig = statusConfig[step];
                  return (
                    <div key={step} className="flex flex-col items-center w-1/5 group">
                      <motion.div
                        initial={false}
                        animate={{
                          scale: isActive ? 1 : 0.8,
                          backgroundColor: isActive ? "#0A0A0A" : "#E8E5DF",
                          borderColor: isActive ? "#0A0A0A" : "#C8C4BC",
                        }}
                        className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center mb-4 transition-colors duration-500 shadow-sm relative ${isActive ? "text-[#F2F0EB]" : "text-[#8A8680]"}`}
                      >
                        {isActive && (
                          <div className={`absolute inset-0 border border-white/20 rounded-lg animate-ping opacity-20`} />
                        )}
                        {isActive ? (
                          <span className="text-[10px] mono font-bold">0{index + 1}</span>
                        ) : (
                          <span className="text-[10px] mono font-medium">0{index + 1}</span>
                        )}
                      </motion.div>
                      <p
                        className={`text-[9px] text-center uppercase tracking-[0.2em] font-bold ${
                          isActive ? "text-[#0A0A0A]" : "text-[#8A8680]"
                        }`}
                      >
                        {stepConfig.label.split(" ")[0]}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column — Items & Shipping */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-2 space-y-8"
          >
            {/* Order Items */}
            <div className="bg-[#E8E5DF]/60 border border-[#C8C4BC]/60 rounded-2xl p-6 md:p-8">
              <h2 className="mono text-[10px] text-[#8A8680] tracking-[0.2em] uppercase mb-6 flex items-center gap-3">
                <span className="w-4 h-px bg-[#C8C4BC]" />
                Items
              </h2>
              <div className="space-y-6">
                {order.items.map((item) => (
                  <div key={item.id} className="flex flex-col sm:flex-row gap-6 pb-6 border-b border-[#C8C4BC]/40 last:border-0 last:pb-0">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 bg-[#D4D0C8] rounded-xl overflow-hidden flex-shrink-0 border border-[#C8C4BC]">
                      {item.product?.primary_image ? (
                        <img
                          src={item.product.primary_image.image_url}
                          alt={item.product_name}
                          className="w-full h-full object-cover mix-blend-multiply hover:scale-105 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#8A8680] mono text-[10px] uppercase">
                          No Img
                        </div>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-[#0A0A0A] text-lg leading-tight mb-3">{item.product_name}</h3>
                        <div className="flex flex-wrap gap-x-6 gap-y-2 mb-2">
                          <div>
                            <p className="mono text-[9px] text-[#8A8680] tracking-[0.2em] uppercase mb-1">SKU</p>
                            <p className="mono text-[11px] font-bold text-[#4A4845]">{item.product_sku}</p>
                          </div>
                          <div>
                            <p className="mono text-[9px] text-[#8A8680] tracking-[0.2em] uppercase mb-1">Size</p>
                            <p className="mono text-[11px] font-bold text-[#4A4845]">{item.variant_size}</p>
                          </div>
                          {item.variant_color && (
                            <div>
                              <p className="mono text-[9px] text-[#8A8680] tracking-[0.2em] uppercase mb-1">Color</p>
                              <p className="mono text-[11px] font-bold text-[#4A4845]">{item.variant_color}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-end justify-between mt-4 sm:mt-0">
                        <div className="mono text-[10px] tracking-wider font-bold bg-[#0A0A0A] text-[#F2F0EB] px-2.5 py-1 rounded">
                          QTY {String(item.quantity).padStart(2, '0')}
                        </div>
                        <p className="text-xl font-bold text-[#0A0A0A] tracking-tight">{formatPrice(item.subtotal)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Info */}
            <div className="bg-[#E8E5DF]/60 border border-[#C8C4BC]/60 rounded-2xl p-6 md:p-8">
              <h2 className="mono text-[10px] text-[#8A8680] tracking-[0.2em] uppercase mb-6 flex items-center gap-3">
                <span className="w-4 h-px bg-[#C8C4BC]" />
                Shipping Details
              </h2>
              <div className="grid sm:grid-cols-2 gap-8">
                <div>
                  <p className="mono text-[9px] text-[#8A8680] tracking-[0.2em] uppercase mb-1.5">Recipient Identity</p>
                  <p className="font-bold text-[#0A0A0A]">{order.shipping_name}</p>
                  <p className="text-[#4A4845] text-sm">{order.shipping_phone}</p>
                </div>
                <div>
                  <p className="mono text-[9px] text-[#8A8680] tracking-[0.2em] uppercase mb-1.5">Address</p>
                  <p className="font-bold text-[#0A0A0A]">{order.shipping_address}</p>
                  <p className="text-[#4A4845] text-sm">
                    {order.shipping_city}, {order.shipping_province} {order.shipping_postal_code}
                  </p>
                </div>
                <div>
                  <p className="mono text-[9px] text-[#8A8680] tracking-[0.2em] uppercase mb-1.5">Logistics</p>
                  <p className="font-bold text-[#0A0A0A]">
                    {order.courier.toUpperCase()} <span className="text-[#8A8680] font-normal text-sm">— {order.courier_service}</span>
                  </p>
                </div>
                {order.tracking_number && (
                  <div>
                    <p className="mono text-[9px] text-[#8A8680] tracking-[0.2em] uppercase mb-1.5">Tracking ID</p>
                    <p className="mono text-sm font-bold text-[#0A0A0A] mb-2 inline-block">
                      {order.tracking_number}
                    </p>
                    <a
                      href={`https://cekresi.com/?noresi=${order.tracking_number}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block mono text-[9px] font-bold text-[#00D4FF] hover:text-[#0A0A0A] uppercase tracking-[0.1em] transition-colors"
                    >
                      Initialize Tracking →
                    </a>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Right Column — Summary & Actions */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            {/* Order Summary */}
            <div className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-3xl p-6 sm:p-8 text-[#F2F0EB]">
              <h2 className="text-xl font-black mb-6 border-b border-[#2A2A2A] pb-4">Order Summary</h2>

              <div className="space-y-3 mb-6 text-sm">
                <div className="flex justify-between text-[#8A8680]">
                  <span>Subtotal</span>
                  <span className="mono text-[#F2F0EB]">{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-[#8A8680]">
                  <span>Shipping Cost</span>
                  <span className="mono text-[#F2F0EB]">{formatPrice(order.shipping_cost)}</span>
                </div>
              </div>

              <div className="flex justify-between items-end pt-6 border-t border-[#2A2A2A]">
                <span className="font-bold text-[#8A8680]">Total</span>
                <span className="mono text-2xl font-black text-white">
                  {formatPrice(order.total_price)}
                </span>
              </div>
            </div>

            {/* Order Info */}
            <div className="bg-[#E8E5DF]/60 border border-[#C8C4BC]/60 rounded-2xl p-6 md:p-8">
              <h2 className="mono text-[10px] text-[#8A8680] tracking-[0.2em] uppercase mb-6 flex items-center gap-3">
                <span className="w-4 h-px bg-[#C8C4BC]" />
                Metadata
              </h2>
              <div className="space-y-5">
                <div>
                  <span className="mono text-[9px] text-[#8A8680] tracking-[0.2em] uppercase block mb-1">Order date</span>
                  <span className="font-bold text-[#0A0A0A]">{formatDate(order.created_at)}</span>
                </div>
                {order.paid_at && (
                  <div>
                    <span className="mono text-[9px] text-[#8A8680] tracking-[0.2em] uppercase block mb-1">Timestamp Auth</span>
                    <span className="font-bold text-[#0A0A0A]">{formatDate(order.paid_at)}</span>
                  </div>
                )}
                {order.notes && (
                  <div className="pt-5 border-t border-[#C8C4BC]/40">
                    <span className="mono text-[9px] text-[#8A8680] tracking-[0.2em] uppercase block mb-2">User Notes</span>
                    <div className="bg-[#E8E5DF] border border-[#C8C4BC] rounded p-3 text-sm text-[#4A4845] relative">
                      <div className="absolute top-0 left-0 w-1 h-full bg-[#C8C4BC]" />
                      {order.notes}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Cancel Button */}
            {order.status === "pending" && (
              <button
                onClick={handleCancelOrder}
                disabled={isCancelling}
                className="w-full relative group bg-transparent border border-[#FF6B6B]/50 text-[#FF6B6B] font-mono text-[10px] font-bold tracking-[0.2em] uppercase py-4 rounded-xl hover:bg-[#FF6B6B]/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#FF6B6B] opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#FF6B6B] opacity-0 group-hover:opacity-100 transition-opacity" />
                {isCancelling ? "CANCELING..." : "CANCEL ORDER"}
              </button>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
