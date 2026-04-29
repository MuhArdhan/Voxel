import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { OrderStatus } from "@/types";

// shadcn cn() utility
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ---- Price formatting ----
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// ---- Date formatting ----
export function formatDate(dateString: string, options?: Intl.DateTimeFormatOptions): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long",
    year: "numeric",
  };
  return new Date(dateString).toLocaleDateString("id-ID", options ?? defaultOptions);
}

export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ---- Discount percentage ----
export function discountPercent(original: number, discounted: number): number {
  return Math.round(((original - discounted) / original) * 100);
}

// ---- Order status helpers ----
const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Menunggu Pembayaran",
  paid: "Dibayar",
  processing: "Diproses",
  shipped: "Dikirim",
  completed: "Selesai",
  cancelled: "Dibatalkan",
};

const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "text-yellow-600 bg-yellow-50 border-yellow-200",
  paid: "text-blue-600 bg-blue-50 border-blue-200",
  processing: "text-purple-600 bg-purple-50 border-purple-200",
  shipped: "text-cyan-600 bg-cyan-50 border-cyan-200",
  completed: "text-green-600 bg-green-50 border-green-200",
  cancelled: "text-red-600 bg-red-50 border-red-200",
};

export function getOrderStatusLabel(status: OrderStatus): string {
  return ORDER_STATUS_LABELS[status] ?? status;
}

export function getOrderStatusColor(status: OrderStatus): string {
  return ORDER_STATUS_COLORS[status] ?? "";
}

// ---- Extract validation errors from Axios error ----
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getValidationErrors(error: any): Record<string, string> {
  const errors: Record<string, string> = {};
  if (error?.response?.data?.errors) {
    const raw = error.response.data.errors as Record<string, string[]>;
    for (const [key, messages] of Object.entries(raw)) {
      errors[key] = messages[0];
    }
  }
  return errors;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getErrorMessage(error: any, fallback = "Terjadi kesalahan. Silakan coba lagi."): string {
  return error?.response?.data?.message ?? error?.message ?? fallback;
}

// ---- Stock helpers ----
export function getStockLabel(stock: number): { label: string; color: string } {
  if (stock === 0) return { label: "Habis", color: "text-red-500" };
  if (stock <= 5) return { label: `${stock} tersisa`, color: "text-orange-500" };
  return { label: "Tersedia", color: "text-green-600" };
}

// ---- Truncate text ----
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "…";
}
