import { shopifyFetch } from "./client";
import { PRODUCT_BY_HANDLE_QUERY, PRODUCTS_QUERY } from "./queries";
import type { ShopifyProduct } from "./types";

/**
 * Lista todo lo que Shopify ya expone por la Storefront API: cualquier producto
 * ACTIVE y publicado al canal "Tienda online" aparece aquí automáticamente
 * (hoy solo los 3 toritos; los repuestos quedan fuera mientras estén en DRAFT).
 */
export async function getTiendaProducts(): Promise<ShopifyProduct[]> {
  const data = await shopifyFetch<{ products: { nodes: ShopifyProduct[] } }>(
    PRODUCTS_QUERY,
    {},
    { revalidate: 120 },
  );
  return data.products.nodes;
}

export async function getTiendaProduct(handle: string): Promise<ShopifyProduct | null> {
  const data = await shopifyFetch<{ product: ShopifyProduct | null }>(
    PRODUCT_BY_HANDLE_QUERY,
    { handle },
    { revalidate: 120 },
  );
  return data.product;
}
