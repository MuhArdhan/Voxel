"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  ShoppingBag,
  AlertCircle,
  Zap,
  Truck,
  RotateCcw,
  Package,
} from "lucide-react";
import { toast } from "sonner";
import { apiGet } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import type { Product, ProductVariant } from "@/types";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/hooks/useProducts";
import ProductCard from "@/components/ProductCard";
import { ProductCardSkeleton, Skeleton } from "@/components/ui/skeleton";

// Animated price
function PriceDisplay({ price }: { price: number }) {
  return (
    <motion.span
      key={price}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="tabular-nums"
    >
      {formatPrice(price)}
    </motion.span>
  );
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [addedFlash, setAddedFlash] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await apiGet<Product>(`/products/slug/${slug}`);
        setProduct(res);
      } catch (err: any) {
        setError(
          err.response?.status === 404
            ? "Produk tidak ditemukan."
            : "Terjadi kesalahan saat memuat produk."
        );
      } finally {
        setIsLoading(false);
      }
    }
    if (slug) fetchProduct();
  }, [slug]);

  const selectedVariant: ProductVariant | undefined = product?.variants.find(
    (v) => v.size === selectedSize
  );
  const availableStock = selectedVariant ? selectedVariant.stock : 0;
  const isOutOfStock = product?.variants.every((v) => v.stock === 0);

  const handleAddToCart = async () => {
    if (!selectedSize) { toast.error("Pilih ukuran dulu."); return; }
    if (quantity > availableStock) { toast.error("Stok tidak mencukupi."); return; }
    setIsAdding(true);
    try {
      await new Promise((r) => setTimeout(r, 800));
      setAddedFlash(true);
      setTimeout(() => setAddedFlash(false), 1000);
      toast.success(`${product?.name} (${selectedSize}) masuk keranjang!`);
    } catch {
      toast.error("Gagal menambahkan ke keranjang.");
    } finally {
      setIsAdding(false);
    }
  };

  // Price math
  const basePrice = Number(product?.price ?? 0);
  const discountPrice = product?.discount_price ? Number(product.discount_price) : null;
  const effectivePrice = discountPrice ?? basePrice;
  const hasDiscount = !!discountPrice;
  const additionalPrice = selectedVariant?.additional_price
    ? Number(selectedVariant.additional_price) : 0;
  const finalPrice = effectivePrice + additionalPrice;
  const discountPct = hasDiscount
    ? Math.round(((basePrice - effectivePrice) / basePrice) * 100) : 0;

  // Gallery
  const images = product?.images ?? [];
  const primaryIndex = images.findIndex((img) => img.is_primary);
  const orderedImages =
    primaryIndex > 0
      ? [images[primaryIndex], ...images.filter((_, i) => i !== primaryIndex)]
      : images;
  const activeImageUrl = orderedImages[activeImage]?.image_url;

  // Loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F2F0EB] pt-28 pb-16 px-6 md:px-10 max-w-[1400px] mx-auto">
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="w-full lg:w-[58%]">
            <Skeleton className="aspect-[3/4] rounded-3xl bg-[#E8E5DF]" />
            <div className="flex gap-3 mt-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="w-20 h-20 rounded-2xl bg-[#E8E5DF]" />
              ))}
            </div>
          </div>
          <div className="w-full lg:w-[42%] space-y-6 pt-4">
            <Skeleton className="h-4 w-24 rounded-full bg-[#E8E5DF]" />
            <Skeleton className="h-14 w-4/5 rounded-2xl bg-[#E8E5DF]" />
            <Skeleton className="h-8 w-1/3 rounded-full bg-[#E8E5DF]" />
            <Skeleton className="h-20 w-full rounded-2xl bg-[#E8E5DF]" />
            <div className="grid grid-cols-4 gap-2">
              {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-14 rounded-2xl bg-[#E8E5DF]" />)}
            </div>
            <Skeleton className="h-16 w-full rounded-2xl bg-[#E8E5DF]" />
          </div>
        </div>
      </div>
    );
  }

  // Error
  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#F2F0EB] flex flex-col items-center justify-center text-center px-6">
        <div className="w-20 h-20 bg-[#E8E5DF] rounded-full flex items-center justify-center mb-6">
          <AlertCircle size={28} className="text-[#8A8680]" />
        </div>
        <h3 className="text-2xl font-black text-[#0A0A0A] mb-2">{error || "Produk tidak ditemukan"}</h3>
        <p className="text-[#8A8680] text-sm mb-8">Mungkin URL salah atau produk telah dihapus.</p>
        <Button onClick={() => router.push("/shop")} className="rounded-full px-8">
          ← Kembali ke Shop
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2F0EB]">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 pt-28 pb-20">

        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 mb-10 text-[10px] font-semibold tracking-[0.2em] uppercase text-[#8A8680]">
          <Link href="/" className="hover:text-[#0A0A0A] transition-colors">Home</Link>
          <ChevronRight size={10} />
          <Link href="/shop" className="hover:text-[#0A0A0A] transition-colors">Shop</Link>
          <ChevronRight size={10} />
          <Link
            href={`/shop?category=${product.category.slug}`}
            className="hover:text-[#0A0A0A] transition-colors"
          >
            {product.category.name}
          </Link>
          <ChevronRight size={10} />
          <span className="text-[#0A0A0A] truncate">{product.name}</span>
        </nav>

        <div className="flex flex-col lg:flex-row items-stretch gap-12 xl:gap-16">

          {/* LEFT: Gallery */}
          <div className="w-full lg:w-[58%] flex flex-col">
            <div className="flex-1 flex flex-col">

              {/* Main image */}
              <div className="relative flex-1 min-h-[500px] bg-[#E8E5DF] rounded-3xl overflow-hidden">

                {/* Badges */}
                {product.is_limited_drop && (
                  <div className="absolute top-5 left-5 z-10">
                    <span className="inline-flex items-center gap-1.5 bg-[#5C1A1A] text-[#F2F0EB] px-3 py-1.5 rounded-full text-[9px] font-black tracking-[0.2em] uppercase">
                      <Zap size={9} />
                      Limited Drop
                    </span>
                  </div>
                )}
                {hasDiscount && (
                  <div className="absolute top-5 right-5 z-10">
                    <span className="inline-flex items-center bg-[#0A0A0A] text-[#F2F0EB] px-2.5 py-1.5 rounded-full text-[9px] font-black tracking-[0.1em]">
                      -{discountPct}%
                    </span>
                  </div>
                )}

                <AnimatePresence mode="wait">
                  {activeImageUrl ? (
                    <motion.img
                      key={activeImageUrl}
                      src={activeImageUrl}
                      alt={product.name}
                      initial={{ opacity: 0, scale: 1.04 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <motion.div
                      key="placeholder"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="w-full h-full flex flex-col items-center justify-center gap-3"
                    >
                      <div className="w-20 h-20 border border-[#C8C4BC] rounded-full flex items-center justify-center">
                        <span className="text-3xl opacity-30">👕</span>
                      </div>
                      <span className="mono text-[10px] text-[#C8C4BC] tracking-[0.2em] uppercase">
                        No image yet
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Subtle inner border */}
                <div className="absolute inset-0 rounded-3xl ring-1 ring-black/[0.04] pointer-events-none" />
              </div>

              {/* Thumbnails */}
              {orderedImages.length > 1 && (
                <div className="flex gap-3 mt-4 overflow-x-auto pb-1">
                  {orderedImages.map((img, i) => (
                    <button
                      key={img.id}
                      onClick={() => setActiveImage(i)}
                      className={`relative w-20 h-20 shrink-0 rounded-2xl overflow-hidden transition-all duration-200 border-2 ${
                        activeImage === i
                          ? "border-[#0A0A0A] scale-[1.05]"
                          : "border-[#C8C4BC] hover:border-[#8A8680]"
                      }`}
                    >
                      <img src={img.image_url} alt="thumb" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Info */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="w-full lg:w-[42%] flex flex-col"
          >
            <div className="flex-1 space-y-0">

              {/* Category pill + SKU */}
              <div className="flex items-center justify-between mb-5">
                <Link
                  href={`/shop?category=${product.category.slug}`}
                  className="mono text-[9px] tracking-[0.2em] uppercase text-[#8A8680] hover:text-[#0A0A0A] transition-colors border border-[#C8C4BC] hover:border-[#0A0A0A] px-3 py-1.5 rounded-full"
                >
                  {product.category.name}
                </Link>
                <span className="mono text-[9px] tracking-[0.1em] text-[#C8C4BC]">
                  {product.sku}
                </span>
              </div>

              {/* Product name */}
              <h1 className="text-4xl md:text-5xl xl:text-[3.5rem] font-black text-[#0A0A0A] tracking-tight leading-[0.95] mb-6">
                {product.name}
              </h1>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-8">
                <span className="text-3xl font-black text-[#0A0A0A]">
                  <PriceDisplay price={finalPrice} />
                </span>
                {hasDiscount && (
                  <>
                    <span className="text-base text-[#8A8680] line-through">
                      {formatPrice(basePrice)}
                    </span>
                    <span className="text-[9px] font-black bg-[#5C1A1A] text-[#F2F0EB] px-2 py-0.5 rounded-full">
                      SAVE {discountPct}%
                    </span>
                  </>
                )}
              </div>

              {/* Divider */}
              <div className="h-px bg-[#C8C4BC] mb-7" />

              {/* Description */}
              <div className="mb-7">
                <p className="text-[#4A4845] text-sm leading-relaxed">
                  {product.description || "Tidak ada deskripsi produk."}
                </p>
                {product.material && (
                  <div className="mt-4 inline-flex items-center gap-2 bg-[#E8E5DF] border border-[#C8C4BC] rounded-full px-4 py-2">
                    <span className="mono text-[9px] tracking-[0.15em] uppercase text-[#8A8680]">Material</span>
                    <span className="w-px h-3 bg-[#C8C4BC]" />
                    <span className="text-xs text-[#4A4845]">{product.material}</span>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="h-px bg-[#C8C4BC] mb-7" />

              {/* Size Picker */}
              <div className="mb-7">
                <div className="flex items-center justify-between mb-4">
                  <span className="mono text-[10px] font-bold tracking-[0.2em] uppercase text-[#4A4845]">
                    Pilih Ukuran
                    {selectedSize && (
                      <span className="ml-2 text-[#0A0A0A]">— {selectedSize}</span>
                    )}
                  </span>
                  <button className="mono text-[9px] tracking-[0.1em] uppercase text-[#8A8680] hover:text-[#0A0A0A] transition-colors underline underline-offset-4">
                    Size Guide
                  </button>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {product.variants.map((v) => {
                    const isAvailable = v.stock > 0;
                    const isSelected = selectedSize === v.size;
                    const isLow = isAvailable && v.stock < 5;

                    return (
                      <motion.button
                        key={v.id}
                        disabled={!isAvailable}
                        onClick={() => { setSelectedSize(v.size); setQuantity(1); }}
                        whileTap={isAvailable ? { scale: 0.93 } : {}}
                        className={`relative h-14 rounded-2xl text-xs font-black transition-all duration-200 border
                          ${isSelected
                            ? "bg-[#0A0A0A] text-[#F2F0EB] border-[#0A0A0A]"
                            : isAvailable
                            ? "bg-transparent text-[#4A4845] border-[#C8C4BC] hover:border-[#0A0A0A] hover:text-[#0A0A0A]"
                            : "bg-[#E8E5DF] text-[#C8C4BC] border-[#E8E5DF] cursor-not-allowed"
                          }`}
                      >
                        {/* Strikethrough for sold-out */}
                        {!isAvailable && (
                          <span className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-2xl pointer-events-none">
                            <span className="absolute w-full h-px bg-[#C8C4BC] rotate-45" />
                          </span>
                        )}
                        <span className={!isAvailable ? "opacity-40" : ""}>{v.size}</span>
                        {/* Low stock dot */}
                        {isLow && !isSelected && (
                          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#5C1A1A]" />
                        )}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Stock indicator */}
                <AnimatePresence>
                  {selectedSize && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: "auto", marginTop: 12 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            availableStock < 5
                              ? "bg-[#5C1A1A] animate-pulse"
                              : "bg-[#4A4845]"
                          }`}
                        />
                        <span
                          className={`mono text-[10px] tracking-[0.1em] ${
                            availableStock < 5 ? "text-[#5C1A1A] font-bold" : "text-[#8A8680]"
                          }`}
                        >
                          {availableStock < 5
                            ? `HANYA ${availableStock} TERSISA`
                            : `${availableStock} unit tersedia`}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Quantity + CTA */}
              <div className="flex gap-3 mb-8">
                {/* Qty */}
                <div className="flex items-center bg-[#E8E5DF] border border-[#C8C4BC] rounded-2xl overflow-hidden h-16">
                  <button
                    disabled={quantity <= 1 || !selectedSize}
                    onClick={() => setQuantity((q) => q - 1)}
                    className="w-12 h-full flex items-center justify-center text-[#8A8680] hover:text-[#0A0A0A] hover:bg-[#D4D0C8] disabled:opacity-25 transition-all text-lg font-bold"
                  >
                    −
                  </button>
                  <span className="w-10 text-center text-base font-black text-[#0A0A0A] tabular-nums">
                    {quantity}
                  </span>
                  <button
                    disabled={!selectedSize || quantity >= availableStock}
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-12 h-full flex items-center justify-center text-[#8A8680] hover:text-[#0A0A0A] hover:bg-[#D4D0C8] disabled:opacity-25 transition-all text-lg font-bold"
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart */}
                <motion.button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || isAdding || Boolean(selectedSize && availableStock === 0)}
                  animate={addedFlash ? { scale: [1, 1.02, 1] } : {}}
                  transition={{ duration: 0.3 }}
                  className={`flex-1 h-16 rounded-2xl text-sm font-black tracking-[0.04em] flex items-center justify-center gap-2.5 transition-all duration-300 border
                    ${isOutOfStock
                      ? "bg-[#E8E5DF] text-[#C8C4BC] border-[#C8C4BC] cursor-not-allowed"
                      : "bg-[#0A0A0A] text-[#F2F0EB] border-[#0A0A0A] hover:bg-[#5C1A1A] hover:border-[#5C1A1A] active:scale-[0.98]"
                    }`}
                >
                  {isAdding ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                      </svg>
                      Adding...
                    </>
                  ) : isOutOfStock ? (
                    "SOLD OUT"
                  ) : (
                    <>
                      <ShoppingBag size={16} />
                      Add to Cart
                    </>
                  )}
                </motion.button>
              </div>

              {/* Divider */}
              <div className="h-px bg-[#C8C4BC] mb-7" />

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: <Truck size={14} />, label: "Free Shipping", sub: "Pembelian > Rp1jt", color: "#00D4FF" },
                  { icon: <Package size={14} />, label: "100% Authentic", sub: "Cyber-tech apparel", color: "#8B5CF6" },
                  { icon: <RotateCcw size={14} />, label: "14-Day Return", sub: "Easy return policy", color: "#5C1A1A" },
                ].map((badge) => (
                  <div
                    key={badge.label}
                    className="flex flex-col gap-2 bg-[#E8E5DF] border border-[#C8C4BC] rounded-2xl p-4"
                  >
                    <span style={{ color: badge.color }}>{badge.icon}</span>
                    <div>
                      <p className="text-xs font-bold text-[#0A0A0A]">{badge.label}</p>
                      <p className="text-[10px] text-[#8A8680] mt-0.5">{badge.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Related Products */}
      <RelatedProducts categorySlug={product.category.slug} currentSlug={product.slug} />

    </div>
  );
}

// Related Products Component
function RelatedProducts({ categorySlug, currentSlug }: { categorySlug: string; currentSlug: string }) {
  const { products, isLoading } = useProducts({ category: categorySlug, per_page: 5 });

  // Exclude current product
  const related = products.filter((p) => p.slug !== currentSlug).slice(0, 4);

  if (!isLoading && related.length === 0) return null;

  return (
    <section className="bg-[#E8E5DF] border-t border-[#C8C4BC] py-20">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="mono text-[10px] text-[#8A8680] tracking-[0.25em] uppercase mb-2">— You Might Also Like</p>
            <h2 className="text-3xl md:text-4xl font-black text-[#0A0A0A] tracking-tight leading-tight">
              More From<br />
              <span className="text-[#5C1A1A]">This Drop.</span>
            </h2>
          </div>
          <Link
            href={`/shop?category=${categorySlug}`}
            className="mono text-[10px] text-[#8A8680] tracking-[0.15em] uppercase underline underline-offset-4 hover:text-[#0A0A0A] transition-colors"
          >
            View all →
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {isLoading
            ? [...Array(4)].map((_, i) => <ProductCardSkeleton key={i} />)
            : related.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)
          }
        </div>
      </div>
    </section>
  );
}
