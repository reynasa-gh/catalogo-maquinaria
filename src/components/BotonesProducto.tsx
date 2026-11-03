"use client";

import { GitCompareArrows, Heart } from "lucide-react";
import { useStore } from "@/lib/store";

export function BotonFavorito({ id, modelo, grande = false }: { id: string; modelo: string; grande?: boolean }) {
  const { esFavorito, alternarFavorito, listo } = useStore();
  const activo = listo && esFavorito(id);
  return (
    <button
      type="button"
      onClick={() => alternarFavorito(id)}
      aria-pressed={activo}
      aria-label={grande ? undefined : activo ? `Quitar ${modelo} de Mis equipos` : `Guardar ${modelo} en Mis equipos`}
      title={activo ? "Quitar de Mis equipos" : "Guardar en Mis equipos"}
      className={`no-print inline-flex items-center justify-center gap-2 rounded-xl border transition-colors ${
        grande ? "h-12 px-4 text-sm font-semibold" : "h-11 w-11"
      } ${
        activo
          ? "border-acento-500 bg-acento-50 text-acento-600"
          : "border-slate-200 bg-white text-slate-600 hover:border-marino-200 hover:text-marino-800"
      }`}
    >
      <Heart className={`h-5 w-5 ${activo ? "fill-current" : ""}`} aria-hidden="true" />
      {grande && <span>{activo ? "En Mis equipos" : "Favorito"}</span>}
    </button>
  );
}

export function BotonComparar({ id, modelo, grande = false }: { id: string; modelo: string; grande?: boolean }) {
  const { enComparador, alternarComparar, listo } = useStore();
  const activo = listo && enComparador(id);
  return (
    <button
      type="button"
      onClick={() => alternarComparar(id)}
      aria-pressed={activo}
      aria-label={grande ? undefined : activo ? `Quitar ${modelo} del comparador` : `Añadir ${modelo} al comparador`}
      title={activo ? "Quitar del comparador" : "Añadir a comparación"}
      className={`no-print inline-flex items-center justify-center gap-2 rounded-xl border transition-colors ${
        grande ? "h-12 px-4 text-sm font-semibold" : "h-11 w-11"
      } ${
        activo
          ? "border-marino-700 bg-marino-700 text-white"
          : "border-slate-200 bg-white text-slate-600 hover:border-marino-200 hover:text-marino-800"
      }`}
    >
      <GitCompareArrows className="h-5 w-5" aria-hidden="true" />
      {grande && <span>{activo ? "En comparación" : "Añadir a comparación"}</span>}
    </button>
  );
}
