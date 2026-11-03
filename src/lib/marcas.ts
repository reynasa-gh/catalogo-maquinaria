// Logotipos de marca extraídos del PDF (scripts/extraer_logos.py).
import type { Producto } from "./types";

export type Logo = { marca: string; src: string; w: number; h: number };

const LOGOS: Record<string, Omit<Logo, "marca">> = {
  SPACE: { src: "/img/marcas/space.png", w: 183, h: 100 },
  "SNAP-ON": { src: "/img/marcas/snap-on.png", w: 900, h: 170 },
  BOXER: { src: "/img/marcas/boxer.png", w: 223, h: 56 },
  TREADREADER: { src: "/img/marcas/treadreader.png", w: 846, h: 256 },
  ABAC: { src: "/img/marcas/abac.png", w: 180, h: 51 },
  ECOTECHNICS: { src: "/img/marcas/ecotechnics.png", w: 271, h: 52 },
  WIGAM: { src: "/img/marcas/wigam.png", w: 308, h: 88 },
  MICRAUTO: { src: "/img/marcas/micrauto.png", w: 270, h: 34 },
};

/** Logos de la marca y, si la hay, de la submarca (p. ej. SNAP-ON + BOXER). */
export function logosDe(p: Producto): Logo[] {
  return [p.marca, p.submarca]
    .filter((m): m is string => !!m && !!LOGOS[m])
    .map((m) => ({ marca: m, ...LOGOS[m] }));
}
