import type { MetadataRoute } from "next";
import { getTiendaProducts } from "@/lib/shopify/products";

const BASE_URL = "https://orient-lion-chile.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: now, priority: 1 },
    { url: `${BASE_URL}/modelos`, lastModified: now, priority: 0.9 },
    { url: `${BASE_URL}/repuestos`, lastModified: now, priority: 0.8 },
    { url: `${BASE_URL}/tienda`, lastModified: now, priority: 0.8 },
  ];

  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const products = await getTiendaProducts();
    productRoutes = products.map((p) => ({
      url: `${BASE_URL}/tienda/${p.handle}`,
      lastModified: now,
      priority: 0.6,
    }));
  } catch {
    // Shopify no disponible al generar el sitemap: se omiten las fichas de
    // producto, pero las rutas estáticas igual se publican.
  }

  return [...staticRoutes, ...productRoutes];
}
