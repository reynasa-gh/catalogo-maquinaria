// Utilidades sobre un producto, sin importar los datos del catálogo
// (se pueden usar en componentes de cliente sin engordar el JavaScript).
import type { Imagen, Producto } from "./types";

export function imagenPrincipal(p: Producto): Imagen | undefined {
  return p.imagenes.find((i) => i.tipo === "producto") ?? p.imagenes[0];
}

export function referenciaPrincipal(p: Producto): string {
  return p.referencias[0]?.valor ?? "ND";
}

export function marcaCompleta(p: Producto): string {
  return p.submarca ? `${p.marca} · ${p.submarca}` : p.marca;
}
