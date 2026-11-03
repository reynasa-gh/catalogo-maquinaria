"use client";

import { Check } from "lucide-react";
import { useStore } from "@/lib/store";

export function Avisos() {
  const { avisos } = useStore();
  return (
    <div
      data-avisos
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex flex-col items-center gap-2 px-4"
    >
      {avisos.map((a) => (
        <div
          key={a.id}
          className="pointer-events-auto flex max-w-md items-center gap-2 rounded-xl bg-marino-950 px-4 py-3 text-sm text-white shadow-elevada"
        >
          <Check className="h-4 w-4 shrink-0 text-acento-400" aria-hidden="true" />
          {a.texto}
        </div>
      ))}
    </div>
  );
}
