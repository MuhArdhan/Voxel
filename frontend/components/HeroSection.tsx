"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function HeroSection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);
  const modelY = useTransform(scrollYProgress, [0, 1], ["0%", "-8%"]);
  const opacity = useTransform(scrollYProgress, [0.7, 1], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative min-h-screen overflow-hidden bg-[#F2F0EB]"
    >
      {/* Background editorial giant text */}
      <motion.div
        style={{ y: bgY }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
      >
        <div className="editorial-text text-center leading-none">
          <div>WEAR</div>
          <div>THE</div>
          <div>FUTURE</div>
        </div>
      </motion.div>

      {/* Grain texture */}
      <div className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.2'/%3E%3C/svg%3E")`,
          backgroundSize: "200px 200px",
        }}
      />

      {/* Main content */}
      <motion.div
        style={{ y: textY, opacity }}
        className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-10 pt-28 pb-20 min-h-screen flex flex-col justify-between"
      >
        {/* Top row */}
        <div className="flex justify-between items-start">
          {/* Left label */}
          <div>
            <div className="mono text-[10px] text-[#8A8680] tracking-[0.2em] uppercase mb-1">
              SS26 Collection
            </div>
            <div className="w-8 h-px bg-[#C8C4BC]" />
          </div>

          {/* Right label */}
          <div className="text-right">
            <div className="mono text-[10px] text-[#8A8680] tracking-[0.2em] uppercase mb-1">
              Cyber Tech Streetwear
            </div>
            <div className="ml-auto w-8 h-px bg-[#C8C4BC]" />
          </div>
        </div>

        {/* Hero product card — center floating */}
        <motion.div
          style={{ y: modelY }}
          className="relative mx-auto w-full max-w-sm md:max-w-md lg:max-w-lg"
        >
          {/* Product card */}
          <div className="relative bg-[#2A2520] rounded-2xl overflow-hidden aspect-[3/4] shadow-2xl">
            {/* Placeholder for product image */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#1a1510] via-[#2A2520] to-[#1a1510] flex items-center justify-center">
              <div className="text-center">
                <div className="text-[5rem] leading-none font-black text-[#F2F0EB]/5 select-none">
                  VOXEL
                </div>
                <div className="mt-4 w-20 h-20 mx-auto rounded-full bg-[#F2F0EB]/5 flex items-center justify-center">
                  <span className="text-3xl">🥷</span>
                </div>
              </div>
            </div>

            {/* Neon accent lines */}
            <div className="absolute top-0 left-0 w-px h-24 bg-gradient-to-b from-[#00D4FF] to-transparent opacity-60" />
            <div className="absolute top-0 left-0 w-24 h-px bg-gradient-to-r from-[#00D4FF] to-transparent opacity-60" />
            <div className="absolute bottom-0 right-0 w-px h-24 bg-gradient-to-t from-[#8B5CF6] to-transparent opacity-60" />
            <div className="absolute bottom-0 right-0 w-24 h-px bg-gradient-to-l from-[#8B5CF6] to-transparent opacity-60" />

            {/* Limited Drop badge */}
            <div className="absolute top-4 left-4">
              <div className="tag-badge">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C8FF00] limited-pulse" />
                Limited Drop
              </div>
            </div>

            {/* Product info overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-[#0A0A0A]/80 to-transparent">
              <div className="mono text-[9px] text-[#00D4FF] tracking-[0.2em] mb-1">VXL-HDD-001</div>
              <div className="text-white font-bold text-lg leading-tight mb-1">VOID CIRCUIT Hoodie</div>
              <div className="text-[#F2F0EB]/60 text-sm">Rp 549.000</div>
            </div>

            {/* Floating annotation dot */}
            <div className="absolute top-1/3 right-6 group cursor-pointer">
              <div className="w-6 h-6 rounded-full border border-white/30 bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white" />
              </div>
              {/* Tooltip */}
              <div className="absolute right-8 top-1/2 -translate-y-1/2 bg-[#0A0A0A] text-white text-[10px] px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                380gsm Premium Fleece
              </div>
            </div>
          </div>

          {/* Floating side info */}
          <div className="absolute -left-4 md:-left-16 top-1/2 -translate-y-1/2 hidden md:block">
            <div className="rotate-90 origin-center">
              <div className="mono text-[9px] text-[#8A8680] tracking-[0.3em] uppercase whitespace-nowrap">
                100 / 100 pcs available
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bottom row — CTA */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="max-w-xs">
            <p className="text-[#4A4845] text-sm leading-relaxed">
              Cyber-tech streetwear crafted for those who blur the line between human and machine.
            </p>
          </div>

          <Link
            href="/shop"
            className="group inline-flex items-center gap-3 px-7 py-3.5 bg-[#0A0A0A] text-[#F2F0EB] text-xs font-semibold tracking-[0.15em] uppercase rounded-full hover:bg-[#5C1A1A] transition-colors duration-300"
          >
            Explore Collection
            <ArrowRight
              size={14}
              className="group-hover:translate-x-1 transition-transform duration-300"
            />
          </Link>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        style={{ opacity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <div className="mono text-[9px] text-[#8A8680] tracking-[0.3em] uppercase">Scroll</div>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-px h-8 bg-gradient-to-b from-[#8A8680] to-transparent"
        />
      </motion.div>
    </section>
  );
}
