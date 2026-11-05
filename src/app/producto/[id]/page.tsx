import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, ChevronRight, FileDown, FileText, Info, Minus, Plus } from "lucide-react";
import { BotonComparar, BotonFavorito } from "@/components/BotonesProducto";
import { Compartir } from "@/components/Compartir";
import { Foto } from "@/components/Foto";
import { Galeria } from "@/components/Galeria";
import { Pestanas, type Pestana } from "@/components/Pestanas";
import { BotonPresentacion, Presentacion } from "@/components/Presentacion";
import { TarjetaProducto } from "@/components/TarjetaProducto";
import { asset, paginaPdf } from "@/lib/asset";
import { marcaCompleta, productoPorId, productosDeFamilia, referenciaPrincipal, todosLosProductos, vecinos } from "@/lib/catalogo";
import { familiaPorId } from "@/lib/familias";
import { logosDe } from "@/lib/marcas";
import type { Dato, Documento, Extra, Producto } from "@/lib/types";

export const dynamicParams = false;

export function generateStaticParams() {
  return todosLosProductos().map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const p = productoPorId(id);
  if (!p) return {};
  return {
    title: `${p.modelo} · ${p.tipoEquipo}`,
    description: `${marcaCompleta(p)} ${p.modelo}. ${p.descripcion}`,
  };
}

function Lista({ items, icono = "punto" }: { items: string[]; icono?: "punto" | "check" | "menos" }) {
  return (
    <ul className="grid gap-x-8 gap-y-2.5 lg:grid-cols-2">
      {items.map((t) => (
        <li key={t} className="flex gap-3 text-[15px] leading-relaxed text-slate-800">
          {icono === "check" ? (
            <Check className="mt-1 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
          ) : icono === "menos" ? (
            <Minus className="mt-1 h-4 w-4 shrink-0 text-slate-600" aria-hidden="true" />
          ) : (
            <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-acento-500" aria-hidden="true" />
          )}
          <span>{t}</span>
        </li>
      ))}
    </ul>
  );
}

function TablaDatos({ datos }: { datos: Dato[] }) {
  return (
    <dl className="grid overflow-hidden rounded-2xl border border-slate-200 bg-white sm:grid-cols-2">
      {datos.map((d) => (
        <div key={d.etiqueta} className="flex flex-col gap-0.5 border-b border-slate-100 px-4 py-3 sm:odd:border-r">
          <dt className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-600">{d.etiqueta}</dt>
          <dd className="font-medium text-marino-950">{d.valor}</dd>
        </div>
      ))}
    </dl>
  );
}

