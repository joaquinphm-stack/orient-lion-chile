"use client";

import { useEffect, useRef, useState } from "react";

type Slide = { id: string; plate: string; title: string; src: string; alt: string };

// Imágenes de referencia en /public/modelos (placeholders por tipo).
const SLIDES: Slide[] = [
  {
    id: "scooter",
    plate: "SCOOTER · 110 KM",
    title: "Scooters eléctricos con batería extraíble",
    src: "/modelos/scooter-1.svg",
    alt: "Scooter eléctrico Orient Lion",
  },
  {
    id: "bici",
    plate: "BICI · PEDALEO ASISTIDO",
    title: "Bicicletas eléctricas para ciudad, carga y todo terreno",
    src: "/modelos/bici-1.svg",
    alt: "Bicicleta eléctrica Orient Lion",
  },
  {
    id: "moto",
    plate: "MOTO 49CC · SIN LICENCIA ESPECIAL",
    title: "Motos 49cc bencineras para trayectos más largos",
    src: "/modelos/moto-1.svg",
    alt: "Moto 49cc Orient Lion",
  },
];

const ROTATE_MS = 4500;

export default function ModelosHeroShowcase() {
  const [i, setI] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    timer.current = setInterval(
      () => setI((n) => (n + 1) % SLIDES.length),
      ROTATE_MS,
    );
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, []);

  function go(n: number) {
    if (timer.current) clearInterval(timer.current);
    setI(n);
    const reduce = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (!reduce) {
      timer.current = setInterval(
        () => setI((k) => (k + 1) % SLIDES.length),
        ROTATE_MS,
      );
    }
  }

  return (
    <div className="rep-showcase">
      <span aria-hidden="true" className="rep-showcase-glow" />

      <div className="rep-showcase-stage">
        {SLIDES.map((s, n) => {
          const on = n === i;
          const behind = n < i || (i === 0 && n === SLIDES.length - 1);
          return (
            <div className="rep-showcase-slide" key={s.id}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={s.src}
                alt={s.alt}
                width={1280}
                height={853}
                loading={n === 0 ? "eager" : "lazy"}
                decoding="async"
                style={{
                  opacity: on ? 1 : 0,
                  transform: on
                    ? "translateX(0)"
                    : `translateX(${behind ? -46 : 46}px)`,
                }}
              />
            </div>
          );
        })}
      </div>

      <div className="rep-showcase-plates">
        {SLIDES.map((s, n) => (
          <button
            key={s.id}
            type="button"
            className={n === i ? "is-active" : ""}
            aria-pressed={n === i}
            onClick={() => go(n)}
          >
            <span className="rep-plate-dot" />
            {s.plate}
          </button>
        ))}
      </div>

      <div className="rep-showcase-caption-wrap">
        <span className="rep-showcase-caption" aria-live="polite">
          {SLIDES[i].title}
        </span>
      </div>
    </div>
  );
}
