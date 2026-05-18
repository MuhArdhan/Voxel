"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Check, ChevronRight, Lock, MapPin, Truck,
  CreditCard, AlertCircle, Loader2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { checkoutSchema, CheckoutFormData, CheckoutPayload } from "@/types";
import { apiPost, STORAGE_URL } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import { Input }    from "@/components/ui/input";
import { Label }    from "@/components/ui/label";
import { Button }   from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

declare global {
  interface Window {
    snap: {
      embed: (token: string, opts: {
        embedId: string;
        onSuccess?: (r: any) => void;
        onPending?: (r: any) => void;
        onError?:   (r: any) => void;
        onClose?:   ()       => void;
      }) => void;
    };
  }
}

const STEPS = [
  { id: 1, name: "Address",  Icon: MapPin    },
  { id: 2, name: "Shipping", Icon: Truck     },
  { id: 3, name: "Payment",  Icon: CreditCard },
];

const COURIERS = [
  { id: "jne",      name: "JNE",      services: [{ id: "reg", name: "REG",         price: 15000 }, { id: "yes",  name: "YES",      price: 25000 }] },
  { id: "sicepat",  name: "SiCepat",  services: [{ id: "reg", name: "SiCepat REG", price: 14000 }, { id: "best", name: "BEST",     price: 22000 }] },
  { id: "anteraja", name: "Anteraja", services: [{ id: "reg", name: "Regular",      price: 13000 }, { id: "nd",   name: "Next Day", price: 20000 }] },
];

