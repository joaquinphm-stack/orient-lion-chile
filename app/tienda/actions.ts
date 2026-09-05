"use server";

import { cookies } from "next/headers";
import { shopifyFetch } from "@/lib/shopify/client";
import {
  CART_CREATE_MUTATION,
  CART_LINES_ADD_MUTATION,
  CART_LINES_REMOVE_MUTATION,
  CART_LINES_UPDATE_MUTATION,
  CART_QUERY,
} from "@/lib/shopify/queries";
import type { ShopifyCart } from "@/lib/shopify/types";

const CART_COOKIE = "ol_cart_id";

type CartResult = { ok: true; cart: ShopifyCart | null } | { ok: false; error: string };

async function getCartId(): Promise<string | null> {
  const store = await cookies();
  return store.get(CART_COOKIE)?.value ?? null;
}

async function setCartId(id: string) {
  const store = await cookies();
  store.set(CART_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function getCart(): Promise<ShopifyCart | null> {
  const id = await getCartId();
  if (!id) return null;
  try {
    const data = await shopifyFetch<{ cart: ShopifyCart | null }>(
      CART_QUERY,
      { id },
      { cache: "no-store" },
    );
    return data.cart;
  } catch {
    return null;
  }
}

export async function addToCart(variantId: string, quantity: number = 1): Promise<CartResult> {
  try {
    const cartId = await getCartId();

    if (!cartId) {
      const data = await shopifyFetch<{
        cartCreate: { cart: ShopifyCart | null; userErrors: { message: string }[] };
      }>(
        CART_CREATE_MUTATION,
        { lines: [{ merchandiseId: variantId, quantity }] },
        { cache: "no-store" },
      );
      const { cart, userErrors } = data.cartCreate;
      if (userErrors.length || !cart) {
        return { ok: false, error: userErrors[0]?.message ?? "No se pudo crear el carrito." };
      }
      await setCartId(cart.id);
      return { ok: true, cart };
    }

    const data = await shopifyFetch<{
      cartLinesAdd: { cart: ShopifyCart | null; userErrors: { message: string }[] };
    }>(
      CART_LINES_ADD_MUTATION,
      { cartId, lines: [{ merchandiseId: variantId, quantity }] },
      { cache: "no-store" },
    );
    const { cart, userErrors } = data.cartLinesAdd;
    if (userErrors.length || !cart) {
      return { ok: false, error: userErrors[0]?.message ?? "No se pudo agregar al carrito." };
    }
    return { ok: true, cart };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

export async function updateCartLine(lineId: string, quantity: number): Promise<CartResult> {
  try {
    const cartId = await getCartId();
    if (!cartId) return { ok: false, error: "No hay un carrito activo." };

    if (quantity <= 0) {
      const data = await shopifyFetch<{
        cartLinesRemove: { cart: ShopifyCart | null; userErrors: { message: string }[] };
      }>(CART_LINES_REMOVE_MUTATION, { cartId, lineIds: [lineId] }, { cache: "no-store" });
      const { cart, userErrors } = data.cartLinesRemove;
      if (userErrors.length) return { ok: false, error: userErrors[0].message };
      return { ok: true, cart };
    }

    const data = await shopifyFetch<{
      cartLinesUpdate: { cart: ShopifyCart | null; userErrors: { message: string }[] };
    }>(
      CART_LINES_UPDATE_MUTATION,
      { cartId, lines: [{ id: lineId, quantity }] },
      { cache: "no-store" },
    );
    const { cart, userErrors } = data.cartLinesUpdate;
    if (userErrors.length || !cart) {
      return { ok: false, error: userErrors[0]?.message ?? "No se pudo actualizar el carrito." };
    }
    return { ok: true, cart };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}
