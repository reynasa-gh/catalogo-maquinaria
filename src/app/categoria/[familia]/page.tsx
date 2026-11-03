import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Explorador } from "@/components/Explorador";
import { PictogramaFamilia } from "@/components/PictogramaFamilia";
import { productosDeFamilia } from "@/lib/catalogo";
import { FAMILIAS, familiaPorId } from "@/lib/familias";

export const dynamicParams = false;

export function generateStaticParams() {
  return FAMILIAS.map((f) => ({ familia: f.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ familia: string }> }): Promise<Metadata> {
  const f = familiaPorId((await params).familia);
  return f ? { title: f.nombre, description: f.descripcion } : {};
}

export default async function PaginaCategoria({ params }: { params: Promise<{ familia: string }> }) {
  const f = familiaPorId((await params).familia);
  if (!f) notFound();
  const productos = productosDeFamilia(f.id);
  const porSub = f.subfamilias.map((s) => ({ s, n: productos.filter((p) => p.subfamilia === s).length }));

  return (
    <>
      <div className="relative overflow-hidden border-b border-slate-200 bg-white">
        <div className="absolute inset-y-0 left-0 w-1.5" style={{ backgroundColor: f.color }} aria-hidden="true" />
        <div className="mx-auto flex max-w-[1440px] flex-col gap-6 px-4 py-8 sm:px-6 md:flex-row md:items-center lg:px-8">
          <PictogramaFamilia familia={f.id} className="h-16 w-16 rounded-2xl" />
          <div className="flex-1">
            <nav aria-label="Ruta" className="text-sm text-slate-600">
              <Link href="/catalogo/" className="hover:underline">
                Catálogo
              </Link>{" "}
              / {f.nombre}
            </nav>
            <h1 className="mt-1 font-display text-4xl font-bold text-marino-950">{f.nombre}</h1>
            <p className="mt-1 max-w-2xl text-slate-600">{f.descripcion}</p>
          </div>
          <dl className="flex flex-wrap gap-3">
            <div className="rounded-2xl bg-marino-900 px-5 py-3 text-white">
              <dt className="text-xs uppercase tracking-wider text-marino-200">Equipos</dt>
              <dd className="font-display text-3xl font-bold leading-none">{productos.length}</dd>
            </div>
            {porSub.length > 1 &&
              porSub.map(({ s, n }) => (
                <div key={s} className="rounded-2xl border border-slate-200 px-4 py-3">
                  <dt className="text-xs uppercase tracking-wider text-slate-600">{s}</dt>
                  <dd className="font-display text-2xl font-semibold leading-none">{n}</dd>
                </div>
              ))}
          </dl>
        </div>
      </div>
      <Explorador familia={f.id} />
    </>
  );
}
