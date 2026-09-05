"use client";

import { useState, useTransition } from "react";
import { formatCLP } from "@/lib/types";
import { addToCart } from "@/app/tienda/actions";
import { findColorOption, parseCapacidad, parseSpecs } from "@/lib/shopify/format";
import type { ShopifyProduct } from "@/lib/shopify/types";
import { useCart } from "./CartContext";

const COLOR_HEX: Record<string, string> = {
  Azul: "#1F4FD8",
  Turquesa: "#12B5B0",
  Rojo: "#C23B22",
  Negro: "#111111",
};

export default function ShopifyProductDetail({ product }: { product: ShopifyProduct }) {
  const { setCart, openDrawer } = useCart();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [colorIdx, setColorIdx] = useState(0);
  const [photoIdx, setPhotoIdx] = useState(0);

  const colorOption = findColorOption(product);
  const colors = colorOption?.values ?? [];
  const activeColor = colors[colorIdx];

  const activeVariant =
    product.variants.nodes.find((v) =>
      v.selectedOptions.some((o) => o.name === colorOption?.name && o.value === activeColor),
    ) ?? product.variants.nodes[0];

  const colorImages = activeColor
    ? product.images.nodes.filter((img) => img.altText?.includes(activeColor))
    : [];
  const images = colorImages.length > 0 ? colorImages : product.images.nodes;
  const activeImage = images[photoIdx] ?? images[0];

  const capacidad = parseCapacidad(product);
  const specs = parseSpecs(product);
  const price = activeVariant
    ? Number(activeVariant.price.amount)
    : Number(product.priceRange.minVariantPrice.amount);

  function handleAdd() {
    if (!activeVariant) return;
    setError(null);
    startTransition(async () => {
      const res = await addToCart(activeVariant.id, qty);
      if (!res.ok) return setError(res.error);
      setCart(res.cart);
      openDrawer();
    });
  }

  return (
    <div className="tienda-detail-grid">
      <div>
        <div className="tienda-detail-media">
          {activeImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={activeImage.url} alt={activeImage.altText ?? product.title} />
          ) : (
            <div className="media-placeholder">
              <span className="placeholder-tag">Sin foto</span>
            </div>
          )}
        </div>

        {images.length > 1 && (
          <div className="tienda-detail-thumbs">
            {images.map((img, i) => (
              <button
                key={img.url + i}
                type="button"
                className={i === photoIdx ? "is-active" : ""}
                onClick={() => setPhotoIdx(i)}
                aria-label={`Ver foto ${i + 1}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt="" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="tienda-detail-info">
        {capacidad !== null && (
          <p className="tienda-detail-sub">
            Modelo · {capacidad} KILOS
          </p>
        )}
        <h1>{product.title}</h1>
        <div className="tienda-detail-price">
          {formatCLP(price)}
          <small>Precio con IVA incluido</small>
        </div>

        {colors.length > 0 && (
          <div className="tienda-color-row">
            <span className="swatch-label">Color: {activeColor}</span>
            {colors.map((c, i) => (
              <button
                key={c}
                className={"swatch" + (i === colorIdx ? " active" : "")}
                style={{ background: COLOR_HEX[c] ?? "#666" }}
                aria-label={c}
                onClick={() => {
                  setColorIdx(i);
                  setPhotoIdx(0);
                }}
              />
            ))}
          </div>
        )}

        {specs.length > 0 && (
          <ul className="model-specs tienda-detail-specs">
            {specs.map((s, i) => (
              <li key={i}>
                <span>{s.label}</span>
                <span>{s.value}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="tienda-qty">
          <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Restar">
            −
          </button>
          <span>{qty}</span>
          <button type="button" onClick={() => setQty((q) => q + 1)} aria-label="Sumar">
            +
          </button>
        </div>

        {error && <p className="alert alert-err">{error}</p>}

        <div className="tienda-detail-actions">
          <button
            type="button"
            className="btn btn-primary"
            disabled={pending || !activeVariant}
            onClick={handleAdd}
          >
            {pending ? "Agregando…" : "Agregar al carrito"}
          </button>
        </div>

        <div
          className="tienda-detail-desc"
          dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
        />
      </div>
    </div>
  );
}
