"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import { STORAGE_URL } from "@/lib/api";

const CATEGORY_ACCENTS: Record<string, { label: string; index: string }> = {
  "hoodies":     { label: "OUTERWEAR",  index: "01" },
  "t-shirts":    { label: "ESSENTIALS", index: "02" },
  "jackets":     { label: "OUTERWEAR",  index: "03" },
  "pants":       { label: "BOTTOMS",    index: "04" },
  "accessories": { label: "ACC.",       index: "05" },
};

const DEFAULT_ACCENT = { label: "COLLECTION", index: "00" };

export default function CategoriesSection() {
  const { categories, isLoading } = useCategories();
  const displayCategories = categories.slice(0, 5);

  return (
    <section className="py-20 md:py-28 bg-[#F2F0EB]">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4"
        >
          <div>
            <div className="mono text-[10px] text-[#8A8680] tracking-[0.25em] uppercase mb-3">
              — Browse by Category
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-[#0A0A0A] leading-none">
              Find Your<br />
              <span className="text-[#5C1A1A]">Drop.</span>
            </h2>
          </div>
          <Link
            href="/shop"
            className="group flex items-center gap-2 mono text-[10px] text-[#4A4845] tracking-[0.15em] uppercase hover:text-[#0A0A0A] transition-colors"
          >
            View all products
            <ArrowUpRight size={12} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </motion.div>

        {/* Category List — Full-width editorial rows */}
        <div className="divide-y divide-[#C8C4BC]">
          
          {/* Top border */}
          <div className="border-t border-[#C8C4BC]" />

          {isLoading ? (
            [...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between py-5 animate-pulse">
                <div className="flex items-center gap-6">
                  <div className="w-8 h-3 bg-[#D4D0C8] rounded" />
                  <div className="w-32 h-7 bg-[#D4D0C8] rounded" />
                </div>
                <div className="w-20 h-3 bg-[#D4D0C8] rounded" />
              </div>
            ))
          ) : displayCategories.length > 0 ? (
            displayCategories.map((cat, i) => {
              const info = CATEGORY_ACCENTS[cat.slug] || DEFAULT_ACCENT;
              return (
                <motion.div
                  key={cat.slug}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Link href={`/shop?category=${cat.slug}`} className="group flex items-center justify-between py-5 md:py-6 cursor-pointer">
                    
                    {/* Left: Index + Name */}
                    <div className="flex items-center gap-5 md:gap-8 flex-1 min-w-0">
                      <span className="mono text-[10px] text-[#8A8680] tracking-[0.2em] shrink-0 hidden sm:block">
                        {info.index}
                      </span>
                      <div className="flex items-center gap-4 min-w-0">
                        {/* Thumbnail */}
                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg bg-[#E8E5DF] overflow-hidden shrink-0 border border-[#C8C4BC] transition-transform duration-500 group-hover:scale-105">
                          {cat.image ? (
                            <img
                              src={`${STORAGE_URL}/${cat.image}`}
                              alt={cat.name}
                              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                            />
                          ) : (
                            <div className="w-full h-full bg-[#D4D0C8]" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-2xl md:text-3xl lg:text-4xl font-black text-[#0A0A0A] tracking-tight leading-none uppercase group-hover:text-[#5C1A1A] transition-colors duration-300">
                            {cat.name}
                          </h3>
                          <div className="mono text-[9px] text-[#8A8680] tracking-[0.2em] uppercase mt-1">
                            {info.label}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right: Count + Arrow */}
                    <div className="flex items-center gap-6 md:gap-10 shrink-0">
                      <span className="mono text-[10px] text-[#8A8680] tracking-[0.15em] hidden md:block">
                        {cat.products_count} {cat.products_count === 1 ? "style" : "styles"}
                      </span>
                      <div className="w-8 h-8 rounded-full border border-[#C8C4BC] flex items-center justify-center text-[#8A8680] group-hover:bg-[#0A0A0A] group-hover:border-[#0A0A0A] group-hover:text-[#F2F0EB] transition-all duration-300">
                        <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform duration-300" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })
          ) : (
            <div className="py-16 text-center text-[#8A8680] mono text-xs uppercase tracking-widest">
              No categories found.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
