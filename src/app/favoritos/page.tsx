import type { Metadata } from "next";
import { Favoritos } from "@/components/Favoritos";

export const metadata: Metadata = {
  title: "Mis equipos",
  description: "Equipos guardados como favoritos en este dispositivo.",
};

export default function PaginaFavoritos() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-acento-600">Favoritos</p>
      <h1 className="mt-1 font-display text-4xl font-bold text-marino-950">Mis equipos</h1>
      <p className="mb-8 mt-2 text-slate-600">Se guardan en este navegador. No hace falta iniciar sesión.</p>
      <Favoritos />
    </div>
  );
}
