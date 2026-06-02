"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

const collections = [
  {
    id: "01",
    title: "SEASON 01: THE VOID",
    subtitle: "Structural outerwear designed for anonymity.",
    image: "/images/collections/collection-1.png",
    link: "/shop?category=outerwear",
    color: "bg-[#0A0A0A]",
    textColor: "text-[#F2F0EB]"
  },
  {
    id: "02",
    title: "CORE ESSENTIALS",
    subtitle: "Heavyweight cottons. Permanent utility.",
    image: "/images/collections/collection-2.png",
    link: "/shop?category=apparel",
    color: "bg-[#E8E5DF]",
    textColor: "text-[#0A0A0A]"
  },
  {
    id: "03",
    title: "ARCHIVE // PROTOTYPES",
    subtitle: "Experimental silhouettes and limited runs.",
    image: "/images/collections/collection-3.png",
    link: "/shop?limited=true",
    color: "bg-[#C8C4BC]",
    textColor: "text-[#0A0A0A]"
  }
];

export default function CollectionsPage() {
  return (
    <>
      <Navbar />

      <main className="pt-24 pb-20">
        {/* Header */}
        <section className="px-6 md:px-10 max-w-[1400px] mx-auto mb-16 md:mb-24 mt-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter uppercase mb-4">
              Collections
            </h1>
            <p className="mono text-[10px] md:text-xs text-[#8A8680] tracking-[0.2em] uppercase max-w-md">
              Curated drops and seasonal releases. Engineered for the modern environment.
            </p>
          </motion.div>
        </section>

        {/* Collections Feed */}
        <section className="px-6 md:px-10 max-w-[1400px] mx-auto space-y-12 md:space-y-32">
          {collections.map((collection, idx) => (
            <motion.div 
              key={collection.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true, margin: "-100px" }}
              className="group relative flex flex-col md:flex-row items-center gap-8 md:gap-16"
            >
              {/* Image Block */}
              <div className={`w-full md:w-1/2 aspect-square relative overflow-hidden rounded-2xl ${collection.color}`}>
                <img 
                  src={collection.image} 
                  alt={collection.title}
                  className="w-full h-full object-cover grayscale opacity-90 group-hover:scale-105 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000 ease-out"
                />
                
                {/* ID Badge overlay on image */}
                <div className="absolute top-6 left-6 mono text-[10px] tracking-widest font-bold uppercase bg-white/10 backdrop-blur-md text-white px-3 py-1 rounded-full">
                  DROP {collection.id}
                </div>
              </div>

              {/* Text Block */}
              <div className="w-full md:flex-1 flex flex-col justify-center">
                <div className="mono text-xs text-[#8A8680] mb-4 tracking-[0.2em]">
                  {collection.id} //
                </div>
                <h2 className="text-4xl md:text-5xl lg:text-7xl font-black uppercase tracking-tighter leading-[0.9] mb-6">
                  {collection.title.split(': ').map((part, i, arr) => (
                    <span key={i}>
                      {part}
                      {i < arr.length - 1 && <br />}
                    </span>
                  ))}
                </h2>
                <p className="text-base md:text-lg text-[#4A4845] mb-10 max-w-sm">
                  {collection.subtitle}
                </p>
                <Link 
                  href={collection.link}
                  className="inline-flex items-center justify-between border border-[#0A0A0A] px-6 py-4 rounded-xl hover:bg-[#0A0A0A] hover:text-[#F2F0EB] transition-colors w-full sm:w-auto"
                >
                  <span className="mono text-[10px] font-bold tracking-[0.2em] uppercase">Explore Collection</span>
                  <span className="font-bold">→</span>
                </Link>
              </div>
            </motion.div>
          ))}
        </section>
      </main>

      <Footer />
    </>
  );
}
