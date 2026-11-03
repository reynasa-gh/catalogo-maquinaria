"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Maximize, Minimize, Presentation, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { marcaCompleta, referenciaPrincipal } from "@/lib/producto";
import { asset } from "@/lib/asset";
import { nombreFamilia } from "@/lib/familias";
import { logosDe } from "@/lib/marcas";
import { useStore } from "@/lib/store";
import type { Producto } from "@/lib/types";
import { Foto } from "./Foto";
import { IconoFamilia } from "./IconoFamilia";

export function BotonPresentacion() {
  const { setPresentacion } = useStore();
  return (
    <button
      type="button"
      onClick={() => setPresentacion(true)}
      className="no-print inline-flex h-12 items-center gap-2 rounded-xl bg-acento-500 px-4 text-sm font-bold text-marino-950 hover:bg-acento-400"
    >
      <Presentation className="h-5 w-5" aria-hidden="true" /> Modo presentación
    </button>
  );
}

/**
 * Vista para enseñar el equipo al cliente con la tableta: sin navegación,
 * imágenes grandes y solo los datos principales. Flechas para pasar de equipo.
 */
type Vecino = { id: string; modelo: string } | undefined;

export function Presentacion({ producto: p, anterior, siguiente }: { producto: Producto; anterior: Vecino; siguiente: Vecino }) {
  const router = useRouter();
  const { presentacion, setPresentacion } = useStore();
  const fotos = p.imagenes.filter((i) => i.tipo === "producto" || i.tipo === "detalle" || i.tipo === "accesorio");
  const [foto, setFoto] = useState(0);
  const [pantallaCompleta, setPantallaCompleta] = useState(false);

  useEffect(() => setFoto(0), [p.id]);

  // /producto/<id>/?presentar abre la ficha directamente en modo presentación.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).has("presentar")) setPresentacion(true);
  }, [setPresentacion]);

  const salir = useCallback(() => {
    setPresentacion(false);
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  }, [setPresentacion]);

  useEffect(() => {
    if (!presentacion) return;
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") salir();
      if (e.key === "ArrowRight" && siguiente) router.push(`/producto/${siguiente.id}/`);
      if (e.key === "ArrowLeft" && anterior) router.push(`/producto/${anterior.id}/`);
    };
    const fs = () => setPantallaCompleta(!!document.fullscreenElement);
    window.addEventListener("keydown", tecla);
    document.addEventListener("fullscreenchange", fs);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", tecla);
      document.removeEventListener("fullscreenchange", fs);
      document.body.style.overflow = "";
    };
  }, [presentacion, anterior, siguiente, router, salir]);

  if (!presentacion) return null;

  const img = fotos[foto] ?? p.imagenes[0];

  return (
    <div role="dialog" aria-modal="true" aria-label={`Presentación de ${p.modelo}`} className="fixed inset-0 z-[65] flex flex-col overflow-y-auto bg-white">
      <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3 sm:px-6">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-marino-900 text-white">
          <IconoFamilia familia={p.familia} className="h-5 w-5" />
        </span>
        <p className="text-sm font-semibold uppercase tracking-wider text-slate-600">
          {nombreFamilia(p.familia)} · {p.subfamilia}
        </p>
        <div className="ml-auto flex items-center gap-2">
          {typeof document !== "undefined" && document.fullscreenEnabled && (
            <button
              type="button"
              onClick={() =>
                document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen().catch(() => {})
              }
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-semibold"
            >
              {pantallaCompleta ? <Minimize className="h-5 w-5" aria-hidden="true" /> : <Maximize className="h-5 w-5" aria-hidden="true" />}
              <span className="hidden sm:inline">{pantallaCompleta ? "Salir de pantalla completa" : "Pantalla completa"}</span>
            </button>
          )}
          <button
            type="button"
            onClick={salir}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-marino-900 px-4 text-sm font-semibold text-white"
            autoFocus
          >
            <X className="h-5 w-5" aria-hidden="true" /> Salir
          </button>
        </div>
      </div>

      <div className="grid flex-1 gap-6 p-4 sm:p-6 lg:grid-cols-[1.25fr_1fr] lg:gap-10 lg:p-10">
        <div className="flex flex-col">
          <div className="foto-fondo flex min-h-[44vh] flex-1 items-center justify-center rounded-3xl p-6 lg:min-h-0">
            <Foto imagen={img} prioridad className="max-h-[62vh] max-w-full" />
          </div>
          {fotos.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {fotos.map((f, i) => (
                <button
                  key={f.src}
                  type="button"
                  onClick={() => setFoto(i)}
                  aria-label={`Ver ${f.alt}`}
                  aria-current={i === foto}
                  className={`foto-fondo h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 p-1 ${i === foto ? "border-acento-500" : "border-transparent"}`}
                >
                  <Foto imagen={f} pequena className="h-full w-full" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col">
          {logosDe(p).length ? (
            <ul className="flex flex-wrap items-center gap-x-6 gap-y-3" aria-label={`Marca: ${marcaCompleta(p)}`}>
              {logosDe(p).map((l) => (
                <li key={l.marca}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={asset(l.src)} alt={l.marca} width={l.w} height={l.h} className="h-12 w-auto max-w-[220px] object-contain" />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-base font-bold uppercase tracking-[0.16em] text-acento-600">{marcaCompleta(p)}</p>
          )}
          <h2 className="mt-3 font-display text-5xl font-bold leading-none text-marino-950 sm:text-6xl">{p.modelo}</h2>
          <p className="mt-3 text-xl text-slate-700">{p.tipoEquipo}</p>
          <p className="mt-1 font-mono text-sm text-slate-600">Ref. {referenciaPrincipal(p)}</p>
          <dl className="mt-8 grid grid-cols-2 gap-3">
            {p.fichaRapida.map((d) => (
              <div key={d.etiqueta} className="rounded-2xl border border-slate-200 bg-marino-50 p-4">
                <dt className="text-xs font-bold uppercase tracking-[0.12em] text-slate-600">{d.etiqueta}</dt>
                <dd className="mt-1 font-display text-2xl font-semibold leading-tight text-marino-950">{d.valor}</dd>
              </div>
            ))}
          </dl>
          {p.destacados.length > 0 && (
            <ul className="mt-6 flex flex-wrap gap-2">
              {p.destacados.map((d) => (
                <li key={d} className="rounded-full bg-acento-50 px-3 py-1.5 text-sm font-medium text-acento-600">
                  {d}
                </li>
              ))}
            </ul>
          )}
          <div className="mt-auto flex items-center justify-between gap-3 pt-8">
            {anterior ? (
              <Link href={`/producto/${anterior.id}/`} className="inline-flex h-14 min-w-0 items-center gap-2 rounded-2xl border border-slate-200 px-4 font-semibold hover:bg-slate-50">
                <ChevronLeft className="h-6 w-6 shrink-0" aria-hidden="true" />
                <span className="truncate">{anterior.modelo}</span>
              </Link>
            ) : (
              <span />
            )}
            {siguiente && (
              <Link href={`/producto/${siguiente.id}/`} className="inline-flex h-14 min-w-0 items-center gap-2 rounded-2xl bg-marino-900 px-5 font-semibold text-white hover:bg-marino-700">
                <span className="truncate">{siguiente.modelo}</span>
                <ChevronRight className="h-6 w-6 shrink-0" aria-hidden="true" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