function Extras({ titulo, items }: { titulo: string; items: Extra[] }) {
  if (!items.length) return null;
  return (
    <div className="print-bloque">
      <h3 className="mb-3 text-sm font-bold uppercase tracking-[0.12em] text-slate-600">{titulo}</h3>
      <ul className="grid gap-3 sm:grid-cols-2">
        {items.map((e) => (
          <li key={e.nombre} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3">
            <Plus className="mt-0.5 h-4 w-4 shrink-0 text-marino-700" aria-hidden="true" />
            <div>
              <p className="font-medium text-marino-950">{e.nombre}</p>
              {e.referencia && <p className="font-mono text-sm text-slate-600">Ref. {e.referencia}</p>}
              {e.nota && <p className="text-sm text-acento-600">{e.nota}</p>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Bloque({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="print-bloque">
      <h3 className="mb-3 text-sm font-bold uppercase tracking-[0.12em] text-slate-600">{titulo}</h3>
      {children}
    </div>
  );
}

function Logos({ p }: { p: Producto }) {
  const logos = logosDe(p);
  if (!logos.length) return <p className="text-sm font-bold uppercase tracking-[0.16em] text-acento-600">{marcaCompleta(p)}</p>;
  return (
    <ul className="flex flex-wrap items-center gap-x-6 gap-y-3" aria-label={`Marca: ${marcaCompleta(p)}`}>
      {logos.map((l) => (
        <li key={l.marca}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={asset(l.src)} alt={l.marca} width={l.w} height={l.h} className="h-10 w-auto max-w-[190px] object-contain sm:h-11" />
        </li>
      ))}
    </ul>
  );
}

/** Planos del fabricante: se descargan tal cual, sin modificar. */
function Documentos({ documentos }: { documentos: Documento[] }) {
  return (
    <ul className="grid gap-3">
      {documentos.map((d) => (
        <li key={d.archivo}>
          <a
            href={asset(d.archivo)}
            download={d.nombreDescarga}
            className="no-print flex items-center gap-4 rounded-2xl border border-marino-200 bg-marino-50 p-4 transition-colors hover:border-marino-600"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-marino-900 text-white">
              <FileDown className="h-6 w-6" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold text-marino-950">Descargar {d.titulo.toLowerCase()} (PDF)</span>
              <span className="block text-sm text-slate-600">{d.detalle}</span>
              <span className="block text-xs text-slate-600">1 hoja · {d.tamanoKb} KB · documento original del fabricante</span>
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}

function pestanasDe(p: Producto): Pestana[] {
  const t: Pestana[] = [];
  const accesoriosImg = p.imagenes.filter((i) => i.tipo === "accesorio");
  const planos = p.imagenes.filter((i) => i.tipo === "plano");

  t.push({
    id: "descripcion",
    titulo: "Descripción",
    soloPantalla: p.destacados.length === 0,
    contenido: (
      <div className="max-w-3xl space-y-4">
        <p className="text-lg leading-relaxed text-slate-800 print:hidden">{p.descripcion}</p>
        {p.destacados.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {p.destacados.map((d) => (
              <li key={d} className="rounded-full border border-acento-100 bg-acento-50 px-3 py-1.5 text-sm font-medium text-acento-600">
                {d}
              </li>
            ))}
          </ul>
        )}
      </div>
    ),
  });

  if (p.caracteristicas.length)
    t.push({ id: "caracteristicas", titulo: "Características", contenido: <Lista items={p.caracteristicas} /> });

  if (p.datosTecnicos.length)
    t.push({ id: "datos", titulo: "Datos técnicos", contenido: <TablaDatos datos={p.datosTecnicos} /> });

  const hayEquipamiento =
    p.equipamientoIncluido.length || p.noIncluido.length || p.opcionales.length || p.accesorios.length || p.configuracion || accesoriosImg.length;
  if (hayEquipamiento)
    t.push({
      id: "equipamiento",
      titulo: "Equipamiento y opcionales",
      contenido: (
        <div className="space-y-8">
          {p.equipamientoIncluido.length > 0 && (
            <Bloque titulo="Equipamiento incluido">
              <Lista items={p.equipamientoIncluido} icono="check" />
            </Bloque>
          )}
          {p.noIncluido.length > 0 && (
            <Bloque titulo="No incluido">
              <Lista items={p.noIncluido} icono="menos" />
            </Bloque>
          )}
          <Extras titulo="Opcionales" items={p.opcionales} />
          <Extras titulo="Accesorios" items={p.accesorios} />
          {p.configuracion && (
            <Bloque titulo={p.configuracion.titulo}>
              <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                <table className="w-full min-w-[520px] text-sm">
                  <thead className="bg-marino-50 text-left">
                    <tr>
                      <th scope="col" className="px-4 py-3 font-semibold">
                        Configuración
                      </th>
                      {p.configuracion.columnas.map((c) => (
                        <th key={c} scope="col" className="px-4 py-3 font-semibold">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {p.configuracion.filas.map((f) => (
                      <tr key={f.etiqueta} className="border-t border-slate-100">
                        <th scope="row" className="px-4 py-2.5 text-left font-medium text-slate-700">
                          {f.etiqueta}
                        </th>
                        {f.valores.map((v, i) => (
                          <td key={i} className={`px-4 py-2.5 ${v === "Sí" ? "font-semibold text-emerald-700" : "text-slate-600"}`}>
                            {v}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Bloque>
          )}
          {accesoriosImg.length > 0 && (
            <Bloque titulo="Imágenes de accesorios">
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {accesoriosImg.map((i) => (
                  <li key={i.src} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                    <div className="foto-fondo flex aspect-[4/3] items-center justify-center p-4">
                      <Foto imagen={i} pequena className="max-h-full max-w-full" />
                    </div>
                    <p className="px-3 py-2 text-sm text-slate-700">{i.alt}</p>
                  </li>
                ))}
              </ul>
            </Bloque>
          )}
        </div>
      ),
    });

  if (p.compatibilidades.length || p.vehiculos.fuente)
    t.push({
      id: "compatibilidad",
      titulo: "Compatibilidad",
      contenido: (
        <div className="space-y-5">
          {p.compatibilidades.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {p.compatibilidades.map((c) => (
                <li key={c} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium">
                  {c}
                </li>
              ))}
            </ul>
          )}
          {p.vehiculos.fuente && <p className="text-sm text-slate-600">{p.vehiculos.fuente}</p>}
        </div>
      ),
    });

  if (p.requisitosInstalacion.length)
    t.push({ id: "instalacion", titulo: "Requisitos de instalación", contenido: <Lista items={p.requisitosInstalacion} /> });

  t.push({
    id: "documentacion",
    titulo: "Documentación",
    contenido: (
      <div className="space-y-6">
        {p.documentos.length > 0 && <Documentos documentos={p.documentos} />}
        {planos.length > 0 && (
          <ul className="grid gap-4 sm:grid-cols-2">
            {planos.map((i) => (
              <li key={i.src} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <a href={asset(i.src)} target="_blank" rel="noopener" className="block">
                  <div className="flex aspect-[4/3] items-center justify-center bg-white p-3">
                    <Foto imagen={i} pequena className="max-h-full" />
                  </div>
                  <p className="border-t border-slate-100 px-4 py-3 text-sm font-medium text-marino-900">{i.alt} · abrir a tamaño completo</p>
                </a>
              </li>
            ))}
          </ul>
        )}
        <ul className="flex flex-wrap gap-3">
          {p.paginas.map((n) => (
            <li key={n}>
              <a
                href={paginaPdf(n)}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-marino-900 hover:border-marino-600"
              >
                <FileText className="h-5 w-5 text-marino-700" aria-hidden="true" /> Catálogo PDF · página {n}
              </a>
            </li>
          ))}
        </ul>
      </div>
    ),
  });

  if (p.observaciones.length || p.notasDatos.length)
    t.push({
      id: "observaciones",
      titulo: "Observaciones comerciales",
      contenido: (
        <div className="space-y-6">
          {p.observaciones.length > 0 && <Lista items={p.observaciones} />}
          {p.notasDatos.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Info className="h-4 w-4" aria-hidden="true" /> Notas sobre los datos del catálogo
              </p>
              <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
                {p.notasDatos.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ),
    });

  return t;
}

export default async function PaginaProducto({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = productoPorId(id);
  if (!p) notFound();
  const familia = familiaPorId(p.familia)!;
  const { anterior, siguiente } = vecinos(p);
  const corto = (x?: Producto) => (x ? { id: x.id, modelo: x.modelo } : undefined);
  const relacionados = productosDeFamilia(p.familia).filter((x) => x.id !== p.id && x.subfamilia === p.subfamilia).slice(0, 3);
  const otros = relacionados.length ? relacionados : productosDeFamilia(p.familia).filter((x) => x.id !== p.id).slice(0, 3);

  return (
    <>
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <nav aria-label="Ruta" className="no-print py-4 text-sm">
          <ol className="flex flex-wrap items-center gap-1 text-slate-600">
            <li>
              <Link href="/catalogo/" className="hover:text-marino-800 hover:underline">
                Catálogo
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="h-4 w-4" />
            </li>
            <li>
              <Link href={`/categoria/${familia.id}/`} className="hover:text-marino-800 hover:underline">
                {familia.nombre}
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="h-4 w-4" />
            </li>
            <li aria-current="page" className="font-medium text-marino-950">
              {p.modelo}
            </li>
          </ol>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-12 print:grid-cols-[45%_1fr] print:gap-6">
          <div className="print:max-w-none">
            <Galeria imagenes={p.imagenes} modelo={p.modelo} />
          </div>

          <div>
            <Logos p={p} />
            <h1 className="mt-3 font-display text-4xl font-bold leading-none text-marino-950 sm:text-5xl">{p.modelo}</h1>
            <p className="mt-2 text-lg text-slate-700">{p.tipoEquipo}</p>

            {p.precio && (
              <div className="mt-4 inline-flex items-baseline gap-3 rounded-2xl bg-marino-900 px-5 py-3 text-white">
                <span className="font-display text-3xl font-bold leading-none">{p.precio}</span>
                <span className="text-xs font-semibold text-marino-200">+IVA</span>              </div>
            )}

            <dl className="mt-5 grid gap-x-6 gap-y-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-600">Familia</dt>
                <dd className="font-medium">
                  {familia.nombre} · {p.subfamilia}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-600">Marca</dt>
                <dd className="font-medium">
                  {marcaCompleta(p)}
                  {p.fabricante !== "ND" && p.fabricante !== p.marca && <span className="text-slate-600"> (fab. {p.fabricante})</span>}
                </dd>
              </div>
              {p.referencias.length ? (
                p.referencias.map((r) => (
                  <div key={r.valor}>
                    <dt className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-600">{r.etiqueta}</dt>
                    <dd className="font-mono font-medium tracking-wide">{r.valor}</dd>
                  </div>
                ))
              ) : (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-600">Referencia</dt>
                  <dd className="font-medium">ND</dd>
                </div>
              )}
            </dl>

            <p className="mt-5 text-base leading-relaxed text-slate-700">{p.descripcion}</p>

            {p.pictogramas.length > 0 && (
              <ul className="mt-4 flex flex-wrap gap-3" aria-label="Pictogramas">
                {p.pictogramas.map((g) => (
                  <li key={g.src} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={asset(g.src)} alt="" width={g.w} height={g.h} className="h-12 w-auto" />
                    <span className="text-sm font-medium text-marino-900">{g.alt}</span>
                  </li>
                ))}
              </ul>
            )}

            {p.documentos.length > 0 && (
              <div className="mt-5">
                <Documentos documentos={p.documentos} />
              </div>
            )}

            <div className="no-print mt-6 flex flex-wrap gap-2">
              <BotonPresentacion />
              <BotonComparar id={p.id} modelo={p.modelo} grande />
              <BotonFavorito id={p.id} modelo={p.modelo} grande />
              <Compartir titulo={`${marcaCompleta(p)} ${p.modelo} · ${p.tipoEquipo}`} resumen={p.fichaRapida.map((d) => `${d.etiqueta}: ${d.valor}`).join(" · ")} />
            </div>

            <section aria-labelledby="ficha-rapida" className="mt-8">
              <h2 id="ficha-rapida" className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.14em] text-marino-800">
                <span className="h-4 w-1 rounded bg-acento-500" aria-hidden="true" /> Ficha rápida
              </h2>
              <dl className="mt-3 grid grid-cols-2 gap-3 xl:grid-cols-3">
                {p.fichaRapida.map((d) => (
                  <div key={d.etiqueta} className="print-bloque rounded-2xl border border-slate-200 bg-white p-4 shadow-tarjeta">
                    <dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-600">{d.etiqueta}</dt>
                    <dd className="mt-1 font-display text-xl font-semibold leading-tight text-marino-950">{d.valor}</dd>
                  </div>
                ))}
              </dl>
            </section>
          </div>
        </div>

        <section aria-label="Información técnica" className="mt-12">
          <Pestanas pestanas={pestanasDe(p)} />
        </section>

        {otros.length > 0 && (
          <section aria-labelledby="relacionados" className="no-print mt-14">
            <h2 id="relacionados" className="font-display text-2xl font-semibold">
              Otros equipos de {familia.nombre.toLowerCase()}
            </h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {otros.map((x) => (
                <TarjetaProducto key={x.id} producto={x} />
              ))}
            </div>
          </section>
        )}

        <p className="solo-print mt-8 border-t border-slate-200 pt-3 text-xs text-slate-600">
          {marcaCompleta(p)} {p.modelo} · Ref. {referenciaPrincipal(p)} · Datos del catálogo de maquinaria (pág. {p.paginas.join(", ")}).
        </p>
      </div>
      <Presentacion producto={p} anterior={corto(anterior)} siguiente={corto(siguiente)} />
    </>
  );
}
