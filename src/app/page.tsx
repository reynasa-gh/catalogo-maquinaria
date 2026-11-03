import Link from "next/link";
import { ArrowRight, FileText, GitCompareArrows, Heart, WandSparkles } from "lucide-react";
import { Buscador } from "@/components/Buscador";
import { Foto } from "@/components/Foto";
import { PictogramaFamilia } from "@/components/PictogramaFamilia";
import { MARCA } from "@/config/marca";
import { asset, PDF_CATALOGO } from "@/lib/asset";
import { imagenPrincipal, marcas, productosDeFamilia } from "@/lib/catalogo";
import { FAMILIAS } from "@/lib/familias";

// Foto representativa de cada familia (producto del catálogo).
const PORTADA_FAMILIA: Record<string, string> = {
  elevadores: "sdx42lik",
  alineacion: "spa3dtower-4",
  neumaticos: "super-lx-24",
  "aire-comprimido": "cross-500-10-200",
  "aire-acondicionado": "optima",
  "servicio-liquidos": "ds903",
};

export default function Inicio() {
  return (
    <>
      <section className="relative bg-marino-900 text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(rgb(255 255 255) 1px, transparent 1px), linear-gradient(90deg, rgb(255 255 255) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-[1440px] px-4 pb-8 pt-7 sm:px-6 lg:px-8 lg:pb-10 lg:pt-9">
          {/* El nombre ya está en la cabecera: aquí solo queda para lectores de pantalla. */}
          <h1 className="sr-only">{MARCA.nombre}</h1>
          <p className="max-w-2xl text-base font-bold uppercase tracking-wide text-white sm:text-lg">{MARCA.subtitulo}</p>
          <div className="mt-6 max-w-xl">
            <Buscador grande />
          </div>
        </div>
      </section>

      <section aria-labelledby="familias" className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 id="familias" className="font-display text-3xl font-semibold text-marino-950">
              Familias de equipos
            </h2>
            <p className="mt-1 text-slate-600">Elige una familia para ver equipos, filtros y comparativas.</p>
          </div>
          <Link href="/catalogo/" className="hidden items-center gap-1 text-sm font-semibold text-marino-800 hover:underline sm:inline-flex">
            Ver todo el catálogo <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FAMILIAS.map((f, i) => {
            const productos = productosDeFamilia(f.id);
            const portada = productos.find((p) => p.id === PORTADA_FAMILIA[f.id]) ?? productos[0];
            return (
              <li key={f.id}>
                <Link
                  href={`/categoria/${f.id}/`}
                  className="group flex h-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-tarjeta transition-shadow hover:shadow-elevada"
                >
                  <div className="flex flex-1 flex-col p-6">
                    <PictogramaFamilia familia={f.id} className="h-14 w-14 rounded-xl" />
                    <h3 className="mt-4 font-display text-2xl font-semibold text-marino-950">{f.nombre}</h3>
                    <p className="mt-1 text-sm font-semibold text-acento-600">
                      {productos.length} {productos.length === 1 ? "equipo" : "equipos"}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-slate-600">{f.subfamilias.join(" · ")}</p>
                    <span className="mt-auto inline-flex items-center gap-1 pt-5 text-sm font-semibold text-marino-800">
                      Ver equipos <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                    </span>
                  </div>
                  <div className="foto-fondo relative w-[42%] shrink-0">
                    <Foto imagen={portada && imagenPrincipal(portada)} pequena prioridad={i < 3} className="absolute inset-0 h-full w-full p-3" />
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="herramientas" className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <h2 id="herramientas" className="sr-only">
          Herramientas
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { href: "/asistente/", icono: WandSparkles, titulo: "¿Qué equipo necesito?", texto: "Responde 3 preguntas y te sugerimos equipos." },
            { href: "/comparador/", icono: GitCompareArrows, titulo: "Comparador", texto: "Hasta 4 equipos de la misma familia, lado a lado." },
            { href: "/favoritos/", icono: Heart, titulo: "Mis equipos", texto: "Los equipos que guardas para tus visitas." },
          ].map((h) => (
            <li key={h.href}>
              <Link href={h.href} className="flex h-full items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition-colors hover:border-marino-200">
                <h.icono className="h-6 w-6 shrink-0 text-acento-500" aria-hidden="true" />
                <span>
                  <span className="block font-semibold text-marino-950">{h.titulo}</span>
                  <span className="mt-1 block text-sm text-slate-600">{h.texto}</span>
                </span>
              </Link>
            </li>
          ))}
          <li>
            <a
              href={asset(PDF_CATALOGO)}
              target="_blank"
              rel="noopener"
              className="flex h-full items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition-colors hover:border-marino-200"
            >
              <FileText className="h-6 w-6 shrink-0 text-acento-500" aria-hidden="true" />
              <span>
                <span className="block font-semibold text-marino-950">Catálogo PDF</span>
                <span className="mt-1 block text-sm text-slate-600">El documento original, 33 páginas.</span>
              </span>
            </a>
          </li>
        </ul>
      </section>

      <section aria-labelledby="marcas" className="mx-auto max-w-[1440px] px-4 pt-12 sm:px-6 lg:px-8">
        <h2 id="marcas" className="text-xs font-bold uppercase tracking-[0.16em] text-slate-600">
          Marcas del catálogo
        </h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {marcas().map((m) => (
            <li key={m}>
              <Link
                href={`/catalogo/?f.marca=${encodeURIComponent(m)}`}
                className="inline-flex rounded-xl border border-slate-200 bg-white px-4 py-2 font-display text-lg font-semibold tracking-wide text-marino-900 hover:border-marino-600"
              >
                {m}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
