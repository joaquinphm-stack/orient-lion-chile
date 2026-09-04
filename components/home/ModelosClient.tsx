"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import {
  createProduct,
  deleteProduct,
  saveProduct,
  setProductFlags,
  type ProductInput,
} from "@/app/actions";
import ProductCard from "@/components/ProductCard";
import { createClient } from "@/lib/supabase/client";
import { PRODUCT_IMAGES_BUCKET } from "@/lib/supabase/config";
import {
  slugify,
  storageImg,
  type Color,
  type Product,
  type ProductTipo,
  type Spec,
} from "@/lib/types";

/** Sube un archivo al bucket de Storage con el JWT del admin y devuelve su URL pública. */
async function uploadImage(folder: string, file: File): Promise<string> {
  const supabase = createClient();
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .upload(path, file, { contentType: file.type || "image/jpeg", upsert: false });
  if (error) throw new Error(error.message);
  return supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(path).data.publicUrl;
}

const COLORES_NUEVOS: Color[] = [
  { nombre: "Azul", hex: "#1F4FD8", imagenes: [] },
  { nombre: "Turquesa", hex: "#12B5B0", imagenes: [] },
  { nombre: "Rojo", hex: "#C23B22", imagenes: [] },
  { nombre: "Negro", hex: "#111111", imagenes: [] },
];

type Props = { products: Product[]; isAdmin: boolean; tipo?: ProductTipo };

export default function ModelosClient({ products, isAdmin, tipo = "torito" }: Props) {
  const esOtro = tipo === "otro";
  const sustantivo = esOtro ? "vehículo" : "torito";
  const [rows, setRows] = useState<Product[]>(products);
  const [msg, setMsg] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [drawer, setDrawer] = useState<
    { mode: "edit"; row: Product } | { mode: "new" } | null
  >(null);

  // En móvil la grilla es un carrusel con scroll-snap; estos puntos indican
  // en qué modelo estás y permiten saltar a otro sin deslizar.
  const pista = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(0);

  useEffect(() => setRows(products), [products]);

  function onScrollPista() {
    const el = pista.current;
    if (!el) return;
    const x = el.getBoundingClientRect().left;
    const dist = [...el.children].map((c) =>
      Math.abs(c.getBoundingClientRect().left - x),
    );
    setVisible(dist.indexOf(Math.min(...dist)));
  }

  function irA(i: number) {
    const el = pista.current;
    const card = el?.children[i] as HTMLElement | undefined;
    if (!el || !card) return;
    el.scrollTo({
      left:
        el.scrollLeft +
        card.getBoundingClientRect().left -
        el.getBoundingClientRect().left,
      behavior: "smooth",
    });
  }

  function flash(m: string) {
    setMsg(m);
    window.clearTimeout((flash as unknown as { t?: number }).t);
    (flash as unknown as { t?: number }).t = window.setTimeout(() => setMsg(""), 2600);
  }

  async function toggleFlag(p: Product, flag: "destacado" | "activo") {
    setBusyId(p.id);
    const next = !p[flag];
    const res = await setProductFlags(p.id, { [flag]: next });
    setBusyId(null);
    if (!res.ok) return flash(res.error);
    setRows((rs) => rs.map((x) => (x.id === p.id ? { ...x, [flag]: next } : x)));
    flash("Guardado");
  }

  return (
    <>
      {isAdmin && (
        <div className="models-admin-head">
          <button
            type="button"
            className="rep-add"
            onClick={() => setDrawer({ mode: "new" })}
          >
            + Agregar {sustantivo}
          </button>
        </div>
      )}

      <div className="models-grid" ref={pista} onScroll={onScrollPista}>
        {rows.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            isAdmin={isAdmin}
            busy={busyId === p.id}
            onEdit={() => setDrawer({ mode: "edit", row: p })}
            onToggleDestacado={() => toggleFlag(p, "destacado")}
            onToggleActivo={() => toggleFlag(p, "activo")}
          />
        ))}
      </div>

      {rows.length > 1 && (
        <div className="models-nav" role="tablist" aria-label="Modelos">
          {rows.map((p, i) => (
            <button
              key={p.id}
              type="button"
              role="tab"
              aria-current={i === visible}
              aria-label={`Ver ${p.nombre}`}
              onClick={() => irA(i)}
            />
          ))}
        </div>
      )}

      {drawer && (
        <Drawer
          key={drawer.mode === "edit" ? drawer.row.id : "new"}
          state={drawer}
          tipo={tipo}
          nextOrden={rows.reduce((max, p) => Math.max(max, p.orden), 0) + 1}
          onClose={() => setDrawer(null)}
          onSaved={(row, mode) => {
            setRows((rs) =>
              mode === "new"
                ? [...rs, row]
                : rs.map((x) => (x.id === row.id ? row : x)),
            );
            setDrawer(null);
            flash("Guardado");
          }}
          onDeleted={(id) => {
            setRows((rs) => rs.filter((x) => x.id !== id));
            setDrawer(null);
            flash(esOtro ? "Vehículo eliminado" : "Torito eliminado");
          }}
          flash={flash}
        />
      )}

      {msg && <div className="rep-toast">{msg}</div>}
    </>
  );
}

