"use client";

import Link from "next/link";
import { ArrowRight, GitCompareArrows, X } from "lucide-react";
import { useState } from "react";
import { imagenPrincipal, marcaCompleta, productoPorId, referenciaPrincipal } from "@/lib/catalogo";
import { MAX_COMPARAR, tablaComparativa, type FilaTabla } from "@/lib/comparador";
import { FAMILIAS, nombreFamilia } from "@/lib/familias";
import { useStore } from "@/lib/store";
import type { Producto } from "@/lib/types";
import { Foto } from "./Foto";

function Filas({ filas, soloDiferencias, n }: { filas: FilaTabla[]; soloDiferencias: boolean; n: number }) {
  const visibles = soloDiferencias ? filas.filter((f) => f.diferente) : filas;
  if (!visibles.length)
    return (
      <tr>
        <td colSpan={n + 1} className="px-4 py-6 text-center text-sm text-slate-600">
          No hay diferencias en este bloque.
        </td>
      </tr>
    );
  return (
    <>
      {visibles.map((f) => (
        <tr key={f.etiqueta} className={`border-t border-slate-100 ${f.diferente ? "bg-acento-50/60" : ""}`}>
          <th
            scope="row"
            className={`sticky left-0 z-10 w-44 border-r border-slate-100 px-4 py-3 text-left text-sm font-medium text-slate-700 ${
              f.diferente ? "bg-acento-50" : "bg-white"
            }`}
          >
            <span className="flex items-center gap-2">
              {f.diferente && <span className="h-2 w-2 shrink-0 rounded-full bg-acento-500" title="Valores distintos" aria-label="Valores distintos" />}
              {f.etiqueta}
            </span>
          </th>
          {f.valores.map((v, i) => (
            <td key={i} className={`px-4 py-3 text-sm ${v === "ND" ? "text-slate-500" : "font-medium text-marino-950"}`}>
              {v}
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export function Comparador() {
  const { comparar, quitarComparar, vaciarComparador, listo } = useStore();
  const [soloDiferencias, setSoloDiferencias] = useState(false);
  const productos = comparar.map(productoPorId).filter((p): p is Producto => !!p);

  if (!listo) return <div className="h-96" />;

  if (!productos.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
        <GitCompareArrows className="mx-auto h-10 w-10 text-marino-700" aria-hidden="true" />
        <p className="mt-4 font-display text-2xl font-semibold">Aún no hay equipos para comparar</p>
        <p className="mx-auto mt-2 max-w-md text-slate-600">
          Pulsa el botón de comparar en las tarjetas o en la ficha. Se pueden comparar hasta {MAX_COMPARAR} equipos de la misma familia.
        </p>
        <ul className="mt-8 flex flex-wrap justify-center gap-2">
          {FAMILIAS.map((f) => (
            <li key={f.id}>
              <Link href={`/categoria/${f.id}/`} className="inline-flex rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold hover:border-marino-600">
                {f.nombre}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const { principales, tecnicos } = tablaComparativa(productos);
  const familia = productos[0].familia;
  const n = productos.length;

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <p className="text-sm text-slate-600">
          <strong className="text-marino-950">{n}</strong> equipos de <strong className="text-marino-950">{nombreFamilia(familia)}</strong>
          {n < MAX_COMPARAR && (
            <>
              {" · "}
              <Link href={`/categoria/${familia}/`} className="font-semibold text-marino-800 hover:underline">
                añadir más
              </Link>
            </>
          )}
        </p>
        <label className="ml-auto inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium">
          <input type="checkbox" checked={soloDiferencias} onChange={(e) => setSoloDiferencias(e.target.checked)} className="h-4 w-4 accent-[#f39200]" />
          Mostrar solo diferencias
        </label>
        <button type="button" onClick={vaciarComparador} className="rounded-xl px-3 py-2 text-sm font-medium text-marino-800 hover:bg-marino-50">
          Vaciar comparador
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-tarjeta">
        <table className="w-full min-w-[640px] border-collapse">
          <caption className="sr-only">Comparativa de equipos</caption>
          <thead>
            <tr>
              <th scope="col" className="sticky left-0 z-10 w-44 border-r border-slate-100 bg-white px-4 py-4 text-left align-bottom text-xs font-bold uppercase tracking-[0.12em] text-slate-600">
                Característica
              </th>
              {productos.map((p) => (
                <th key={p.id} scope="col" className="min-w-[200px] px-4 py-4 text-left align-top font-normal">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => quitarComparar(p.id)}
                      className="absolute right-0 top-0 z-10 rounded-lg bg-white/90 p-1.5 text-slate-600 shadow-sm hover:text-marino-950"
                      aria-label={`Quitar ${p.modelo}`}
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <div className="foto-fondo flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl">
                      <Foto imagen={imagenPrincipal(p)} pequena className="h-full w-full p-3" />
                    </div>
                    <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-acento-600">{marcaCompleta(p)}</p>
                    <p className="font-display text-xl font-semibold leading-tight text-marino-950">{p.modelo}</p>
                    <p className="font-mono text-xs text-slate-600">{referenciaPrincipal(p)}</p>
                    <Link href={`/producto/${p.id}/`} className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-marino-800 hover:underline">
                      Ver ficha <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <th colSpan={n + 1} scope="colgroup" className="bg-marino-900 px-4 py-2 text-left text-xs font-bold uppercase tracking-[0.14em] text-white">
                Características principales
              </th>
            </tr>
            <Filas filas={principales} soloDiferencias={soloDiferencias} n={n} />
            {tecnicos.length > 0 && (
              <>
                <tr>
                  <th colSpan={n + 1} scope="colgroup" className="bg-marino-900 px-4 py-2 text-left text-xs font-bold uppercase tracking-[0.14em] text-white">
                    Datos técnicos
                  </th>
                </tr>
                <Filas filas={tecnicos} soloDiferencias={soloDiferencias} n={n} />
              </>
            )}
          </tbody>
        </table>
      </div>
      <p className="mt-3 flex items-center gap-2 text-sm text-slate-600">
        <span className="h-2 w-2 rounded-full bg-acento-500" aria-hidden="true" /> Filas resaltadas: los equipos tienen valores distintos. «ND»: dato no
        disponible en el catálogo.
      </p>
    </div>
  );
}
