"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ShoppingBag, Menu, X, Search, User } from "lucide-react";

const NAV_LEFT = [
  { label: "Shop", href: "/shop" },
  { label: "Collections", href: "/collections" },
  { label: "Limited Drop", href: "/shop?limited=true" },
];

const NAV_RIGHT = [
  { label: "Lookbook", href: "/lookbook" },
  { label: "About", href: "/about" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartCount] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-[#F2F0EB]/90 backdrop-blur-md border-b border-[#C8C4BC]"
            : "bg-transparent"
        }`}
      >
        <nav className="max-w-[1400px] mx-auto px-6 md:px-10 h-14 flex items-center justify-between gap-8">
          {/* Left nav */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LEFT.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-[10px] font-semibold tracking-[0.15em] uppercase text-[#4A4845] hover:text-[#0A0A0A] transition-colors duration-200"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Logo — centered */}
          <Link
            href="/"
            className="absolute left-1/2 -translate-x-1/2 text-xl font-black tracking-[0.2em] uppercase text-[#0A0A0A]"
          >
            VOXEL
          </Link>

          {/* Right nav */}
          <div className="hidden md:flex items-center gap-8 ml-auto">
            {NAV_RIGHT.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-[10px] font-semibold tracking-[0.15em] uppercase text-[#4A4845] hover:text-[#0A0A0A] transition-colors duration-200"
              >
                {item.label}
              </Link>
            ))}

            {/* Icons */}
            <div className="flex items-center gap-4 pl-4 border-l border-[#C8C4BC]">
              <button
                aria-label="Search"
                className="text-[#4A4845] hover:text-[#0A0A0A] transition-colors"
              >
                <Search size={16} strokeWidth={1.5} />
              </button>
              <Link
                href="/account"
                aria-label="Account"
                className="text-[#4A4845] hover:text-[#0A0A0A] transition-colors"
              >
                <User size={16} strokeWidth={1.5} />
              </Link>
              <Link
                href="/cart"
                aria-label="Cart"
                className="relative text-[#4A4845] hover:text-[#0A0A0A] transition-colors"
              >
                <ShoppingBag size={16} strokeWidth={1.5} />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-[#0A0A0A] text-[#F2F0EB] text-[8px] font-bold rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden ml-auto text-[#0A0A0A]"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </nav>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-[#F2F0EB] pt-14 flex flex-col"
          >
            <div className="flex flex-col p-8 gap-8">
              {[...NAV_LEFT, ...NAV_RIGHT].map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="text-3xl font-black tracking-tight text-[#0A0A0A] uppercase"
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}

              <div className="flex items-center gap-6 mt-auto pt-8 border-t border-[#C8C4BC]">
                <Link href="/account" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 text-sm text-[#4A4845]">
                  <User size={16} /> Account
                </Link>
                <Link href="/cart" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 text-sm text-[#4A4845]">
                  <ShoppingBag size={16} /> Cart
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
