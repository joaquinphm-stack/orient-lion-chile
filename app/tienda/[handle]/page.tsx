import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ShopifyProductDetail from "@/components/tienda/ShopifyProductDetail";
import { getTiendaProduct } from "@/lib/shopify/products";

export const revalidate = 120;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const product = await getTiendaProduct(handle).catch(() => null);
  if (!product) return { title: "Producto | Tienda Orient Lion" };
  return {
    title: `${product.title} | Tienda Orient Lion`,
    description: product.descriptionHtml.replace(/<[^>]+>/g, "").slice(0, 160),
  };
}

export default async function TiendaProductPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const product = await getTiendaProduct(handle);
  if (!product) notFound();

  return (
    <section className="tienda-detail">
      <div className="container">
        <Link href="/tienda" className="tienda-back">
          ← Volver a la tienda
        </Link>
        <ShopifyProductDetail product={product} />
      </div>
    </section>
  );
}
