"use client";

import Link from "next/link";

// Inline SVG icons to avoid lucide-react version issues
function InstagramIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
    </svg>
  );
}
function TwitterIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
    </svg>
  );
}
function YoutubeIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.97C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.97C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.97A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/>
    </svg>
  );
}

const FOOTER_LINKS = {
  Shop: [
    { label: "All Products", href: "/shop" },
    { label: "Hoodies", href: "/shop?category=hoodies" },
    { label: "T-Shirts", href: "/shop?category=t-shirts" },
    { label: "Jackets", href: "/shop?category=jackets" },
    { label: "Limited Drops", href: "/shop?limited=true" },
  ],
  Support: [
    { label: "FAQ", href: "/faq" },
    { label: "Size Guide", href: "/size-guide" },
    { label: "Shipping Info", href: "/shipping" },
    { label: "Returns", href: "/returns" },
    { label: "Contact", href: "/contact" },
  ],
  Brand: [
    { label: "About VOXEL", href: "/about" },
    { label: "Lookbook", href: "/lookbook" },
    { label: "Manifesto", href: "/manifesto" },
    { label: "Careers", href: "/careers" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-[#0A0A0A] text-white">
      {/* Main footer */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 pt-20 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-16">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <div className="text-3xl font-black tracking-[0.2em] uppercase mb-4">
              VOXEL
            </div>
            <p className="text-white/40 text-sm leading-relaxed max-w-xs mb-6">
              Cyber-tech streetwear crafted for those who live at the intersection of technology and culture.
            </p>

            {/* Social links */}
            <div className="flex items-center gap-4">
              {[
                { icon: InstagramIcon, href: "https://instagram.com" },
                { icon: TwitterIcon, href: "https://twitter.com" },
                { icon: YoutubeIcon, href: "https://youtube.com" },
              ].map(({ icon: Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white/30 transition-all duration-200"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>

            {/* Newsletter */}
            <div className="mt-8">
              <div className="mono text-[10px] text-white/30 tracking-[0.2em] uppercase mb-3">
                Join the grid
              </div>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-full text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#00D4FF]/50 transition-colors"
                />
                <button className="px-5 py-2.5 bg-white text-[#0A0A0A] text-xs font-bold rounded-full hover:bg-[#00D4FF] transition-colors duration-200">
                  →
                </button>
              </div>
            </div>
          </div>

          {/* Links columns */}
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category}>
              <div className="mono text-[10px] text-white/30 tracking-[0.2em] uppercase mb-5">
                {category}
              </div>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/50 hover:text-white transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="mono text-[10px] text-white/20 tracking-[0.15em]">
            © 2026 VOXEL. All rights reserved.
          </div>

          {/* Tech status indicators */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#C8FF00]" />
              <span className="mono text-[9px] text-white/20 tracking-wider">SYSTEM_ONLINE</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00D4FF]" />
              <span className="mono text-[9px] text-white/20 tracking-wider">SECURE_CHECKOUT</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/privacy" className="mono text-[9px] text-white/20 hover:text-white/40 transition-colors tracking-wider">
              Privacy
            </Link>
            <Link href="/terms" className="mono text-[9px] text-white/20 hover:text-white/40 transition-colors tracking-wider">
              Terms
            </Link>
          </div>
        </div>
      </div>

      {/* Giant footer text */}
      <div className="overflow-hidden border-t border-white/5">
        <div
          className="text-[12rem] md:text-[18rem] font-black text-white/[0.02] leading-none tracking-tighter select-none text-center pb-4"
          aria-hidden="true"
        >
          VOXEL
        </div>
      </div>
    </footer>
  );
}
