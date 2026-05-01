"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { formatPrice } from "@/lib/utils";

export default function CartSlideOver() {
  const { cart, isLoading, isCartOpen, setIsCartOpen, updateItem, removeItem } = useCart();
  const slideOverRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (slideOverRef.current && !slideOverRef.current.contains(e.target as Node)) {
        setIsCartOpen(false);
      }
    };
    if (isCartOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden"; // Prevent background scroll
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [isCartOpen, setIsCartOpen]);

  // Handle Qty Change (without deep debounce for now, just direct API call)
  const handleQuantityChange = async (cartItemId: number, currentQty: number, change: number) => {
    const newQty = currentQty + change;
    if (newQty < 1) return;
    if (newQty > 10) return; // Optional max
    await updateItem(cartItemId, newQty);
  };

  const hasItems = cart && cart.items && cart.items.length > 0;

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#0A0A0A]/40 backdrop-blur-sm z-[100]"
          />

          {/* Slide-over panel */}
          <motion.div
            ref={slideOverRef}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-[#F2F0EB] shadow-2xl z-[110] flex flex-col border-l border-[#C8C4BC]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#C8C4BC] bg-[#F2F0EB] z-10">
              <div className="flex items-center gap-2">
                <ShoppingBag size={20} className="text-[#0A0A0A]" />
                <h2 className="text-xl font-black text-[#0A0A0A] tracking-tight">Your Cart</h2>
                {cart?.total_items ? (
                  <span className="bg-[#5C1A1A] text-[#F2F0EB] text-[10px] font-bold px-2 py-0.5 rounded-full ml-1">
                    {cart.total_items}
                  </span>
                ) : null}
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 hover:bg-[#E8E5DF] rounded-full transition-colors"
                aria-label="Close cart"
              >
                <X size={20} className="text-[#0A0A0A]" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 bg-[#F2F0EB]">
              {isLoading && !cart ? (
                <div className="flex flex-col gap-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex gap-4 animate-pulse">
                      <div className="w-20 h-24 bg-[#E8E5DF] rounded-xl" />
                      <div className="flex-1 space-y-2 py-2">
                        <div className="h-4 bg-[#E8E5DF] rounded w-3/4" />
                        <div className="h-3 bg-[#E8E5DF] rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : !hasItems ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-[#8A8680]">
                  <ShoppingBag size={48} className="opacity-20 mb-2" />
                  <p className="text-[#0A0A0A] font-bold text-lg">Your cart is empty.</p>
                  <p className="text-sm max-w-[200px]">Looks like you haven't added anything to your cart yet.</p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="mt-6 mono text-xs font-bold tracking-[0.15em] uppercase border border-[#0A0A0A] text-[#0A0A0A] px-6 py-3 rounded-full hover:bg-[#0A0A0A] hover:text-[#F2F0EB] transition-colors"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {cart.items.map((item) => {
                    const img = item.product.images?.find((i) => i.is_primary) || item.product.images?.[0];
                    return (
                      <div key={item.id} className="flex gap-4">
                        {/* Thumbnail */}
                        <div className="relative w-20 h-24 bg-[#E8E5DF] rounded-xl overflow-hidden shrink-0 border border-[#C8C4BC]/50">
                          {img ? (
                            <img src={img.image_url} alt={item.product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl opacity-20">👕</div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 flex flex-col justify-between py-1">
                          <div>
                            <div className="flex justify-between items-start gap-2">
                              <Link 
                                href={`/products/${item.product.slug}`}
                                onClick={() => setIsCartOpen(false)}
                                className="text-sm font-bold text-[#0A0A0A] leading-tight hover:text-[#5C1A1A] transition-colors line-clamp-2"
                              >
                                {item.product.name}
                              </Link>
                              <button
                                onClick={() => removeItem(item.id)}
                                className="text-[#8A8680] hover:text-red-500 transition-colors p-1"
                                aria-label="Remove item"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="mono text-[10px] text-[#4A4845] bg-[#E8E5DF] px-2 py-0.5 rounded-md border border-[#C8C4BC]">
                                Size: {item.variant.size}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-end justify-between mt-3">
                            {/* Qty Control */}
                            <div className="flex items-center border border-[#C8C4BC] rounded-lg bg-[#E8E5DF]">
                              <button
                                onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                                disabled={item.quantity <= 1}
                                className="p-1.5 text-[#4A4845] hover:text-[#0A0A0A] disabled:opacity-30 transition-colors"
                              >
                                <Minus size={12} />
                              </button>
                              <span className="mono text-xs font-bold w-6 text-center text-[#0A0A0A]">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                                disabled={item.quantity >= 10 || item.quantity >= item.variant.stock}
                                className="p-1.5 text-[#4A4845] hover:text-[#0A0A0A] disabled:opacity-30 transition-colors"
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                            <span className="mono text-xs font-bold text-[#0A0A0A]">
                              {formatPrice(Number(item.subtotal))}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {hasItems && (
              <div className="border-t border-[#C8C4BC] bg-[#E8E5DF] p-6 shrink-0">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-bold text-[#4A4845]">Subtotal</span>
                  <span className="mono text-lg font-black text-[#0A0A0A]">{formatPrice(Number(cart.total))}</span>
                </div>
                <p className="text-[10px] text-[#8A8680] text-center mb-5">
                  Shipping and taxes calculated at checkout.
                </p>
                <div className="flex flex-col gap-3">
                  <Link
                    href="/checkout"
                    onClick={() => setIsCartOpen(false)}
                    className="w-full flex items-center justify-center gap-2 bg-[#0A0A0A] text-[#F2F0EB] py-4 rounded-xl font-bold hover:bg-[#5C1A1A] transition-colors shadow-lg"
                  >
                    Proceed to Checkout
                    <ArrowRight size={16} />
                  </Link>
                  <Link
                    href="/cart"
                    onClick={() => setIsCartOpen(false)}
                    className="w-full text-center py-3 text-sm font-bold text-[#4A4845] hover:text-[#0A0A0A] transition-colors"
                  >
                    View Cart
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
