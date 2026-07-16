"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import { CartDrawer } from "@/components/cart/cart-drawer";

export type CartItem = {
  productId: string;
  name: string;
  description: string;
  price_cents: number;
  icon: string;
};

type CartContextValue = {
  items: CartItem[];
  cartCount: number;
  totalCents: number;
  isOpen: boolean;
  checkoutVersion: number;
  openCart: () => void;
  closeCart: () => void;
  setCartOpen: (open: boolean) => void;
  addItem: (item: CartItem) => { ok: true } | { ok: false; reason: string };
  removeItem: (productId: string) => void;
  clearCart: () => void;
  notifyCheckoutComplete: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setCartOpen] = useState(false);
  const [checkoutVersion, setCheckoutVersion] = useState(0);

  const openCart = useCallback(() => setCartOpen(true), []);
  const closeCart = useCallback(() => setCartOpen(false), []);

  const notifyCheckoutComplete = useCallback(() => {
    setCheckoutVersion((current) => current + 1);
  }, []);

  const addItem = useCallback((item: CartItem) => {
    let result: { ok: true } | { ok: false; reason: string } = { ok: true };

    setItems((current) => {
      if (current.some((existing) => existing.productId === item.productId)) {
        result = { ok: false, reason: "That item is already in your cart." };
        return current;
      }
      return [...current, item];
    });

    return result;
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((current) =>
      current.filter((item) => item.productId !== productId),
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const value = useMemo(
    () => ({
      items,
      cartCount: items.length,
      totalCents: items.reduce((sum, item) => sum + item.price_cents, 0),
      isOpen,
      checkoutVersion,
      openCart,
      closeCart,
      setCartOpen,
      addItem,
      removeItem,
      clearCart,
      notifyCheckoutComplete,
    }),
    [
      items,
      isOpen,
      checkoutVersion,
      openCart,
      closeCart,
      addItem,
      removeItem,
      clearCart,
      notifyCheckoutComplete,
    ],
  );

  return (
    <CartContext.Provider value={value}>
      {children}
      <CartDrawer />
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
