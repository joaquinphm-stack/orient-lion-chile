"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type {
  Color,
  ProductCategoria,
  RepuestoCategoria,
  Spec,
} from "@/lib/types";

type ActionResult = { ok: true } | { ok: false; error: string };

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, isAdmin: false };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  return { supabase, user, isAdmin: profile?.role === "admin" };
}

export type ProductInput = {
  id: string;
  nombre: string;
  /** Opcionales: si se omiten, la fila conserva sus valores (default `torito` / ""). */
  categoria?: ProductCategoria;
  subcategoria?: string;
  capacidad_kg: number;
  precio: number;
  precio_nota: string;
  specs: Spec[];
  colores: Color[];
  color_default: number;
  imagenes: string[];
  destacado: boolean;
  destacado_texto: string;
  orden: number;
  activo: boolean;
};

export async function saveProduct(input: ProductInput): Promise<ActionResult> {
  const { supabase, isAdmin } = await requireAdmin();
  if (!isAdmin) return { ok: false, error: "No autorizado." };

  const { id, ...fields } = input;
  const { error } = await supabase
    .from("products")
    .update(fields)
    .eq("id", id);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/");
  revalidatePath("/admin");
  return { ok: true };
}

export async function createProduct(input: ProductInput): Promise<ActionResult> {
  const { supabase, isAdmin } = await requireAdmin();
  if (!isAdmin) return { ok: false, error: "No autorizado." };

  const slug = input.id.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-");
  if (!slug) return { ok: false, error: "El identificador no es válido." };

  const { error } = await supabase.from("products").insert({ ...input, id: slug });
  if (error) {
    return {
      ok: false,
      error: error.code === "23505" ? "Ya existe un producto con ese identificador." : error.message,
    };
  }

  revalidatePath("/");
  revalidatePath("/admin");
  return { ok: true };
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  const { supabase, isAdmin } = await requireAdmin();
  if (!isAdmin) return { ok: false, error: "No autorizado." };

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/");
  revalidatePath("/admin");
  return { ok: true };
}

/** Cambia solo los flags rápidos de un torito (★ destacado / 👁 visible). */
export async function setProductFlags(
  id: string,
  flags: { destacado?: boolean; activo?: boolean },
): Promise<ActionResult> {
  const { supabase, isAdmin } = await requireAdmin();
  if (!isAdmin) return { ok: false, error: "No autorizado." };

  const { error } = await supabase.from("products").update(flags).eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/");
  revalidatePath("/admin");
  return { ok: true };
}

export async function updateProfileName(nombre: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "No autorizado." };

  const { error } = await supabase
    .from("profiles")
    .update({ nombre: nombre.trim() })
    .eq("id", user.id);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/perfil");
  revalidatePath("/");
  return { ok: true };
}

export type RepuestoInput = {
  id: string;
  nombre: string;
  categoria: RepuestoCategoria;
  subcategoria: string;
  descripcion: string;
  compatibilidad: string;
  specs: Spec[];
  precio: number | null;
  precio_nota: string;
  destacado: boolean;
  voltaje: string[];
  modelos_compatibles: string[];
  anio_desde: number | null;
  anio_hasta: number | null;
  imagenes: string[];
  orden: number;
  activo: boolean;
};

export async function saveRepuesto(input: RepuestoInput): Promise<ActionResult> {
  const { supabase, isAdmin } = await requireAdmin();
  if (!isAdmin) return { ok: false, error: "No autorizado." };

  const { id, ...fields } = input;
  const { error } = await supabase.from("repuestos").update(fields).eq("id", id);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/repuestos");
  revalidatePath("/admin");
  revalidatePath("/");
  return { ok: true };
}

export async function createRepuesto(input: RepuestoInput): Promise<ActionResult> {
  const { supabase, isAdmin } = await requireAdmin();
  if (!isAdmin) return { ok: false, error: "No autorizado." };

  const slug = input.id.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-");
  if (!slug) return { ok: false, error: "El identificador no es válido." };

  const { error } = await supabase
    .from("repuestos")
    .insert({ ...input, id: slug });
  if (error) {
    return {
      ok: false,
      error:
        error.code === "23505"
          ? "Ya existe un repuesto con ese identificador."
          : error.message,
    };
  }

  revalidatePath("/repuestos");
  revalidatePath("/admin");
  revalidatePath("/");
  return { ok: true };
}

export async function deleteRepuesto(id: string): Promise<ActionResult> {
  const { supabase, isAdmin } = await requireAdmin();
  if (!isAdmin) return { ok: false, error: "No autorizado." };

  const { error } = await supabase.from("repuestos").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/repuestos");
  revalidatePath("/admin");
  revalidatePath("/");
  return { ok: true };
}

/** Cambia solo los flags rápidos de una ficha (★ destacado / 👁 visible). */
export async function setRepuestoFlags(
  id: string,
  flags: { destacado?: boolean; activo?: boolean },
): Promise<ActionResult> {
  const { supabase, isAdmin } = await requireAdmin();
  if (!isAdmin) return { ok: false, error: "No autorizado." };

  const { error } = await supabase.from("repuestos").update(flags).eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/repuestos");
  revalidatePath("/");
  return { ok: true };
}

/** Guarda un texto editable del sitio (hero, categorías, secciones de /repuestos). */
export async function saveTextoSitio(
  clave: string,
  valor: string,
): Promise<ActionResult> {
  const { supabase, isAdmin } = await requireAdmin();
  if (!isAdmin) return { ok: false, error: "No autorizado." };

  const { error } = await supabase
    .from("textos_sitio")
    .upsert({ clave, valor }, { onConflict: "clave" });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/repuestos");
  return { ok: true };
}

/** Fuente y tamaño (px, escritorio) de todos los botones del sitio. */
export async function saveButtonAppearance(
  fuente: string,
  tamano: number,
): Promise<ActionResult> {
  const { supabase, isAdmin } = await requireAdmin();
  if (!isAdmin) return { ok: false, error: "No autorizado." };

  const { error } = await supabase.from("textos_sitio").upsert(
    [
      { clave: "boton.fuente", valor: fuente },
      { clave: "boton.tamano", valor: String(tamano) },
    ],
    { onConflict: "clave" },
  );
  if (error) return { ok: false, error: error.message };

  // Las variables se inyectan desde el layout, así que hay que revalidarlo todo.
  revalidatePath("/", "layout");
  return { ok: true };
}
