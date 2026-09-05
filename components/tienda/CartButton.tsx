"use client";

import { useCart } from "./CartContext";

export default function CartButton() {
  const { cart, openDrawer } = useCart();
  const count = cart?.totalQuantity ?? 0;

  return (
    <button type="button" className="btn btn-ghost btn-sm" onClick={openDrawer}>
      Carrito{count > 0 ? ` (${count})` : ""}
    </button>
  );
}
