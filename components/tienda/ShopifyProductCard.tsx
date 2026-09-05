"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
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

export default function ShopifyProductCard({ product }: { product: ShopifyProduct }) {
  const { setCart, openDrawer } = useCart();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
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

  const featured = product.tags.includes("destacado");
  const capacidad = parseCapacidad(product);
  const specs = parseSpecs(product);
  const price = Number(product.priceRange.minVariantPrice.amount);

  function handleAdd() {
    if (!activeVariant) return;
    setError(null);
    startTransition(async () => {
      const res = await addToCart(activeVariant.id, 1);
      if (!res.ok) return setError(res.error);
      setCart(res.cart);
      openDrawer();
    });
  }

  return (
    <article className={"model-card" + (featured ? " featured" : "")}>
      {featured && <span className="featured-tag">Más elegido</span>}

      <div className="model-media">
        <div className="media-frame">
          {images.length > 0 ? (
            <img
              className="media-img"
              src={images[photoIdx]?.url ?? images[0].url}
              alt={images[photoIdx]?.altText ?? product.title}
              loading="lazy"
              decoding="async"
              width={800}
              height={600}
            />
          ) : (
            <div className="media-placeholder">
              <span className="placeholder-tag">Sin foto</span>
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

        {colors.length > 0 && (
          <div className="color-swatches">
            <span className="swatch-label">Color</span>
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
      </div>

      {capacidad !== null && (
        <div className="model-plate">
          <span className="plate-label">Modelo</span>
          <span className="plate-value">{capacidad} KILOS</span>
        </div>
      )}

      <div className="model-body">
        <Link href={`/tienda/${product.handle}`}>
          <h3>{product.title}</h3>
        </Link>
        <div className="model-price">
          {formatCLP(price)}
          <small>Precio con IVA incluido</small>
        </div>

        {specs.length > 0 && (
          <ul className="model-specs">
            {specs.map((s, i) => (
              <li key={i}>
                <span>{s.label}</span>
                <span>{s.value}</span>
              </li>
            ))}
          </ul>
        )}

        {error && <p className="alert alert-err">{error}</p>}

        <button
          type="button"
          className="btn btn-primary"
          disabled={pending || !activeVariant}
          onClick={handleAdd}
        >
          {pending ? "Agregando…" : "Agregar al carrito"}
        </button>
      </div>
    </article>
  );
}
