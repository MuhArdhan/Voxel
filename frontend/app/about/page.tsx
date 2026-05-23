"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import Image from "next/link";

const values = [
  {
    id: "01",
    title: "DIGITAL PRECISION",
    desc: "Every cut, stitch, and silhouette is engineered with algorithmic accuracy. We design for the future, unconstrained by traditional fashion rules."
  },
  {
    id: "02",
    title: "RAW UTILITY",
    desc: "Form follows function. Our garments are built to withstand the urban environment, featuring durable hardware and weather-resistant textiles."
  },
  {
    id: "03",
    title: "ANONYMITY",
    desc: "In a hyper-connected world, privacy is a luxury. Our oversized fits and structural hoods are designed to obscure, protect, and empower."
  }
];

export default function AboutPage() {
  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 md:px-10 max-w-[1400px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-px bg-[#0A0A0A]" />
            <span className="mono text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase">Brand Identity</span>
          </div>
          
          <h1 className="text-5xl md:text-8xl lg:text-[10rem] font-black tracking-tighter leading-[0.85] uppercase">
            Wearable <br /> Architecture.
          </h1>
        </motion.div>
      </section>

      {/* Hero Image / Video Placeholder */}
      <section className="w-full h-[60vh] md:h-[80vh] relative bg-[#0A0A0A] overflow-hidden">
        <motion.div 
          initial={{ scale: 1.1 }}
          whileInView={{ scale: 1 }}
          transition={{ duration: 1.5 }}
          viewport={{ once: true }}
          className="w-full h-full"
        >
          <img 
            src="https://images.unsplash.com/photo-1618084705353-83ebce2ea7d0?q=80&w=2574&auto=format&fit=crop" 
            alt="Voxel Aesthetic" 
            className="w-full h-full object-cover opacity-80 mix-blend-luminosity"
          />
        </motion.div>
        <div className="absolute bottom-8 left-6 md:left-10 mono text-[10px] text-[#F2F0EB] tracking-widest uppercase">
          Headquarters
        </div>
      </section>

      {/* Manifesto Section */}
      <section className="py-24 md:py-40 px-6 md:px-10 max-w-[1400px] mx-auto">
        <div className="grid md:grid-cols-12 gap-12 md:gap-8">
          <div className="md:col-span-4">
            <h2 className="mono text-xs md:text-sm font-bold tracking-[0.2em] text-[#8A8680] uppercase sticky top-32">
              [ THE MANIFESTO ]
            </h2>
          </div>
          <div className="md:col-span-8">
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true, margin: "-100px" }}
              className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] uppercase"
            >
              VOXEL is not a fashion brand. It is an architectural approach to the human form. We extract the cold, calculated aesthetics of the digital realm and manifest them into physical artifacts.
            </motion.p>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true, margin: "-100px" }}
              className="mt-10 text-base md:text-xl text-[#4A4845] leading-relaxed max-w-2xl font-medium"
            >
              Born in 2026, we rebel against fast fashion by creating permanent, structural garments. Every piece is a meticulously constructed shell designed to shield the wearer from the noise of the modern world.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="bg-[#0A0A0A] text-[#F2F0EB] py-24 md:py-32 px-6 md:px-10">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 md:mb-24 gap-8">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase">
              Core <br /> Architecture
            </h2>
            <div className="mono text-[10px] tracking-[0.3em] uppercase text-[#8A8680]">
              Design Pillars // V.1.0
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-12 md:gap-8">
            {values.map((val, idx) => (
              <motion.div 
                key={val.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.15 }}
                viewport={{ once: true }}
                className="border-t border-[#2A2A2A] pt-8"
              >
                <div className="mono text-xs text-[#8A8680] mb-6">{val.id} //</div>
                <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight mb-4">{val.title}</h3>
                <p className="text-[#8A8680] leading-relaxed text-sm">{val.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Visual Grid */}
      <section className="py-24 md:py-40 px-6 md:px-10 max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="h-[50vh] md:h-[80vh] bg-[#C8C4BC] overflow-hidden rounded-xl"
          >
            <img 
              src="https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2670&auto=format&fit=crop" 
              alt="Fabric texture" 
              className="w-full h-full object-cover grayscale mix-blend-multiply opacity-80"
            />
          </motion.div>
          <div className="flex flex-col gap-6 md:gap-8">
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="h-[25vh] md:h-[40vh] bg-[#C8C4BC] overflow-hidden rounded-xl"
            >
              <img 
                src="https://images.unsplash.com/photo-1558222218-b7b54eede3f3?q=80&w=2574&auto=format&fit=crop" 
                alt="Hardware detail" 
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
              />
            </motion.div>
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="h-[25vh] md:h-[37vh] bg-[#0A0A0A] flex flex-col justify-between p-8 rounded-xl"
            >
              <div className="mono text-[10px] text-[#8A8680] tracking-widest uppercase">
                Materials
              </div>
              <p className="text-[#F2F0EB] text-xl font-medium tracking-tight">
                Sourcing industrial-grade textiles. Heavyweight cottons, ripstop nylons, and matte metal hardware.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="border-t border-[#C8C4BC] py-32 px-6 md:px-10 text-center">
        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-10">
          Enter The System
        </h2>
        <Link 
          href="/shop"
          className="inline-flex items-center justify-center bg-[#0A0A0A] text-[#F2F0EB] px-8 py-4 rounded-xl mono text-xs font-bold tracking-[0.2em] uppercase hover:bg-[#5C1A1A] transition-colors"
        >
          Explore Catalog →
        </Link>
      </section>

      <Footer />
    </>
  );
}
