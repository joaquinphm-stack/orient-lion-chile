import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import RepuestosClient from "@/components/repuestos/RepuestosClient";
import type { Repuesto, TextoSitio } from "@/lib/types";

export const dynamic = "force-dynamic";

const TITLE = "Repuestos | Orient Lion Chile";
const DESCRIPTION =
  "Repuestos para toritos eléctricos de carga Orient Lion: sistema eléctrico y propulsión, chasis y dirección, frenos y tracción, carrocería y luces. Filtra por modelo, año y voltaje o cotiza por WhatsApp.";
const IMAGE = "/repuestos-hero/hero-bateria.webp";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/repuestos", images: [IMAGE] },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: [IMAGE] },
};

export default async function RepuestosPage() {
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
    .from("repuestos")
    .select("*")
    .order("orden", { ascending: true });
  if (!isAdmin) query = query.eq("activo", true);

  const [{ data: repData }, { data: txtData }] = await Promise.all([
    query,
    supabase.from("textos_sitio").select("clave, valor"),
  ]);

  const repuestos = (repData ?? []) as Repuesto[];
  const textos = Object.fromEntries(
    ((txtData ?? []) as TextoSitio[]).map((t) => [t.clave, t.valor]),
  );

  return (
    <RepuestosClient repuestos={repuestos} textos={textos} isAdmin={isAdmin} />
  );
}
