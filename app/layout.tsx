import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { waLink } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";
import { clampButtonSize, fontStackFor } from "@/lib/buttonFont";

const SITE_URL = "https://orient-lion-chile.vercel.app";
const SITE_TITLE = "Orient Lion Chile | Toritos Eléctricos de Carga";
const SITE_DESCRIPTION =
  "Toritos eléctricos de carga Orient Lion: hasta 1000 kilos, despacho a domicilio, pago contra entrega. Cotiza por WhatsApp.";
const OG_IMAGE =
  "https://jozqjwkutcqeiereobun.supabase.co/storage/v1/object/public/product-images/site/hero-negro.webp";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: "/",
    siteName: "Orient Lion Chile",
    images: [{ url: OG_IMAGE, width: 1200, height: 800 }],
    locale: "es_CL",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE],
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fuente y tamaño de los botones elegidos en /admin (si no hay, usa el default de globals.css).
  const supabase = await createClient();
  const { data: ajustes } = await supabase
    .from("textos_sitio")
    .select("clave, valor")
    .in("clave", ["boton.fuente", "boton.tamano"]);

  const map = Object.fromEntries((ajustes ?? []).map((r) => [r.clave, r.valor]));
  const btnFont = map["boton.fuente"] ? fontStackFor(map["boton.fuente"]) : null;
  const btnSize = map["boton.tamano"]
    ? clampButtonSize(Number(map["boton.tamano"]))
    : null;
  const btnVars =
    btnFont || btnSize
      ? `:root{${btnFont ? `--btn-font:${btnFont};` : ""}${
          btnSize ? `--btn-size:${btnSize}px;` : ""
        }}`
      : null;

  return (
    <html lang="es">
      <head>
        {btnVars && <style>{btnVars}</style>}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="ssj">
        <Header />
        {children}
        <Footer />
        <a
          className="float-wa"
          href={waLink()}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Escribir por WhatsApp"
        >
          <svg width="26" height="26" viewBox="0 0 32 32" fill="#06210F">
            <path d="M16.02 3C9.4 3 4 8.4 4 15.02c0 2.36.68 4.55 1.86 6.4L4 29l7.77-1.8a11.98 11.98 0 0 0 4.25.77C22.6 27.97 28 22.57 28 15.95 28 9.33 22.64 3 16.02 3zm0 21.6c-1.42 0-2.8-.36-4-1.02l-.29-.16-4.6 1.07 1.1-4.48-.19-.3a9.53 9.53 0 0 1-1.5-5.12c0-5.3 4.3-9.6 9.6-9.6 5.3 0 9.6 4.24 9.6 9.55 0 5.3-4.3 10.06-9.72 10.06zm5.24-7.18c-.29-.14-1.7-.84-1.96-.93-.26-.1-.46-.14-.65.14-.19.29-.75.93-.92 1.12-.17.19-.34.21-.63.07-.29-.14-1.22-.45-2.32-1.43-.86-.76-1.44-1.71-1.61-2-.17-.29-.02-.44.13-.58.13-.13.29-.34.43-.5.14-.17.19-.29.29-.48.1-.19.05-.36-.02-.5-.07-.14-.65-1.57-.9-2.15-.24-.57-.48-.5-.65-.5-.17 0-.36-.02-.55-.02-.19 0-.5.07-.76.36-.26.29-1 1-1 2.43 0 1.43 1.03 2.81 1.17 3 .14.19 2.03 3.1 4.92 4.35.69.3 1.22.48 1.64.61.69.22 1.32.19 1.81.11.55-.08 1.7-.7 1.94-1.37.24-.67.24-1.24.17-1.37-.07-.12-.26-.19-.55-.33z" />
          </svg>
        </a>
        <Analytics />
      </body>
    </html>
  );
}
