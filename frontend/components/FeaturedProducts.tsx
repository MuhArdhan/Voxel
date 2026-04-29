"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import ProductCard from "./ProductCard";

import { useProducts } from "@/hooks/useProducts";
import { ProductCardSkeleton } from "./ui/skeleton";

export default function FeaturedProducts() {
  const { products, isLoading } = useProducts({ featured: true, per_page: 5 });

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
          {isLoading ? (
            <>
              {/* Large featured card skeleton */}
              <div className="col-span-2 md:col-span-1 lg:col-span-2 lg:row-span-2">
                <ProductCardSkeleton />
              </div>
              {/* Regular cards skeletons */}
              {[...Array(4)].map((_, i) => (
                <div key={i} className="col-span-1">
                  <ProductCardSkeleton />
                </div>
              ))}
            </>
          ) : products.length > 0 ? (
            <>
              {/* Large featured card */}
              <div className="col-span-2 md:col-span-1 lg:col-span-2 lg:row-span-2">
                <ProductCard product={products[0]} index={0} size="large" />
              </div>

              {/* Regular cards */}
              {products.slice(1, 5).map((product, i) => (
                <div key={product.id} className="col-span-1">
                  <ProductCard product={product} index={i + 1} size="default" />
                </div>
              ))}
            </>
          ) : (
            <div className="col-span-full py-12 text-center text-[#8A8680] mono text-sm">
              NO FEATURED PRODUCTS FOUND.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
