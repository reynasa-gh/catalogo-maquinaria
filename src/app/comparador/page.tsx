import type { Metadata } from "next";
import { Comparador } from "@/components/Comparador";

export const metadata: Metadata = {
  title: "Comparador",
  description: "Compara hasta 4 equipos de la misma familia y detecta sus diferencias.",
};

export default function PaginaComparador() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-acento-600">Herramienta comercial</p>
      <h1 className="mt-1 font-display text-4xl font-bold text-marino-950">Comparador de equipos</h1>
      <p className="mb-8 mt-2 text-slate-600">Hasta 4 equipos de la misma familia, con las diferencias resaltadas.</p>
      <Comparador />
    </div>
  );
}
