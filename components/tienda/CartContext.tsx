"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { ShopifyCart } from "@/lib/shopify/types";

type CartContextValue = {
  cart: ShopifyCart | null;
  setCart: (cart: ShopifyCart | null) => void;
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({
  initialCart,
  children,
}: {
  initialCart: ShopifyCart | null;
  children: ReactNode;
}) {
  const [cart, setCart] = useState<ShopifyCart | null>(initialCart);
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <CartContext.Provider
      value={{
        cart,
        setCart,
        drawerOpen,
        openDrawer: () => setDrawerOpen(true),
        closeDrawer: () => setDrawerOpen(false),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de <CartProvider>");
  return ctx;
}
