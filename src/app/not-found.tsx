import Link from "next/link";

export default function NoEncontrado() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="font-display text-6xl font-bold text-marino-900">404</p>
      <h1 className="mt-2 font-display text-2xl font-semibold">Página no encontrada</h1>
      <p className="mt-2 text-slate-600">El equipo o la página que buscas no existe.</p>
      <Link href="/catalogo/" className="mt-6 inline-flex rounded-xl bg-marino-900 px-5 py-3 text-sm font-semibold text-white">
        Ir al catálogo
      </Link>
    </div>
  );
}
