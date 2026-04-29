"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ShoppingBag, Eye } from "lucide-react";

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  discount_price?: number;
  is_limited_drop: boolean;
  sku: string;
  category: { name: string };
  images: { image_path: string; is_primary: boolean }[];
  variants: { size: string; stock: number }[];
}

interface ProductCardProps {
  product: Product;
  index?: number;
  size?: "default" | "large" | "small";
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
}

export default function ProductCard({ product, index = 0, size = "default" }: ProductCardProps) {
  const [hovered, setHovered] = useState(false);
  const availableSizes = product.variants
    .filter((v) => v.stock > 0)
    .map((v) => v.size);
  const effectivePrice = product.discount_price ?? product.price;
  const hasDiscount = !!product.discount_price;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group"
    >
      {/* Image container */}
      <Link href={`/products/${product.slug}`}>
        <div
          className={`relative overflow-hidden rounded-2xl bg-[#E8E5DF] ${
            size === "large" ? "aspect-[3/4]" : size === "small" ? "aspect-square" : "aspect-[4/5]"
          }`}
        >
          {/* Product image placeholder */}
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#E8E5DF] to-[#D4D0C8]">
            <span className="text-5xl opacity-20">👕</span>
          </div>

          {/* Neon corner accents on hover */}
          <motion.div
            animate={{ opacity: hovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            className="absolute top-0 left-0 w-px h-12 bg-gradient-to-b from-[#00D4FF] to-transparent"
          />
          <motion.div
            animate={{ opacity: hovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            className="absolute top-0 left-0 w-12 h-px bg-gradient-to-r from-[#00D4FF] to-transparent"
          />
          <motion.div
            animate={{ opacity: hovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-0 right-0 w-px h-12 bg-gradient-to-t from-[#8B5CF6] to-transparent"
          />
          <motion.div
            animate={{ opacity: hovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-0 right-0 w-12 h-px bg-gradient-to-l from-[#8B5CF6] to-transparent"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.is_limited_drop && (
              <div className="tag-badge text-[9px]">
                <span className="w-1 h-1 rounded-full bg-[#C8FF00] limited-pulse" />
                Limited
              </div>
            )}
            {hasDiscount && (
              <div className="inline-flex items-center px-2 py-0.5 bg-[#5C1A1A] text-white text-[9px] font-bold tracking-wider uppercase rounded">
                Sale
              </div>
            )}
          </div>

          {/* Hover overlay */}
          <motion.div
            animate={{ opacity: hovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-[#0A0A0A]/20 flex items-center justify-center gap-3"
          >
            <button
              className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors"
              onClick={(e) => e.preventDefault()}
            >
              <Eye size={14} className="text-[#0A0A0A]" />
            </button>
            <button
              className="w-10 h-10 rounded-full bg-[#0A0A0A]/90 backdrop-blur-sm flex items-center justify-center hover:bg-[#0A0A0A] transition-colors"
              onClick={(e) => e.preventDefault()}
            >
              <ShoppingBag size={14} className="text-white" />
            </button>
          </motion.div>

          {/* Size quick-pick (visible on hover) */}
          <motion.div
            animate={{ y: hovered ? 0 : 10, opacity: hovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-3 left-3 right-3 flex gap-1.5"
          >
            {availableSizes.slice(0, 5).map((size) => (
              <button
                key={size}
                className="flex-1 py-1 bg-white/90 backdrop-blur-sm text-[#0A0A0A] text-[9px] font-bold rounded hover:bg-[#0A0A0A] hover:text-white transition-colors"
                onClick={(e) => e.preventDefault()}
              >
                {size}
              </button>
            ))}
          </motion.div>
        </div>
      </Link>

      {/* Product info */}
      <div className="mt-3 px-1">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1 min-w-0">
            <div className="mono text-[9px] text-[#8A8680] tracking-[0.15em] uppercase mb-0.5">
              {product.category.name}
            </div>
            <Link href={`/products/${product.slug}`}>
              <h3 className="text-sm font-bold text-[#0A0A0A] leading-snug hover:text-[#5C1A1A] transition-colors truncate">
                {product.name}
              </h3>
            </Link>
          </div>
          <div className="text-right flex-shrink-0">
            {hasDiscount ? (
              <>
                <div className="text-sm font-bold text-[#0A0A0A]">{formatPrice(effectivePrice)}</div>
                <div className="mono text-[9px] text-[#8A8680] line-through">{formatPrice(product.price)}</div>
              </>
            ) : (
              <div className="text-sm font-bold text-[#0A0A0A]">{formatPrice(product.price)}</div>
            )}
          </div>
        </div>

        <div className="mt-1.5 mono text-[9px] text-[#8A8680] tracking-wider">{product.sku}</div>
      </div>
    </motion.div>
  );
}
