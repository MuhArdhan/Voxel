// ============================================================
// VOXEL Frontend — TypeScript Interfaces
// ============================================================

import { z } from "zod";

// ----- User -----
export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  avatar?: string;
  role: "user" | "admin";
  is_blocked: boolean;
  total_orders?: number;
  total_spent?: number;
  created_at: string;
  updated_at: string;
}

// ----- Category -----
export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  is_active: boolean;
  products_count?: number;
  created_at: string;
  updated_at: string;
}

// ----- Product Variant -----
export interface ProductVariant {
  id: number;
  product_id: number;
  size: "XS" | "S" | "M" | "L" | "XL" | "XXL";
  color?: string;
  stock: number;
  additional_price: number;
  created_at: string;
  updated_at: string;
}

// ----- Product Image -----
export interface ProductImage {
  id: number;
  product_id: number;
  image_path: string;
  image_url: string;
  is_primary: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// ----- Product -----
export interface Product {
  id: number;
  category_id: number;
  category: Category;
  name: string;
  slug: string;
  description?: string;
  material?: string;
  price: number;
  discount_price?: number;
  sku: string;
  weight?: number;
  is_limited_drop: boolean;
  is_active: boolean;
  is_featured: boolean;
  variants: ProductVariant[];
  images: ProductImage[];
  primary_image?: ProductImage;
  deleted_at?: string;
  created_at: string;
  updated_at: string;
}

// ----- Pagination -----
export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
  next_page_url: string | null;
  prev_page_url: string | null;
}

// ----- Cart -----
export interface CartItem {
  id: number;
  cart_id: number;
  product_id: number;
  product: Product;
  product_variant_id: number;
  variant: ProductVariant;
  quantity: number;
  subtotal: number;
  created_at: string;
  updated_at: string;
}

export interface Cart {
  cart_id: number;
  items: CartItem[];
  total: number;
  total_items: number;
}

// ----- Order -----
export type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "completed"
  | "cancelled";

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product?: Product;
  product_variant_id: number;
  product_name: string;
  product_sku: string;
  variant_size: string;
  variant_color?: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: number;
  user_id: number;
  user?: User;
  order_number: string;
  status: OrderStatus;
  subtotal: number;
  shipping_cost: number;
  total_price: number;
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_province: string;
  shipping_postal_code: string;
  courier: string;
  courier_service: string;
  tracking_number?: string;
  payment_method?: string;
  payment_token?: string;
  payment_url?: string;
  paid_at?: string;
  notes?: string;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

// ----- Checkout -----
export interface CheckoutPayload {
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_province: string;
  shipping_postal_code: string;
  courier: string;
  courier_service: string;
  shipping_cost: number;
  notes?: string;
}

export const checkoutSchema = z.object({
  shipping_name: z.string().min(3, "Nama lengkap harus diisi (min 3 karakter)"),
  shipping_phone: z.string().min(10, "Nomor HP tidak valid").regex(/^[0-9+]+$/, "Hanya angka yang diperbolehkan"),
  shipping_address: z.string().min(10, "Alamat lengkap harus diisi secara detail"),
  shipping_city: z.string().min(3, "Kota harus diisi"),
  shipping_province: z.string().min(3, "Provinsi harus diisi"),
  shipping_postal_code: z.string().min(4, "Kode pos tidak valid"),
  notes: z.string().optional(),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;

// ----- Product Filters -----
export interface ProductFilters {
  search?: string;
  category?: string;
  min_price?: number;
  max_price?: number;
  size?: string;
  limited?: boolean;
  featured?: boolean;
  sort_by?: "created_at" | "price" | "name";
  sort_dir?: "asc" | "desc";
  per_page?: number;
  page?: number;
}

// ----- Admin -----
export interface DashboardStats {
  total_revenue: number;
  total_orders: number;
  total_users: number;
  total_products: number;
}

export interface RevenueChartPoint {
  date: string;
  revenue: number;
}

export interface AdminDashboard {
  stats: DashboardStats;
  recent_orders: Order[];
  orders_by_status: Record<OrderStatus, number>;
  revenue_chart: RevenueChartPoint[];
}

// ----- API Responses -----
export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
  token_type: string;
}
