"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronRight, Lock, MapPin, Truck, CreditCard } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { checkoutSchema, CheckoutFormData, CheckoutPayload } from "@/types";
import { apiPost, STORAGE_URL } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const steps = [
  { id: 1, name: "Address", icon: MapPin },
  { id: 2, name: "Shipping", icon: Truck },
  { id: 3, name: "Review & Pay", icon: CreditCard },
];

const couriers = [
  { id: "jne", name: "JNE", services: [{ id: "reg", name: "REG", price: 15000 }, { id: "yes", name: "YES", price: 25000 }] },
  { id: "sicepat", name: "SiCepat", services: [{ id: "reg", name: "SiCepat REG", price: 14000 }, { id: "best", name: "BEST", price: 22000 }] },
  { id: "anteraja", name: "Anteraja", services: [{ id: "reg", name: "Regular", price: 13000 }, { id: "nd", name: "Next Day", price: 20000 }] },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isLoggedIn, isLoading: authLoading } = useAuth();
  const { cart, clearCart, isLoading: cartLoading } = useCart();

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCourier, setSelectedCourier] = useState(couriers[0].id);
  const [selectedService, setSelectedService] = useState(couriers[0].services[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [isCheckoutComplete, setIsCheckoutComplete] = useState(false);

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      shipping_name: "",
      shipping_phone: "",
      shipping_address: "",
      shipping_city: "",
      shipping_province: "",
      shipping_postal_code: "",
      notes: "",
    },
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.push("/login?redirect=/checkout");
    }
  }, [authLoading, isLoggedIn, router]);

  // Pre-fill form if user data exists
  useEffect(() => {
    if (user && !form.formState.isDirty) {
      form.reset({
        shipping_name: user.name || "",
        shipping_phone: user.phone || "",
        shipping_address: user.address || "",
        shipping_city: user.city || "",
        shipping_province: user.province || "",
        shipping_postal_code: user.postal_code || "",
        notes: "",
      });
    }
  }, [user, form]);

  const handleNextStep = async () => {
    if (currentStep === 1) {
      const isValid = await form.trigger();
      if (isValid) setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(3);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  const onSubmit = async (data: CheckoutFormData) => {
    if (currentStep !== 3) return;

    try {
      setIsSubmitting(true);
      setCheckoutError(null);

      const payload: CheckoutPayload = {
        ...data,
        courier: selectedCourier,
        courier_service: selectedService.id,
        shipping_cost: selectedService.price,
      };

      const res = await apiPost("/orders/checkout", payload);
      
      // Set flag BEFORE clearCart to prevent empty cart UI flash during navigation
      setIsCheckoutComplete(true);
      
      // Clear cart context
      await clearCart();
      
      // Redirect to success/order page
      if (res.order?.id) {
        router.push(`/orders/${res.order.id}?status=success`);
      } else {
        router.push("/orders?status=success");
      }
    } catch (err: any) {
      console.error("Checkout error:", err);
      setCheckoutError(err.response?.data?.message || "Terjadi kesalahan saat memproses pesanan.");
      // Reset flag if error (user can retry)
      setIsCheckoutComplete(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || cartLoading || isCheckoutComplete) {
    return (
      <div className="min-h-screen bg-[#F2F0EB] pt-28 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0A0A0A] mx-auto mb-4"></div>
          {isCheckoutComplete && (
            <p className="text-[#4A4845] text-sm">Redirecting to your order...</p>
          )}
        </div>
      </div>
    );
  }

  if ((!cart || cart.items.length === 0) && !isCheckoutComplete) {
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
  const total = subtotal + selectedService.price;

  return (
    <div className="min-h-screen bg-[#F2F0EB] pt-24 pb-16 px-6 md:px-10">
      <div className="max-w-[1200px] mx-auto">
        {/* Header & Progress */}
        <div className="mb-10 text-center sm:text-left flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-[#0A0A0A] tracking-tight flex items-center gap-3 justify-center sm:justify-start">
              <Lock className="text-[#5C1A1A]" size={28} />
              Secure Checkout
            </h1>
          </div>

          <div className="flex items-center justify-center gap-2 sm:gap-4">
            {steps.map((step, index) => {
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              const Icon = step.icon;

              return (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                      isActive
                        ? "bg-[#0A0A0A] border-[#0A0A0A] text-[#F2F0EB]"
                        : isCompleted
                        ? "bg-[#5C1A1A] border-[#5C1A1A] text-[#F2F0EB]"
                        : "bg-transparent border-[#C8C4BC] text-[#8A8680]"
                    }`}
                  >
                    {isCompleted ? <Check size={18} /> : <Icon size={18} />}
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-8 sm:w-12 h-0.5 mx-2 ${
                        isCompleted ? "bg-[#5C1A1A]" : "bg-[#C8C4BC]"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* LEFT COLUMN: Forms */}
          <div className="w-full lg:w-2/3">
            <div className="bg-[#E8E5DF] border border-[#C8C4BC] rounded-3xl p-6 sm:p-10 overflow-hidden relative">
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <AnimatePresence mode="wait">
                  {/* STEP 1: ADDRESS */}
                  {currentStep === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <h2 className="text-2xl font-black text-[#0A0A0A] mb-6 border-b border-[#C8C4BC] pb-4">
                        1. Shipping Address
                      </h2>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="shipping_name">Full Name</Label>
                          <Input
                            id="shipping_name"
                            {...form.register("shipping_name")}
                            className="bg-[#F2F0EB] border-[#C8C4BC] focus-visible:ring-[#0A0A0A]"
                            placeholder="John Doe"
                          />
                          {form.formState.errors.shipping_name && (
                            <p className="text-red-500 text-xs mt-1">{form.formState.errors.shipping_name.message}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="shipping_phone">Phone Number</Label>
                          <Input
                            id="shipping_phone"
                            {...form.register("shipping_phone")}
                            className="bg-[#F2F0EB] border-[#C8C4BC] focus-visible:ring-[#0A0A0A]"
                            placeholder="08123456789"
                          />
                          {form.formState.errors.shipping_phone && (
                            <p className="text-red-500 text-xs mt-1">{form.formState.errors.shipping_phone.message}</p>
                          )}
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                          <Label htmlFor="shipping_address">Complete Address</Label>
                          <Textarea
                            id="shipping_address"
                            {...form.register("shipping_address")}
                            className="bg-[#F2F0EB] border-[#C8C4BC] focus-visible:ring-[#0A0A0A] min-h-[100px]"
                            placeholder="Street name, building, house number..."
                          />
                          {form.formState.errors.shipping_address && (
                            <p className="text-red-500 text-xs mt-1">{form.formState.errors.shipping_address.message}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="shipping_city">City</Label>
                          <Input
                            id="shipping_city"
                            {...form.register("shipping_city")}
                            className="bg-[#F2F0EB] border-[#C8C4BC] focus-visible:ring-[#0A0A0A]"
                          />
                          {form.formState.errors.shipping_city && (
                            <p className="text-red-500 text-xs mt-1">{form.formState.errors.shipping_city.message}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="shipping_province">Province</Label>
                          <Input
                            id="shipping_province"
                            {...form.register("shipping_province")}
                            className="bg-[#F2F0EB] border-[#C8C4BC] focus-visible:ring-[#0A0A0A]"
                          />
                          {form.formState.errors.shipping_province && (
                            <p className="text-red-500 text-xs mt-1">{form.formState.errors.shipping_province.message}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="shipping_postal_code">Postal Code</Label>
                          <Input
                            id="shipping_postal_code"
                            {...form.register("shipping_postal_code")}
                            className="bg-[#F2F0EB] border-[#C8C4BC] focus-visible:ring-[#0A0A0A]"
                          />
                          {form.formState.errors.shipping_postal_code && (
                            <p className="text-red-500 text-xs mt-1">{form.formState.errors.shipping_postal_code.message}</p>
                          )}
                        </div>
                      </div>

                      <div className="pt-6 flex justify-end">
                        <Button
                          type="button"
                          onClick={handleNextStep}
                          className="bg-[#0A0A0A] text-[#F2F0EB] rounded-full px-8 py-6 flex items-center gap-2 hover:bg-[#5C1A1A] transition-colors"
                        >
                          Continue to Shipping <ChevronRight size={18} />
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 2: SHIPPING */}
                  {currentStep === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <h2 className="text-2xl font-black text-[#0A0A0A] mb-6 border-b border-[#C8C4BC] pb-4">
                        2. Shipping Method
                      </h2>

                      <div className="space-y-8">
                        <div className="space-y-4">
                          <Label className="text-base text-[#4A4845]">Select Courier</Label>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {couriers.map((courier) => (
                              <div
                                key={courier.id}
                                onClick={() => {
                                  setSelectedCourier(courier.id);
                                  setSelectedService(courier.services[0]);
                                }}
                                className={`cursor-pointer border-2 rounded-2xl p-4 flex flex-col items-center justify-center transition-all ${
                                  selectedCourier === courier.id
                                    ? "border-[#0A0A0A] bg-[#0A0A0A] text-[#F2F0EB]"
                                    : "border-[#C8C4BC] bg-[#F2F0EB] text-[#0A0A0A] hover:border-[#8A8680]"
                                }`}
                              >
                                <span className="font-bold text-lg">{courier.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <Label className="text-base text-[#4A4845]">Select Service</Label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {couriers.find((c) => c.id === selectedCourier)?.services.map((service) => (
                              <div
                                key={service.id}
                                onClick={() => setSelectedService(service)}
                                className={`cursor-pointer border-2 rounded-2xl p-4 flex justify-between items-center transition-all ${
                                  selectedService.id === service.id && selectedCourier === couriers.find((c) => c.services.includes(selectedService))?.id
                                    ? "border-[#5C1A1A] bg-[#F2F0EB]"
                                    : "border-[#C8C4BC] bg-[#F2F0EB] hover:border-[#8A8680]"
                                }`}
                              >
                                <div>
                                  <span className="font-bold block text-[#0A0A0A]">{service.name}</span>
                                  <span className="text-sm text-[#8A8680]">Estimated 2-3 days</span>
                                </div>
                                <span className="mono font-bold text-[#0A0A0A]">
                                  {formatPrice(service.price)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="notes">Order Notes (Optional)</Label>
                          <Textarea
                            id="notes"
                            {...form.register("notes")}
                            className="bg-[#F2F0EB] border-[#C8C4BC] focus-visible:ring-[#0A0A0A]"
                            placeholder="Any special requests or instructions..."
                          />
                        </div>
                      </div>

                      <div className="pt-6 flex justify-between border-t border-[#C8C4BC] mt-8">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handlePrevStep}
                          className="border-[#C8C4BC] text-[#0A0A0A] rounded-full px-8 py-6 hover:bg-[#F2F0EB]"
                        >
                          Back
                        </Button>
                        <Button
                          type="button"
                          onClick={handleNextStep}
                          className="bg-[#0A0A0A] text-[#F2F0EB] rounded-full px-8 py-6 flex items-center gap-2 hover:bg-[#5C1A1A] transition-colors"
                        >
                          Continue to Payment <ChevronRight size={18} />
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 3: REVIEW & PAY */}
                  {currentStep === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <h2 className="text-2xl font-black text-[#0A0A0A] mb-6 border-b border-[#C8C4BC] pb-4">
                        3. Review & Pay
                      </h2>

                      <div className="space-y-8">
                        <div className="bg-[#F2F0EB] border border-[#C8C4BC] rounded-2xl p-6">
                          <h3 className="font-bold text-[#0A0A0A] mb-4">Shipping Information</h3>
                          <div className="text-[#4A4845] text-sm space-y-1">
                            <p className="font-semibold text-[#0A0A0A]">{form.getValues("shipping_name")}</p>
                            <p>{form.getValues("shipping_phone")}</p>
                            <p>{form.getValues("shipping_address")}</p>
                            <p>{`${form.getValues("shipping_city")}, ${form.getValues("shipping_province")} ${form.getValues("shipping_postal_code")}`}</p>
                            <p className="mt-3 pt-3 border-t border-[#C8C4BC]/50">
                              <span className="font-semibold">Method:</span> {
                                couriers.find(c => c.id === selectedCourier)?.name
                              } - {selectedService.name}
                            </p>
                          </div>
                        </div>

                        <div className="bg-[#F2F0EB] border border-[#C8C4BC] rounded-2xl p-6">
                          <h3 className="font-bold text-[#0A0A0A] mb-4 flex items-center justify-between">
                            Payment Method
                            <span className="text-xs bg-[#5C1A1A] text-[#F2F0EB] px-2 py-1 rounded">Simulated</span>
                          </h3>
                          <p className="text-sm text-[#4A4845]">
                            Tes Dulu
                          </p>
                        </div>
                        
                        {checkoutError && (
                          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-sm">
                            {checkoutError}
                          </div>
                        )}
                      </div>

                      <div className="pt-6 flex justify-between border-t border-[#C8C4BC] mt-8">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handlePrevStep}
                          className="border-[#C8C4BC] text-[#0A0A0A] rounded-full px-8 py-6 hover:bg-[#F2F0EB]"
                          disabled={isSubmitting}
                        >
                          Back
                        </Button>
                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="bg-[#5C1A1A] text-[#F2F0EB] rounded-full px-10 py-6 font-bold flex items-center gap-2 hover:bg-[#0A0A0A] transition-colors shadow-xl"
                        >
                          {isSubmitting ? "Processing..." : "Place Order"}
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            </div>
          </div>

          {/* RIGHT COLUMN: Order Summary */}
          <div className="w-full lg:w-1/3">
            <div className="sticky top-24 bg-[#0A0A0A] border border-[#2A2A2A] rounded-3xl p-6 sm:p-8 text-[#F2F0EB]">
              <h2 className="text-xl font-black mb-6 border-b border-[#2A2A2A] pb-4">Order Summary</h2>

              <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex gap-4 items-start">
                    <div className="w-16 h-16 bg-[#1A1A1A] rounded-xl overflow-hidden shrink-0 border border-[#2A2A2A]">
                      {item.product.images?.[0] ? (
                        <img src={`${STORAGE_URL}/${item.product.images[0].image_path}`} alt={item.product.name} className="w-full h-full object-cover opacity-80" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl">👕</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold truncate" title={item.product.name}>
                        {item.product.name}
                      </h4>
                      <div className="text-xs text-[#8A8680] mt-1 flex justify-between">
                        <span>{item.variant.size} • Qty {item.quantity}</span>
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
                  <span>Shipping Cost</span>
                  <span className="mono text-[#F2F0EB]">
                    {currentStep > 1 ? formatPrice(selectedService.price) : "Calculated at next step"}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-end pt-6 border-t border-[#2A2A2A]">
                <span className="font-bold text-[#8A8680]">Total</span>
                <span className="mono text-2xl font-black text-white">
                  {formatPrice(currentStep > 1 ? total : subtotal)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
