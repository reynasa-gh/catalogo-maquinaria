// Las rutas de /public no reciben el basePath automáticamente en una
// exportación estática, así que se lo añadimos aquí.
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function asset(ruta: string): string {
  return `${BASE}${ruta}`;
}

export const PDF_CATALOGO = "/docs/catalogo-maquinaria.pdf";

export function paginaPdf(pagina: number): string {
  return `${asset(PDF_CATALOGO)}#page=${pagina}`;
}
