"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { getErrorMessage, getValidationErrors } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/";
  const { login } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      await login({ email: form.email, password: form.password });
      toast.success("Selamat datang kembali!");
      router.push(redirect);
    } catch (err) {
      const validationErrors = getValidationErrors(err);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
      } else {
        toast.error(getErrorMessage(err, "Email atau password salah."));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left — Editorial Panel */}
      <div className="hidden lg:flex relative bg-[#0A0A0A] flex-col justify-between p-14 overflow-hidden">
        {/* Background grid lines */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `
              linear-gradient(#00D4FF 1px, transparent 1px),
              linear-gradient(90deg, #00D4FF 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />

        {/* Neon glow blob */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#00D4FF]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-[#5C1A1A]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10">
          <Link href="/" className="font-black text-2xl tracking-[-0.05em] text-[#F2F0EB]">
            VOXEL
          </Link>
        </div>

        {/* Big text */}
        <div className="relative z-10 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="mono text-[10px] text-[#00D4FF] tracking-[0.25em] uppercase mb-6">
              — Member Access
            </p>
            <h1 className="text-5xl xl:text-6xl font-black text-[#F2F0EB] tracking-tight leading-[0.9]">
              WEAR<br />
              <span className="text-[#5C1A1A]">THE</span><br />
              FUTURE.
            </h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="text-sm text-[#4A4845] max-w-xs leading-relaxed"
          >
            Akses koleksi eksklusif, pantau pesanan, dan jadilah yang pertama mendapatkan limited drop.
          </motion.p>
        </div>

        {/* Bottom status bar */}
        <div className="relative z-10 flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00D4FF] animate-pulse" />
            <span className="mono text-[9px] text-[#4A4845] tracking-[0.2em] uppercase">System Online</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C8FF00]" />
            <span className="mono text-[9px] text-[#4A4845] tracking-[0.2em] uppercase">Secure Connection</span>
          </div>
        </div>
      </div>

      {/* Right — Form Panel */}
      <div className="flex items-center justify-center bg-[#F2F0EB] px-6 py-16">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-sm space-y-8"
        >
          {/* Mobile logo */}
          <div className="lg:hidden">
            <Link href="/" className="font-black text-2xl tracking-[-0.05em] text-[#0A0A0A]">
              VOXEL
            </Link>
          </div>

          {/* Header */}
          <div className="space-y-1">
            <p className="mono text-[10px] text-[#8A8680] tracking-[0.25em] uppercase">
              — Sign In
            </p>
            <h2 className="text-3xl font-black text-[#0A0A0A] tracking-tight">
              Welcome back.
            </h2>
            <p className="text-sm text-[#8A8680]">
              Belum punya akun?{" "}
              <Link
                href="/register"
                className="text-[#0A0A0A] font-semibold underline underline-offset-4 hover:text-[#5C1A1A] transition-colors"
              >
                Daftar sekarang
              </Link>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <Label
                htmlFor="email"
                className="mono text-[10px] font-semibold tracking-[0.15em] uppercase text-[#4A4845]"
              >
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="nama@example.com"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                required
                className={`h-12 bg-[#E8E5DF] border-[#C8C4BC] rounded-xl text-sm focus-visible:ring-[#00D4FF]/30 focus-visible:border-[#0A0A0A] ${
                  errors.email ? "border-red-400 focus-visible:border-red-500" : ""
                }`}
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label
                htmlFor="password"
                className="mono text-[10px] font-semibold tracking-[0.15em] uppercase text-[#4A4845]"
              >
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className={`h-12 bg-[#E8E5DF] border-[#C8C4BC] rounded-xl text-sm pr-11 focus-visible:ring-[#00D4FF]/30 focus-visible:border-[#0A0A0A] ${
                    errors.password ? "border-red-400 focus-visible:border-red-500" : ""
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A8680] hover:text-[#0A0A0A] transition-colors p-1"
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500">{errors.password}</p>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-[#0A0A0A] text-[#F2F0EB] rounded-full font-bold tracking-[0.12em] uppercase text-xs hover:bg-[#5C1A1A] transition-colors group"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Sign In
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-[#C8C4BC]" />
            <span className="mono text-[9px] text-[#8A8680] tracking-[0.2em] uppercase">Or</span>
            <div className="h-px flex-1 bg-[#C8C4BC]" />
          </div>

          {/* Back to shop */}
          <p className="text-center">
            <Link
              href="/"
              className="mono text-[10px] text-[#8A8680] tracking-[0.15em] uppercase hover:text-[#0A0A0A] transition-colors underline underline-offset-4"
            >
              ← Kembali ke toko
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
