import type { Familia, FamiliaId } from "./types";

// Taxonomía construida a partir de las secciones reales del PDF.
export const FAMILIAS: Familia[] = [
  {
    id: "elevadores",
    nombre: "Elevadores",
    descripcion: "Elevadores electromecánicos de 2 columnas y electrohidráulicos de tijera, de 3.500 a 5.500 kg.",
    subfamilias: ["2 columnas", "Tijera"],
    color: "#f28c3a",
  },
  {
    id: "alineacion",
    nombre: "Alineación",
    descripcion: "Alineadores 3D, CCD con tableta y alineación por imagen.",
    subfamilias: ["3D", "CCD", "Por imagen"],
    color: "#d8343b",
  },
  {
    id: "neumaticos",
    nombre: "Neumáticos",
    descripcion: "Desmontadoras, equilibradoras y escáner de neumáticos para el servicio de ruedas.",
    subfamilias: ["Desmontadoras", "Equilibradoras", "Escáner de neumáticos"],
    color: "#3d4450",
  },
  {
    id: "aire-comprimido",
    nombre: "Aire comprimido",
    descripcion: "Compresores de tornillo, secadores frigoríficos y depósitos de aire.",
    subfamilias: ["Compresores", "Secadores", "Depósitos"],
    color: "#1f3a68",
  },
  {
    id: "aire-acondicionado",
    nombre: "Aire acondicionado",
    descripcion: "Estaciones de carga A/A para R134a y R1234yf, incluidas versiones para híbridos y eléctricos.",
    subfamilias: ["Estaciones de carga A/A"],
    color: "#1683c6",
  },
  {
    id: "servicio-liquidos",
    nombre: "Servicio de líquidos",
    descripcion: "Equipos de sangrado, purgado y cambio de líquidos para el mantenimiento.",
    subfamilias: ["Sangrado y purgado"],
    color: "#6a3d9a",
  },
];

export function familiaPorId(id: string): Familia | undefined {
  return FAMILIAS.find((f) => f.id === id);
}

export function nombreFamilia(id: FamiliaId): string {
  return familiaPorId(id)?.nombre ?? id;
}

/** 3500 -> "3.500" (es-ES no agrupa números de 4 cifras). */
export function miles(n: number): string {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
