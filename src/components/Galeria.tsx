"use client";

import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { Imagen } from "@/lib/types";
import { Foto } from "./Foto";

/** Galería de la ficha: foto principal, miniaturas y visor a pantalla completa. */
export function Galeria({ imagenes, modelo }: { imagenes: Imagen[]; modelo: string }) {
  const fotos = imagenes.filter((i) => i.tipo !== "plano");
  const [actual, setActual] = useState(0);
  const [visor, setVisor] = useState(false);
  const total = fotos.length;
  const mover = useCallback((d: number) => setActual((a) => (a + d + total) % total), [total]);

  useEffect(() => {
    if (!visor) return;
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") setVisor(false);
      if (e.key === "ArrowRight") mover(1);
      if (e.key === "ArrowLeft") mover(-1);
    };
    window.addEventListener("keydown", tecla);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", tecla);
      document.body.style.overflow = "";
    };
  }, [visor, mover]);

  if (!total) return <Foto className="foto-fondo aspect-square w-full rounded-2xl" />;
  const img = fotos[actual];

  return (
    <div>
      <div className="foto-fondo group relative aspect-[4/3] overflow-hidden rounded-2xl border border-slate-200/80 lg:aspect-square">
        <button
          type="button"
          onClick={() => setVisor(true)}
          className="flex h-full w-full items-center justify-center p-6"
          aria-label={`Ampliar imagen: ${img.alt}`}
        >
          <Foto imagen={img} prioridad={actual === 0} className="max-h-full max-w-full" />
        </button>
        <span className="no-print pointer-events-none absolute right-3 top-3 inline-flex items-center gap-1 rounded-lg bg-white/90 px-2 py-1 text-xs font-medium text-slate-600 shadow-sm">
          <Expand className="h-3.5 w-3.5" aria-hidden="true" /> Ampliar
        </span>
        {total > 1 && (
          <>
            <button
              type="button"
              onClick={() => mover(-1)}
              className="no-print absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-tarjeta hover:bg-white"
              aria-label="Imagen anterior"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => mover(1)}
              className="no-print absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-tarjeta hover:bg-white"
              aria-label="Imagen siguiente"
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </>
        )}
      </div>
      <p className="mt-2 text-center text-sm text-slate-600">{img.alt}</p>

      {total > 1 && (
        <ul className="no-print mt-3 grid grid-cols-5 gap-2 sm:grid-cols-6" aria-label={`Imágenes de ${modelo}`}>
          {fotos.map((f, i) => (
            <li key={f.src}>
              <button
                type="button"
                onClick={() => setActual(i)}
                aria-label={`Ver imagen ${i + 1}: ${f.alt}`}
                aria-current={i === actual}
                className={`foto-fondo flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl border-2 p-1 ${
                  i === actual ? "border-acento-500" : "border-transparent hover:border-marino-200"
                }`}
              >
                <Foto imagen={f} pequena className="h-full w-full" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {visor && (
        <div role="dialog" aria-modal="true" aria-label={`Imagen ampliada de ${modelo}`} className="fixed inset-0 z-[70] flex flex-col bg-marino-950/95">
          <div className="flex items-center justify-between px-4 py-3 text-white">
            <p className="text-sm">
              {actual + 1} / {total} · {img.alt}
            </p>
            <button type="button" onClick={() => setVisor(false)} className="rounded-lg p-2 hover:bg-white/10" aria-label="Cerrar" autoFocus>
              <X className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <div className="relative flex flex-1 items-center justify-center overflow-hidden p-4">
            <div className="flex max-h-full max-w-5xl items-center justify-center rounded-2xl bg-white p-6">
              <Foto imagen={img} className="max-h-[78vh] max-w-full" />
            </div>
            {total > 1 && (
              <>
                <button type="button" onClick={() => mover(-1)} className="absolute left-4 rounded-full bg-white/15 p-3 text-white hover:bg-white/25" aria-label="Anterior">
                  <ChevronLeft className="h-6 w-6" aria-hidden="true" />
                </button>
                <button type="button" onClick={() => mover(1)} className="absolute right-4 rounded-full bg-white/15 p-3 text-white hover:bg-white/25" aria-label="Siguiente">
                  <ChevronRight className="h-6 w-6" aria-hidden="true" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
