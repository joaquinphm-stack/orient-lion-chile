export type Spec = { label: string; value: string };
export type Color = { nombre: string; hex: string; imagenes?: string[] };

/** `torito` usa la placa "Modelo · N KILOS"; `otro` (scooter, bici, moto) usa
 *  "Autonomía · N KM". Ver ProductCard. */
export type ProductTipo = "torito" | "otro";

export type Product = {
  id: string;
  nombre: string;
  tipo: ProductTipo;
  capacidad_kg: number;
  precio: number;
  precio_nota: string;
  specs: Spec[];
  imagenes: string[];
  colores: Color[];
  color_default: number;
  destacado: boolean;
  destacado_texto: string;
  orden: number;
  activo: boolean;
  created_at: string;
  updated_at: string;
};

export type RepuestoCategoria =
  | "sistema-electrico"
  | "chasis"
  | "frenos"
  | "carroceria";

export type Repuesto = {
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
  created_at: string;
  updated_at: string;
};

/** Texto editable del sitio (tabla `textos_sitio`), indexado por `clave`. */
export type TextoSitio = { clave: string; valor: string };

export const REPUESTO_CATEGORIAS: {
  id: RepuestoCategoria;
  nombre: string;
  detalle: string;
  subcategorias: string[];
}[] = [
  {
    id: "sistema-electrico",
    nombre: "Sistema eléctrico y propulsión",
    detalle:
      "Baterías, cargadores, aceleradores, motores, controladores y convertidores DC-DC.",
    subcategorias: [
      "Baterías",
      "Cargadores",
      "Aceleradores",
      "Motores",
      "Controladores",
      "Convertidores DC-DC",
    ],
  },
  {
    id: "chasis",
    nombre: "Chasis, suspensión y dirección",
    detalle:
      "Amortiguadores, paquetes de resortes (ballestas), horquillas y rodamientos.",
    subcategorias: [
      "Amortiguadores",
      "Paquetes de resortes (ballestas)",
      "Horquillas",
      "Rodamientos",
    ],
  },
  {
    id: "frenos",
    nombre: "Frenos y tracción",
    detalle: "Balatas (zapatas), pastillas de freno, bombas y piolas, ejes traseros.",
    subcategorias: [
      "Balatas (zapatas)",
      "Pastillas de freno",
      "Bombas y piolas",
      "Ejes traseros",
    ],
  },
  {
    id: "carroceria",
    nombre: "Carrocería y luces",
    detalle:
      "Focos LED, espejos, parabrisas, chapas de contacto, neumáticos y llantas.",
    subcategorias: [
      "Focos LED",
      "Espejos",
      "Parabrisas",
      "Chapas de contacto",
      "Neumáticos y llantas",
    ],
  },
];

/** Convierte un texto a un slug apto para anclas / ids (`Baterías` → `baterias`). */
export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

/** Ancla estable de una subcategoría dentro de /repuestos. */
export const subAnchor = (cat: string, sub: string) => `sub-${cat}-${slugify(sub)}`;

export type Profile = {
  id: string;
  nombre: string;
  email: string;
  role: "cliente" | "admin";
  created_at: string;
};

export const WHATSAPP_NUMBER = "56999125871";

export function waLink(text?: string) {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

export function formatCLP(value: number) {
  return "$" + Math.round(value).toLocaleString("es-CL");
}

/**
 * Sirve una imagen del Storage de Supabase a través del CDN de transformación:
 * la redimensiona y la entrega en WebP/AVIF según el navegador. Las fotos que
 * suben desde el panel pesan 0,5–2 MB; esto las baja a ~40–80 KB.
 * `resize=contain` es clave: sin él, el CDN recorta la imagen a lo ancho en vez
 * de escalarla, y se pierde parte del objeto. Con `contain` solo la achica
 * manteniendo la proporción original (el recorte a 4:3 de las tarjetas lo hace
 * el CSS con `object-fit: cover`).
 * URLs que no son de `/object/public/` (o ya transformadas) se devuelven igual.
 */
export function storageImg(url: string, width = 800, quality = 72): string {
  const OBJECT = "/storage/v1/object/public/";
  if (!url || !url.includes(OBJECT)) return url;
  const base = url.replace(OBJECT, "/storage/v1/render/image/public/");
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}width=${width}&quality=${quality}&resize=contain`;
}
