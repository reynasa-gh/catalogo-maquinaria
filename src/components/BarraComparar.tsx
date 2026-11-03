"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, GitCompareArrows, X } from "lucide-react";
import { MAX_COMPARAR } from "@/lib/comparador";
import { nombreFamilia } from "@/lib/familias";
import { resumenPorId } from "@/lib/resumen";
import { useStore } from "@/lib/store";
import { Foto } from "./Foto";

/** Barra inferior con los equipos elegidos para comparar. */
export function BarraComparar() {
  const ruta = usePathname();
  const { comparar, quitarComparar, vaciarComparador, presentacion, listo } = useStore();
  if (!listo || presentacion || !comparar.length || ruta.startsWith("/comparador")) return null;
  const productos = comparar.map(resumenPorId).filter((p) => !!p);
  return (
    <div data-barra-comparar className="fixed inset-x-0 bottom-0 z-40 px-3 pb-3 sm:px-6">
      <div className="mx-auto flex max-w-4xl items-center gap-3 rounded-2xl border border-marino-800 bg-marino-950 p-3 text-white shadow-elevada">
        <GitCompareArrows className="ml-1 hidden h-6 w-6 shrink-0 text-acento-400 sm:block" aria-hidden="true" />
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wider text-marino-200">Comparar · {nombreFamilia(productos[0]!.familia)}</p>
          <p className="text-sm font-semibold">
            {productos.length} de {MAX_COMPARAR}
          </p>
        </div>
        <ul className="flex min-w-0 flex-1 gap-2 overflow-x-auto">
          {productos.map((p) => (
            <li key={p!.id} className="relative shrink-0">
              <div className="flex h-12 items-center gap-2 rounded-xl bg-white/10 pl-1 pr-8">
                <span className="foto-fondo flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg">
                  <Foto imagen={p!.imagen ?? undefined} pequena className="h-full w-full p-0.5" />
                </span>
                <span className="hidden max-w-[9rem] truncate text-sm font-medium md:block">{p!.modelo}</span>
              </div>
              <button
                type="button"
                onClick={() => quitarComparar(p!.id)}
                className="absolute right-1 top-1/2 -translate-y-1/2 rounded-md p-1 text-marino-200 hover:bg-white/10 hover:text-white"
                aria-label={`Quitar ${p!.modelo}`}
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
        <button type="button" onClick={vaciarComparador} className="hidden text-sm text-marino-200 hover:text-white sm:block">
          Vaciar
        </button>
        <Link
          href="/comparador/"
          className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl bg-acento-500 px-4 text-sm font-bold uppercase tracking-wide text-marino-950 hover:bg-acento-400"
        >
          Comparar <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
