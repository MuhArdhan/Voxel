"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";
import type { Cart, CartItem } from "@/types";
import { useAuth } from "./AuthContext";

interface CartContextType {
  cart: Cart | null;
  isLoading: boolean;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  fetchCart: () => Promise<void>;
  addItem: (productId: number, variantId: number, quantity: number) => Promise<boolean>;
  updateItem: (cartItemId: number, quantity: number) => Promise<boolean>;
  removeItem: (cartItemId: number) => Promise<boolean>;
  clearCart: () => Promise<boolean>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { user } = useAuth(); // Re-fetch cart when user login state changes

  const fetchCart = async () => {
    try {
      setIsLoading(true);
      const data = await apiGet<Cart>("/cart");
      setCart(data);
    } catch (error) {
      console.error("Failed to fetch cart:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const addItem = async (productId: number, variantId: number, quantity: number) => {
    try {
      const data = await apiPost<Cart & { message: string }>("/cart/items", {
        product_id: productId,
        product_variant_id: variantId,
        quantity,
      });
      setCart({
        cart_id: data.cart_id,
        items: data.items,
        total: data.total,
        total_items: data.total_items,
      });
      toast.success(data.message || "Added to cart");
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add item to cart");
      return false;
    }
  };

  const updateItem = async (cartItemId: number, quantity: number) => {
    try {
      const data = await apiPut<Cart & { message: string }>(`/cart/items/${cartItemId}`, {
        quantity,
      });
      setCart({
        cart_id: data.cart_id || cart?.cart_id || 0,
        items: data.items,
        total: data.total,
        total_items: data.total_items,
      });
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update quantity");
      return false;
    }
  };

  const removeItem = async (cartItemId: number) => {
    try {
      const data = await apiDelete<Cart & { message: string }>(`/cart/items/${cartItemId}`);
      setCart({
        cart_id: data.cart_id || cart?.cart_id || 0,
        items: data.items,
        total: data.total,
        total_items: data.total_items,
      });
      toast.success(data.message || "Item removed");
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to remove item");
      return false;
    }
  };

  const clearCart = async () => {
    try {
      await apiDelete("/cart");
      setCart(null);
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to clear cart");
      return false;
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        isCartOpen,
        setIsCartOpen,
        fetchCart,
        addItem,
        updateItem,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
