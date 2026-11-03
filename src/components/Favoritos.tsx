"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { productoPorId } from "@/lib/catalogo";
import { FAMILIAS } from "@/lib/familias";
import { useStore } from "@/lib/store";
import type { Producto } from "@/lib/types";
import { TarjetaProducto } from "./TarjetaProducto";

export function Favoritos() {
  const { favoritos, listo } = useStore();
  if (!listo) return <div className="h-96" />;
  const productos = favoritos.map(productoPorId).filter((p): p is Producto => !!p);

  if (!productos.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
        <Heart className="mx-auto h-10 w-10 text-acento-500" aria-hidden="true" />
        <p className="mt-4 font-display text-2xl font-semibold">Todavía no has guardado equipos</p>
        <p className="mx-auto mt-2 max-w-md text-slate-600">Pulsa ♡ en cualquier equipo para tenerlo a mano en tus visitas.</p>
        <Link href="/catalogo/" className="mt-6 inline-flex rounded-xl bg-marino-900 px-5 py-3 text-sm font-semibold text-white">
          Ir al catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {FAMILIAS.map((f) => {
        const lista = productos.filter((p) => p.familia === f.id);
        if (!lista.length) return null;
        return (
          <section key={f.id} aria-labelledby={`fav-${f.id}`}>
            <h2 id={`fav-${f.id}`} className="mb-4 font-display text-2xl font-semibold">
              {f.nombre} <span className="text-base font-medium text-slate-600">({lista.length})</span>
            </h2>
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {lista.map((p) => (
                <TarjetaProducto key={p.id} producto={p} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