// Load Midtrans Snap script via DOM (no next/script needed)
function loadSnapScript(clientKey: string, onLoad: () => void) {
  if (typeof window === "undefined") return;
  if (window.snap) { onLoad(); return; }

  const existing = document.getElementById("midtrans-snap-js") as HTMLScriptElement | null;
  if (existing) {
    if (window.snap) { onLoad(); }
    else { existing.addEventListener("load", onLoad, { once: true }); }
    return;
  }

  const isProduction = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true";
  const s = document.createElement("script");
  s.id   = "midtrans-snap-js";
  s.src  = isProduction
    ? "https://app.midtrans.com/snap/snap.js"
    : "https://app.sandbox.midtrans.com/snap/snap.js";
  s.setAttribute("data-client-key", clientKey);
  s.addEventListener("load", onLoad, { once: true });
  document.head.appendChild(s);
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isLoggedIn, isLoading: authLoading } = useAuth();
  const { cart, clearCart, isLoading: cartLoading }  = useCart();

  const [step,            setStep]            = useState(1);
  const [courier,         setCourier]         = useState(COURIERS[0].id);
  const [service,         setService]         = useState(COURIERS[0].services[0]);
  const [submitting,      setSubmitting]      = useState(false);
  const [error,           setError]           = useState<string | null>(null);
  const [done,            setDone]            = useState(false);
  const [snapToken,       setSnapToken]       = useState<string | null>(null);
  const [snapReady,       setSnapReady]       = useState(false);
  const [snapEmbedded,    setSnapEmbedded]    = useState(false);
  const orderIdRef     = useRef<number | null>(null);
  const embedDone      = useRef(false);

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      shipping_name: "", shipping_phone: "", shipping_address: "",
      shipping_city: "", shipping_province: "", shipping_postal_code: "", notes: "",
    },
  });

  /* ── auth redirect ── */
  useEffect(() => {
    if (!authLoading && !isLoggedIn) router.push("/login?redirect=/checkout");
  }, [authLoading, isLoggedIn, router]);

  /* ── prefill form ── */
  useEffect(() => {
    if (user && !form.formState.isDirty) {
      form.reset({
        shipping_name:        user.name        || "",
        shipping_phone:       user.phone       || "",
        shipping_address:     user.address     || "",
        shipping_city:        user.city        || "",
        shipping_province:    user.province    || "",
        shipping_postal_code: user.postal_code || "",
        notes: "",
      });
    }
  }, [user, form]);

  /* ── load snap script when clientKey arrives ── */
  const [clientKey, setClientKey] = useState("");
  useEffect(() => {
    if (!clientKey) return;
    loadSnapScript(clientKey, () => setSnapReady(true));
  }, [clientKey]);

  useEffect(() => {
    if (!snapToken || !snapReady || step !== 3 || snapEmbedded || embedDone.current) return;

    let tries = 0;
    const run = () => {
      tries++;
      const el = document.getElementById("snap-container");
      if (el && window.snap) {
        embedDone.current = true;
        window.snap.embed(snapToken, {
          embedId: "snap-container",
          onSuccess: async () => {
            try {
              await apiPost(`/orders/${orderIdRef.current}/verify-payment`, {});
            } catch (e) {
              console.error("verify-payment failed:", e);
            }
            setDone(true);
            clearCart();
            router.push(`/orders/${orderIdRef.current}?status=success`);
          },
          onPending: async () => {
            try {
              await apiPost(`/orders/${orderIdRef.current}/verify-payment`, {});
            } catch (e) {
              console.error("verify-payment (pending) failed:", e);
            }
            setDone(true);
            clearCart();
            router.push(`/orders/${orderIdRef.current}?status=pending`);
          },
          onError: () => {
            setError("Pembayaran gagal. Silakan coba lagi.");
            embedDone.current = false;
            setSnapEmbedded(false);
          },
          onClose: () => {
            embedDone.current = false;
            setSnapEmbedded(false);
          },
        });
        setSnapEmbedded(true);
      } else if (tries < 30) {
        setTimeout(run, 100);
      } else {
        setError("Gagal memuat antarmuka pembayaran. Coba refresh halaman.");
      }
    };
    setTimeout(run, 200); // wait for React to render step-3 div
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapToken, snapReady, step]);

  /* ── navigation helpers ── */
  const nextStep = async () => {
    if (step === 1) {
      const ok = await form.trigger();
      if (ok) setStep(2);
    } else if (step === 2) {
      await goToPayment();
    }
  };

  const prevStep = () => {
    if (step > 1) {
      if (step === 3) {
        embedDone.current = false;
        setSnapEmbedded(false);
        setSnapToken(null);
      }
      setStep(s => s - 1);
    }
  };

  const goToPayment = async () => {
    setSubmitting(true);
    setError(null);
    embedDone.current = false;
    try {
      const values = form.getValues();
      const payload: CheckoutPayload = {
        ...values,
        courier,
        courier_service: service.id,
        shipping_cost:   service.price,
      };
      const res = await apiPost("/orders/checkout", payload);
      orderIdRef.current = res.order?.id ?? null;
      setClientKey(res.client_key ?? "");
      setSnapToken(res.snap_token);
      setStep(3);
    } catch (e: any) {
      setError(e.response?.data?.message || "Terjadi kesalahan. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  /* ── loading / empty states ── */
  if (authLoading || cartLoading || done) {
    return (
      <div className="min-h-screen bg-[#F2F0EB] pt-28 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0A0A0A] mx-auto mb-4" />
          {done && <p className="text-[#4A4845] text-sm">Mengarahkan ke pesanan Anda...</p>}
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-[#F2F0EB] pt-28 pb-16 px-6 flex flex-col items-center justify-center text-center">
        <h1 className="text-3xl font-black text-[#0A0A0A] mb-4">Cart is Empty</h1>
        <p className="text-[#4A4845] mb-8">You need items in your cart to checkout.</p>
        <Button onClick={() => router.push("/shop")} className="bg-[#0A0A0A] text-[#F2F0EB] rounded-full px-8 py-6">
          Continue Shopping
        </Button>
      </div>
    );
  }

  const subtotal = Number(cart.total);
  const total    = subtotal + service.price;

  return (
    <div className="min-h-screen bg-[#F2F0EB] pt-24 pb-16 px-6 md:px-10">
      <div className="max-w-[1200px] mx-auto">

        {/* Header & Steps */}
        <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <h1 className="text-3xl sm:text-4xl font-black text-[#0A0A0A] flex items-center gap-3 justify-center sm:justify-start">
            <Lock className="text-[#5C1A1A]" size={28} /> Secure Checkout
          </h1>
          <div className="flex items-center justify-center">
            {STEPS.map((s, i) => {
              const active    = step === s.id;
              const completed = step > s.id;
              return (
                <div key={s.id} className="flex items-center">
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all
                    ${active ? "bg-[#0A0A0A] text-[#F2F0EB]" : completed ? "bg-[#5C1A1A] text-[#F2F0EB]" : "text-[#8A8680]"}`}>
                    {completed ? <Check size={14} /> : <s.Icon size={14} />}
                    <span className="hidden sm:inline">{s.name}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`w-6 sm:w-10 h-0.5 mx-1 ${completed ? "bg-[#5C1A1A]" : "bg-[#C8C4BC]"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Form area */}
          <div className="w-full lg:w-2/3">
            <div className="bg-[#E8E5DF] border border-[#C8C4BC] rounded-3xl p-6 sm:p-10 overflow-hidden">
              <form onSubmit={e => e.preventDefault()}>
                <AnimatePresence mode="wait">

                  {/* STEP 1 */}
                  {step === 1 && (
                    <motion.div key="s1"
                      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <h2 className="text-2xl font-black text-[#0A0A0A] border-b border-[#C8C4BC] pb-4">1. Shipping Address</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {[
                          { id: "shipping_name",        label: "Full Name",       ph: "John Doe",           span: false },
                          { id: "shipping_phone",       label: "Phone Number",    ph: "08123456789",        span: false },
                          { id: "shipping_address",     label: "Complete Address",ph: "Street, No...",      span: true,  textarea: true },
                          { id: "shipping_city",        label: "City",            ph: "",                   span: false },
                          { id: "shipping_province",    label: "Province",        ph: "",                   span: false },
                          { id: "shipping_postal_code", label: "Postal Code",     ph: "",                   span: false },
                        ].map(f => (
                          <div key={f.id} className={`space-y-2 ${f.span ? "sm:col-span-2" : ""}`}>
                            <Label htmlFor={f.id}>{f.label}</Label>
                            {f.textarea
                              ? <Textarea id={f.id} {...form.register(f.id as any)} placeholder={f.ph} className="bg-[#F2F0EB] border-[#C8C4BC] min-h-[90px]" />
                              : <Input   id={f.id} {...form.register(f.id as any)} placeholder={f.ph} className="bg-[#F2F0EB] border-[#C8C4BC]" />
                            }
                            {(form.formState.errors as any)[f.id] && (
                              <p className="text-red-500 text-xs">{(form.formState.errors as any)[f.id]?.message}</p>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="pt-6 flex justify-end">
                        <Button type="button" onClick={nextStep} className="bg-[#0A0A0A] text-[#F2F0EB] rounded-full px-8 py-6 flex items-center gap-2 hover:bg-[#5C1A1A]">
                          Continue to Shipping <ChevronRight size={18} />
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 2 */}
                  {step === 2 && (
                    <motion.div key="s2"
                      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <h2 className="text-2xl font-black text-[#0A0A0A] border-b border-[#C8C4BC] pb-4">2. Shipping Method</h2>
                      <div className="space-y-8">
                        <div className="space-y-4">
                          <Label className="text-base text-[#4A4845]">Select Courier</Label>
                          <div className="grid grid-cols-3 gap-4">
                            {COURIERS.map(c => (
                              <div key={c.id} onClick={() => { setCourier(c.id); setService(c.services[0]); }}
                                className={`cursor-pointer border-2 rounded-2xl p-4 text-center transition-all
                                  ${courier === c.id ? "border-[#0A0A0A] bg-[#0A0A0A] text-[#F2F0EB]" : "border-[#C8C4BC] bg-[#F2F0EB] hover:border-[#8A8680]"}`}>
                                <span className="font-bold">{c.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-4">
                          <Label className="text-base text-[#4A4845]">Select Service</Label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {COURIERS.find(c => c.id === courier)?.services.map(sv => (
                              <div key={sv.id} onClick={() => setService(sv)}
                                className={`cursor-pointer border-2 rounded-2xl p-4 flex justify-between items-center transition-all
                                  ${service.id === sv.id ? "border-[#5C1A1A]" : "border-[#C8C4BC] hover:border-[#8A8680]"} bg-[#F2F0EB]`}>
                                <div>
                                  <span className="font-bold block">{sv.name}</span>
                                  <span className="text-sm text-[#8A8680]">Estimasi 2–3 hari</span>
                                </div>
                                <span className="font-bold mono">{formatPrice(sv.price)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="notes">Order Notes (Optional)</Label>
                          <Textarea id="notes" {...form.register("notes")} className="bg-[#F2F0EB] border-[#C8C4BC]" placeholder="Any special requests..." />
                        </div>
                      </div>

                      {error && (
                        <div className="flex gap-3 bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-sm">
                          <AlertCircle size={16} className="mt-0.5 shrink-0" />
                          <span>{error}</span>
                        </div>
                      )}

                      <div className="pt-6 flex justify-between border-t border-[#C8C4BC] mt-8">
                        <Button type="button" variant="outline" onClick={prevStep} className="border-[#C8C4BC] rounded-full px-8 py-6">Back</Button>
                        <Button type="button" onClick={nextStep} disabled={submitting}
                          className="bg-[#0A0A0A] text-[#F2F0EB] rounded-full px-8 py-6 flex items-center gap-2 hover:bg-[#5C1A1A] disabled:opacity-60">
                          {submitting ? <><Loader2 size={18} className="animate-spin" /> Memproses...</> : <>Lanjut ke Pembayaran <ChevronRight size={18} /></>}
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 3 — Snap Embed */}
                  {step === 3 && (
                    <motion.div key="s3"
                      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <h2 className="text-2xl font-black text-[#0A0A0A] border-b border-[#C8C4BC] pb-4">3. Pilih Pembayaran</h2>

                      {/* summary strip */}
                      <div className="bg-[#F2F0EB] border border-[#C8C4BC] rounded-2xl p-4 text-sm text-[#4A4845] flex flex-wrap gap-x-6 gap-y-1">
                        <span><strong className="text-[#0A0A0A]">Alamat:</strong> {form.getValues("shipping_city")}, {form.getValues("shipping_province")}</span>
                        <span><strong className="text-[#0A0A0A]">Kurir:</strong> {COURIERS.find(c => c.id === courier)?.name} – {service.name}</span>
                        <span><strong className="text-[#0A0A0A]">Total:</strong> {formatPrice(total)}</span>
                      </div>

                      {/* Snap container — Midtrans injects payment UI here */}
                      <div className="relative min-h-[200px]">
                        {!snapEmbedded && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                            <Loader2 size={36} className="animate-spin text-[#5C1A1A]" />
                            <p className="text-sm text-[#4A4845] font-medium">Memuat pilihan pembayaran...</p>
                          </div>
                        )}
                        <div id="snap-container" className="w-full" />
                      </div>

                      {error && (
                        <div className="flex gap-3 bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-sm">
                          <AlertCircle size={16} className="mt-0.5 shrink-0" />
                          <span>{error}</span>
                        </div>
                      )}

                      <div className="pt-4 border-t border-[#C8C4BC]">
                        <Button type="button" variant="outline" onClick={prevStep} className="border-[#C8C4BC] rounded-full px-8 py-6">
                          Kembali
                        </Button>
                      </div>
                    </motion.div>
                  )}

                </AnimatePresence>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-1/3">
            <div className="sticky top-24 bg-[#0A0A0A] border border-[#2A2A2A] rounded-3xl p-6 sm:p-8 text-[#F2F0EB]">
              <h2 className="text-xl font-black mb-6 border-b border-[#2A2A2A] pb-4">Order Summary</h2>
              <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2">
                {cart.items.map(item => (
                  <div key={item.id} className="flex gap-4 items-start">
                    <div className="w-16 h-16 bg-[#1A1A1A] rounded-xl overflow-hidden shrink-0 border border-[#2A2A2A]">
                      {item.product?.images?.[0]
                        ? <img src={`${STORAGE_URL}/${item.product.images[0].image_path}`} alt={item.product.name} className="w-full h-full object-cover opacity-80" />
                        : <div className="w-full h-full flex items-center justify-center text-xl">👕</div>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">{item.product.name}</p>
                      <div className="text-xs text-[#8A8680] mt-1 flex justify-between">
                        <span>{item.variant.size} · Qty {item.quantity}</span>
                        <span className="mono">{formatPrice(Number(item.subtotal))}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="h-px bg-[#2A2A2A] mb-6" />
              <div className="space-y-3 mb-6 text-sm">
                <div className="flex justify-between text-[#8A8680]">
                  <span>Subtotal ({cart.total_items} items)</span>
                  <span className="mono text-[#F2F0EB]">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-[#8A8680]">
                  <span>Shipping</span>
                  <span className="mono text-[#F2F0EB]">
                    {step > 1 ? formatPrice(service.price) : "—"}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-end pt-6 border-t border-[#2A2A2A]">
                <span className="font-bold text-[#8A8680]">Total</span>
                <span className="mono text-2xl font-black">{formatPrice(step > 1 ? total : subtotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
