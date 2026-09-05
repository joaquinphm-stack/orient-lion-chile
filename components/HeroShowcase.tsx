"use client";

import { useEffect, useRef, useState } from "react";
import { storageImg } from "@/lib/types";

const BUCKET =
  "https://jozqjwkutcqeiereobun.supabase.co/storage/v1/object/public/product-images/site";

type Paint = {
  key: string;
  name: string;
  src: string;
  swatch: string;
  glow: string;
};

const PAINTS: Paint[] = [
  { key: "negro", name: "Negro", src: `${BUCKET}/hero-negro.webp`, swatch: "#131313", glow: "rgba(150,170,255,.14)" },
  { key: "azul", name: "Azul", src: `${BUCKET}/hero-azul.webp`, swatch: "#1B3FC4", glow: "rgba(80,120,255,.20)" },
  { key: "rojo", name: "Rojo", src: `${BUCKET}/hero-rojo.webp`, swatch: "#C4181C", glow: "rgba(255,90,90,.18)" },
  { key: "turquesa", name: "Turquesa", src: `${BUCKET}/hero-turquesa.webp`, swatch: "#1AA3A3", glow: "rgba(70,220,220,.18)" },
];

const ROTATE_MS = 4500;
const SLIDE = 40;

export default function HeroShowcase() {
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const [manual, setManual] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (manual) return;
    timer.current = setTimeout(() => {
      setDir(1);
      setI((n) => (n + 1) % PAINTS.length);
    }, ROTATE_MS);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [i, manual]);

  function pick(n: number) {
    if (timer.current) clearTimeout(timer.current);
    setDir(n >= i ? 1 : -1);
    setI(n);
    setManual(true);
  }

  const active = PAINTS[i];

  return (
    <div className="hero-showcase">
      <div className="hero-showcase-stage">
        <div
          className="hero-showcase-glow"
          style={{ background: `radial-gradient(closest-side, ${active.glow}, transparent 78%)` }}
        />
        {PAINTS.map((p, n) => (
          <img
            key={p.key}
            src={storageImg(p.src, 1080)}
            alt={`Torito eléctrico de carga ${p.name.toLowerCase()} Orient Lion`}
            className="hero-showcase-img"
            loading={n === 0 ? "eager" : "lazy"}
            style={{
              opacity: n === i ? 1 : 0,
              transform: `translateX(${n === i ? 0 : SLIDE * dir}px) scale(${n === i ? 1 : 0.965})`,
            }}
          />
        ))}
      </div>

      <div className="hero-showcase-swatches">
        {PAINTS.map((p, n) => (
          <button
            key={p.key}
            type="button"
            title={p.name}
            aria-label={`Ver en ${p.name}`}
            aria-pressed={n === i}
            onClick={() => pick(n)}
            style={{
              background: p.swatch,
              boxShadow: n === i ? "0 0 0 2px rgba(30,22,8,.85)" : "none",
              transform: `scale(${n === i ? 1.08 : 1})`,
            }}
          />
        ))}
      </div>

      <div className="hero-showcase-caption">
        <span className="dot" />
        {active.name} · 1000 kilos
      </div>
    </div>
  );
}
