"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Check, ChevronRight, ChevronDown, Lock, MapPin, Truck,
  CreditCard, AlertCircle, Loader2, Search, Receipt
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { checkoutSchema, CheckoutFormData, CheckoutPayload } from "@/types";
import { apiPost, apiGet, STORAGE_URL } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import { Input }    from "@/components/ui/input";
import { Label }    from "@/components/ui/label";
import { Button }   from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

declare global {
  interface Window {
    snap: {
      embed: (token: string, opts: any) => void;
      pay: (token: string, opts: any) => void;
    };
  }
}

const STEPS = [
  { id: 1, name: "Address",  Icon: MapPin    },
  { id: 2, name: "Shipping", Icon: Truck     },
  { id: 3, name: "Payment",  Icon: CreditCard },
];

type PaymentMethod = { id: string; name: string; logo?: string; icon?: any };
type PaymentGroup = { id: string; title: string; methods: PaymentMethod[] };

const PAYMENT_GROUPS: PaymentGroup[] = [
  {
    id: 'ewallet',
    title: 'E-Wallet & QRIS',
    methods: [
      { id: 'gopay', name: 'GoPay', logo: '/logo/gopay.png' },
      { id: 'dana', name: 'DANA', logo: '/logo/dana.png' },
      { id: 'qris', name: 'QRIS', logo: '/logo/qris.png' },
    ]
  },
  {
    id: 'va',
    title: 'Virtual Account',
    methods: [
      { id: 'bca_va', name: 'BCA Virtual Account', logo: '/logo/bca.png' },
      { id: 'mandiri_va', name: 'Mandiri Virtual Account', logo: '/logo/mandiri.png' },
      { id: 'bni_va', name: 'BNI Virtual Account', logo: '/logo/bni.png' },
      { id: 'bri_va', name: 'BRI Virtual Account', logo: '/logo/bri.png' },
    ]
  },
  {
    id: 'card',
    title: 'Card Payment',
    methods: [
      { id: 'credit_card', name: 'Credit Card / Debit Card', icon: CreditCard },
    ]
  }
];

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
  const [submitting,      setSubmitting]      = useState(false);
  const [error,           setError]           = useState<string | null>(null);
  const [done,            setDone]            = useState(false);
  const [snapToken,       setSnapToken]       = useState<string | null>(null);
  const [snapReady,       setSnapReady]       = useState(false);
  const [activePaymentGroup, setActivePaymentGroup] = useState<string | null>(null);
  const [isPaymentOpen,   setIsPaymentOpen]   = useState(false);

  const orderIdRef     = useRef<number | null>(null);
  const embedDone      = useRef(false);

  // --- Shipping & Area States ---
  const [areas, setAreas] = useState<any[]>([]);
  const [areaSearch, setAreaSearch] = useState("");
  const [isSearchingArea, setIsSearchingArea] = useState(false);
  const [showAreaDropdown, setShowAreaDropdown] = useState(false);
  const [selectedAreaLabel, setSelectedAreaLabel] = useState("");
  
  const [dynamicRates, setDynamicRates] = useState<any[]>([]);
  const [isLoadingRates, setIsLoadingRates] = useState(false);
  
  const [selectedCourier, setSelectedCourier] = useState<string>("");
  const [selectedService, setSelectedService] = useState<any>(null);

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      shipping_name: "", shipping_phone: "", shipping_address: "",
      shipping_city: "", shipping_province: "", shipping_postal_code: "", notes: "",
      destination_area_id: "",
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
        destination_area_id: user.area_id || "",
      });
      
      if (user.city && user.province && user.postal_code) {
        const label = `${user.city}, ${user.province}, ${user.postal_code}`;
        setSelectedAreaLabel(label);
        setAreaSearch(label);
      }
    }
  }, [user, form]);

  /* ── area search debounce ── */
  useEffect(() => {
    const timer = setTimeout(() => {
      if (areaSearch.length > 2 && areaSearch !== selectedAreaLabel) {
        setIsSearchingArea(true);
        apiGet<any[]>('/shipping/areas', { search: areaSearch })
          .then((data) => {
            setAreas(data);
            setShowAreaDropdown(true);
          })
          .catch((e) => console.error(e))
          .finally(() => setIsSearchingArea(false));
      } else {
        setAreas([]);
        setShowAreaDropdown(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [areaSearch, selectedAreaLabel]);

  const selectArea = (area: any) => {
    form.setValue("shipping_city", area.administrative_division_level_2_name);
    form.setValue("shipping_province", area.administrative_division_level_1_name);
    form.setValue("shipping_postal_code", String(area.postal_code));
    form.setValue("destination_area_id", area.id);
    
    const label = `${area.name}, ${area.administrative_division_level_2_name}, ${area.postal_code}`;
    setSelectedAreaLabel(label);
    setAreaSearch(label);
    setShowAreaDropdown(false);
    form.clearErrors("destination_area_id");
  };

  /* ── load snap script when clientKey arrives ── */
  const [clientKey, setClientKey] = useState("");
  useEffect(() => {
    if (!clientKey) return;
    loadSnapScript(clientKey, () => setSnapReady(true));
  }, [clientKey]);




  /* ── navigation helpers ── */
  const nextStep = async () => {
    if (step === 1) {
      const ok = await form.trigger();
      if (!form.getValues('destination_area_id')) {
          form.setError("destination_area_id", { type: "manual", message: "Please select a valid area from the dropdown" });
          return;
      }
      if (ok) {
        setStep(2);
        fetchRates();
      }
    } else if (step === 2) {
      if (!selectedService) {
        setError("Please select a shipping service.");
        return;
      }
      setStep(3);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      if (step === 3) {
        embedDone.current = false;
        setSnapToken(null);
      }
      setStep(s => s - 1);
    }
  };

  const fetchRates = async () => {
    setIsLoadingRates(true);
    setError(null);
    try {
        const res = await apiPost<any>('/shipping/rates', {
            destination_area_id: form.getValues('destination_area_id')
        });
        setDynamicRates(res);
        // Auto-select first available courier/service if any
        if (res.length > 0) {
            setSelectedCourier(res[0].courier_code);
            setSelectedService(res[0]);
        }
    } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch shipping rates. Please try again.");
    } finally {
        setIsLoadingRates(false);
    }
  };

  const createOrderAndPay = async (method?: string) => {
    setSubmitting(true);
    setError(null);
    try {
      const values = form.getValues();
      const payload: CheckoutPayload = {
        ...values,
        courier: selectedCourier,
        courier_service: selectedService.courier_service_code,
        shipping_cost: selectedService.price,
        selected_payment_method: method,
      };
      const res = await apiPost<any>("/orders/checkout", payload);
      orderIdRef.current = res.order?.id ?? null;
      
      const proceed = () => {
        if (window.snap && res.snap_token) {
          window.snap.pay(res.snap_token, {
            onSuccess: async () => {
              setDone(true);
              clearCart();
              router.push(`/orders/${res.order.id}?status=success`);
            },
            onPending: async () => {
              setDone(true);
              clearCart();
              router.push(`/orders/${res.order.id}?status=pending`);
            },
            onError: () => {
              setError("Payment failed. Please try again.");
              setSubmitting(false);
            },
            onClose: () => {
              // Redirect to order page to pay later
              setDone(true);
              clearCart();
              router.push(`/orders/${res.order.id}`);
            },
          });
        }
      };

      if (res.client_key && !window.snap) {
        loadSnapScript(res.client_key, proceed);
      } else {
        proceed();
      }
      
      // If pay later
      if (!method && res.order?.id) {
        setDone(true);
        clearCart();
        router.push(`/orders/${res.order.id}`);
      }
      
    } catch (e: any) {
      setError(e.response?.data?.message || "An error occurred. Please try again.");
      setSubmitting(false);
    }
  };

  /* ── loading / empty states ── */
  if (authLoading || cartLoading || done) {
    return (
      <div className="min-h-screen bg-[#F2F0EB] pt-28 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0A0A0A] mx-auto mb-4" />
          {done && <p className="text-[#4A4845] text-sm">Redirecting to your order...</p>}
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
  const total    = subtotal + (selectedService?.price || 0);

  // Group rates by courier for Step 2 UI
  const couriersList = dynamicRates.reduce((acc: any[], rate: any) => {
    const existing = acc.find(c => c.id === rate.courier_code);
    if (existing) {
        existing.services.push(rate);
    } else {
        acc.push({
            id: rate.courier_code,
            name: rate.courier_name,
            services: [rate]
        });
    }
    return acc;
  }, []);

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
                        <div className="space-y-2">
                          <Label htmlFor="shipping_name">Full Name</Label>
                          <Input id="shipping_name" {...form.register("shipping_name")} placeholder="John Doe" className="bg-[#F2F0EB] border-[#C8C4BC]" />
                          {form.formState.errors.shipping_name && (
                            <p className="text-red-500 text-xs">{form.formState.errors.shipping_name.message}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="shipping_phone">Phone Number</Label>
                          <Input id="shipping_phone" {...form.register("shipping_phone")} placeholder="08123456789" className="bg-[#F2F0EB] border-[#C8C4BC]" />
                          {form.formState.errors.shipping_phone && (
                            <p className="text-red-500 text-xs">{form.formState.errors.shipping_phone.message}</p>
                          )}
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                          <Label htmlFor="shipping_address">Complete Address</Label>
                          <Textarea id="shipping_address" {...form.register("shipping_address")} placeholder="Street, No..." className="bg-[#F2F0EB] border-[#C8C4BC] min-h-[90px]" />
                          {form.formState.errors.shipping_address && (
                            <p className="text-red-500 text-xs">{form.formState.errors.shipping_address.message}</p>
                          )}
                        </div>
                        
                        {/* Area Search Autocomplete */}
                        <div className="space-y-2 sm:col-span-2 relative">
                          <Label htmlFor="area_search">District / City / Postal Code</Label>
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8680]" size={18} />
                            <Input 
                                id="area_search" 
                                value={areaSearch}
                                onChange={(e) => setAreaSearch(e.target.value)}
                                placeholder="e.g. Kebayoran Baru or 12110" 
                                className="bg-[#F2F0EB] border-[#C8C4BC] pl-10" 
                                autoComplete="off"
                            />
                            {isSearchingArea && (
                                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5C1A1A] animate-spin" size={18} />
                            )}
                          </div>
                          {form.formState.errors.destination_area_id && (
                            <p className="text-red-500 text-xs">{form.formState.errors.destination_area_id.message}</p>
                          )}

                          <AnimatePresence>
                            {showAreaDropdown && areas.length > 0 && (
                                <motion.div 
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute z-20 w-full mt-2 bg-[#F2F0EB] border border-[#C8C4BC] rounded-xl shadow-2xl max-h-64 overflow-y-auto overflow-x-hidden"
                                >
                                    {areas.map((area) => (
                                        <div 
                                            key={area.id} 
                                            className="px-5 py-3 hover:bg-[#E8E5DF] cursor-pointer border-b border-[#C8C4BC]/40 last:border-0 transition-colors flex flex-col gap-0.5"
                                            onClick={() => selectArea(area)}
                                        >
                                            <p className="font-bold text-sm text-[#0A0A0A]">{area.name}</p>
                                            <p className="text-[11px] text-[#8A8680] uppercase tracking-wider mono">
                                                {area.administrative_division_level_2_name}, {area.administrative_division_level_1_name} {area.postal_code}
                                            </p>
                                        </div>
                                    ))}
                                </motion.div>
                            )}
                            {showAreaDropdown && areaSearch.length > 2 && areas.length === 0 && !isSearchingArea && areaSearch !== selectedAreaLabel && (
                                <motion.div 
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute z-20 w-full mt-2 bg-[#F2F0EB] border border-[#C8C4BC] rounded-xl shadow-xl p-6 text-center"
                                >
                                    <p className="text-sm font-medium text-[#8A8680]">No areas found.</p>
                                    <p className="text-[10px] text-[#8A8680]/60 uppercase tracking-widest mono mt-1">Try another keyword</p>
                                </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                      <div className="pt-6 flex justify-between items-center border-t border-[#C8C4BC] mt-8">
                        <Button type="button" variant="outline" onClick={() => router.push('/cart')} className="border-[#C8C4BC] rounded-full px-8 py-6 text-[#0A0A0A] hover:text-[#F2F0EB]">
                          Back to Cart
                        </Button>
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
                        {isLoadingRates ? (
                            <div className="flex flex-col items-center justify-center py-10 gap-4">
                                <Loader2 size={32} className="animate-spin text-[#5C1A1A]" />
                                <p className="text-[#8A8680] text-sm">Calculating best rates...</p>
                            </div>
                        ) : couriersList.length > 0 ? (
                            <>
                                <div className="space-y-4">
                                <Label className="text-base text-[#4A4845]">Select Courier</Label>
                                <div className="grid grid-cols-3 gap-4">
                                    {couriersList.map((c) => (
                                    <div key={c.id} onClick={() => { setSelectedCourier(c.id); setSelectedService(c.services[0]); }}
                                        className={`cursor-pointer border-2 rounded-2xl p-4 text-center transition-all
                                        ${selectedCourier === c.id ? "border-[#0A0A0A] bg-[#0A0A0A] text-[#F2F0EB]" : "border-[#C8C4BC] bg-[#F2F0EB] hover:border-[#8A8680]"}`}>
                                        <span className="font-bold">{c.name}</span>
                                    </div>
                                    ))}
                                </div>
                                </div>
                                <div className="space-y-4">
                                <Label className="text-base text-[#4A4845]">Select Service</Label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {couriersList.find((c) => c.id === selectedCourier)?.services.map((sv: any) => (
                                    <div key={sv.courier_service_code} onClick={() => setSelectedService(sv)}
                                        className={`cursor-pointer border-2 rounded-2xl p-4 flex justify-between items-center transition-all
                                        ${selectedService?.courier_service_code === sv.courier_service_code ? "border-[#5C1A1A]" : "border-[#C8C4BC] hover:border-[#8A8680]"} bg-[#F2F0EB]`}>
                                        <div>
                                        <span className="font-bold block">{sv.courier_service_name}</span>
                                        <span className="text-sm text-[#8A8680]">
                                          {sv.shipment_duration_range
                                            ? `${sv.shipment_duration_range} ${sv.shipment_duration_unit}`
                                            : "Estimated delivery"}
                                        </span>
                                        </div>
                                        <span className="font-bold mono">{formatPrice(sv.price)}</span>
                                    </div>
                                    ))}
                                </div>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-[#8A8680]">No shipping options available for this destination.</p>
                            </div>
                        )}
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
                        <Button type="button" onClick={nextStep} disabled={submitting || isLoadingRates || !selectedService}
                          className="bg-[#0A0A0A] text-[#F2F0EB] rounded-full px-8 py-6 flex items-center gap-2 hover:bg-[#5C1A1A] disabled:opacity-60">
                          {submitting ? <><Loader2 size={18} className="animate-spin" /> Processing...</> : <>Proceed to Payment <ChevronRight size={18} /></>}
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
                      <h2 className="text-2xl font-black text-[#0A0A0A] border-b border-[#C8C4BC] pb-4">3. Payment Selection</h2>

                      {/* Order Data Summary */}
                      <div className="bg-[#F2F0EB] border border-[#C8C4BC] rounded-2xl p-6 mb-8 flex flex-col sm:flex-row gap-6">
                        {/* Address */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 text-[#0A0A0A] mb-3">
                            <MapPin size={16} />
                            <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Ship To</span>
                          </div>
                          <div className="text-sm text-[#4A4845] space-y-1">
                            <p className="font-bold text-[#0A0A0A]">
                              {form.getValues("shipping_name")} <span className="text-[#C8C4BC] font-normal mx-1">|</span> {form.getValues("shipping_phone")}
                            </p>
                            <p className="leading-relaxed pt-1">{form.getValues("shipping_address")}</p>
                            <p>{form.getValues("shipping_city")}, {form.getValues("shipping_province")} {form.getValues("shipping_postal_code")}</p>
                          </div>
                        </div>

                        {/* Divider */}
                        <div className="w-full h-px sm:w-px sm:h-auto bg-[#C8C4BC]" />

                        {/* Courier */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 text-[#0A0A0A] mb-3">
                            <Truck size={16} />
                            <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Delivery</span>
                          </div>
                          <div className="text-sm text-[#4A4845]">
                            <p className="font-bold text-[#0A0A0A] uppercase tracking-wide">
                              {selectedService?.courier_name || "Courier"}
                            </p>
                            <p className="mt-1">{selectedService?.courier_service_name}</p>
                          </div>
                        </div>
                      </div>

                      {/* Custom Payment Methods List */}
                      <div>
                        <h3 className="text-sm font-bold text-[#0A0A0A] uppercase tracking-[0.2em] mb-6">Select Payment Method</h3>
                        
                        <div className="space-y-6 mb-8">
                          {PAYMENT_GROUPS.map(group => (
                            <div key={group.id}>
                              <button
                                type="button"
                                onClick={() => setActivePaymentGroup(activePaymentGroup === group.id ? null : group.id)}
                                className="w-full flex items-center justify-between mb-2 text-left group/btn p-2 -ml-2 rounded-lg hover:bg-[#E8E5DF]/50 transition-colors"
                              >
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                                  <h4 className="text-[10px] text-[#8A8680] group-hover/btn:text-[#0A0A0A] font-bold tracking-widest uppercase transition-colors">{group.title}</h4>
                                  
                                  <div className="flex flex-wrap items-center gap-3">
                                    {group.methods.map(m => m.logo ? (
                                      <img key={m.id} src={m.logo} alt={m.name} className="h-3 max-w-[30px] object-contain grayscale opacity-50 group-hover/btn:opacity-100 transition-opacity" />
                                    ) : m.icon ? (
                                      <m.icon key={m.id} size={14} className="text-[#8A8680] group-hover/btn:text-[#0A0A0A] transition-colors opacity-50 group-hover/btn:opacity-100" />
                                    ) : null)}
                                  </div>
                                </div>
                                <ChevronDown size={16} className={`text-[#8A8680] group-hover/btn:text-[#0A0A0A] transition-transform duration-300 ${activePaymentGroup === group.id ? 'rotate-180' : ''}`} />
                              </button>

                              <AnimatePresence>
                                {activePaymentGroup === group.id && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="space-y-3 pt-2">
                                      {group.methods.map((method) => (
                                        <button
                                          key={method.id}
                                          type="button"
                                          onClick={() => createOrderAndPay(method.id)}
                                          disabled={submitting}
                                          className="w-full bg-transparent border border-[#C8C4BC] hover:border-[#0A0A0A] hover:bg-[#E8E5DF] p-4 rounded-xl flex items-center justify-between transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                          <div className="flex items-center gap-4">
                                            <div className="w-12 h-8 bg-white border border-[#C8C4BC] rounded flex items-center justify-center p-1.5 shadow-sm group-hover:border-[#0A0A0A] transition-colors shrink-0">
                                              {method.logo ? (
                                                <img src={method.logo} alt={method.name} className="w-full h-full object-contain" />
                                              ) : method.icon ? (
                                                <method.icon className="text-[#0A0A0A]" size={18} />
                                              ) : null}
                                            </div>
                                            <span className="font-bold text-[#0A0A0A] text-sm group-hover:text-[#5C1A1A] transition-colors">{method.name}</span>
                                          </div>
                                          <ChevronRight size={18} className="text-[#C8C4BC] group-hover:text-[#0A0A0A] transition-colors" />
                                        </button>
                                      ))}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center justify-between border-t border-[#C8C4BC] pt-6">
                          <Button type="button" variant="outline" onClick={prevStep} disabled={submitting} className="border-[#C8C4BC] rounded-full px-8 py-6 text-[#0A0A0A] hover:text-[#F2F0EB]">
                            Back
                          </Button>
                          <button 
                            type="button" 
                            onClick={() => createOrderAndPay()}
                            disabled={submitting}
                            className="text-[11px] font-bold tracking-widest uppercase text-[#8A8680] hover:text-[#0A0A0A] transition-colors"
                          >
                            Show Other Payment Methods
                          </button>
                        </div>
                      </div>

                      {error && (
                        <div className="flex gap-3 bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-sm mt-4">
                          <AlertCircle size={16} className="mt-0.5 shrink-0" />
                          <span>{error}</span>
                        </div>
                      )}
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
                    {step > 1 && selectedService ? formatPrice(selectedService.price) : "—"}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-end pt-6 border-t border-[#2A2A2A]">
                <span className="font-bold text-[#8A8680]">Total</span>
                <span className="mono text-2xl font-black">{formatPrice(step > 1 && selectedService ? total : subtotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
