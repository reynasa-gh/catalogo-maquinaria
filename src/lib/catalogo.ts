// Única puerta de acceso a los datos. Hoy lee los JSON del proyecto; para
// migrar a Supabase o a una API basta con reimplementar estas funciones.
import productosJson from "@/data/productos.json";
import imagenesJson from "@/data/imagenes.json";
import type { FamiliaId, Imagen, Producto, ProductoBase } from "./types";

const imagenes = imagenesJson as Record<string, Imagen[]>;

export const PRODUCTOS: Producto[] = (productosJson as unknown as ProductoBase[]).map((p) => ({
  ...p,
  imagenes: imagenes[p.id] ?? [],
}));

export function todosLosProductos(): Producto[] {
  return PRODUCTOS;
}

export function productoPorId(id: string): Producto | undefined {
  return PRODUCTOS.find((p) => p.id === id);
}

export function productosDeFamilia(familia: FamiliaId): Producto[] {
  return PRODUCTOS.filter((p) => p.familia === familia);
}

export { imagenPrincipal, marcaCompleta, referenciaPrincipal } from "./producto";

/** Producto anterior y siguiente dentro de su familia (para el modo presentación). */
export function vecinos(p: Producto): { anterior?: Producto; siguiente?: Producto } {
  const lista = productosDeFamilia(p.familia);
  const i = lista.findIndex((x) => x.id === p.id);
  return { anterior: lista[i - 1], siguiente: lista[i + 1] };
}

export function marcas(): string[] {
  return [...new Set(PRODUCTOS.map((p) => p.marca))];
}
