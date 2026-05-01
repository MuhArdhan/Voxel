"use client";

import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import CartSlideOver from "@/components/CartSlideOver";
import { Toaster } from "@/components/ui/sonner";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        {children}
        <CartSlideOver />
        <Toaster
        position="bottom-right"
        toastOptions={{
          classNames: {
            toast: "font-sans text-sm border border-[#C8C4BC] bg-[#F2F0EB] text-[#0A0A0A] rounded-xl shadow-lg",
            title: "font-semibold",
            description: "text-[#4A4845]",
            success: "border-l-4 border-l-green-500",
            error: "border-l-4 border-l-red-500",
            info: "border-l-4 border-l-[#00D4FF]",
            warning: "border-l-4 border-l-yellow-500",
          },
        }}
      />
      </CartProvider>
    </AuthProvider>
  );
}
