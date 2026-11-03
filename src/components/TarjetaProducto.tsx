import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { imagenPrincipal, marcaCompleta, referenciaPrincipal } from "@/lib/catalogo";
import type { Producto } from "@/lib/types";
import { BotonComparar, BotonFavorito } from "./BotonesProducto";
import { Foto } from "./Foto";

export function TarjetaProducto({ producto: p, prioridad = false }: { producto: Producto; prioridad?: boolean }) {
  const url = `/producto/${p.id}/`;
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-tarjeta transition-shadow hover:shadow-elevada">
      <div className="foto-fondo relative aspect-[4/3] overflow-hidden">
        <Foto
          imagen={imagenPrincipal(p)}
          pequena
          prioridad={prioridad}
          className="h-full w-full p-4 transition-transform duration-300 group-hover:scale-[1.03]"
        />
        <span className="absolute left-3 top-3 rounded-md bg-white/90 px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-600 shadow-sm">
          {p.subfamilia}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-acento-600">{marcaCompleta(p)}</p>
          <h3 className="mt-1 font-display text-2xl font-semibold leading-tight text-marino-950">
            <Link href={url} className="after:absolute after:inset-0 after:content-['']">
              {p.modelo}
            </Link>
          </h3>
          <p className="mt-1 text-sm text-slate-600">{p.tipoEquipo}</p>
          <p className="mt-1 font-mono text-xs text-slate-600">Ref. {referenciaPrincipal(p)}</p>
        </div>
        <ul className="space-y-1.5 border-t border-slate-100 pt-3 text-sm">
          {p.fichaRapida.slice(0, 4).map((d) => (
            <li key={d.etiqueta} className="flex gap-2">
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-acento-500" aria-hidden="true" />
              <span>
                <span className="text-slate-600">{d.etiqueta}: </span>
                <span className="font-medium text-marino-900">{d.valor}</span>
              </span>
            </li>
          ))}
        </ul>
        <div className="relative z-10 mt-auto flex items-center gap-2 pt-2">
          <Link
            href={url}
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-marino-900 px-4 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-marino-700"
          >
            Ver ficha <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <BotonFavorito id={p.id} modelo={p.modelo} />
          <BotonComparar id={p.id} modelo={p.modelo} />
        </div>
      </div>
    </article>
  );
}
