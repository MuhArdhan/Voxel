"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { formatPrice } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { STORAGE_URL } from "@/lib/api";

export default function CartPage() {
  const { cart, isLoading, updateItem, removeItem } = useCart();

  const handleQuantityChange = async (cartItemId: number, currentQty: number, change: number) => {
    const newQty = currentQty + change;
    if (newQty < 1 || newQty > 10) return;
    await updateItem(cartItemId, newQty);
  };

  const hasItems = cart && cart.items && cart.items.length > 0;

  if (isLoading && !cart) {
    return (
      <div className="min-h-screen bg-[#F2F0EB] pt-28 pb-16 px-6 md:px-10">
        <div className="max-w-[1200px] mx-auto flex flex-col lg:flex-row gap-12">
          <div className="w-full lg:w-2/3 space-y-6">
            <Skeleton className="h-10 w-48 bg-[#E8E5DF] rounded-xl mb-8" />
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full bg-[#E8E5DF] rounded-2xl" />
            ))}
          </div>
          <div className="w-full lg:w-1/3">
            <Skeleton className="h-64 w-full bg-[#E8E5DF] rounded-3xl sticky top-24" />
          </div>
        </div>
      </div>
    );
  }

  if (!hasItems) {
    return (
      <div className="min-h-screen bg-[#F2F0EB] pt-28 pb-16 px-6 flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <div className="w-24 h-24 mx-auto bg-[#E8E5DF] border border-[#C8C4BC] rounded-full flex items-center justify-center mb-6">
            <ShoppingBag size={32} className="text-[#8A8680]" />
          </div>
          <h1 className="text-4xl font-black text-[#0A0A0A] tracking-tight mb-4">Cart is Empty.</h1>
          <p className="text-[#4A4845] mb-8">
            You have not added any items to your shopping cart. Discover the latest futuristic apparel.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center justify-center gap-2 bg-[#0A0A0A] text-[#F2F0EB] px-8 py-4 rounded-full font-bold hover:bg-[#5C1A1A] transition-colors"
          >
            Explore Collection
            <ArrowRight size={16} />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2F0EB] pt-28 pb-16 px-6 md:px-10">
      <div className="max-w-[1200px] mx-auto">
        <h1 className="text-4xl md:text-5xl font-black text-[#0A0A0A] tracking-tight mb-10">
          Your Cart
        </h1>

        <div className="flex flex-col lg:flex-row items-start gap-12">
          {/* LEFT: Item List */}
          <div className="w-full lg:w-2/3 flex flex-col gap-6">
            {cart.items.map((item) => {
              const img = item.product.images?.find((i) => i.is_primary) || item.product.images?.[0];
              const price = Number(item.subtotal);
              
              return (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row gap-6 bg-[#E8E5DF] border border-[#C8C4BC] rounded-3xl p-4 sm:p-6"
                >
                  {/* Image */}
                  <Link
                    href={`/products/${item.product.slug}`}
                    className="relative w-full sm:w-32 aspect-square bg-[#F2F0EB] rounded-2xl overflow-hidden shrink-0 border border-[#C8C4BC]/50 group"
                  >
                    {img ? (
                      <img
                        src={`${STORAGE_URL}/${img.image_path}`}
                        alt={item.product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl opacity-20">
                        👕
                      </div>
                    )}
                  </Link>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <Link
                            href={`/products/${item.product.slug}`}
                            className="text-lg font-bold text-[#0A0A0A] hover:text-[#5C1A1A] transition-colors leading-tight"
                          >
                            {item.product.name}
                          </Link>
                          <p className="mono text-xs text-[#8A8680] mt-1 tracking-[0.1em] uppercase">
                            {item.product.sku}
                          </p>
                        </div>
                        <span className="mono text-lg font-black text-[#0A0A0A]">
                          {formatPrice(price)}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 mt-3">
                        <span className="mono text-[10px] text-[#4A4845] bg-[#F2F0EB] px-2.5 py-1 rounded border border-[#C8C4BC]">
                          Size: {item.variant.size}
                        </span>
                        {item.variant.color && (
                          <span className="mono text-[10px] text-[#4A4845] bg-[#F2F0EB] px-2.5 py-1 rounded border border-[#C8C4BC]">
                            Color: {item.variant.color}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-6">
                      {/* Qty Control */}
                      <div className="flex items-center bg-[#F2F0EB] border border-[#C8C4BC] rounded-xl overflow-hidden h-10">
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                          disabled={item.quantity <= 1}
                          className="px-3 h-full text-[#4A4845] hover:text-[#0A0A0A] hover:bg-[#E8E5DF] disabled:opacity-30 transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="mono text-sm font-bold w-10 text-center text-[#0A0A0A]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                          disabled={item.quantity >= 10 || item.quantity >= item.variant.stock}
                          className="px-3 h-full text-[#4A4845] hover:text-[#0A0A0A] hover:bg-[#E8E5DF] disabled:opacity-30 transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="flex items-center gap-2 text-sm font-semibold text-[#8A8680] hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                        <span className="hidden sm:inline">Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* RIGHT: Order Summary */}
          <div className="w-full lg:w-1/3">
            <div className="sticky top-24 bg-[#E8E5DF] border border-[#C8C4BC] rounded-3xl p-6 sm:p-8">
              <h2 className="text-xl font-black text-[#0A0A0A] mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-[#4A4845]">Subtotal</span>
                  <span className="mono font-bold text-[#0A0A0A]">{formatPrice(Number(cart.total))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#4A4845]">Shipping</span>
                  <span className="text-[#8A8680] italic">Calculated at checkout</span>
                </div>
              </div>

              <div className="h-px bg-[#C8C4BC] mb-6" />

              <div className="flex justify-between items-end mb-8">
                <span className="font-bold text-[#0A0A0A]">Total</span>
                <span className="mono text-2xl font-black text-[#5C1A1A]">
                  {formatPrice(Number(cart.total))}
                </span>
              </div>

              <Link
                href="/checkout"
                className="w-full flex items-center justify-center gap-2 bg-[#0A0A0A] text-[#F2F0EB] py-4 rounded-full font-bold hover:bg-[#5C1A1A] transition-colors shadow-lg"
              >
                Proceed to Checkout
                <ArrowRight size={18} />
              </Link>
              
              <div className="mt-6 flex flex-col items-center gap-3">
                <p className="text-[10px] text-[#8A8680] text-center">
                  Taxes and shipping discounts applied at checkout.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
