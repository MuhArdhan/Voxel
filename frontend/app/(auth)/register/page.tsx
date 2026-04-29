"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowRight, User, Mail, Phone } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { getErrorMessage, getValidationErrors } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FormState {
  name: string;
  email: string;
  phone: string;
  password: string;
  password_confirmation: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    phone: "",
    password: "",
    password_confirmation: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const validateClient = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = "Nama wajib diisi.";
    if (!form.email.trim()) newErrors.email = "Email wajib diisi.";
    if (form.password.length < 8) newErrors.password = "Password minimal 8 karakter.";
    if (form.password !== form.password_confirmation)
      newErrors.password_confirmation = "Konfirmasi password tidak cocok.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateClient()) return;
    setLoading(true);
    setErrors({});

    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        password_confirmation: form.password_confirmation,
        phone: form.phone || undefined,
      });
      toast.success("Akun berhasil dibuat. Selamat datang di VOXEL!");
      router.push("/");
    } catch (err) {
      const validationErrors = getValidationErrors(err);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
      } else {
        toast.error(getErrorMessage(err, "Gagal membuat akun. Silakan coba lagi."));
      }
    } finally {
      setLoading(false);
    }
  };

  // Field helper
  const fieldClass = (key: keyof FormState) =>
    `h-12 bg-[#E8E5DF] border-[#C8C4BC] rounded-xl text-sm focus-visible:ring-[#00D4FF]/30 focus-visible:border-[#0A0A0A] ${
      errors[key] ? "border-red-400 focus-visible:border-red-500" : ""
    }`;

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left — Editorial Panel */}
      <div className="hidden lg:flex relative bg-[#0A0A0A] flex-col justify-between p-14 overflow-hidden">
        {/* Grid bg */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `
              linear-gradient(#8B5CF6 1px, transparent 1px),
              linear-gradient(90deg, #8B5CF6 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-[#8B5CF6]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-[#5C1A1A]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10">
          <Link href="/" className="font-black text-2xl tracking-[-0.05em] text-[#F2F0EB]">
            VOXEL
          </Link>
        </div>

        {/* Editorial copy */}
        <div className="relative z-10 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="mono text-[10px] text-[#8B5CF6] tracking-[0.25em] uppercase mb-6">
              — Join the Collective
            </p>
            <h1 className="text-5xl xl:text-6xl font-black text-[#F2F0EB] tracking-tight leading-[0.9]">
              JOIN<br />
              <span className="text-[#8B5CF6]">THE</span><br />
              GRID.
            </h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="text-sm text-[#4A4845] max-w-xs leading-relaxed"
          >
            Daftar dan dapatkan akses eksklusif ke limited drop, notifikasi rilis terbaru, dan pengalaman berbelanja yang dipersonalisasi.
          </motion.p>
        </div>

        {/* Benefits list */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="relative z-10 space-y-2"
        >
          {[
            "Early access ke Limited Drop",
            "Pantau status pesanan real-time",
            "Riwayat pembelian tersimpan",
          ].map((benefit) => (
            <div key={benefit} className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6] flex-shrink-0" />
              <span className="text-xs text-[#4A4845]">{benefit}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Right — Form Panel */}
      <div className="flex items-center justify-center bg-[#F2F0EB] px-6 py-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-sm space-y-7"
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
              — Create Account
            </p>
            <h2 className="text-3xl font-black text-[#0A0A0A] tracking-tight">
              Daftar sekarang.
            </h2>
            <p className="text-sm text-[#8A8680]">
              Sudah punya akun?{" "}
              <Link
                href="/login"
                className="text-[#0A0A0A] font-semibold underline underline-offset-4 hover:text-[#5C1A1A] transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="space-y-1.5">
              <Label htmlFor="name" className="mono text-[10px] font-semibold tracking-[0.15em] uppercase text-[#4A4845]">
                Nama Lengkap
              </Label>
              <div className="relative">
                <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A8680] pointer-events-none" />
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Muhammad Ardhan"
                  autoComplete="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className={`${fieldClass("name")} pl-9`}
                />
              </div>
              {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="mono text-[10px] font-semibold tracking-[0.15em] uppercase text-[#4A4845]">
                Email
              </Label>
              <div className="relative">
                <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A8680] pointer-events-none" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="nama@example.com"
                  autoComplete="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className={`${fieldClass("email")} pl-9`}
                />
              </div>
              {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
            </div>

            {/* Phone (optional) */}
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="mono text-[10px] font-semibold tracking-[0.15em] uppercase text-[#4A4845]">
                No. HP{" "}
                <span className="normal-case text-[#8A8680] font-normal">(opsional)</span>
              </Label>
              <div className="relative">
                <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A8680] pointer-events-none" />
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="08xx-xxxx-xxxx"
                  autoComplete="tel"
                  value={form.phone}
                  onChange={handleChange}
                  className={`${fieldClass("phone")} pl-9`}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="mono text-[10px] font-semibold tracking-[0.15em] uppercase text-[#4A4845]">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPass ? "text" : "password"}
                  placeholder="Min. 8 karakter"
                  autoComplete="new-password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className={`${fieldClass("password")} pr-11`}
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
              {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password_confirmation" className="mono text-[10px] font-semibold tracking-[0.15em] uppercase text-[#4A4845]">
                Konfirmasi Password
              </Label>
              <div className="relative">
                <Input
                  id="password_confirmation"
                  name="password_confirmation"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Ulangi password"
                  autoComplete="new-password"
                  value={form.password_confirmation}
                  onChange={handleChange}
                  required
                  className={`${fieldClass("password_confirmation")} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A8680] hover:text-[#0A0A0A] transition-colors p-1"
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password_confirmation && (
                <p className="text-xs text-red-500">{errors.password_confirmation}</p>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-[#0A0A0A] text-[#F2F0EB] rounded-full font-bold tracking-[0.12em] uppercase text-xs hover:bg-[#5C1A1A] transition-colors group mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Creating account...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Create Account
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </Button>

            <p className="text-[10px] text-[#8A8680] text-center leading-relaxed">
              Dengan mendaftar, Anda menyetujui{" "}
              <span className="underline cursor-pointer hover:text-[#0A0A0A]">Syarat & Ketentuan</span>{" "}
              dan{" "}
              <span className="underline cursor-pointer hover:text-[#0A0A0A]">Kebijakan Privasi</span>{" "}
              VOXEL.
            </p>
          </form>

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
