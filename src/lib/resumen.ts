// Índice ligero del catálogo para componentes que están en todas las páginas.
import resumenJson from "@/data/resumen.json";
import type { FamiliaId, Imagen } from "./types";

export type Resumen = { id: string; modelo: string; familia: FamiliaId; imagen: Imagen | null };

export const RESUMEN = resumenJson as Resumen[];

export function resumenPorId(id: string): Resumen | undefined {
  return RESUMEN.find((r) => r.id === id);
}

export function cuentaFamilia(familia: FamiliaId): number {
  return RESUMEN.filter((r) => r.familia === familia).length;
}
