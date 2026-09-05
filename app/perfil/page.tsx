import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";
import PerfilCliente from "./PerfilCliente";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function PerfilPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single<Profile>();

  const p: Profile = profile ?? {
    id: user.id,
    nombre: "",
    email: user.email ?? "",
    role: "cliente",
    created_at: user.created_at,
  };

  return (
    <div className="page-wrap">
      <h1>Mi perfil</h1>
      <p className="sub">Tu cuenta en Orient Lion Chile.</p>

      <div className="data-list">
        <div className="row">
          <span className="k">Nombre</span>
          <span className="v">{p.nombre || "—"}</span>
        </div>
        <div className="row">
          <span className="k">Correo</span>
          <span className="v">{p.email}</span>
        </div>
        <div className="row">
          <span className="k">Tipo de cuenta</span>
          <span className="v">
            <span className={"badge" + (p.role === "admin" ? " admin" : "")}>
              {p.role === "admin" ? "Administrador" : "Cliente"}
            </span>
          </span>
        </div>
        <div className="row">
          <span className="k">Miembro desde</span>
          <span className="v">
            {new Date(p.created_at).toLocaleDateString("es-CL")}
          </span>
        </div>
      </div>

      {p.role === "admin" && (
        <p style={{ marginBottom: 28 }}>
          <Link href="/admin" className="btn btn-light btn-sm">
            Ir al panel de administración
          </Link>
        </p>
      )}

      <PerfilCliente initialNombre={p.nombre} />
    </div>
  );
}
