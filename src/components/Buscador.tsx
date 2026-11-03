"use client";

import { usePathname, useRouter } from "next/navigation";
import { ArrowRight, Search, X } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { asset } from "@/lib/asset";
import type { buscar as Buscar } from "@/lib/busqueda";
import { imagenPrincipal, marcaCompleta, referenciaPrincipal } from "@/lib/producto";
import type { Producto } from "@/lib/types";
import { Foto } from "./Foto";

export const PLACEHOLDER = "Buscar equipo, referencia, categoría, marca o característica...";

const EJEMPLOS = ["SDX42LIK", "4200 kg", "elevador furgones", "alineador 3D", "R1234yf", "desmontadora 26 pulgadas", "compresor 10 bar"];

type Props = {
  grande?: boolean;
  autoFocus?: boolean;
  alNavegar?: () => void;
  mostrarEjemplos?: boolean;
};

/** Buscador con resultados en vivo mientras se escribe. */
export function Buscador({ grande = false, autoFocus = false, alNavegar, mostrarEjemplos = false }: Props) {
  const router = useRouter();
  const ruta = usePathname();
  const [q, setQ] = useState("");
  const [abierto, setAbierto] = useState(false);
  const [activo, setActivo] = useState(-1);
  const input = useRef<HTMLInputElement>(null);
  const caja = useRef<HTMLDivElement>(null);
  const idLista = useId();

  // Los datos del catálogo se cargan al empezar a usar el buscador, no con la página.
  const [motor, setMotor] = useState<{ buscar: typeof Buscar; productos: Producto[] } | null>(null);
  const cargando = useRef(false);
  function cargar() {
    if (cargando.current) return;
    cargando.current = true;
    Promise.all([import("@/lib/busqueda"), import("@/lib/catalogo")]).then(([b, c]) =>
      setMotor({ buscar: b.buscar, productos: c.todosLosProductos() }),
    );
  }

  const { resultados, parcial } = useMemo(
    () => (motor ? motor.buscar(motor.productos, q) : { resultados: [], parcial: false }),
    [motor, q],
  );
  const visibles = q.trim() ? resultados.slice(0, 6) : [];

  useEffect(() => {
    if (autoFocus) {
      input.current?.focus();
      cargar();
    }
  }, [autoFocus]);

  useEffect(() => {
    const cerrar = (e: MouseEvent) => {
      if (!caja.current?.contains(e.target as Node)) setAbierto(false);
    };
    document.addEventListener("mousedown", cerrar);
    return () => document.removeEventListener("mousedown", cerrar);
  }, []);

  function ir(url: string) {
    setAbierto(false);
    alNavegar?.();
    router.push(url);
  }

  function verTodos() {
    const t = q.trim();
    const url = t ? `/catalogo/?q=${encodeURIComponent(t)}` : "/catalogo/";
    if (ruta === "/catalogo/" || ruta === "/catalogo") {
      // Ya estamos en el catálogo: se cambia la URL y se avisa al explorador.
      setAbierto(false);
      alNavegar?.();
      window.history.pushState(null, "", asset(url));
      window.dispatchEvent(new Event("cm:url"));
    } else ir(url);
  }

  function teclado(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setAbierto(true);
      setActivo((a) => Math.min(a + 1, visibles.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActivo((a) => Math.max(a - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activo >= 0 && activo < visibles.length) ir(`/producto/${visibles[activo].producto.id}/`);
      else verTodos();
    } else if (e.key === "Escape") {
      setAbierto(false);
    }
  }

  const mostrarLista = abierto && q.trim().length > 0;

  return (
    <div ref={caja} className="relative w-full">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          verTodos();
        }}
      >
        <label htmlFor={`${idLista}-input`} className="sr-only">
          Buscar en el catálogo
        </label>
        <div
          className={`flex items-center gap-3 rounded-2xl border bg-white text-marino-950 shadow-tarjeta transition-shadow focus-within:border-acento-500 focus-within:shadow-elevada ${
            grande ? "h-14 border-transparent px-5 sm:h-16" : "h-12 border-slate-200 px-4"
          }`}
        >
          <Search className={`shrink-0 text-marino-700 ${grande ? "h-6 w-6" : "h-5 w-5"}`} aria-hidden="true" />
          <input
            ref={input}
            id={`${idLista}-input`}
            type="search"
            role="combobox"
            aria-expanded={mostrarLista}
            aria-controls={idLista}
            aria-autocomplete="list"
            aria-activedescendant={activo >= 0 ? `${idLista}-${activo}` : undefined}
            autoComplete="off"
            spellCheck={false}
            placeholder={PLACEHOLDER}
            value={q}
            onChange={(e) => {
              cargar();
              setQ(e.target.value);
              setActivo(-1);
              setAbierto(true);
            }}
            onFocus={() => {
              cargar();
              setAbierto(true);
            }}
            onPointerEnter={cargar}
            onKeyDown={teclado}
            className={`min-w-0 flex-1 bg-transparent outline-none placeholder:text-slate-600 [&::-webkit-search-cancel-button]:hidden ${
              grande ? "text-base sm:text-lg" : "text-base"
            }`}
          />
          {q && (
            <button
              type="button"
              onClick={() => {
                setQ("");
                input.current?.focus();
              }}
              className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100"
              aria-label="Borrar búsqueda"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          )}
        </div>
      </form>

      {mostrarLista && (
        <div className="absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white text-marino-950 shadow-elevada">
          {parcial && (
            <p className="border-b border-slate-100 bg-acento-50 px-4 py-2 text-xs text-acento-600">
              Sin coincidencia exacta: resultados que cumplen parte de la búsqueda.
            </p>
          )}
          <ul id={idLista} role="listbox" aria-label="Resultados" className="max-h-[60vh] overflow-y-auto py-1">
            {visibles.length === 0 && (
              <li className="px-4 py-6 text-center text-sm text-slate-600">{motor ? `Ningún equipo coincide con «${q}».` : "Cargando catálogo…"}</li>
            )}
            {visibles.map(({ producto: p }, i) => (
              <li
                key={p.id}
                id={`${idLista}-${i}`}
                role="option"
                aria-selected={i === activo}
                onMouseEnter={() => setActivo(i)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => ir(`/producto/${p.id}/`)}
                className={`flex w-full cursor-pointer items-center gap-4 px-4 py-2.5 text-left ${i === activo ? "bg-marino-50" : ""}`}
              >
                  <span className="foto-fondo flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg">
                    <Foto imagen={imagenPrincipal(p)} pequena className="h-full w-full p-1" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[11px] font-semibold uppercase tracking-wider text-acento-600">{marcaCompleta(p)}</span>
                    <span className="block truncate font-display text-lg font-semibold leading-tight">{p.modelo}</span>
                    <span className="block truncate text-sm text-slate-600">
                      {p.tipoEquipo} · <span className="font-mono text-xs">{referenciaPrincipal(p)}</span>
                    </span>
                  </span>
              </li>
            ))}
          </ul>
          {resultados.length > 0 && (
            <button
              type="button"
              onClick={verTodos}
              onMouseEnter={() => setActivo(visibles.length)}
              className={`flex w-full items-center justify-between border-t border-slate-100 px-4 py-3 text-sm font-semibold text-marino-800 ${
                activo === visibles.length ? "bg-marino-50" : ""
              }`}
            >
              Ver todos los resultados ({resultados.length})
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
      )}

      {mostrarEjemplos && (
        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-marino-100/80">Prueba:</span>
          {EJEMPLOS.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => {
                cargar();
                setQ(e);
                setAbierto(true);
                input.current?.focus();
              }}
              className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-white transition-colors hover:bg-white/20"
            >
              {e}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
