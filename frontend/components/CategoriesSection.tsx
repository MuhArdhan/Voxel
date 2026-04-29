"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const CATEGORIES = [
  { name: "Hoodies", slug: "hoodies", count: "12 styles", accent: "#00D4FF", emoji: "🧥" },
  { name: "T-Shirts", slug: "t-shirts", count: "24 styles", accent: "#8B5CF6", emoji: "👕" },
  { name: "Jackets", slug: "jackets", count: "8 styles", accent: "#C8FF00", emoji: "🥼" },
  { name: "Pants", slug: "pants", count: "10 styles", accent: "#FF6B6B", emoji: "👖" },
  { name: "Accessories", slug: "accessories", count: "30+ pieces", accent: "#FFB347", emoji: "⚡" },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export default function CategoriesSection() {
  return (
    <section className="py-24 md:py-32 bg-[#F2F0EB]">
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
              — Browse by Category
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-[#0A0A0A]">
              Find Your<br />
              <span className="text-[#5C1A1A]">Drop.</span>
            </h2>
          </div>
          <Link
            href="/shop"
            className="mono text-[10px] text-[#4A4845] tracking-[0.15em] uppercase underline underline-offset-4 hover:text-[#0A0A0A] transition-colors"
          >
            View all products →
          </Link>
        </motion.div>

        {/* Asymmetric grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3"
        >
          {CATEGORIES.map((cat, i) => (
            <motion.div key={cat.slug} variants={cardVariants}>
              <Link href={`/shop?category=${cat.slug}`} className="block group">
                <div
                  className={`relative overflow-hidden rounded-2xl bg-[#E8E5DF] p-6 transition-all duration-500 group-hover:shadow-xl ${i === 0 ? "md:row-span-2 aspect-[3/4]" : "aspect-square"} ${i === 2 ? "hidden lg:block" : ""}`}
                  style={{ minHeight: i === 0 ? "320px" : "140px" }}
                >
                  {/* Accent glow */}
                  <div
                    className="absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500"
                    style={{ background: cat.accent }}
                  />

                  {/* Neon top line */}
                  <div
                    className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: `linear-gradient(to right, transparent, ${cat.accent}, transparent)` }}
                  />

                  {/* Content */}
                  <div className="flex flex-col h-full justify-between">
                    <div>
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-4 transition-transform duration-300 group-hover:scale-110"
                        style={{ background: `${cat.accent}20` }}
                      >
                        {cat.emoji}
                      </div>
                      <div className="mono text-[9px] tracking-[0.2em] uppercase mb-1" style={{ color: cat.accent }}>
                        {cat.count}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-black text-[#0A0A0A] tracking-tight leading-tight mb-2">
                        {cat.name}
                      </h3>
                      <div className="flex items-center gap-1 mono text-[9px] text-[#8A8680] tracking-[0.1em] uppercase group-hover:text-[#4A4845] transition-colors">
                        Shop now
                        <span className="translate-x-0 group-hover:translate-x-1 transition-transform duration-300 inline-block">→</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
