"use client";

import {
  useEffect,
  useMemo,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import {
  PRODUCT_CATEGORIAS,
  slugify,
  storageImg,
  subAnchor,
  waLink,
  type Color,
  type Product,
  type ProductCategoria,
  type Spec,
} from "@/lib/types";
import ProductCard from "@/components/ProductCard";
import ModelosHeroShowcase from "@/components/modelos/ModelosHeroShowcase";
import WaGlyph from "@/components/WaGlyph";
import { createClient } from "@/lib/supabase/client";
import { PRODUCT_IMAGES_BUCKET } from "@/lib/supabase/config";
import {
  createProduct,
  deleteProduct,
  saveProduct,
  setProductFlags,
  saveTextoSitio,
  type ProductInput,
} from "@/app/actions";

const WA_GENERAL =
  "Hola, quiero cotizar un vehículo del catálogo Orient Lion";

const norm = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");

/** Sube un archivo al bucket de Storage con el JWT del admin y devuelve su URL pública. */
async function uploadImage(folder: string, file: File): Promise<string> {
  const supabase = createClient();
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .upload(path, file, { contentType: file.type || "image/jpeg", upsert: false });
  if (error) throw new Error(error.message);
  return supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(path).data
    .publicUrl;
}

const COLORES_NUEVOS: Color[] = [
  { nombre: "Azul", hex: "#1F4FD8", imagenes: [] },
  { nombre: "Turquesa", hex: "#12B5B0", imagenes: [] },
  { nombre: "Rojo", hex: "#C23B22", imagenes: [] },
  { nombre: "Negro", hex: "#111111", imagenes: [] },
];

type Props = {
  products: Product[];
  textos: Record<string, string>;
  isAdmin: boolean;
};

export default function ModelosPageClient({ products, textos, isAdmin }: Props) {
  const [rows, setRows] = useState<Product[]>(products);
  const [txt, setTxt] = useState<Record<string, string>>(textos);
  const [msg, setMsg] = useState("");

  const [q, setQ] = useState("");
  const [cat, setCat] = useState<"" | ProductCategoria>("");

  const [drawer, setDrawer] = useState<
    | { mode: "edit"; row: Product }
    | { mode: "new"; categoria: ProductCategoria; subcategoria: string }
    | null
  >(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => setRows(products), [products]);
  useEffect(() => setTxt(textos), [textos]);

  function flash(m: string) {
    setMsg(m);
    window.clearTimeout((flash as unknown as { t?: number }).t);
    (flash as unknown as { t?: number }).t = window.setTimeout(
      () => setMsg(""),
      2600,
    );
  }

  useEffect(() => {
    const h = window.location.hash.slice(1);
    if (h) document.getElementById(h)?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const filtroActivo = !!(q.trim() || cat);

  function matches(p: Product) {
    if (cat && p.categoria !== cat) return false;
    if (q.trim()) {
      const hay = norm(
        [p.nombre, p.subcategoria, ...p.specs.map((s) => `${s.label} ${s.value}`)].join(
          " ",
        ),
      );
      if (!norm(q).split(/\s+/).every((w) => hay.includes(w))) return false;
    }
    return true;
  }

  const visibles = rows.filter((p) => isAdmin || p.activo);
  const filtradas = visibles.filter(matches);
  const destacados = visibles.filter((p) => p.destacado);

  const grupos = PRODUCT_CATEGORIAS.map((c) => {
    const items = filtradas.filter((p) => p.categoria === c.id);
    const orden = c.subcategorias;
    const subs = [...new Set(items.map((p) => p.subcategoria || "Otros"))].sort(
      (a, b) => {
        const ia = orden.indexOf(a);
        const ib = orden.indexOf(b);
        if (ia !== -1 || ib !== -1)
          return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
        return a.localeCompare(b, "es");
      },
    );
    return { cat: c, items, subs };
  });

  const nextOrden = useMemo(
    () => rows.reduce((max, p) => Math.max(max, p.orden), 0) + 1,
    [rows],
  );

  async function toggleFlag(p: Product, flag: "destacado" | "activo") {
    setBusyId(p.id);
    const next = !p[flag];
    const res = await setProductFlags(p.id, { [flag]: next });
    setBusyId(null);
    if (!res.ok) return flash(res.error);
    setRows((rs) => rs.map((x) => (x.id === p.id ? { ...x, [flag]: next } : x)));
    flash("Guardado");
  }

  function resetFiltros() {
    setQ("");
    setCat("");
  }

  return (
    <div className="rep">
      {/* ---------------- HERO ---------------- */}
      <section className="rep-hero">
        <span aria-hidden="true" className="rep-hero-glow" />
        <div className="container rep-hero-in">
          <div className="rep-hero-copy">
            <div className="rep-eyebrow">
              <span className="dot" />
              Catálogo de vehículos · Chile
            </div>
            <h1 className="rep-hero-h1">
              Toritos, scooters, bicicletas y{" "}
              <span className="faint">motos 49cc</span>
            </h1>
            <p className="rep-hero-lead">
              Todo el catálogo Orient Lion en un solo lugar. Eliges el color, lo
              despachamos a tu domicilio y pagas al recibir, con factura
              incluida.
            </p>
            <div className="rep-hero-ctas">
              <a className="btn btn-ghost" href="#catalogo">
                Ver todo el catálogo
              </a>
              <a
                className="btn btn-primary"
                href={waLink(WA_GENERAL)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <WaGlyph />
                <span>Cotizar por WhatsApp</span>
              </a>
            </div>
            <div className="hero-stats">
              <div>
                <span className="num">4</span>
                <span className="label">Familias de vehículos</span>
              </div>
              <div>
                <span className="num">24h</span>
                <span className="label">Despacho a domicilio</span>
              </div>
              <div>
                <span className="num">$0</span>
                <span className="label">Se paga al recibir, no antes</span>
              </div>
            </div>
          </div>

          <div className="rep-hero-media">
            <ModelosHeroShowcase />
          </div>
        </div>
      </section>

      {/* ------------- BUSCADOR ------------- */}
      <div className="container rep-buscador" id="buscador">
        <div className="rep-searchbar mod-searchbar">
          <input
            type="search"
            className="rep-q"
            placeholder="Buscar modelo: torito, scooter, cargo, 49cc…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Buscar modelo"
          />
          <div className="rep-facets">
            <select
              value={cat}
              onChange={(e) => setCat(e.target.value as "" | ProductCategoria)}
              aria-label="Categoría"
            >
              <option value="">Todas las categorías</option>
              {PRODUCT_CATEGORIAS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>
          {filtroActivo && (
            <button type="button" className="rep-clear" onClick={resetFiltros}>
              Limpiar ({filtradas.length})
            </button>
          )}
        </div>
      </div>

      {/* ------------- CATEGORÍAS MADRE ------------- */}
      {!filtroActivo && (
        <section className="container rep-cats">
          {PRODUCT_CATEGORIAS.map((c) => (
            <a className="rep-cat-card" href={`#cat-${c.id}`} key={c.id}>
              <CatIcon id={c.id} />
              <Editable
                as="h3"
                k={`modelos.cat.${c.id}.titulo`}
                fallback={c.nombre}
                txt={txt}
                setTxt={setTxt}
                isAdmin={isAdmin}
                flash={flash}
              />
              <Editable
                as="p"
                k={`modelos.cat.${c.id}.desc`}
                fallback={c.detalle}
                txt={txt}
                setTxt={setTxt}
                isAdmin={isAdmin}
                flash={flash}
              />
            </a>
          ))}
        </section>
      )}

      {/* ------------- LOS MÁS ELEGIDOS ------------- */}
      {!filtroActivo && destacados.length > 0 && (
        <section className="rep-section rep-section-alt">
          <div className="container">
            <Editable
              as="h2"
              k="modelos.destacados.titulo"
              fallback="Los más elegidos"
              txt={txt}
              setTxt={setTxt}
              isAdmin={isAdmin}
              flash={flash}
            />
            <Editable
              as="p"
              className="rep-section-lead"
              k="modelos.destacados.bajada"
              fallback="Los modelos que más nos piden en cada familia."
              txt={txt}
              setTxt={setTxt}
              isAdmin={isAdmin}
              flash={flash}
            />
            <div className="rep-grid">
              {destacados.map((p) => (
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
          </div>
        </section>
      )}

      {/* ------------- CATÁLOGO COMPLETO ------------- */}
      <section className="rep-section" id="catalogo">
        <div className="container">
          {filtroActivo && (
            <div className="rep-results-head">
              <h2>
                {filtradas.length} resultado{filtradas.length === 1 ? "" : "s"}
              </h2>
              <button type="button" className="rep-clear" onClick={resetFiltros}>
                Limpiar filtros
              </button>
            </div>
          )}

          {filtradas.length === 0 ? (
            <div className="rep-empty">
              <p>
                No encontramos modelos con esos filtros. Escríbenos por WhatsApp y
                te ayudamos a elegir.
              </p>
              <a
                className="btn btn-primary"
                href={waLink(WA_GENERAL)}
                target="_blank"
                rel="noopener noreferrer"
              >
                Escribir por WhatsApp
              </a>
            </div>
          ) : (
            grupos.map(({ cat: c, items, subs }) =>
              items.length === 0 && !isAdmin ? null : (
                <div className="rep-cat-block" id={`cat-${c.id}`} key={c.id}>
                  <div className="rep-cat-block-head">
                    <h2>{txt[`modelos.cat.${c.id}.titulo`] || c.nombre}</h2>
                    {isAdmin && (
                      <button
                        type="button"
                        className="rep-add"
                        onClick={() =>
                          setDrawer({
                            mode: "new",
                            categoria: c.id,
                            subcategoria: c.subcategorias[0] ?? "",
                          })
                        }
                      >
                        + Agregar modelo
                      </button>
                    )}
                  </div>

                  {subs.map((sub) => (
                    <div
                      className="rep-subcat"
                      id={subAnchor(c.id, sub)}
                      key={sub}
                    >
                      <h3 className="rep-subcat-head">{sub}</h3>
                      <div className="rep-grid">
                        {items
                          .filter((p) => (p.subcategoria || "Otros") === sub)
                          .map((p) => (
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
                    </div>
                  ))}
                </div>
              ),
            )
          )}
        </div>
      </section>

      {drawer && (
        <Drawer
          key={drawer.mode === "edit" ? drawer.row.id : `new-${drawer.categoria}`}
          state={drawer}
          nextOrden={nextOrden}
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
            flash("Modelo eliminado");
          }}
          flash={flash}
        />
      )}

      {msg && <div className="rep-toast">{msg}</div>}
    </div>
  );
}

/* ---------------- Texto editable ---------------- */
function Editable({
  as,
  k,
  fallback = "",
  className,
  txt,
  setTxt,
  isAdmin,
  flash,
}: {
  as: "h1" | "h2" | "h3" | "p";
  k: string;
  fallback?: string;
  className?: string;
  txt: Record<string, string>;
  setTxt: (fn: (t: Record<string, string>) => Record<string, string>) => void;
  isAdmin: boolean;
  flash: (m: string) => void;
}) {
  const Tag = as;
  const value = txt[k] ?? fallback;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [pending, start] = useTransition();

  if (!isAdmin) return <Tag className={className}>{value}</Tag>;

  if (editing) {
    return (
      <div className="rep-edit-text">
        <textarea
          value={draft}
          rows={as === "p" ? 3 : 2}
          onChange={(e) => setDraft(e.target.value)}
          autoFocus
        />
        <div className="rep-edit-text-actions">
          <button
            type="button"
            className="btn btn-primary btn-sm"
            disabled={pending}
            onClick={() =>
              start(async () => {
                const res = await saveTextoSitio(k, draft.trim());
                if (!res.ok) return flash(res.error);
                setTxt((t) => ({ ...t, [k]: draft.trim() }));
                setEditing(false);
                flash("Texto guardado");
              })
            }
          >
            Guardar
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => {
              setDraft(value);
              setEditing(false);
            }}
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <Tag
      className={`${className ?? ""} rep-editable`.trim()}
      onClick={() => {
        setDraft(value);
        setEditing(true);
      }}
      title="Clic para editar"
    >
      {value}
      <span className="rep-editable-pen" aria-hidden="true">
        ✎
      </span>
    </Tag>
  );
}

/* ---------------- Drawer de ficha ---------------- */
function Drawer({
  state,
  nextOrden,
  onClose,
  onSaved,
  onDeleted,
  flash,
}: {
  state:
    | { mode: "edit"; row: Product }
    | { mode: "new"; categoria: ProductCategoria; subcategoria: string };
  nextOrden: number;
  onClose: () => void;
  onSaved: (row: Product, mode: "edit" | "new") => void;
  onDeleted: (id: string) => void;
  flash: (m: string) => void;
}) {
  const base: Product =
    state.mode === "edit"
      ? state.row
      : {
          id: "",
          nombre: "",
          categoria: state.categoria,
          subcategoria: state.subcategoria,
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
  const esCarga = f.categoria === "torito";
  const cat = PRODUCT_CATEGORIAS.find((c) => c.id === f.categoria);

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

  const carpeta =
    (state.mode === "new" ? slug || slugify(f.nombre) : f.id) || "nuevo";

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
      categoria: f.categoria,
      subcategoria: f.subcategoria.trim(),
      capacidad_kg: f.capacidad_kg,
      precio: f.precio,
      precio_nota: f.precio_nota.trim(),
      specs: f.specs
        .map((s) => ({ label: s.label.trim(), value: s.value.trim() }))
        .filter((s) => s.label || s.value),
      colores,
      color_default: Math.min(
        Math.max(f.color_default, 0),
        Math.max(colores.length - 1, 0),
      ),
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
        state.mode === "new"
          ? await createProduct(input)
          : await saveProduct(input);
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
            {state.mode === "new" ? "Nuevo modelo" : "Editar modelo"}
          </strong>
          <button
            type="button"
            className="rep-drawer-x"
            onClick={onClose}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <div className="rep-drawer-body">
          <label>
            Nombre
            <input
              value={f.nombre}
              onChange={(e) => set("nombre", e.target.value)}
            />
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
              Categoría
              <select
                value={f.categoria}
                onChange={(e) =>
                  set("categoria", e.target.value as ProductCategoria)
                }
              >
                {PRODUCT_CATEGORIAS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Modelo (subcategoría)
              <input
                list="modelos-page-subcats"
                value={f.subcategoria}
                onChange={(e) => set("subcategoria", e.target.value)}
              />
              <datalist id="modelos-page-subcats">
                {(cat?.subcategorias ?? []).map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </label>
          </div>

          <div className="rep-drawer-row">
            <label>
              {esCarga ? "Capacidad (kg)" : "Autonomía (km)"}
              <input
                type="number"
                min={0}
                value={f.capacidad_kg}
                onChange={(e) =>
                  set("capacidad_kg", Number(e.target.value) || 0)
                }
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
                  placeholder="Etiqueta (ej: Autonomía)"
                  value={s.label}
                  onChange={(e) => setSpec(i, "label", e.target.value)}
                />
                <input
                  placeholder="Valor (ej: 65 km)"
                  value={s.value}
                  onChange={(e) => setSpec(i, "value", e.target.value)}
                />
                <button
                  type="button"
                  className="rep-spec-x"
                  aria-label="Quitar"
                  onClick={() =>
                    set(
                      "specs",
                      f.specs.filter((_, idx) => idx !== i),
                    )
                  }
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
                      set(
                        "colores",
                        f.colores.filter((_, idx) => idx !== i),
                      )
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
                        <img
                          src={storageImg(url, 160)}
                          alt={`Foto ${j + 1}`}
                          loading="lazy"
                        />
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
                            setColorImgs(
                              i,
                              (c.imagenes ?? []).filter((u) => u !== url),
                            )
                          }
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <label className="rep-foto-upload">
                  {uploading
                    ? "Subiendo…"
                    : `＋ Subir fotos de ${c.nombre || "este color"}`}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={uploading}
                    onChange={(e) =>
                      subir(
                        e,
                        (urls) =>
                          setColorImgs(i, [...(c.imagenes ?? []), ...urls]),
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
                set("colores", [
                  ...f.colores,
                  { nombre: "", hex: "#1F4FD8", imagenes: [] },
                ])
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
                    <img
                      src={storageImg(url, 160)}
                      alt={`Foto ${i + 1}`}
                      loading="lazy"
                    />
                    <button
                      type="button"
                      className="rep-foto-x"
                      aria-label="Quitar foto"
                      onClick={() =>
                        set(
                          "imagenes",
                          f.imagenes.filter((u) => u !== url),
                        )
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
                    (urls) =>
                      setF((p) => ({ ...p, imagenes: [...p.imagenes, ...urls] })),
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
              Destacado (“Los más elegidos”)
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

/* ---------------- Iconos de categoría ---------------- */
function CatIcon({ id }: { id: ProductCategoria }): ReactNode {
  const p = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  if (id === "torito")
    return (
      <svg {...p}>
        <circle cx="6" cy="17.5" r="2.5" />
        <circle cx="18" cy="17.5" r="2.5" />
        <path d="M8.5 17.5h7M6 15V9h6l4 4.5M12 9l1.5-4H17" />
        <path d="M3.5 13H6" />
      </svg>
    );
  if (id === "scooter")
    return (
      <svg {...p}>
        <circle cx="5" cy="18" r="2.5" />
        <circle cx="19" cy="18" r="2.5" />
        <path d="M7.5 18h9M6 18l4-9h3M13 6h3l2 12M10 9h5" />
      </svg>
    );
  if (id === "bicicleta")
    return (
      <svg {...p}>
        <circle cx="5.5" cy="17.5" r="3.5" />
        <circle cx="18.5" cy="17.5" r="3.5" />
        <path d="M5.5 17.5 10 8h6M9 8l5 9.5M14 8l2-3h2.5M10 8H7" />
      </svg>
    );
  return (
    <svg {...p}>
      <circle cx="6" cy="17.5" r="3" />
      <circle cx="18" cy="17.5" r="3" />
      <path d="M6 17.5c3-.5 4-3 6-6l3 .5 1.5 5.5M9 8.5h5l2 3M4.5 11h4" />
    </svg>
  );
}
