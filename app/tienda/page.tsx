import type { Metadata } from "next";
import ShopifyProductCard from "@/components/tienda/ShopifyProductCard";
import { getTiendaProducts } from "@/lib/shopify/products";

const TITLE = "Tienda | Orient Lion Chile";
const DESCRIPTION =
  "Compra online los toritos eléctricos de carga Orient Lion: elige color, agrégalo al carrito y paga con checkout seguro.";
const IMAGE =
  "https://jozqjwkutcqeiereobun.supabase.co/storage/v1/object/public/product-images/site/hero-negro.webp";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/tienda", images: [{ url: IMAGE }] },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: [IMAGE] },
};

export const revalidate = 120;

export default async function TiendaPage() {
  let products: Awaited<ReturnType<typeof getTiendaProducts>> = [];
  let error: string | null = null;
  try {
    products = await getTiendaProducts();
  } catch (err) {
    error =
      (err as Error).message ||
      "No se pudo conectar con Shopify. Revisa el token de la Storefront API.";
  }

  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <span className="kicker">
            <span className="dot" />
            Tienda online
          </span>
          <h2>Compra tu torito eléctrico</h2>
          <p>Elige color, agrégalo al carrito y paga online. Despacho a todo Chile.</p>
        </div>

        {error && <p className="alert alert-err">{error}</p>}

        {!error && products.length === 0 && (
          <div className="rep-empty">
            <p>Todavía no hay productos publicados en la tienda.</p>
          </div>
        )}

        {products.length > 0 && (
          <div className="models-grid">
            {products.map((p) => (
              <ShopifyProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
