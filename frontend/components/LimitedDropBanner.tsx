"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";

export default function LimitedDropBanner() {
  return (
    <section className="py-6 bg-[#0A0A0A] overflow-hidden relative">
      {/* Neon grid background */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,212,255,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,212,255,0.5) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 py-8">
          {/* Left */}
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#00D4FF]/10 border border-[#00D4FF]/30 flex items-center justify-center">
              <Zap size={18} className="text-[#00D4FF]" />
            </div>
            <div>
              <div className="mono text-[10px] text-[#00D4FF] tracking-[0.3em] uppercase mb-0.5">
                Limited Drop — SS26
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                VOID CIRCUIT Collection
              </h2>
            </div>
          </div>

          {/* Center — stats */}
          <div className="flex items-center gap-8 border-x border-white/10 px-8 hidden md:flex">
            <div className="text-center">
              <div className="mono text-[10px] text-[#8A8680] tracking-wider uppercase mb-1">Total</div>
              <div className="text-2xl font-black text-white">100</div>
              <div className="mono text-[9px] text-[#8A8680]">pieces</div>
            </div>
            <div className="w-px h-12 bg-white/10" />
            <div className="text-center">
              <div className="mono text-[10px] text-[#8A8680] tracking-wider uppercase mb-1">Left</div>
              <div className="text-2xl font-black text-[#00D4FF]">23</div>
              <div className="mono text-[9px] text-[#8A8680]">pieces</div>
            </div>
          </div>

          {/* Right — CTA */}
          <Link
            href="/shop?limited=true"
            className="group inline-flex items-center gap-3 px-7 py-3.5 border border-white/20 text-white text-xs font-semibold tracking-[0.15em] uppercase rounded-full hover:bg-white hover:text-[#0A0A0A] transition-all duration-300"
          >
            Shop the Drop
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </div>
      </div>

      {/* Bottom neon line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#8B5CF6] to-transparent opacity-50" />
    </section>
  );
}
