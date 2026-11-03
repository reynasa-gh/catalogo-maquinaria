"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, GitCompareArrows, Heart, Menu, Search, WandSparkles, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { FAMILIAS } from "@/lib/familias";
import { cuentaFamilia } from "@/lib/resumen";
import { useStore } from "@/lib/store";
import { Buscador } from "./Buscador";
import { IconoFamilia } from "./IconoFamilia";
import { Logo } from "./Logo";

function Contador({ n }: { n: number }) {
  if (!n) return null;
  return (
    <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-acento-500 px-1.5 text-[11px] font-bold text-marino-950">
      {n}
    </span>
  );
}

export function Cabecera() {
  const ruta = usePathname();
  const { presentacion, comparar, favoritos, listo } = useStore();
  const [busqueda, setBusqueda] = useState(false);
  const [menu, setMenu] = useState(false);
  const [categorias, setCategorias] = useState(false);
  const refCategorias = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMenu(false);
    setCategorias(false);
    setBusqueda(false);
  }, [ruta]);

  useEffect(() => {
    const atajo = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      const escribiendo = t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable;
      if ((e.key === "k" && (e.ctrlKey || e.metaKey)) || (e.key === "/" && !escribiendo)) {
        e.preventDefault();
        setBusqueda(true);
      }
      if (e.key === "Escape") {
        setBusqueda(false);
        setCategorias(false);
        setMenu(false);
      }
    };
    const fuera = (e: MouseEvent) => {
      if (!refCategorias.current?.contains(e.target as Node)) setCategorias(false);
    };
    window.addEventListener("keydown", atajo);
    document.addEventListener("mousedown", fuera);
    return () => {
      window.removeEventListener("keydown", atajo);
      document.removeEventListener("mousedown", fuera);
    };
  }, []);

  if (presentacion) return null;

  const activo = (prefijo: string) => ruta === prefijo || ruta.startsWith(prefijo);
  const enlace = (href: string, on: boolean) =>
    `inline-flex h-10 items-center whitespace-nowrap rounded-lg px-2.5 text-[13px] font-semibold uppercase tracking-wide transition-colors xl:px-3 xl:text-sm ${
      on ? "bg-white/10 text-white" : "text-marino-100 hover:bg-white/10 hover:text-white"
    }`;

  return (
    <header data-cabecera className="sticky top-0 z-40 bg-marino-900 text-white shadow-[0_1px_0_rgb(255_255_255/0.06)]">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="mr-2 rounded-lg">
          <Logo claro />
        </Link>

        <nav aria-label="Principal" className="ml-auto hidden items-center gap-0.5 lg:flex xl:gap-1">
          <Link href="/catalogo/" className={enlace("/catalogo/", activo("/catalogo"))}>
            Catálogo
          </Link>
          <div ref={refCategorias} className="relative">
            <button
              type="button"
              aria-expanded={categorias}
              aria-controls="menu-categorias"
              onClick={() => setCategorias((v) => !v)}
              className={`${enlace("", activo("/categoria"))} gap-1`}
            >
              Categorías <ChevronDown className={`h-4 w-4 transition-transform ${categorias ? "rotate-180" : ""}`} aria-hidden="true" />
            </button>
            {categorias && (
              <div id="menu-categorias" className="absolute right-0 top-full mt-2 w-80 rounded-2xl border border-slate-200 bg-white p-2 text-marino-950 shadow-elevada">
                {FAMILIAS.map((f) => (
                  <Link
                    key={f.id}
                    href={`/categoria/${f.id}/`}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-marino-50"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-marino-50 text-marino-800">
                      <IconoFamilia familia={f.id} className="h-5 w-5" />
                    </span>
                    <span className="flex-1 font-semibold">{f.nombre}</span>
                    <span className="text-sm text-slate-600">{cuentaFamilia(f.id)}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
          <Link href="/asistente/" className={enlace("/asistente/", activo("/asistente"))}>
            ¿Qué necesito?
          </Link>
          <Link href="/comparador/" className={enlace("/comparador/", activo("/comparador"))}>
            Comparador {listo && <Contador n={comparar.length} />}
          </Link>
          <Link href="/favoritos/" className={enlace("/favoritos/", activo("/favoritos"))}>
            Favoritos {listo && <Contador n={favoritos.length} />}
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => setBusqueda(true)}
          className="ml-auto inline-flex h-10 items-center gap-2 rounded-xl bg-white/10 px-3 text-sm font-medium text-white transition-colors hover:bg-white/20 lg:ml-2"
          aria-label="Buscar (atajo: /)"
        >
          <Search className="h-5 w-5" aria-hidden="true" />
          <span className="hidden sm:inline">Buscar</span>
          <kbd className="hidden rounded border border-white/25 px-1.5 text-xs text-marino-100 xl:inline">/</kbd>
        </button>

        <button
          type="button"
          onClick={() => setMenu((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 lg:hidden"
          aria-expanded={menu}
          aria-controls="menu-movil"
          aria-label={menu ? "Cerrar menú" : "Abrir menú"}
        >
          {menu ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
        </button>
      </div>

      {menu && (
        <nav id="menu-movil" aria-label="Menú" className="border-t border-white/10 bg-marino-900 px-4 pb-5 pt-2 lg:hidden">
          <div className="grid grid-cols-3 gap-2 py-2">
            <Link href="/asistente/" className="flex flex-col items-center gap-1 rounded-xl bg-white/10 px-2 py-3 text-center text-xs font-semibold">
              <WandSparkles className="h-5 w-5 text-acento-400" aria-hidden="true" /> ¿Qué necesito?
            </Link>
            <Link href="/comparador/" className="flex flex-col items-center gap-1 rounded-xl bg-white/10 px-2 py-3 text-center text-xs font-semibold">
              <GitCompareArrows className="h-5 w-5 text-acento-400" aria-hidden="true" />
              <span>Comparador {listo && <Contador n={comparar.length} />}</span>
            </Link>
            <Link href="/favoritos/" className="flex flex-col items-center gap-1 rounded-xl bg-white/10 px-2 py-3 text-center text-xs font-semibold">
              <Heart className="h-5 w-5 text-acento-400" aria-hidden="true" />
              <span>Favoritos {listo && <Contador n={favoritos.length} />}</span>
            </Link>
          </div>
          <Link href="/catalogo/" className="mt-1 block rounded-lg px-3 py-3 font-semibold">
            Todo el catálogo
          </Link>
          {FAMILIAS.map((f) => (
            <Link key={f.id} href={`/categoria/${f.id}/`} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-marino-100 hover:bg-white/10">
              <IconoFamilia familia={f.id} className="h-5 w-5" />
              <span className="flex-1">{f.nombre}</span>
              <span className="text-sm opacity-70">{cuentaFamilia(f.id)}</span>
            </Link>
          ))}
        </nav>
      )}

      {busqueda && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Buscar en el catálogo"
          className="fixed inset-0 z-50 bg-marino-950/60 px-4 pt-[12vh] backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setBusqueda(false);
          }}
        >
          <div className="mx-auto max-w-2xl">
            <div className="mb-3 flex justify-end">
              <button
                type="button"
                onClick={() => setBusqueda(false)}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm text-white/90 hover:bg-white/10"
              >
                <X className="h-4 w-4" aria-hidden="true" /> Cerrar
              </button>
            </div>
            <Buscador grande autoFocus alNavegar={() => setBusqueda(false)} />
          </div>
        </div>
      )}
    </header>
  );
}
