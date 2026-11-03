"use client";

import { usePathname } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { asset } from "@/lib/asset";
import { buscar } from "@/lib/busqueda";
import { productosDeFamilia, todosLosProductos } from "@/lib/catalogo";
import {
  aplicarFiltros,
  FILTROS,
  FILTROS_GENERALES,
  filtrosVisibles,
  opciones,
  type DefinicionFiltro,
  type Seleccion,
} from "@/lib/filtros";
import type { FamiliaId, Producto } from "@/lib/types";
import { TarjetaProducto } from "./TarjetaProducto";

type Orden = "catalogo" | "modelo" | "relevancia";

function leerSeleccion(params: URLSearchParams): Seleccion {
  const s: Seleccion = {};
  params.forEach((v, k) => {
    if (k.startsWith("f.")) s[k.slice(2)] = v.split("|").filter(Boolean);
  });
  return s;
}

/** Evento con el que el buscador global avisa de una búsqueda nueva en esta página. */
export const EVENTO_URL = "cm:url";

/**
 * Buscador + filtros + rejilla. Mantiene el estado en la URL para poder
 * compartirlo. La URL se lee tras la hidratación (no con useSearchParams) para
 * que la rejilla completa venga ya pintada en el HTML estático.
 */
export function Explorador({ familia }: { familia?: FamiliaId }) {
  const ruta = usePathname();
  const [{ q, seleccion }, setEstado] = useState<{ q: string; seleccion: Seleccion }>({ q: "", seleccion: {} });
  const [texto, setTexto] = useState("");
  const [orden, setOrden] = useState<Orden>("catalogo");
  const [panel, setPanel] = useState(false);

  useEffect(() => {
    const leer = () => {
      const p = new URLSearchParams(window.location.search);
      const nuevaQ = p.get("q") ?? "";
      setEstado({ q: nuevaQ, seleccion: leerSeleccion(p) });
      setTexto(nuevaQ);
      if (nuevaQ) setOrden("relevancia");
    };
    leer();
    window.addEventListener("popstate", leer);
    window.addEventListener(EVENTO_URL, leer);
    return () => {
      window.removeEventListener("popstate", leer);
      window.removeEventListener(EVENTO_URL, leer);
    };
  }, []);

  const base: Producto[] = useMemo(() => (familia ? productosDeFamilia(familia) : todosLosProductos()), [familia]);
  const defs: DefinicionFiltro[] = familia ? FILTROS[familia] : FILTROS_GENERALES;
  const visibles = filtrosVisibles(defs, seleccion);

  const { lista, parcial } = useMemo(() => {
    const { resultados, parcial } = buscar(base, q);
    let lista = aplicarFiltros(
      resultados.map((r) => r.producto),
      visibles,
      seleccion,
    );
    if (orden === "modelo") lista = [...lista].sort((a, b) => a.modelo.localeCompare(b.modelo, "es"));
    if (orden === "catalogo" && q) lista = base.filter((p) => lista.includes(p));
    return { lista, parcial };
  }, [base, q, seleccion, visibles, orden]);

  function actualizar(cambios: { q?: string; seleccion?: Seleccion }) {
    const p = new URLSearchParams();
    const nuevaQ = cambios.q ?? q;
    if (nuevaQ) p.set("q", nuevaQ);
    const sel = cambios.seleccion ?? seleccion;
    // Al cambiar de subfamilia se descartan filtros que ya no aplican.
    const validos = filtrosVisibles(defs, sel).map((d) => d.id);
    for (const [k, v] of Object.entries(sel)) if (v.length && validos.includes(k)) p.set(`f.${k}`, v.join("|"));
    const s = p.toString();
    window.history.replaceState(null, "", asset(s ? `${ruta}?${s}` : ruta));
    const nueva: Seleccion = {};
    for (const [k, v] of Object.entries(sel)) if (v.length && validos.includes(k)) nueva[k] = v;
    setEstado({ q: nuevaQ, seleccion: nueva });
  }

  function alternar(id: string, valor: string) {
    const actual = seleccion[id] ?? [];
    const nuevo = actual.includes(valor) ? actual.filter((v) => v !== valor) : [...actual, valor];
    actualizar({ seleccion: { ...seleccion, [id]: nuevo } });
  }

  const activos = visibles.flatMap((d) => (seleccion[d.id] ?? []).map((v) => ({ d, v })));

  const panelFiltros = (
    <div className="space-y-6">
      {visibles.map((d) => {
        const ops = opciones(base, d, visibles, seleccion);
        // Un filtro que no reduce la lista (sin opciones, o una sola que tienen todos) no aporta.
        const inutil = !ops.length || (ops.length === 1 && base.every((p) => d.valores(p).includes(ops[0].valor)));
        if (inutil && !seleccion[d.id]?.length) return null;
        return (
          <fieldset key={d.id}>
            <legend className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-600">{d.etiqueta}</legend>
            <div className="flex flex-wrap gap-2">
              {ops.map((o) => {
                const on = seleccion[d.id]?.includes(o.valor) ?? false;
                const vacio = o.cuenta === 0 && !on;
                return (
                  <button
                    key={o.valor}
                    type="button"
                    aria-pressed={on}
                    disabled={vacio}
                    onClick={() => alternar(d.id, o.valor)}
                    className={`inline-flex min-h-10 items-center gap-2 rounded-xl border px-3 py-1.5 text-sm transition-colors ${
                      on
                        ? "border-marino-800 bg-marino-800 text-white"
                        : vacio
                          ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400"
                          : "border-slate-200 bg-white text-marino-900 hover:border-marino-600"
                    }`}
                  >
                    {o.valor}
                    <span className={`text-xs ${on ? "text-marino-100" : "text-slate-600"}`}>{o.cuenta}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>
        );
      })}
    </div>
  );

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 py-6 sm:flex-row sm:items-center">
        <form
          role="search"
          className="flex-1"
          onSubmit={(e) => {
            e.preventDefault();
            setOrden(texto.trim() ? "relevancia" : "catalogo");
            actualizar({ q: texto.trim() });
          }}
        >
          <label htmlFor="buscar-lista" className="sr-only">
            Buscar en esta lista
          </label>
          <div className="flex h-12 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 shadow-tarjeta focus-within:border-acento-500">
            <Search className="h-5 w-5 text-marino-700" aria-hidden="true" />
            <input
              id="buscar-lista"
              type="search"
              value={texto}
              onChange={(e) => {
                setTexto(e.target.value);
                if (e.target.value.trim()) setOrden("relevancia");
                actualizar({ q: e.target.value.trim() });
              }}
              placeholder={familia ? "Filtrar por modelo, referencia o característica..." : "Buscar equipo, referencia, categoría, marca o característica..."}
              className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-slate-600 [&::-webkit-search-cancel-button]:hidden"
              autoComplete="off"
            />
            {texto && (
              <button
                type="button"
                className="rounded-md p-1 text-slate-600 hover:bg-slate-100"
                aria-label="Borrar búsqueda"
                onClick={() => {
                  setTexto("");
                  setOrden("catalogo");
                  actualizar({ q: "" });
                }}
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            )}
          </div>
        </form>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPanel(true)}
            className="inline-flex h-12 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-marino-900 shadow-tarjeta lg:hidden"
          >
            <SlidersHorizontal className="h-5 w-5" aria-hidden="true" /> Filtros
            {activos.length > 0 && (
              <span className="rounded-full bg-acento-500 px-2 text-xs font-bold text-marino-950">{activos.length}</span>
            )}
          </button>
          <label className="sr-only" htmlFor="orden">
            Ordenar
          </label>
          <select
            id="orden"
            value={orden}
            onChange={(e) => setOrden(e.target.value as Orden)}
            className="h-12 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-marino-900 shadow-tarjeta"
          >
            {q && <option value="relevancia">Más relevantes</option>}
            <option value="catalogo">Orden del catálogo</option>
            <option value="modelo">Modelo A–Z</option>
          </select>
        </div>
      </div>

      <div className="flex gap-8">
        <aside className="hidden w-72 shrink-0 lg:block" aria-label="Filtros">
          <div className="sticky top-24 max-h-[calc(100dvh-7rem)] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-tarjeta">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
                <SlidersHorizontal className="h-5 w-5 text-marino-700" aria-hidden="true" /> Filtros
              </h2>
              {activos.length > 0 && (
                <button type="button" onClick={() => actualizar({ seleccion: {} })} className="text-sm font-medium text-marino-700 hover:underline">
                  Limpiar
                </button>
              )}
            </div>
            {panelFiltros}
          </div>
        </aside>

        <section className="min-w-0 flex-1" aria-live="polite" aria-labelledby="titulo-resultados">
          <h2 id="titulo-resultados" className="sr-only">
            Equipos
          </h2>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <p className="mr-2 text-sm text-slate-600">
              <strong className="text-marino-950">{lista.length}</strong> {lista.length === 1 ? "equipo" : "equipos"}
              {q && (
                <>
                  {" "}
                  para «<span className="font-medium text-marino-950">{q}</span>»
                </>
              )}
            </p>
            {activos.map(({ d, v }) => (
              <button
                key={`${d.id}-${v}`}
                type="button"
                onClick={() => alternar(d.id, v)}
                className="inline-flex items-center gap-1 rounded-full bg-marino-100 px-3 py-1 text-sm font-medium text-marino-900 hover:bg-marino-200"
                aria-label={`Quitar filtro ${d.etiqueta}: ${v}`}
              >
                {v} <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            ))}
          </div>
          {parcial && lista.length > 0 && (
            <p className="mb-4 rounded-xl bg-acento-50 px-4 py-3 text-sm text-acento-600">
              Ningún equipo cumple todas las palabras; se muestran los que cumplen parte de la búsqueda.
            </p>
          )}
          {lista.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
              <p className="font-display text-xl font-semibold">Ningún equipo coincide</p>
              <p className="mt-2 text-slate-600">Prueba con otra palabra o quita algún filtro.</p>
              <button
                type="button"
                onClick={() => {
                  setTexto("");
                  actualizar({ q: "", seleccion: {} });
                }}
                className="mt-6 rounded-xl bg-marino-900 px-5 py-3 text-sm font-semibold text-white"
              >
                Ver todos
              </button>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {lista.map((p, i) => (
                <TarjetaProducto key={p.id} producto={p} prioridad={i < 3} />
              ))}
            </div>
          )}
        </section>
      </div>

      {panel && (
        <div role="dialog" aria-modal="true" aria-label="Filtros" className="fixed inset-0 z-50 flex lg:hidden">
          <button type="button" className="flex-1 bg-marino-950/50" aria-label="Cerrar filtros" onClick={() => setPanel(false)} />
          <div className="flex w-full max-w-sm flex-col bg-white shadow-elevada">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <h2 className="font-display text-xl font-semibold">Filtros</h2>
              <button type="button" onClick={() => setPanel(false)} className="rounded-lg p-2 hover:bg-slate-100" aria-label="Cerrar">
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">{panelFiltros}</div>
            <div className="flex gap-3 border-t border-slate-200 p-4">
              <button type="button" onClick={() => actualizar({ seleccion: {} })} className="h-12 flex-1 rounded-xl border border-slate-200 font-semibold">
                Limpiar
              </button>
              <button type="button" onClick={() => setPanel(false)} className="h-12 flex-[2] rounded-xl bg-marino-900 font-semibold text-white">
                Ver {lista.length} {lista.length === 1 ? "equipo" : "equipos"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
