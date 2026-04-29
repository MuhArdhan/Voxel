"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import ProductCard from "./ProductCard";

// Placeholder products
const PLACEHOLDER_PRODUCTS = [
  {
    id: 1,
    name: "NEON GRID Hoodie",
    slug: "neon-grid-hoodie",
    price: 459000,
    discount_price: undefined,
    is_limited_drop: false,
    sku: "VXL-HDD-001",
    category: { name: "Hoodies" },
    images: [],
    variants: [
      { size: "S", stock: 10 },
      { size: "M", stock: 15 },
      { size: "L", stock: 8 },
      { size: "XL", stock: 3 },
    ],
  },
  {
    id: 2,
    name: "VOID CIRCUIT Hoodie",
    slug: "void-circuit-hoodie",
    price: 549000,
    discount_price: undefined,
    is_limited_drop: true,
    sku: "VXL-HDD-002",
    category: { name: "Hoodies" },
    images: [],
    variants: [
      { size: "S", stock: 2 },
      { size: "M", stock: 3 },
      { size: "L", stock: 0 },
    ],
  },
  {
    id: 3,
    name: "PIXEL GLITCH Tee",
    slug: "pixel-glitch-tee",
    price: 259000,
    discount_price: 199000,
    is_limited_drop: false,
    sku: "VXL-TEE-001",
    category: { name: "T-Shirts" },
    images: [],
    variants: [
      { size: "S", stock: 20 },
      { size: "M", stock: 18 },
      { size: "L", stock: 12 },
      { size: "XL", stock: 7 },
    ],
  },
  {
    id: 4,
    name: "SYSTEM ERROR Tee",
    slug: "system-error-tee",
    price: 229000,
    discount_price: undefined,
    is_limited_drop: false,
    sku: "VXL-TEE-002",
    category: { name: "T-Shirts" },
    images: [],
    variants: [
      { size: "M", stock: 10 },
      { size: "L", stock: 8 },
      { size: "XL", stock: 5 },
    ],
  },
  {
    id: 5,
    name: "STEALTH TECH Jacket",
    slug: "stealth-tech-jacket",
    price: 799000,
    discount_price: undefined,
    is_limited_drop: true,
    sku: "VXL-JKT-001",
    category: { name: "Jackets" },
    images: [],
    variants: [
      { size: "M", stock: 4 },
      { size: "L", stock: 2 },
    ],
  },
];

export default function FeaturedProducts() {
  return (
    <section className="relative py-24 md:py-32 bg-[#F2F0EB]">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end mb-14 gap-4"
        >
          <div>
            <div className="mono text-[10px] text-[#8A8680] tracking-[0.25em] uppercase mb-3">
              — New Arrivals
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-[#0A0A0A]">
              Fresh From<br />
              <span className="text-[#5C1A1A]">The Grid.</span>
            </h2>
          </div>
          <Link
            href="/shop"
            className="group inline-flex items-center gap-2 mono text-[10px] text-[#4A4845] tracking-[0.15em] uppercase underline underline-offset-4 hover:text-[#0A0A0A] transition-colors"
          >
            View all
            <span className="group-hover:translate-x-1 transition-transform duration-200 inline-block">→</span>
          </Link>
        </motion.div>

        {/* Editorial asymmetric grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {/* Large featured card */}
          <div className="col-span-2 md:col-span-1 lg:col-span-2 lg:row-span-2">
            <ProductCard product={PLACEHOLDER_PRODUCTS[4]} index={0} size="large" />
          </div>

          {/* Regular cards */}
          {PLACEHOLDER_PRODUCTS.slice(0, 4).map((product, i) => (
            <div key={product.id} className="col-span-1">
              <ProductCard product={product} index={i + 1} size="default" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
