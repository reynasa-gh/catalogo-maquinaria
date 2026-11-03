"use client";

import { Copy, Mail, MessageCircle, Printer, Share2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useStore } from "@/lib/store";

type Props = { titulo: string; resumen: string };

/** Compartir la ficha: copiar enlace, WhatsApp, email y ficha PDF (impresión). */
export function Compartir({ titulo, resumen }: Props) {
  const { avisar } = useStore();
  const [abierto, setAbierto] = useState(false);
  const caja = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fuera = (e: MouseEvent) => {
      if (!caja.current?.contains(e.target as Node)) setAbierto(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setAbierto(false);
    document.addEventListener("mousedown", fuera);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", fuera);
      document.removeEventListener("keydown", esc);
    };
  }, []);

  const url = () => window.location.href.split("#")[0];
  const texto = () => `${titulo}\n${resumen}\n${url()}`;

  async function copiar() {
    try {
      await navigator.clipboard.writeText(url());
      avisar("Enlace copiado");
    } catch {
      window.prompt("Copia el enlace:", url());
    }
    setAbierto(false);
  }

  async function nativo() {
    if (navigator.share) {
      try {
        await navigator.share({ title: titulo, text: resumen, url: url() });
      } catch {
        /* cancelado */
      }
      setAbierto(false);
    }
  }

  const opcion = "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium hover:bg-marino-50";

  return (
    <div ref={caja} className="no-print relative">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
        aria-haspopup="menu"
        className="inline-flex h-12 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-marino-900 hover:border-marino-200"
      >
        <Share2 className="h-5 w-5" aria-hidden="true" /> Compartir ficha
      </button>
      {abierto && (
        <div role="menu" className="absolute left-0 top-full z-30 mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-elevada sm:left-auto sm:right-0">
          <button role="menuitem" type="button" onClick={copiar} className={opcion}>
            <Copy className="h-5 w-5 text-marino-700" aria-hidden="true" /> Copiar enlace
          </button>
          <a
            role="menuitem"
            href={`https://wa.me/?text=${encodeURIComponent(typeof window === "undefined" ? titulo : texto())}`}
            onClick={(e) => {
              e.currentTarget.href = `https://wa.me/?text=${encodeURIComponent(texto())}`;
              setAbierto(false);
            }}
            target="_blank"
            rel="noopener"
            className={opcion}
          >
            <MessageCircle className="h-5 w-5 text-marino-700" aria-hidden="true" /> WhatsApp
          </a>
          <a
            role="menuitem"
            href="mailto:"
            onClick={(e) => {
              e.currentTarget.href = `mailto:?subject=${encodeURIComponent(titulo)}&body=${encodeURIComponent(texto())}`;
              setAbierto(false);
            }}
            className={opcion}
          >
            <Mail className="h-5 w-5 text-marino-700" aria-hidden="true" /> Email
          </a>
          <button
            role="menuitem"
            type="button"
            onClick={() => {
              setAbierto(false);
              setTimeout(() => window.print(), 50);
            }}
            className={opcion}
          >
            <Printer className="h-5 w-5 text-marino-700" aria-hidden="true" /> Generar ficha PDF
          </button>
          {typeof navigator !== "undefined" && "share" in navigator && (
            <button role="menuitem" type="button" onClick={nativo} className={opcion}>
              <Share2 className="h-5 w-5 text-marino-700" aria-hidden="true" /> Más opciones…
            </button>
          )}
        </div>
      )}
    </div>
  );
}
