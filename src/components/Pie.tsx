"use client";

import Link from "next/link";
import { FileText } from "lucide-react";
import { MARCA } from "@/config/marca";
import { asset, PDF_CATALOGO } from "@/lib/asset";
import { useStore } from "@/lib/store";
import { Logo } from "./Logo";

export function Pie() {
  const { presentacion } = useStore();
  if (presentacion) return null;
  return (
    <footer data-pie className="mt-16 border-t border-slate-200 bg-white pb-28">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div>
          <Logo />
          <p className="mt-3 max-w-md text-sm text-slate-600">{MARCA.subtitulo}.</p>
        </div>
        <nav aria-label="Pie" className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-marino-800">
          <Link href="/catalogo/" className="hover:underline">Catálogo</Link>
          <Link href="/asistente/" className="hover:underline">¿Qué equipo necesito?</Link>
          <Link href="/comparador/" className="hover:underline">Comparador</Link>
          <Link href="/favoritos/" className="hover:underline">Mis equipos</Link>
          <a href={asset(PDF_CATALOGO)} target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 hover:underline">
            <FileText className="h-4 w-4" aria-hidden="true" /> Catálogo PDF
          </a>
        </nav>
      </div>
    </footer>
  );
}
