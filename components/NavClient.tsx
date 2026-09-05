"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import {
  PRODUCT_CATEGORIAS,
  REPUESTO_CATEGORIAS,
  subAnchor,
  waLink,
} from "@/lib/types";

type Props = {
  isLogged: boolean;
  isAdmin: boolean;
  nombre: string;
};

type MegaCat = { id: string; nombre: string; subcategorias: string[] };
type Section = {
  href: string;
  label: string;
  mega?: { aria: string; base: string; cats: MegaCat[] };
};

const SECTIONS: Section[] = [
  { href: "/#servicios", label: "Servicios" },
  { href: "/tienda", label: "Tienda" },
  {
    href: "/modelos",
    label: "Modelos",
    mega: {
      aria: "Categorías de modelos",
      base: "/modelos",
      cats: PRODUCT_CATEGORIAS,
    },
  },
  {
    href: "/repuestos",
    label: "Repuestos",
    mega: {
      aria: "Categorías de repuestos",
      base: "/repuestos",
      cats: REPUESTO_CATEGORIAS,
    },
  },
  { href: "/#testimonios", label: "Testimonios" },
  { href: "/#contacto", label: "Contacto" },
];

export default function NavClient({ isLogged, isAdmin, nombre }: Props) {
  const [open, setOpen] = useState(false);
  const [acc, setAcc] = useState<string | null>(null);
  const [catAcc, setCatAcc] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  // Cierra el menú al cambiar de ruta
  useEffect(() => {
    setOpen(false);
    setAcc(null);
    setCatAcc(null);
  }, [pathname]);

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setOpen(false);
    router.push("/");
    router.refresh();
  }

  return (
    <>
      <ul className="nav-links">
        {SECTIONS.map((s) =>
          s.mega ? (
            <li key={s.href} className="nav-item has-mega">
              <Link href={s.href}>{s.label}</Link>
              <div className="mega" role="menu" aria-label={s.mega.aria}>
                {s.mega.cats.map((cat) => (
                  <div className="mega-col" key={cat.id}>
                    <Link
                      className="mega-col-head"
                      href={`${s.mega!.base}#cat-${cat.id}`}
                    >
                      {cat.nombre}
                    </Link>
                    <ul>
                      {cat.subcategorias.map((sub) => (
                        <li key={sub}>
                          <Link href={`${s.mega!.base}#${subAnchor(cat.id, sub)}`}>
                            {sub}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </li>
          ) : (
            <li key={s.href}>
              <Link href={s.href}>{s.label}</Link>
            </li>
          ),
        )}
      </ul>

      {isLogged && (
        <div className="nav-right">
          {isAdmin && <Link href="/admin">Admin</Link>}
          <Link href="/perfil">{nombre ? nombre.split(" ")[0] : "Perfil"}</Link>
          <button type="button" className="linklike" onClick={logout}>
            Salir
          </button>
        </div>
      )}

      <button
        type="button"
        className="nav-toggle"
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? "✕" : "☰"}
      </button>

      {open && (
        <div className="mobile-menu">
          {SECTIONS.map((s) =>
            s.mega ? (
              <div className="m-acc" key={s.href}>
                <div className="m-acc-row">
                  <Link href={s.href} onClick={() => setOpen(false)}>
                    {s.label}
                  </Link>
                  <button
                    type="button"
                    className="m-acc-toggle"
                    aria-label={acc === s.href ? "Contraer" : "Expandir"}
                    aria-expanded={acc === s.href}
                    onClick={() => setAcc((v) => (v === s.href ? null : s.href))}
                  >
                    {acc === s.href ? "–" : "+"}
                  </button>
                </div>
                {acc === s.href && (
                  <div className="m-acc-body">
                    {s.mega.cats.map((cat) => {
                      const ck = `${s.href}:${cat.id}`;
                      return (
                      <div className="m-acc-cat-group" key={cat.id}>
                        <div className="m-acc-row m-acc-cat-row">
                          <Link
                            className="m-acc-cat"
                            href={`${s.mega!.base}#cat-${cat.id}`}
                            onClick={() => setOpen(false)}
                          >
                            {cat.nombre}
                          </Link>
                          <button
                            type="button"
                            className="m-acc-toggle m-acc-toggle-sm"
                            aria-label={catAcc === ck ? "Contraer" : "Expandir"}
                            aria-expanded={catAcc === ck}
                            onClick={() =>
                              setCatAcc((v) => (v === ck ? null : ck))
                            }
                          >
                            {catAcc === ck ? "–" : "+"}
                          </button>
                        </div>
                        {catAcc === ck && (
                          <div className="m-acc-subs">
                            {cat.subcategorias.map((sub) => (
                              <Link
                                key={sub}
                                className="m-acc-sub"
                                href={`${s.mega!.base}#${subAnchor(cat.id, sub)}`}
                                onClick={() => setOpen(false)}
                              >
                                {sub}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <Link key={s.href} href={s.href} onClick={() => setOpen(false)}>
                {s.label}
              </Link>
            ),
          )}
          {isLogged && (
            <>
              <div className="mobile-menu-sep" />
              {isAdmin && (
                <Link href="/admin" onClick={() => setOpen(false)}>
                  Admin
                </Link>
              )}
              <Link href="/perfil" onClick={() => setOpen(false)}>
                Mi perfil
              </Link>
              <button type="button" className="linklike" onClick={logout}>
                Salir
              </button>
            </>
          )}
          <a
            className="nav-cta"
            href={waLink()}
            target="_blank"
            rel="noopener noreferrer"
          >
            Cotizar por WhatsApp
          </a>
        </div>
      )}
    </>
  );
}
