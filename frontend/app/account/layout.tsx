"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { motion } from "framer-motion";

const navItems = [
  { name: "Dashboard", href: "/account" },
  { name: "Order History", href: "/orders" },
  { name: "Settings", href: "/account/settings" },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isLoggedIn, isLoading, logout } = useAuth();

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push("/login?redirect=/account");
    }
  }, [isLoading, isLoggedIn, router]);

  if (isLoading || !isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#F2F0EB] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[#0A0A0A] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <div className="mono text-[10px] text-[#8A8680] tracking-[0.3em] uppercase animate-pulse">
            System Protocol // Loading
          </div>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <section className="min-h-screen pt-24 pb-16 md:pt-32 bg-[#F2F0EB] relative">
      {/* Grain texture overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.15]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.2'/%3E%3C/svg%3E")`,
          backgroundSize: "200px 200px",
        }}
      />

      <div className="max-w-[1200px] mx-auto px-6 md:px-10 relative z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 mono text-[10px] text-[#8A8680] tracking-[0.2em] uppercase hover:text-[#0A0A0A] transition-colors mb-8"
        >
          ← Return to Store
        </Link>
        
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 shrink-0">
            <div className="sticky top-24 bg-[#E8E5DF]/60 border border-[#C8C4BC]/60 rounded-3xl p-6 backdrop-blur-md">
              <div className="flex items-center gap-3 mb-8 pb-6 border-b border-[#C8C4BC]/40">
                <div className="w-2 h-2 bg-[#00D4FF] rounded-full animate-pulse" />
                <h2 className="mono text-[10px] text-[#0A0A0A] tracking-[0.2em] uppercase font-bold">
                  User Account
                </h2>
              </div>
              
              <nav className="space-y-2 mb-8">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`block px-4 py-3 rounded-xl mono text-[10px] tracking-[0.15em] uppercase transition-all duration-300 relative group overflow-hidden ${
                        isActive
                          ? "text-[#F2F0EB] font-bold"
                          : "text-[#4A4845] hover:text-[#0A0A0A]"
                      }`}
                    >
                      {isActive && (
                        <motion.div 
                          layoutId="activeNavBackground"
                          className="absolute inset-0 bg-[#0A0A0A] rounded-xl -z-10"
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                      {!isActive && (
                        <div className="absolute inset-0 bg-[#C8C4BC]/20 opacity-0 group-hover:opacity-100 rounded-xl -z-10 transition-opacity duration-300" />
                      )}
                      {item.name}
                    </Link>
                  );
                })}
              </nav>

              <div className="pt-6 border-t border-[#C8C4BC]/40">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 rounded-xl mono text-[10px] tracking-[0.15em] uppercase text-[#FF6B6B] hover:bg-[#FF6B6B]/10 transition-colors"
                >
                  Logout Session
                </button>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </section>
  );
}
