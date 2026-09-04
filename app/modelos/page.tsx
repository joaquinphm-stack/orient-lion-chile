import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import ModelosPageClient from "@/components/modelos/ModelosPageClient";
import type { Product, TextoSitio } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Modelos | Orient Lion Chile",
  description:
    "Catálogo Orient Lion: toritos eléctricos de carga de 500, 800 y 1000 kilos, scooters eléctricos, bicicletas eléctricas y motos 49cc. Elige color, paga contra entrega y recibe con factura.",
};

export default async function ModelosPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    isAdmin = profile?.role === "admin";
  }

  let query = supabase
    .from("products")
    .select("*")
    .order("orden", { ascending: true });
  if (!isAdmin) query = query.eq("activo", true);

  const [{ data: prodData }, { data: txtData }] = await Promise.all([
    query,
    supabase.from("textos_sitio").select("clave, valor"),
  ]);

  const products = (prodData ?? []) as Product[];
  const textos = Object.fromEntries(
    ((txtData ?? []) as TextoSitio[]).map((t) => [t.clave, t.valor]),
  );

  return (
    <ModelosPageClient products={products} textos={textos} isAdmin={isAdmin} />
  );
}
