"use client";

import { useState } from "react";
import { formatCLP, storageImg, waLink, type Product } from "@/lib/types";

function PlaceholderTrike({ tint }: { tint: string }) {
  return (
    <svg
      viewBox="0 0 300 160"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      fill="none"
      strokeWidth="1.4"
    >
      <rect className="tintable" x="8" y="50" width="150" height="70" rx="3" stroke={tint} />
      <rect x="8" y="40" width="150" height="10" rx="2" fill="rgba(255,255,255,0.08)" />
      <rect x="168" y="80" width="55" height="26" rx="5" stroke="rgba(255,255,255,0.5)" />
      <circle cx="233" cy="128" r="20" stroke="rgba(255,255,255,0.5)" />
      <circle cx="233" cy="128" r="8" stroke="rgba(255,255,255,0.35)" />
      <circle cx="40" cy="128" r="20" stroke="rgba(255,255,255,0.5)" />
      <circle cx="40" cy="128" r="8" stroke="rgba(255,255,255,0.35)" />
      <circle cx="82" cy="128" r="20" stroke="rgba(255,255,255,0.5)" />
      <circle cx="82" cy="128" r="8" stroke="rgba(255,255,255,0.35)" />
      <rect x="40" y="118" width="193" height="8" fill="rgba(255,255,255,0.15)" stroke="none" />
    </svg>
  );
}

type Props = {
  product: Product;
  isAdmin?: boolean;
  busy?: boolean;
  onEdit?: () => void;
  onToggleDestacado?: () => void;
  onToggleActivo?: () => void;
};

export default function ProductCard({
  product,
  isAdmin,
  busy,
  onEdit,
  onToggleDestacado,
  onToggleActivo,
}: Props) {
  const colores =
    product.colores.length > 0
      ? product.colores
      : [{ nombre: "Rojo", hex: "#C23B22" }];

  const defaultColorIdx = Math.min(
    Math.max(product.color_default ?? 0, 0),
    colores.length - 1
  );
  const [colorIdx, setColorIdx] = useState(defaultColorIdx);
  const [photoIdx, setPhotoIdx] = useState(0);

  const activeColor = colores[colorIdx] ?? colores[0];

  // Si algún color tiene fotos propias, la galería sigue al color elegido
  // (los colores sin fotos muestran el placeholder con su tono). Si ningún
  // color tiene fotos, se usa la galería compartida del producto.
  const anyColorHasImages = colores.some((c) => (c.imagenes?.length ?? 0) > 0);
  const images = anyColorHasImages
    ? activeColor.imagenes ?? []
    : product.imagenes ?? [];
  const waText = `Hola, quiero cotizar el ${product.nombre}`;

  return (
    <article
      className={
        "model-card" +
        (product.destacado ? " featured" : "") +
        (product.activo ? "" : " is-hidden")
      }
    >
      {isAdmin && (
        <div className="card-admin-bar">
          <button type="button" onClick={onEdit} disabled={busy} title="Editar torito">
            ✎
          </button>
          <button
            type="button"
            onClick={onToggleDestacado}
            disabled={busy}
            aria-pressed={product.destacado}
            title={product.destacado ? "Quitar destacado" : "Destacar"}
          >
            {product.destacado ? "★" : "☆"}
          </button>
          <button
            type="button"
            onClick={onToggleActivo}
            disabled={busy}
            aria-pressed={product.activo}
            title={product.activo ? "Ocultar en la web" : "Mostrar en la web"}
          >
            {product.activo ? "👁" : "🚫"}
          </button>
        </div>
      )}

      {product.destacado && (
        <span className="featured-tag">{product.destacado_texto}</span>
      )}

      <div className="model-media">
        <div className="media-frame">
          {images.length > 0 ? (
            <img
              className="media-img"
              src={storageImg(images[photoIdx] ?? images[0], 800)}
              alt={`${product.nombre} ${activeColor.nombre} Orient Lion`}
              loading="lazy"
              decoding="async"
              width={800}
              height={600}
            />
          ) : (
            <div
              className="media-placeholder"
              style={{ ["--tint" as string]: activeColor.hex }}
            >
              <PlaceholderTrike tint={activeColor.hex} />
              <span className="placeholder-tag">Fotos próximamente</span>
            </div>
          )}

          {images.length > 1 && (
            <div className="media-dots">
              {images.map((_, i) => (
                <button
                  key={i}
                  className={"dot" + (i === photoIdx ? " active" : "")}
                  aria-label={`Ver foto ${i + 1} de ${images.length}`}
                  onClick={() => setPhotoIdx(i)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="color-swatches">
          <span className="swatch-label">Color</span>
          {colores.map((c, i) => (
            <button
              key={c.nombre + i}
              className={"swatch" + (i === colorIdx ? " active" : "")}
              style={{ background: c.hex }}
              aria-label={c.nombre}
              onClick={() => {
                setColorIdx(i);
                setPhotoIdx(0);
              }}
            />
          ))}
        </div>
      </div>

      <div className="model-plate">
        <span className="plate-label">
          {product.tipo === "otro" ? "Autonomía" : "Modelo"}
        </span>
        <span className="plate-value">
          {product.capacidad_kg} {product.tipo === "otro" ? "KM" : "KILOS"}
        </span>
      </div>

      <div className="model-body">
        <h3>{product.nombre}</h3>
        <div className="model-price">
          {formatCLP(product.precio)}
          <small>{product.precio_nota}</small>
        </div>

        <ul className="model-specs">
          {product.specs.map((s, i) => (
            <li key={i}>
              <span>{s.label}</span>
              <span>{s.value}</span>
            </li>
          ))}
        </ul>

        <a
          className={"btn " + (product.destacado ? "btn-primary" : "btn-light")}
          href={waLink(waText)}
          target="_blank"
          rel="noopener noreferrer"
        >
          Cotizar este modelo
        </a>
      </div>
    </article>
  );
}
