"use client";

import { useId, useRef, useState, type ReactNode } from "react";

/** soloPantalla: no se imprime (su contenido ya está en la cabecera de la ficha). */
export type Pestana = { id: string; titulo: string; contenido: ReactNode; soloPantalla?: boolean };

/**
 * Pestañas accesibles (flechas para moverse). En móvil se muestran como
 * bloques desplegables; al imprimir se muestran todas.
 */
export function Pestanas({ pestanas }: { pestanas: Pestana[] }) {
  const [activa, setActiva] = useState(pestanas[0]?.id);
  const [abiertas, setAbiertas] = useState<string[]>([pestanas[0]?.id]);
  const base = useId();
  const botones = useRef<(HTMLButtonElement | null)[]>([]);

  function teclado(e: React.KeyboardEvent, i: number) {
    const n = pestanas.length;
    let j = -1;
    if (e.key === "ArrowRight") j = (i + 1) % n;
    if (e.key === "ArrowLeft") j = (i - 1 + n) % n;
    if (e.key === "Home") j = 0;
    if (e.key === "End") j = n - 1;
    if (j >= 0) {
      e.preventDefault();
      setActiva(pestanas[j].id);
      botones.current[j]?.focus();
    }
  }

  return (
    <>
      {/* Escritorio y tablet */}
      <div className="hidden md:block print:block">
        <div role="tablist" aria-label="Información técnica" className="flex flex-wrap gap-1 border-b border-slate-200">
          {pestanas.map((p, i) => (
            <button
              key={p.id}
              ref={(el) => {
                botones.current[i] = el;
              }}
              id={`${base}-tab-${p.id}`}
              role="tab"
              type="button"
              aria-selected={activa === p.id}
              aria-controls={`${base}-panel-${p.id}`}
              tabIndex={activa === p.id ? 0 : -1}
              onClick={() => setActiva(p.id)}
              onKeyDown={(e) => teclado(e, i)}
              className={`-mb-px rounded-t-lg border-b-[3px] px-4 py-3 text-sm font-semibold transition-colors ${
                activa === p.id ? "border-acento-500 text-marino-950" : "border-transparent text-slate-600 hover:text-marino-800"
              }`}
            >
              {p.titulo}
            </button>
          ))}
        </div>
        {pestanas.map((p) => (
          <div
            key={p.id}
            id={`${base}-panel-${p.id}`}
            role="tabpanel"
            aria-labelledby={`${base}-tab-${p.id}`}
            tabIndex={0}
            className={`py-6 print:py-3 ${p.soloPantalla ? "print:hidden" : "print:block"} ${activa === p.id ? "" : "hidden"}`}
          >
            <h2 className="solo-print mb-3 font-display text-xl font-semibold">{p.titulo}</h2>
            {p.contenido}
          </div>
        ))}
      </div>

      {/* Móvil: desplegables */}
      <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white md:hidden print:hidden">
        {pestanas.map((p) => {
          const abierta = abiertas.includes(p.id);
          return (
            <details
              key={p.id}
              open={abierta}
              onToggle={(e) => {
                const ahora = (e.currentTarget as HTMLDetailsElement).open;
                setAbiertas((a) => (ahora ? [...new Set([...a, p.id])] : a.filter((x) => x !== p.id)));
              }}
              className="group"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-4 font-semibold">
                {p.titulo}
                <span className="text-xl leading-none text-marino-700 transition-transform group-open:rotate-45" aria-hidden="true">
                  +
                </span>
              </summary>
              <div className="px-4 pb-5">{p.contenido}</div>
            </details>
          );
        })}
      </div>
    </>
  );
}
