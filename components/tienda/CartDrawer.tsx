"use client";

import { useTransition } from "react";
import { formatCLP } from "@/lib/types";
import { updateCartLine } from "@/app/tienda/actions";
import { useCart } from "./CartContext";

export default function CartDrawer() {
  const { cart, drawerOpen, closeDrawer, setCart } = useCart();
  const [pending, startTransition] = useTransition();

  if (!drawerOpen) return null;

  const lines = cart?.lines.nodes ?? [];

  function changeQty(lineId: string, qty: number) {
    startTransition(async () => {
      const res = await updateCartLine(lineId, qty);
      if (res.ok) setCart(res.cart);
    });
  }

  return (
    <div className="rep-drawer-wrap" role="dialog" aria-modal="true">
      <div className="rep-drawer-scrim" onClick={closeDrawer} />
      <div className="rep-drawer">
        <div className="rep-drawer-head">
          <strong>Tu carrito</strong>
          <button type="button" className="rep-drawer-x" onClick={closeDrawer} aria-label="Cerrar">
            ✕
          </button>
        </div>

        <div className="rep-drawer-body">
          {lines.length === 0 && <p className="tienda-cart-empty">Tu carrito está vacío.</p>}

          {lines.map((line) => (
            <div key={line.id} className="tienda-cart-line">
              {line.merchandise.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={line.merchandise.image.url} alt={line.merchandise.image.altText ?? ""} />
              ) : (
                <div className="tienda-cart-line-noimg" />
              )}
              <div className="tienda-cart-line-info">
                <strong>{line.merchandise.product.title}</strong>
                <span>{line.merchandise.selectedOptions.map((o) => o.value).join(" · ")}</span>
                <span>{formatCLP(Number(line.merchandise.price.amount))}</span>
              </div>
              <div className="tienda-cart-line-qty">
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => changeQty(line.id, line.quantity - 1)}
                  aria-label="Quitar una unidad"
                >
                  −
                </button>
                <span>{line.quantity}</span>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => changeQty(line.id, line.quantity + 1)}
                  aria-label="Agregar una unidad"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="rep-drawer-foot tienda-cart-foot">
          {cart && lines.length > 0 && (
            <div className="tienda-cart-total">
              <span>Total</span>
              <span>{formatCLP(Number(cart.cost.totalAmount.amount))}</span>
            </div>
          )}
          <a
            className={"btn btn-primary tienda-cart-checkout" + (!cart || lines.length === 0 ? " is-disabled" : "")}
            href={cart?.checkoutUrl ?? "#"}
          >
            Ir a pagar
          </a>
        </div>
      </div>
    </div>
  );
}
