"use client";

import { useAuth } from "@/contexts/AuthContext";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import { motion } from "framer-motion";

import { useEffect } from "react";

export default function AccountDashboard() {
  const { user, refreshUser } = useAuth();

  // Fetch the latest user data (including updated stats) when landing on dashboard
  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  if (!user) return null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl md:text-4xl font-black text-[#0A0A0A] tracking-tight mb-2">
          Welcome, <span className="text-[#5C1A1A]">{user.name}</span>.
        </h1>
        <p className="mono text-[10px] text-[#8A8680] tracking-[0.2em] uppercase">
          System Protocol // Dashboard
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-[#0A0A0A] text-[#F2F0EB] rounded-2xl p-6 md:p-8 relative overflow-hidden group"
        >
          {/* Cyber Accents */}
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-transparent to-[#00D4FF]/10 rounded-bl-full pointer-events-none" />
          <div className="absolute top-0 left-0 w-px h-16 bg-gradient-to-b from-[#00D4FF]/50 to-transparent pointer-events-none" />
          <div className="absolute top-0 left-0 w-16 h-px bg-gradient-to-r from-[#00D4FF]/50 to-transparent pointer-events-none" />

          <p className="mono text-[10px] text-[#8A8680] tracking-[0.2em] uppercase mb-4">Total Orders</p>
          <p className="text-4xl font-black tracking-tight group-hover:text-[#00D4FF] transition-colors">
            {user.total_orders || 0}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-[#0A0A0A] text-[#F2F0EB] rounded-2xl p-6 md:p-8 relative overflow-hidden group"
        >
          {/* Cyber Accents */}
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-transparent to-[#C8FF00]/10 rounded-bl-full pointer-events-none" />
          <div className="absolute top-0 left-0 w-px h-16 bg-gradient-to-b from-[#C8FF00]/50 to-transparent pointer-events-none" />
          <div className="absolute top-0 left-0 w-16 h-px bg-gradient-to-r from-[#C8FF00]/50 to-transparent pointer-events-none" />

          <p className="mono text-[10px] text-[#8A8680] tracking-[0.2em] uppercase mb-4">Total Spent</p>
          <p className="text-3xl md:text-4xl font-black tracking-tight group-hover:text-[#C8FF00] transition-colors">
            {formatPrice(user.total_spent || 0)}
          </p>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8"
      >
        <Link
          href="/orders"
          className="group bg-[#E8E5DF]/60 border border-[#C8C4BC]/60 rounded-2xl p-6 hover:bg-[#0A0A0A] hover:border-[#0A0A0A] transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-[#0A0A0A] group-hover:text-[#F2F0EB] mb-1 transition-colors">Order History</h3>
              <p className="text-sm text-[#8A8680] group-hover:text-[#C8C4BC]">Track your recent orders</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#F2F0EB] flex items-center justify-center text-[#0A0A0A] group-hover:bg-[#5C1A1A] group-hover:text-[#F2F0EB] transition-colors">
              →
            </div>
          </div>
        </Link>

        <Link
          href="/account/settings"
          className="group bg-[#E8E5DF]/60 border border-[#C8C4BC]/60 rounded-2xl p-6 hover:bg-[#0A0A0A] hover:border-[#0A0A0A] transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-[#0A0A0A] group-hover:text-[#F2F0EB] mb-1 transition-colors">System Config</h3>
              <p className="text-sm text-[#8A8680] group-hover:text-[#C8C4BC]">Update profile & security</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#F2F0EB] flex items-center justify-center text-[#0A0A0A] group-hover:bg-[#5C1A1A] group-hover:text-[#F2F0EB] transition-colors">
              →
            </div>
          </div>
        </Link>
      </motion.div>
    </div>
  );
}
