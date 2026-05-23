"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export default function HeroSection() {
  const ref = useRef<HTMLElement>(null);
  const [hasScrolled, setHasScrolled] = useState(false);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // Trigger animation once when scrolled past 2% of the section
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (latest > 0.02 && !hasScrolled) {
      setHasScrolled(true);
    }
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);

  return (
    <section ref={ref} className="relative h-[150vh]">
      {/* Sticky container that stays in place while scrolling through the 150vh height */}
      <div className="sticky top-0 w-full h-screen overflow-hidden bg-[#F2F0EB]">
        
        {/* Background editorial giant text */}
        <motion.div
          style={{ y: bgY }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ 
            opacity: hasScrolled ? 1 : 0,
            scale: hasScrolled ? 1 : 0.95
          }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden pt-24"
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

        {/* Hero Person Image — Anchored to bottom */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-xl md:max-w-2xl lg:max-w-[800px] z-10 pointer-events-none">
          <motion.div 
            initial={{ opacity: 0, filter: "grayscale(100%) contrast(200%) blur(10px)", y: 40 }}
            animate={{ opacity: 1, filter: "grayscale(0%) contrast(100%) blur(0px)", y: 0 }}
            transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full aspect-[4/5] flex items-end justify-center"
          >
            <Image 
              src="/images/hero-model.png" 
              alt="Hero Model" 
              fill
              className="object-contain object-bottom drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
              priority
            />
          </motion.div>

        {/* Floating side info */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ 
              opacity: hasScrolled ? 1 : 0,
              x: hasScrolled ? 0 : -20
            }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute -left-4 md:-left-16 top-1/2 -translate-y-1/2 hidden md:block"
          >
          </motion.div>
        </div>

        {/* Main content */}
        <motion.div
          style={{ y: textY }}
          className="relative z-20 max-w-[1400px] mx-auto px-6 md:px-10 pt-28 pb-20 min-h-screen flex flex-col justify-between pointer-events-none"
        >
          {/* Top row */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ 
              opacity: hasScrolled ? 1 : 0,
              y: hasScrolled ? 0 : -20
            }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="flex justify-between items-start pointer-events-auto"
          >
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
          </motion.div>

          {/* Empty space filler for flex-between since we moved the image out */}
          <div className="flex-1" />
          
          {/* Bottom row — CTA */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ 
              opacity: hasScrolled ? 1 : 0,
              y: hasScrolled ? 0 : 30
            }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col md:flex-row justify-between items-end gap-6 pointer-events-auto"
          >
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
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: hasScrolled ? 0 : 1 }}
          transition={{ duration: 0.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <div className="mono text-[9px] text-[#8A8680] tracking-[0.3em] uppercase">Scroll</div>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-px h-8 bg-gradient-to-b from-[#8A8680] to-transparent"
          />
        </motion.div>
      </div>
    </section>
  );
}
