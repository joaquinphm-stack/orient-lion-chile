import type { Spec } from "@/lib/types";
import type { ShopifyProduct } from "./types";

/** El metafield `custom.specs` guarda una línea "Etiqueta: Valor" por característica. */
export function parseSpecs(product: ShopifyProduct): Spec[] {
  const raw = product.specsMetafield?.value ?? "";
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const idx = line.indexOf(":");
      if (idx === -1) return { label: line, value: "" };
      return { label: line.slice(0, idx).trim(), value: line.slice(idx + 1).trim() };
    });
}

export function parseCapacidad(product: ShopifyProduct): number | null {
  const raw = product.capacidadMetafield?.value;
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

export function findColorOption(product: ShopifyProduct) {
  return product.options.find((o) => o.name.toLowerCase() === "color") ?? null;
}