/* ---------------- Drawer de ficha ---------------- */
function Drawer({
  state,
  tipo,
  nextOrden,
  onClose,
  onSaved,
  onDeleted,
  flash,
}: {
  state: { mode: "edit"; row: Product } | { mode: "new" };
  tipo: ProductTipo;
  nextOrden: number;
  onClose: () => void;
  onSaved: (row: Product, mode: "edit" | "new") => void;
  onDeleted: (id: string) => void;
  flash: (m: string) => void;
}) {
  const esOtro = tipo === "otro";
  const base: Product =
    state.mode === "edit"
      ? state.row
      : {
          id: "",
          nombre: "",
          tipo,
          capacidad_kg: 0,
          precio: 0,
          precio_nota: "Precio con IVA incluido",
          specs: [],
          imagenes: [],
          colores: COLORES_NUEVOS,
          color_default: 0,
          destacado: false,
          destacado_texto: "Más elegido",
          orden: nextOrden,
          activo: true,
          created_at: "",
          updated_at: "",
        };

  const [f, setF] = useState<Product>(base);
  const [slug, setSlug] = useState(state.mode === "new" ? "" : base.id);
  const [pending, start] = useTransition();
  const [uploading, setUploading] = useState(false);

  const set = <K extends keyof Product>(key: K, v: Product[K]) =>
    setF((p) => ({ ...p, [key]: v }));
  const setSpec = (i: number, key: keyof Spec, v: string) =>
    set(
      "specs",
      f.specs.map((s, idx) => (idx === i ? { ...s, [key]: v } : s)),
    );
  const setColor = (i: number, key: "nombre" | "hex", v: string) =>
    set(
      "colores",
      f.colores.map((c, idx) => (idx === i ? { ...c, [key]: v } : c)),
    );
  const setColorImgs = (i: number, imgs: string[]) =>
    set(
      "colores",
      f.colores.map((c, idx) => (idx === i ? { ...c, imagenes: imgs } : c)),
    );

  const carpeta = (state.mode === "new" ? slug || slugify(f.nombre) : f.id) || "nuevo";

  async function subir(
    e: React.ChangeEvent<HTMLInputElement>,
    destino: (urls: string[]) => void,
    folder: string,
  ) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!files.length) return;
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of files) urls.push(await uploadImage(folder, file));
      destino(urls);
      flash("Foto subida — recuerda guardar la ficha");
    } catch (err) {
      flash("No se pudo subir la foto: " + (err as Error).message);
    } finally {
      setUploading(false);
    }
  }

  function submit() {
    const colores = f.colores
      .filter((c) => c.nombre.trim() || c.hex.trim())
      .map((c) => ({
        nombre: c.nombre.trim(),
        hex: c.hex.trim(),
        imagenes: c.imagenes ?? [],
      }));
    const input: ProductInput = {
      id: state.mode === "new" ? slug || slugify(f.nombre) : f.id,
      nombre: f.nombre.trim(),
      tipo: f.tipo,
      capacidad_kg: f.capacidad_kg,
      precio: f.precio,
      precio_nota: f.precio_nota.trim(),
      specs: f.specs
        .map((s) => ({ label: s.label.trim(), value: s.value.trim() }))
        .filter((s) => s.label || s.value),
      colores,
      color_default: Math.min(Math.max(f.color_default, 0), Math.max(colores.length - 1, 0)),
      imagenes: f.imagenes,
      destacado: f.destacado,
      destacado_texto: f.destacado_texto.trim() || "Más elegido",
      orden: f.orden,
      activo: f.activo,
    };
    if (!input.nombre) return flash("Falta el nombre.");
    if (!input.id) return flash("Falta el identificador.");
    start(async () => {
      const res =
        state.mode === "new" ? await createProduct(input) : await saveProduct(input);
      if (!res.ok) return flash(res.error);
      onSaved({ ...f, ...input, id: input.id }, state.mode);
    });
  }

  function remove() {
    if (state.mode !== "edit") return;
    if (!window.confirm(`¿Eliminar "${f.nombre}"? No se puede deshacer.`)) return;
    start(async () => {
      const res = await deleteProduct(f.id);
      if (!res.ok) return flash(res.error);
      onDeleted(f.id);
    });
  }

  return (
    <div className="rep-drawer-wrap" role="dialog" aria-modal="true">
      <div className="rep-drawer-scrim" onClick={onClose} />
      <div className="rep-drawer">
        <div className="rep-drawer-head">
          <strong>
            {state.mode === "new"
              ? esOtro
                ? "Nuevo vehículo"
                : "Nuevo torito"
              : esOtro
                ? "Editar vehículo"
                : "Editar torito"}
          </strong>
          <button type="button" className="rep-drawer-x" onClick={onClose} aria-label="Cerrar">
            ✕
          </button>
        </div>

        <div className="rep-drawer-body">
          <label>
            Nombre
            <input value={f.nombre} onChange={(e) => set("nombre", e.target.value)} />
          </label>

          {state.mode === "new" && (
            <label>
              Identificador (URL)
              <input
                value={slug}
                placeholder="se genera del nombre"
                onChange={(e) => setSlug(e.target.value)}
              />
            </label>
          )}

          <div className="rep-drawer-row">
            <label>
              {esOtro ? "Autonomía (km)" : "Capacidad (kg)"}
              <input
                type="number"
                min={0}
                value={f.capacidad_kg}
                onChange={(e) => set("capacidad_kg", Number(e.target.value) || 0)}
              />
            </label>
            <label>
              Orden
              <input
                type="number"
                value={f.orden}
                onChange={(e) => set("orden", Number(e.target.value) || 0)}
              />
            </label>
          </div>

          <div className="rep-drawer-row">
            <label>
              Precio (CLP)
              <input
                type="number"
                min={0}
                value={f.precio}
                onChange={(e) => set("precio", Number(e.target.value) || 0)}
              />
            </label>
            <label>
              Nota de precio
              <input
                value={f.precio_nota}
                onChange={(e) => set("precio_nota", e.target.value)}
              />
            </label>
          </div>

          <div className="rep-drawer-specs">
            <span className="rep-drawer-specs-title">Características</span>
            {f.specs.map((s, i) => (
              <div className="rep-spec-row" key={i}>
                <input
                  placeholder="Etiqueta (ej: Largo total)"
                  value={s.label}
                  onChange={(e) => setSpec(i, "label", e.target.value)}
                />
                <input
                  placeholder="Valor (ej: 2,70 m)"
                  value={s.value}
                  onChange={(e) => setSpec(i, "value", e.target.value)}
                />
                <button
                  type="button"
                  className="rep-spec-x"
                  aria-label="Quitar"
                  onClick={() => set("specs", f.specs.filter((_, idx) => idx !== i))}
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => set("specs", [...f.specs, { label: "", value: "" }])}
            >
              + Agregar característica
            </button>
          </div>

          <div className="rep-drawer-specs">
            <span className="rep-drawer-specs-title">Colores y sus fotos</span>
            {f.colores.length > 0 && (
              <label>
                Color por defecto en la web
                <select
                  value={Math.min(f.color_default, f.colores.length - 1)}
                  onChange={(e) => set("color_default", Number(e.target.value))}
                >
                  {f.colores.map((c, i) => (
                    <option key={i} value={i}>
                      {c.nombre || `Color ${i + 1}`}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {f.colores.map((c, i) => (
              <div className="rep-color-block" key={i}>
                <div className="rep-spec-row">
                  <input
                    type="color"
                    className="rep-color-dot"
                    value={/^#[0-9a-fA-F]{6}$/.test(c.hex) ? c.hex : "#000000"}
                    onChange={(e) => setColor(i, "hex", e.target.value)}
                    aria-label="Tono del color"
                  />
                  <input
                    placeholder="Nombre (ej: Azul)"
                    value={c.nombre}
                    onChange={(e) => setColor(i, "nombre", e.target.value)}
                  />
                  <button
                    type="button"
                    className="rep-spec-x"
                    aria-label="Quitar color"
                    onClick={() =>
                      set("colores", f.colores.filter((_, idx) => idx !== i))
                    }
                  >
                    ✕
                  </button>
                </div>

                {(c.imagenes?.length ?? 0) > 0 && (
                  <div className="rep-fotos">
                    {(c.imagenes ?? []).map((url, j) => (
                      <div className="rep-foto" key={url}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={storageImg(url, 160)} alt={`Foto ${j + 1}`} loading="lazy" />
                        {j === 0 ? (
                          <span className="rep-foto-tag">Principal</span>
                        ) : (
                          <button
                            type="button"
                            className="rep-foto-main"
                            title="Hacer principal"
                            onClick={() =>
                              setColorImgs(i, [
                                url,
                                ...(c.imagenes ?? []).filter((u) => u !== url),
                              ])
                            }
                          >
                            ★
                          </button>
                        )}
                        <button
                          type="button"
                          className="rep-foto-x"
                          aria-label="Quitar foto"
                          onClick={() =>
                            setColorImgs(i, (c.imagenes ?? []).filter((u) => u !== url))
                          }
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <label className="rep-foto-upload">
                  {uploading ? "Subiendo…" : `＋ Subir fotos de ${c.nombre || "este color"}`}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={uploading}
                    onChange={(e) =>
                      subir(
                        e,
                        (urls) => setColorImgs(i, [...(c.imagenes ?? []), ...urls]),
                        `${carpeta}/color-${slugify(c.nombre) || i}`,
                      )
                    }
                  />
                </label>
              </div>
            ))}

            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() =>
                set("colores", [...f.colores, { nombre: "", hex: "#1F4FD8", imagenes: [] }])
              }
            >
              + Agregar color
            </button>
          </div>

          <div className="rep-drawer-specs">
            <span className="rep-drawer-specs-title">
              Fotos generales (si un color no tiene fotos propias)
            </span>
            {f.imagenes.length > 0 && (
              <div className="rep-fotos">
                {f.imagenes.map((url, i) => (
                  <div className="rep-foto" key={url}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={storageImg(url, 160)} alt={`Foto ${i + 1}`} loading="lazy" />
                    <button
                      type="button"
                      className="rep-foto-x"
                      aria-label="Quitar foto"
                      onClick={() =>
                        set("imagenes", f.imagenes.filter((u) => u !== url))
                      }
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
            <label className="rep-foto-upload">
              {uploading ? "Subiendo…" : "＋ Subir fotos"}
              <input
                type="file"
                accept="image/*"
                multiple
                disabled={uploading}
                onChange={(e) =>
                  subir(
                    e,
                    (urls) => setF((p) => ({ ...p, imagenes: [...p.imagenes, ...urls] })),
                    carpeta,
                  )
                }
              />
            </label>
          </div>

          <label>
            Texto del sello destacado
            <input
              value={f.destacado_texto}
              onChange={(e) => set("destacado_texto", e.target.value)}
            />
          </label>

          <div className="rep-drawer-row">
            <label className="rep-check">
              <input
                type="checkbox"
                checked={f.destacado}
                onChange={(e) => set("destacado", e.target.checked)}
              />
              Destacado
            </label>
            <label className="rep-check">
              <input
                type="checkbox"
                checked={f.activo}
                onChange={(e) => set("activo", e.target.checked)}
              />
              Visible en la web
            </label>
          </div>
        </div>

        <div className="rep-drawer-foot">
          {state.mode === "edit" && (
            <button
              type="button"
              className="btn btn-ghost btn-danger"
              disabled={pending}
              onClick={remove}
            >
              Eliminar
            </button>
          )}
          <span className="rep-drawer-foot-sp" />
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancelar
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={pending}
            onClick={submit}
          >
            {pending ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}
