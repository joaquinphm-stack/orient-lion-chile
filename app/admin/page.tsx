import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/types";
import AdminPanel from "./AdminPanel";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/");

  const [{ data: productData }, { data: ajustesData }] = await Promise.all([
    supabase.from("products").select("*").order("orden", { ascending: true }),
    supabase
      .from("textos_sitio")
      .select("clave, valor")
      .in("clave", ["boton.fuente", "boton.tamano"]),
  ]);

  const products = (productData ?? []) as Product[];
  const ajustes = Object.fromEntries(
    ((ajustesData ?? []) as { clave: string; valor: string }[]).map((r) => [
      r.clave,
      r.valor,
    ]),
  );

  return (
    <div className="page-wrap">
      <h1>Panel de administración</h1>
      <p className="sub">
        Edita precios, características y fotos de los toritos, o agrega uno nuevo.
        Los repuestos se editan directamente en{" "}
        <Link href="/repuestos">la página de Repuestos</Link>.
      </p>
      <AdminPanel
        initialProducts={products}
        initialButtonFont={ajustes["boton.fuente"] ?? null}
        initialButtonSize={ajustes["boton.tamano"] ?? null}
      />
    </div>
  );
}
