"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { PRODUCT_IMAGES_BUCKET } from "@/lib/supabase/config";
import {
  createProduct,
  deleteProduct,
  saveButtonAppearance,
  saveProduct,
  type ProductInput,
} from "@/app/actions";
import {
  PRODUCT_CATEGORIAS,
  storageImg,
  type Color,
  type Product,
  type ProductCategoria,
  type Spec,
} from "@/lib/types";
import {
  BUTTON_FONTS,
  BUTTON_SIZE_MAX,
  BUTTON_SIZE_MIN,
  clampButtonSize,
  DEFAULT_BUTTON_FONT,
  DEFAULT_BUTTON_SIZE,
} from "@/lib/buttonFont";

const slugify = (s: string) =>
  s.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/* ----------------------------- helpers ----------------------------- */

async function uploadImage(folder: string, file: File): Promise<string> {
  const supabase = createClient();
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .upload(path, file, { contentType: file.type || "image/jpeg", upsert: false });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

type Msg = { ok: boolean; text: string } | null;

/* ------------------ ButtonAppearanceEditor ------------------ */

function ButtonAppearanceEditor({
  initialFont,
  initialSize,
}: {
  initialFont: string | null;
  initialSize: string | null;
}) {
  const router = useRouter();
  const [font, setFont] = useState(
    initialFont && BUTTON_FONTS.some((f) => f.key === initialFont)
      ? initialFont
      : DEFAULT_BUTTON_FONT,
  );
  const [size, setSize] = useState(
    String(
      initialSize ? clampButtonSize(Number(initialSize)) : DEFAULT_BUTTON_SIZE,
    ),
  );
  const [msg, setMsg] = useState<Msg>(null);
  const [busy, setBusy] = useState(false);

  const previewStack =
    BUTTON_FONTS.find((f) => f.key === font)?.stack ?? "inherit";
  const previewSize = clampButtonSize(Number(size)) || DEFAULT_BUTTON_SIZE;

  async function onSave() {
    setBusy(true);
    setMsg(null);
    const res = await saveButtonAppearance(font, clampButtonSize(Number(size)));
    setBusy(false);
    if (res.ok) {
      setMsg({ ok: true, text: "Botones actualizados. Recarga la web para verlo." });
      router.refresh();
    } else {
      setMsg({ ok: false, text: res.error });
    }
  }

  return (
    <div className="admin-product">
      <h3>Fuente y tamaño de los botones</h3>
      <div className="muted">
        Se aplica a todos los botones del sitio (landing, repuestos, formularios).
        En móvil el tamaño se reduce a la mitad automáticamente.
      </div>

      {msg && (
        <div className={"alert " + (msg.ok ? "alert-ok" : "alert-err")}>
          {msg.text}
        </div>
      )}

      <div className="admin-grid">
        <div className="admin-field">
          <label>Fuente</label>
          <select value={font} onChange={(e) => setFont(e.target.value)}>
            {BUTTON_FONTS.map((f) => (
              <option key={f.key} value={f.key}>
                {f.label}
              </option>
            ))}
          </select>
        </div>
        <div className="admin-field">
          <label>Tamaño en escritorio (px)</label>
          <input
            type="number"
            min={BUTTON_SIZE_MIN}
            max={BUTTON_SIZE_MAX}
            value={size}
            onChange={(e) => setSize(e.target.value)}
          />
        </div>
        <div className="admin-field full">
          <label>Vista previa</label>
          <button
            type="button"
            className="btn btn-primary"
            style={{ fontFamily: previewStack, fontSize: `${previewSize}px` }}
          >
            Cotizar por WhatsApp
          </button>
        </div>
      </div>

      <div className="admin-actions">
        <div style={{ flex: 1 }} />
        <button
          className="btn btn-primary btn-sm"
          onClick={onSave}
          disabled={busy}
        >
          {busy ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </div>
  );
}

/* -------------------------- ProductEditor -------------------------- */

function ProductEditor({ product }: { product: Product }) {
  const router = useRouter();
  const [nombre, setNombre] = useState(product.nombre);
  const [categoria, setCategoria] = useState<ProductCategoria>(product.categoria);
  const [subcategoria, setSubcategoria] = useState(product.subcategoria ?? "");
  const [capacidad, setCapacidad] = useState(String(product.capacidad_kg));
  const [precio, setPrecio] = useState(String(product.precio));
  const [precioNota, setPrecioNota] = useState(product.precio_nota);
  const [specs, setSpecs] = useState<Spec[]>(product.specs ?? []);
  const [colores, setColores] = useState<Color[]>(product.colores ?? []);
  const [colorDefault, setColorDefault] = useState<number>(product.color_default ?? 0);
  const [imagenes, setImagenes] = useState<string[]>(product.imagenes ?? []);
  const [destacado, setDestacado] = useState(product.destacado);
  const [destacadoTexto, setDestacadoTexto] = useState(product.destacado_texto);
  const [orden, setOrden] = useState(String(product.orden));
  const [activo, setActivo] = useState(product.activo);

  const [msg, setMsg] = useState<Msg>(null);
  const [busy, setBusy] = useState(false);

  function setSpec(i: number, key: keyof Spec, value: string) {
    setSpecs((prev) => prev.map((s, idx) => (idx === i ? { ...s, [key]: value } : s)));
  }
  function addSpec() {
    setSpecs((prev) => [...prev, { label: "", value: "" }]);
  }
  function removeSpec(i: number) {
    setSpecs((prev) => prev.filter((_, idx) => idx !== i));
  }

  function setColor(i: number, key: "nombre" | "hex", value: string) {
    setColores((prev) => prev.map((c, idx) => (idx === i ? { ...c, [key]: value } : c)));
  }
  function addColor() {
    setColores((prev) => [...prev, { nombre: "", hex: "#1F4FD8", imagenes: [] }]);
  }
  function removeColor(i: number) {
    setColores((prev) => prev.filter((_, idx) => idx !== i));
  }
  function removeColorImage(i: number, j: number) {
    setColores((prev) =>
      prev.map((c, idx) =>
        idx === i
          ? { ...c, imagenes: (c.imagenes ?? []).filter((_, k) => k !== j) }
          : c
      )
    );
  }
  async function onUploadColor(
    i: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setBusy(true);
    setMsg(null);
    try {
      const folder = `${product.id}/color-${slugify(colores[i]?.nombre) || i}`;
      const urls: string[] = [];
      for (const f of files) urls.push(await uploadImage(folder, f));
      setColores((prev) =>
        prev.map((c, idx) =>
          idx === i ? { ...c, imagenes: [...(c.imagenes ?? []), ...urls] } : c
        )
      );
      setMsg({ ok: true, text: "Foto subida. Recuerda guardar los cambios." });
    } catch (err) {
      setMsg({ ok: false, text: "No se pudo subir la foto: " + (err as Error).message });
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  }

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setBusy(true);
    setMsg(null);
    try {
      const urls: string[] = [];
      for (const f of files) urls.push(await uploadImage(product.id, f));
      setImagenes((prev) => [...prev, ...urls]);
      setMsg({ ok: true, text: "Foto subida. Recuerda guardar los cambios." });
    } catch (err) {
      setMsg({ ok: false, text: "No se pudo subir la foto: " + (err as Error).message });
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  }

  async function onSave() {
    setBusy(true);
    setMsg(null);
    const input: ProductInput = {
      id: product.id,
      nombre: nombre.trim(),
      categoria,
      subcategoria: subcategoria.trim(),
      capacidad_kg: Number(capacidad) || 0,
      precio: Number(precio) || 0,
      precio_nota: precioNota.trim(),
      specs: specs.filter((s) => s.label.trim() || s.value.trim()),
      colores: colores
        .filter((c) => c.nombre.trim() || c.hex.trim())
        .map((c) => ({
          nombre: c.nombre.trim(),
          hex: c.hex.trim(),
          imagenes: c.imagenes ?? [],
        })),
      color_default: Math.min(Math.max(colorDefault, 0), Math.max(colores.length - 1, 0)),
      imagenes,
      destacado,
      destacado_texto: destacadoTexto.trim() || "Más elegido",
      orden: Number(orden) || 0,
      activo,
    };
    const res = await saveProduct(input);
    setBusy(false);
    if (res.ok) {
      setMsg({ ok: true, text: "Cambios guardados." });
      router.refresh();
    } else {
      setMsg({ ok: false, text: res.error });
    }
  }

  async function onDelete() {
    if (!confirm(`¿Eliminar "${product.nombre}"? Esta acción no se puede deshacer.`)) return;
    setBusy(true);
    const res = await deleteProduct(product.id);
    setBusy(false);
    if (res.ok) router.refresh();
    else setMsg({ ok: false, text: res.error });
  }

  return (
    <div className={"admin-product" + (activo ? "" : " inactive")}>
      <h3>{product.nombre}</h3>
      <div className="muted">ID: {product.id}</div>

      {msg && (
        <div className={"alert " + (msg.ok ? "alert-ok" : "alert-err")}>{msg.text}</div>
      )}

      <div className="admin-grid">
        <div className="admin-field">
          <label>Nombre</label>
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} />
        </div>
        <div className="admin-field">
          <label>Categoría</label>
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value as ProductCategoria)}
          >
            {PRODUCT_CATEGORIAS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>
        <div className="admin-field">
          <label>Modelo (subcategoría)</label>
          <input
            list={`admin-subcats-${product.id}`}
            value={subcategoria}
            onChange={(e) => setSubcategoria(e.target.value)}
          />
          <datalist id={`admin-subcats-${product.id}`}>
            {(PRODUCT_CATEGORIAS.find((c) => c.id === categoria)?.subcategorias ??
              []).map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </div>
        <div className="admin-field">
          <label>{categoria === "torito" ? "Capacidad (kg)" : "Autonomía (km)"}</label>
          <input
            type="number"
            value={capacidad}
            onChange={(e) => setCapacidad(e.target.value)}
          />
        </div>
        <div className="admin-field">
          <label>Precio (CLP)</label>
          <input
            type="number"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
          />
        </div>
        <div className="admin-field">
          <label>Nota de precio</label>
          <input
            value={precioNota}
            onChange={(e) => setPrecioNota(e.target.value)}
          />
        </div>
        <div className="admin-field">
          <label>Orden</label>
          <input type="number" value={orden} onChange={(e) => setOrden(e.target.value)} />
        </div>
        <div className="admin-field">
          <label>Texto destacado</label>
          <input
            value={destacadoTexto}
            onChange={(e) => setDestacadoTexto(e.target.value)}
          />
        </div>

        <div className="admin-field full">
          <label>Características</label>
          {specs.map((s, i) => (
            <div className="spec-row" key={i}>
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
                className="btn btn-danger btn-sm"
                onClick={() => removeSpec(i)}
              >
                ✕
              </button>
            </div>
          ))}
          <button type="button" className="btn btn-ghost btn-sm" onClick={addSpec}>
            + Agregar característica
          </button>
        </div>

        <div className="admin-field full">
          <label>Colores y sus fotos</label>
          <div className="muted" style={{ marginBottom: 12 }}>
            Cada color muestra sus propias fotos en la web. Si un color no tiene
            fotos, se ve la silueta con ese tono.
          </div>
          {colores.length > 0 && (
            <div className="color-row" style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 13, color: "var(--text-dim)", whiteSpace: "nowrap" }}>
                Color por defecto en la web
              </label>
              <select
                value={Math.min(colorDefault, colores.length - 1)}
                onChange={(e) => setColorDefault(Number(e.target.value))}
              >
                {colores.map((c, i) => (
                  <option key={i} value={i}>
                    {c.nombre || `Color ${i + 1}`}
                  </option>
                ))}
              </select>
            </div>
          )}
          {colores.map((c, i) => (
            <div className="color-block" key={i}>
              <div className="color-row">
                <input
                  type="color"
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
                  className="btn btn-danger btn-sm"
                  onClick={() => removeColor(i)}
                >
                  ✕
                </button>
              </div>
              <div className="thumbs">
                {(c.imagenes ?? []).map((url, j) => (
                  <div className="thumb" key={url}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={storageImg(url, 200)}
                      alt={`${c.nombre} foto ${j + 1}`}
                      loading="lazy"
                    />
                    <button
                      type="button"
                      onClick={() => removeColorImage(i, j)}
                      aria-label="Quitar foto"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => onUploadColor(i, e)}
              />
            </div>
          ))}
          <button type="button" className="btn btn-ghost btn-sm" onClick={addColor}>
            + Agregar color
          </button>
        </div>

        <div className="admin-field full">
          <label>Fotos generales (si un color no tiene fotos propias)</label>
          <div className="thumbs">
            {imagenes.map((url, i) => (
              <div className="thumb" key={url}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={storageImg(url, 200)}
                  alt={`Foto ${i + 1}`}
                  loading="lazy"
                />
                <button
                  type="button"
                  onClick={() =>
                    setImagenes((prev) => prev.filter((_, idx) => idx !== i))
                  }
                  aria-label="Quitar foto"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <input type="file" accept="image/*" multiple onChange={onUpload} />
        </div>
      </div>

      <div className="admin-actions">
        <label className="checkline">
          <input
            type="checkbox"
            checked={destacado}
            onChange={(e) => setDestacado(e.target.checked)}
          />
          Destacado
        </label>
        <label className="checkline">
          <input
            type="checkbox"
            checked={activo}
            onChange={(e) => setActivo(e.target.checked)}
          />
          Visible en la web
        </label>

        <div style={{ flex: 1 }} />

        <button className="btn btn-primary btn-sm" onClick={onSave} disabled={busy}>
          {busy ? "Guardando..." : "Guardar cambios"}
        </button>
        <button className="btn btn-danger btn-sm" onClick={onDelete} disabled={busy}>
          Eliminar
        </button>
      </div>
    </div>
  );
}

/* ------------------------- NewProductForm ------------------------- */

function NewProductForm({ nextOrden }: { nextOrden: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [id, setId] = useState("");
  const [nombre, setNombre] = useState("");
  const [categoria, setCategoria] = useState<ProductCategoria>("torito");
  const [subcategoria, setSubcategoria] = useState("");
  const [capacidad, setCapacidad] = useState("");
  const [precio, setPrecio] = useState("");
  const [msg, setMsg] = useState<Msg>(null);
  const [busy, setBusy] = useState(false);

  const esCarga = categoria === "torito";

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const input: ProductInput = {
      id: id || nombre,
      nombre: nombre.trim(),
      categoria,
      subcategoria: subcategoria.trim(),
      capacidad_kg: Number(capacidad) || 0,
      precio: Number(precio) || 0,
      precio_nota: "Precio con IVA incluido",
      specs: capacidad
        ? [
            {
              label: esCarga ? "Capacidad de carga" : "Autonomía",
              value: esCarga ? `${capacidad} kg` : `${capacidad} km`,
            },
          ]
        : [],
      colores: [
        { nombre: "Azul", hex: "#1F4FD8", imagenes: [] },
        { nombre: "Turquesa", hex: "#12B5B0", imagenes: [] },
        { nombre: "Rojo", hex: "#C23B22", imagenes: [] },
        { nombre: "Negro", hex: "#111111", imagenes: [] },
      ],
      color_default: 0,
      imagenes: [],
      destacado: false,
      destacado_texto: "Más elegido",
      orden: nextOrden,
      activo: true,
    };
    const res = await createProduct(input);
    setBusy(false);
    if (res.ok) {
      setId("");
      setNombre("");
      setCategoria("torito");
      setSubcategoria("");
      setCapacidad("");
      setPrecio("");
      setOpen(false);
      router.refresh();
    } else {
      setMsg({ ok: false, text: res.error });
    }
  }

  if (!open) {
    return (
      <button className="btn btn-primary" onClick={() => setOpen(true)}>
        + Agregar producto nuevo
      </button>
    );
  }

  return (
    <div className="admin-product">
      <h3>Nuevo producto</h3>
      <div className="muted">
        Créalo con los datos básicos; luego podrás agregar características y fotos.
      </div>

      {msg && <div className="alert alert-err">{msg.text}</div>}

      <form onSubmit={onCreate} className="admin-grid">
        <div className="admin-field">
          <label>Identificador (slug)</label>
          <input
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="ej: 1500kg"
            required
          />
        </div>
        <div className="admin-field">
          <label>Nombre</label>
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="ej: Torito 1500 kg"
            required
          />
        </div>
        <div className="admin-field">
          <label>Categoría</label>
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value as ProductCategoria)}
          >
            {PRODUCT_CATEGORIAS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>
        <div className="admin-field">
          <label>Modelo (subcategoría)</label>
          <input
            list="admin-new-subcats"
            value={subcategoria}
            onChange={(e) => setSubcategoria(e.target.value)}
            placeholder="ej: 1500 kg"
          />
          <datalist id="admin-new-subcats">
            {(PRODUCT_CATEGORIAS.find((c) => c.id === categoria)?.subcategorias ??
              []).map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </div>
        <div className="admin-field">
          <label>{esCarga ? "Capacidad (kg)" : "Autonomía (km)"}</label>
          <input
            type="number"
            value={capacidad}
            onChange={(e) => setCapacidad(e.target.value)}
          />
        </div>
        <div className="admin-field">
          <label>Precio (CLP)</label>
          <input
            type="number"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
          />
        </div>

        <div className="admin-field full">
          <div className="inline">
            <button className="btn btn-primary btn-sm" disabled={busy}>
              {busy ? "Creando..." : "Crear producto"}
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}


/* --------------------------- AdminPanel --------------------------- */

export default function AdminPanel({
  initialProducts,
  initialButtonFont,
  initialButtonSize,
}: {
  initialProducts: Product[];
  initialButtonFont: string | null;
  initialButtonSize: string | null;
}) {
  const nextOrden =
    initialProducts.reduce((max, p) => Math.max(max, p.orden), 0) + 1;

  return (
    <div>
      <ButtonAppearanceEditor
        initialFont={initialButtonFont}
        initialSize={initialButtonSize}
      />
      {initialProducts.map((p) => (
        <ProductEditor key={p.id} product={p} />
      ))}
      <div style={{ marginTop: 32 }}>
        <NewProductForm nextOrden={nextOrden} />
      </div>
    </div>
  );
}
