"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { LayoutDashboard, Package, ShoppingCart, Users, Tag, LogOut, ArrowLeft } from "lucide-react";

const adminNav = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { name: "Categories", href: "/admin/categories", icon: Tag },
  { name: "Users", href: "/admin/users", icon: Users },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isLoggedIn, isLoading, isAdmin, user, logout } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!isLoggedIn) {
        router.push("/login?redirect=/admin");
      } else if (!isAdmin) {
        router.push("/");
      }
    }
  }, [isLoading, isLoggedIn, isAdmin, router]);

  if (isLoading || !isLoggedIn || !isAdmin) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[#F2F0EB] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <div className="mono text-[10px] text-[#F2F0EB] tracking-[0.3em] uppercase animate-pulse">
            Admin Protocol // Authenticating
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2F0EB] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0A0A0A] text-[#F2F0EB] flex flex-col shrink-0 fixed h-full inset-y-0 left-0 z-50">
        <div className="p-6">
          <Link href="/admin" className="block mb-12">
            <h1 className="text-2xl font-black tracking-tight leading-none">
              VOXEL<span className="text-[#00D4FF]">_</span>ADMIN
            </h1>
            <p className="mono text-[9px] text-[#8A8680] tracking-[0.2em] mt-1 uppercase">Command Center</p>
          </Link>

          <nav className="space-y-2">
            {adminNav.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all duration-200 ${
                    isActive 
                      ? "bg-[#F2F0EB] text-[#0A0A0A] font-bold" 
                      : "text-[#8A8680] hover:text-[#F2F0EB] hover:bg-[#8A8680]/10"
                  }`}
                >
                  <Icon size={18} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-[#8A8680]/20">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-[#1A1A1A] flex items-center justify-center border border-[#8A8680]/30 overflow-hidden shrink-0">
              {user?.avatar ? (
                <img src={`http://localhost:8000/storage/${user.avatar}`} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs">⚡</span>
              )}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate">{user?.name}</p>
              <p className="mono text-[10px] text-[#00D4FF] tracking-widest uppercase">System Admin</p>
            </div>
          </div>

          <div className="space-y-2">
            <Link 
              href="/"
              className="flex items-center gap-3 px-4 py-2 rounded-lg text-xs text-[#8A8680] hover:text-[#F2F0EB] hover:bg-[#8A8680]/10 transition-colors"
            >
              <ArrowLeft size={14} />
              Return to Store
            </Link>
            <button 
              onClick={() => logout()}
              className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-xs text-[#FF6B6B] hover:bg-[#FF6B6B]/10 transition-colors text-left"
            >
              <LogOut size={14} />
              Logout Session
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-64 min-w-0">
        <div className="p-8 md:p-12">
          {children}
        </div>
      </main>
    </div>
  );
}
