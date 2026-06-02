"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

const lookbookImages = [
  {
    id: 1,
    url: "/images/lookbook/lookbook-1.png",
    caption: "CORE ESSENTIALS // 01",
    aspect: "aspect-[3/4]",
  },
  {
    id: 2,
    url: "/images/lookbook/lookbook-2.png",
    caption: "URBAN CAMOUFLAGE",
    aspect: "aspect-[4/5]",
  },
  {
    id: 3,
    url: "/images/lookbook/lookbook-3.png",
    caption: "HEAVYWEIGHT COTTON",
    aspect: "aspect-square",
  },
  {
    id: 4,
    url: "/images/lookbook/lookbook-4.png",
    caption: "STRUCTURAL HOOD // 01",
    aspect: "aspect-[3/5]",
  },
  {
    id: 5,
    url: "/images/lookbook/lookbook-5.png",
    caption: "SEASONAL OUTERWEAR",
    aspect: "aspect-[4/3]",
  },
  {
    id: 6,
    url: "/images/lookbook/lookbook-6.png",
    caption: "ANONYMITY SHIELD",
    aspect: "aspect-[3/4]",
  }
];

export default function LookbookPage() {
  return (
    <>
      <Navbar />

      <main className="pt-24 pb-32 px-6 md:px-10 max-w-[1600px] mx-auto">
        {/* Header Section */}
        <section className="mt-10 mb-20 md:mb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-8"
          >
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-px bg-[#0A0A0A]" />
                <span className="mono text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase">
                  Visual Archive
                </span>
              </div>
              <h1 className="text-5xl md:text-8xl lg:text-9xl font-black tracking-tighter uppercase leading-[0.9]">
                Lookbook <br /> <span className="text-[#8A8680]">Vol. 01</span>
              </h1>
            </div>
            
            <p className="mono text-[10px] md:text-xs text-[#8A8680] tracking-[0.2em] uppercase max-w-xs md:text-right">
              Documenting the intersection of structural design and urban landscapes.
            </p>
          </motion.div>
        </section>

        {/* Masonry Gallery */}
        <section className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {lookbookImages.map((img, idx) => (
            <motion.div
              key={img.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: (idx % 3) * 0.1, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true, margin: "-50px" }}
              className="break-inside-avoid relative group cursor-pointer"
            >
              <div className={`w-full overflow-hidden rounded-xl bg-[#C8C4BC] ${img.aspect}`}>
                <img 
                  src={img.url} 
                  alt={img.caption}
                  className="w-full h-full object-cover grayscale mix-blend-multiply opacity-90 group-hover:scale-105 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 ease-out"
                  loading="lazy"
                />
              </div>

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl flex items-center justify-center backdrop-blur-[2px]">
                <Link 
                  href="/shop"
                  className="bg-[#F2F0EB] text-[#0A0A0A] px-6 py-3 rounded-full mono text-[10px] font-bold tracking-[0.2em] uppercase hover:bg-white hover:scale-105 transition-all transform translate-y-4 group-hover:translate-y-0 duration-500"
                >
                  Shop The Look
                </Link>
              </div>

              {/* Caption */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                <span className="mono text-[10px] font-bold tracking-[0.1em] text-[#F2F0EB] uppercase">
                  {img.caption}
                </span>
                <span className="w-2 h-2 rounded-full bg-[#00D4FF] shadow-[0_0_8px_rgba(0,212,255,0.8)] animate-pulse" />
              </div>
            </motion.div>
          ))}
        </section>
        
        {/* Call to action */}
        <section className="mt-32 text-center border-t border-[#C8C4BC] pt-24">
          <p className="mono text-[10px] text-[#8A8680] tracking-[0.3em] uppercase mb-8">
            End of Archive
          </p>
          <Link 
            href="/collections"
            className="inline-flex items-center justify-center border-2 border-[#0A0A0A] text-[#0A0A0A] px-10 py-5 rounded-xl mono text-xs font-bold tracking-[0.2em] uppercase hover:bg-[#0A0A0A] hover:text-[#F2F0EB] transition-colors"
          >
            View All Collections
          </Link>
        </section>
      </main>

      <Footer />
    </>
  );
}
