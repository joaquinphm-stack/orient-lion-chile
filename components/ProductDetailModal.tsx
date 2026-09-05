"use client";

import { useEffect } from "react";
import { formatCLP, storageImg, waLink, type Color, type Product } from "@/lib/types";

type Props = {
  product: Product;
  colores: Color[];
  colorIdx: number;
  photoIdx: number;
  images: string[];
  onSelectColor: (i: number) => void;
  onSelectPhoto: (i: number) => void;
  onClose: () => void;
};

export default function ProductDetailModal({
  product,
  colores,
  colorIdx,
  photoIdx,
  images,
  onSelectColor,
  onSelectPhoto,
  onClose,
}: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const activeColor = colores[colorIdx] ?? colores[0];
  const activeImage = images[photoIdx] ?? images[0];
  const waText = `Hola, quiero cotizar el ${product.nombre}`;
  const esCarga = product.categoria === "torito";

  return (
    <div
      className="product-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={product.nombre}
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
    >
      <div className="product-modal" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="product-modal-close"
          onClick={onClose}
          aria-label="Cerrar"
        >
          ✕
        </button>

        <div className="tienda-detail-grid product-modal-grid">
          <div>
            <div className="tienda-detail-media">
              {activeImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={storageImg(activeImage, 1200)}
                  alt={`${product.nombre} ${activeColor.nombre} Orient Lion`}
                />
              ) : (
                <div className="media-placeholder" style={{ ["--tint" as string]: activeColor.hex }}>
                  <span className="placeholder-tag">Fotos próximamente</span>
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="tienda-detail-thumbs">
                {images.map((url, i) => (
                  <button
                    key={url + i}
                    type="button"
                    className={i === photoIdx ? "is-active" : ""}
                    onClick={() => onSelectPhoto(i)}
                    aria-label={`Ver foto ${i + 1}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={storageImg(url, 160)} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="tienda-detail-info">
            <p className="tienda-detail-sub">
              {esCarga ? "Modelo" : "Autonomía"} · {product.capacidad_kg}{" "}
              {esCarga ? "KILOS" : "KM"}
            </p>
            <h2>{product.nombre}</h2>
            <div className="tienda-detail-price">
              {formatCLP(product.precio)}
              <small>{product.precio_nota}</small>
            </div>

            {colores.length > 0 && (
              <div className="tienda-color-row">
                <span className="swatch-label">Color: {activeColor.nombre}</span>
                {colores.map((c, i) => (
                  <button
                    key={c.nombre + i}
                    className={"swatch" + (i === colorIdx ? " active" : "")}
                    style={{ background: c.hex }}
                    aria-label={c.nombre}
                    onClick={() => onSelectColor(i)}
                  />
                ))}
              </div>
            )}

            {product.specs.length > 0 && (
              <ul className="model-specs tienda-detail-specs">
                {product.specs.map((s, i) => (
                  <li key={i}>
                    <span>{s.label}</span>
                    <span>{s.value}</span>
                  </li>
                ))}
              </ul>
            )}

            <a
              className="btn btn-primary"
              href={waLink(waText)}
              target="_blank"
              rel="noopener noreferrer"
            >
              Cotizar este modelo
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
