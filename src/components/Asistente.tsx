"use client";

import Link from "next/link";
import { ArrowRight, Check, CircleAlert, RotateCcw } from "lucide-react";
import { useState } from "react";
import { AREAS, preguntasVisibles, recomendar, type Recomendacion } from "@/lib/asistente";
import { imagenPrincipal, marcaCompleta, todosLosProductos } from "@/lib/catalogo";
import { Foto } from "./Foto";
import { IconoFamilia } from "./IconoFamilia";

function Resultado({ r, revisar = false }: { r: Recomendacion; revisar?: boolean }) {
  const p = r.producto;
  return (
    <li className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-tarjeta sm:flex-row">
      <div className="foto-fondo flex h-36 shrink-0 items-center justify-center overflow-hidden rounded-xl sm:w-40">
        <Foto imagen={imagenPrincipal(p)} pequena className="h-full w-full p-2" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-acento-600">{marcaCompleta(p)}</p>
        <p className="font-display text-2xl font-semibold leading-tight">{p.modelo}</p>
        <p className="text-sm text-slate-600">{p.tipoEquipo}</p>
        {r.motivos.length > 0 && (
          <ul className="mt-3 space-y-1.5 text-sm">
            {r.motivos.map((m, i) => (
              <li key={i} className="flex gap-2">
                {m.estado === "si" ? (
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-label="Cumple" />
                ) : (
                  <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-acento-600" aria-label="Sin dato" />
                )}
                <span className={m.estado === "si" ? "text-slate-800" : "text-slate-600"}>{m.motivo}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="flex items-end">
        <Link
          href={`/producto/${p.id}/`}
          className={`inline-flex h-11 items-center gap-2 rounded-xl px-4 text-sm font-semibold ${
            revisar ? "border border-slate-200 text-marino-900" : "bg-marino-900 text-white hover:bg-marino-700"
          }`}
        >
          Ver ficha <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </li>
  );
}

export function Asistente() {
  const [areaId, setAreaId] = useState<string | null>(null);
  const [respuestas, setRespuestas] = useState<Record<string, string>>({});
  const area = AREAS.find((a) => a.id === areaId);

  if (!area) {
    return (
      <section aria-labelledby="paso1">
        <h2 id="paso1" className="font-display text-2xl font-semibold">
          ¿Qué necesitas equipar?
        </h2>
        <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {AREAS.map((a) => (
            <li key={a.id}>
              <button
                type="button"
                onClick={() => {
                  setAreaId(a.id);
                  setRespuestas({});
                }}
                className="flex w-full items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-tarjeta transition-colors hover:border-marino-600"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-marino-900 text-white">
                  <IconoFamilia familia={a.familia} className="h-6 w-6" />
                </span>
                <span>
                  <span className="block font-display text-xl font-semibold">{a.etiqueta}</span>
                  <span className="block text-sm text-slate-600">{a.descripcion}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>
    );
  }

  const preguntas = preguntasVisibles(area, respuestas);
  const respondidas = preguntas.filter((q) => respuestas[q.id]).length;
  const { recomendados, revisar } = recomendar(area, todosLosProductos(), respuestas);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center gap-2 rounded-xl bg-marino-900 px-3 py-2 text-sm font-semibold text-white">
          <IconoFamilia familia={area.familia} className="h-4 w-4" /> {area.etiqueta}
        </span>
        <button
          type="button"
          onClick={() => {
            setAreaId(null);
            setRespuestas({});
          }}
          className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-marino-800 hover:bg-marino-50"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" /> Empezar de nuevo
        </button>
      </div>

      <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-tarjeta sm:p-6">
        {preguntas.map((q) => (
          <fieldset key={q.id}>
            <legend className="mb-3 font-display text-xl font-semibold">
              {q.texto}
            </legend>
            <div className="flex flex-wrap gap-2">
              {q.opciones.map((o) => {
                const on = respuestas[q.id] === o.id;
                return (
                  <button
                    key={o.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() =>
                      setRespuestas((r) => {
                        const n = { ...r };
                        if (on) delete n[q.id];
                        else n[q.id] = o.id;
                        return n;
                      })
                    }
                    className={`min-h-12 rounded-xl border px-4 py-2 text-[15px] font-medium transition-colors ${
                      on ? "border-marino-800 bg-marino-800 text-white" : "border-slate-200 bg-white hover:border-marino-600"
                    }`}
                  >
                    {o.etiqueta}
                  </button>
                );
              })}
            </div>
          </fieldset>
        ))}
      </div>

      <section aria-labelledby="resultados" aria-live="polite">
        <h2 id="resultados" className="font-display text-2xl font-semibold">
          Equipos recomendados {respondidas > 0 && <span className="text-base font-medium text-slate-600">({recomendados.length})</span>}
        </h2>
        {respondidas === 0 ? (
          <p className="mt-2 text-slate-600">Responde al menos una pregunta para ver recomendaciones.</p>
        ) : (
          <>
            {recomendados.length === 0 ? (
              <p className="mt-3 rounded-xl bg-slate-100 px-4 py-3 text-slate-700">
                Ningún equipo cumple todo con datos del catálogo. {revisar.length ? "Revisa los de abajo." : "Prueba a cambiar alguna respuesta."}
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {recomendados.map((r) => (
                  <Resultado key={r.producto.id} r={r} />
                ))}
              </ul>
            )}
            {revisar.length > 0 && (
              <div className="mt-8">
                <h3 className="font-display text-xl font-semibold">A revisar</h3>
                <p className="mt-1 text-sm text-slate-600">Podrían encajar, pero el catálogo no indica alguno de los datos pedidos.</p>
                <ul className="mt-3 space-y-3">
                  {revisar.map((r) => (
                    <Resultado key={r.producto.id} r={r} revisar />
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
