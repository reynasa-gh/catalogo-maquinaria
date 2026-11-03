import type { Metadata } from "next";
import { Asistente } from "@/components/Asistente";

export const metadata: Metadata = {
  title: "¿Qué equipo necesito?",
  description: "Asistente para encontrar el equipo adecuado según las necesidades del taller.",
};

export default function PaginaAsistente() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-acento-600">Asistente</p>
      <h1 className="mt-1 font-display text-4xl font-bold text-marino-950">¿Qué equipo necesito?</h1>
      <p className="mb-8 mt-2 text-slate-600">
        Las recomendaciones se basan solo en los datos del catálogo. Si un dato no aparece, el equipo se muestra como «a revisar».
      </p>
      <Asistente />
    </div>
  );
}
