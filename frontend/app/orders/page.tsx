"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { apiGet } from "@/lib/api";
import { formatPrice, formatDate, getErrorMessage } from "@/lib/utils";
import type { Order, PaginatedResponse } from "@/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export default function OrdersPage() {
  const { isLoggedIn, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.push("/login?redirect=/orders");
    }
  }, [authLoading, isLoggedIn, router]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearchQuery(searchInput);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  useEffect(() => {
    if (!isLoggedIn) return;
    fetchOrders(currentPage, searchQuery);
  }, [isLoggedIn, currentPage, searchQuery]);

  async function fetchOrders(page: number, search: string) {
    try {
      setIsLoading(true);
      setError(null);
      const res = await apiGet<PaginatedResponse<Order>>("/orders", { page, search });
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
      <div className="min-h-screen bg-[#F2F0EB] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[#0A0A0A] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <div className="mono text-[10px] text-[#8A8680] tracking-[0.3em] uppercase animate-pulse">
            System Protocol // Loading
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="min-h-screen py-24 md:py-32 bg-[#F2F0EB] relative">
      {/* Grain texture overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.15]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.2'/%3E%3C/svg%3E")`,
          backgroundSize: "200px 200px",
        }}
      />

      <div className="max-w-[1000px] mx-auto px-6 md:px-10 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-14"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 mono text-[10px] text-[#8A8680] tracking-[0.2em] uppercase hover:text-[#0A0A0A] transition-colors mb-8"
          >
            ← Return to Home
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-8 h-px bg-[#C8C4BC]" />
                <div className="mono text-[10px] text-[#8A8680] tracking-[0.25em] uppercase">
                  User Protocol // Logs
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-[#0A0A0A]">
                Order<br />
                <span className="text-[#5C1A1A]">History.</span>
              </h1>
            </div>

            {/* Search Bar */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                setSearchQuery(searchInput);
                setCurrentPage(1);
              }}
              className="relative w-full md:w-72"
            >
              <input
                type="text"
                placeholder="Search order..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full bg-[#E8E5DF]/60 border border-[#C8C4BC]/60 text-[#0A0A0A] placeholder:text-[#8A8680] rounded-lg px-4 py-3 mono text-[10px] uppercase tracking-wider focus:outline-none focus:border-[#0A0A0A]/50 transition-colors"
              />
              <button 
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#0A0A0A] text-[#F2F0EB] p-1.5 rounded-md hover:bg-[#5C1A1A] transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </button>
            </form>
          </div>
        </motion.div>

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#FF6B6B]/10 border border-[#FF6B6B]/30 text-[#FF6B6B] px-6 py-4 rounded-xl mb-8 font-mono text-sm tracking-wider"
          >
            ERR // {error}
          </motion.div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-[#E8E5DF]/50 border border-[#C8C4BC]/50 rounded-xl p-6 animate-pulse flex flex-col md:flex-row gap-6">
                <div className="h-24 w-24 bg-[#D4D0C8] rounded-lg shrink-0" />
                <div className="flex-1 space-y-4 py-2">
                  <div className="h-3 bg-[#D4D0C8] rounded w-1/4" />
                  <div className="h-5 bg-[#D4D0C8] rounded w-1/2" />
                  <div className="h-3 bg-[#D4D0C8] rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && orders.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#E8E5DF] border border-[#C8C4BC] rounded-2xl p-16 text-center"
          >
            <div className="w-16 h-16 bg-[#2A2520] rounded-xl flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl opacity-50">📂</span>
            </div>
            <h3 className="text-xl font-bold text-[#0A0A0A] tracking-tight mb-2">No Records Found</h3>
            <p className="text-[#8A8680] text-sm mb-8">Your order logs are currently empty.</p>
            <Link
              href="/shop"
              className="group inline-flex items-center gap-3 px-7 py-3.5 bg-[#0A0A0A] text-[#F2F0EB] text-xs font-semibold tracking-[0.15em] uppercase rounded-full hover:bg-[#2A2520] transition-colors duration-300"
            >
              Initiate Drop
              <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
            </Link>
          </motion.div>
        )}

        {/* Orders List */}
        {!isLoading && orders.length > 0 && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            {orders.map((order) => {
              const status = statusConfig[order.status];
              return (
                <motion.div key={order.id} variants={itemVariants}>
                  <Link
                    href={`/orders/${order.id}`}
                    className="block group bg-[#E8E5DF]/60 border border-[#C8C4BC]/60 rounded-xl p-6 hover:bg-[#E8E5DF] hover:border-[#0A0A0A]/20 transition-all duration-300 relative overflow-hidden"
                  >
                    {/* Cyber tech accent line on hover */}
                    <div className={`absolute top-0 left-0 w-1 h-0 bg-gradient-to-b ${status.glow} to-transparent opacity-0 group-hover:h-full group-hover:opacity-100 transition-all duration-500 ease-out`} />
                    
                    <div className="flex flex-col md:flex-row gap-6 md:items-start justify-between mb-6">
                      <div>
                        <div className="flex items-center gap-3 mb-3">
                          <p className="mono text-[10px] font-bold text-[#0A0A0A] tracking-[0.2em] uppercase">
                            {order.order_number}
                          </p>
                          <div className="w-1 h-1 bg-[#C8C4BC] rounded-full" />
                          <p className="mono text-[10px] text-[#8A8680] tracking-[0.1em]">
                            {formatDate(order.created_at)}
                          </p>
                        </div>
                        <span
                          className={`inline-flex items-center gap-2 px-2.5 py-1 rounded text-[9px] font-bold tracking-[0.2em] uppercase border ${status.bg} ${status.text} ${status.border}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${status.bg.replace('/10', '')} animate-pulse`} />
                          {status.label}
                        </span>
                      </div>
                      
                      <div className="text-left md:text-right">
                        <p className="mono text-[9px] text-[#8A8680] tracking-[0.2em] uppercase mb-1">Total</p>
                        <p className="text-xl font-bold text-[#0A0A0A] tracking-tight">{formatPrice(order.total_price)}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-5 border-t border-[#C8C4BC]/40">
                      <div className="flex items-center gap-3">
                        {order.items.slice(0, 3).map((item, idx) => (
                          <div key={item.id} className={`w-12 h-12 bg-[#D4D0C8] rounded-lg overflow-hidden flex-shrink-0 border border-[#E8E5DF] ${idx > 0 ? '-ml-5' : ''} group-hover:translate-y-[-2px] transition-transform duration-300`} style={{ transitionDelay: `${idx * 50}ms` }}>
                            {item.product?.primary_image ? (
                              <img
                                src={item.product.primary_image.image_url}
                                alt={item.product_name}
                                className="w-full h-full object-cover mix-blend-multiply"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[#8A8680]/50 text-xs">
                                IMG
                              </div>
                            )}
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <div className="w-12 h-12 bg-[#2A2520] text-[#F2F0EB] rounded-lg flex items-center justify-center mono text-[10px] font-bold border border-[#E8E5DF] -ml-5 z-10">
                            +{order.items.length - 3}
                          </div>
                        )}
                        <div className="ml-3">
                          <p className="text-sm font-bold text-[#0A0A0A] line-clamp-1">{order.items[0]?.product_name || 'Unknown Item'}</p>
                          {order.items.length > 1 ? (
                            <p className="mono text-[9px] text-[#8A8680] tracking-[0.1em] uppercase mt-1">
                              + {order.items.length - 1} other item{order.items.length - 1 > 1 ? 's' : ''}
                            </p>
                          ) : (
                            <p className="mono text-[9px] text-[#8A8680] tracking-[0.1em] uppercase mt-1">
                              1 Unit
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mono text-[9px] text-[#0A0A0A] tracking-[0.2em] uppercase font-bold opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                        View Detail
                        <span>→</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Pagination */}
        {!isLoading && lastPage > 1 && (
          <div className="flex items-center justify-center gap-4 mt-12">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-10 h-10 flex items-center justify-center border border-[#C8C4BC] text-[#0A0A0A] rounded-full hover:bg-[#0A0A0A] hover:text-[#F2F0EB] disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[#0A0A0A] transition-all"
            >
              ←
            </button>
            <div className="mono text-[10px] tracking-[0.3em] text-[#8A8680]">
              {String(currentPage).padStart(2, '0')} / {String(lastPage).padStart(2, '0')}
            </div>
            <button
              onClick={() => setCurrentPage((p) => Math.min(lastPage, p + 1))}
              disabled={currentPage === lastPage}
              className="w-10 h-10 flex items-center justify-center border border-[#C8C4BC] text-[#0A0A0A] rounded-full hover:bg-[#0A0A0A] hover:text-[#F2F0EB] disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[#0A0A0A] transition-all"
            >
              →
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

