import { MARCA } from "@/config/marca";

/** Nombre de la app como logotipo de texto (marca neutra). */
export function Logo({ claro = false }: { claro?: boolean }) {
  return (
    <span className={`whitespace-nowrap font-display text-lg font-semibold leading-none tracking-wide uppercase ${claro ? "text-white" : "text-marino-950"}`}>
      {MARCA.nombre}
    </span>
  );
}
