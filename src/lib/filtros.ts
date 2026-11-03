// Filtros por familia. Las opciones se generan a partir de los valores
// reales de los productos; un "ND" nunca aparece como opción.
import { nombreFamilia, miles } from "./familias";
import type { FamiliaId, Producto, ValorAtributo } from "./types";

export type DefinicionFiltro = {
  id: string;
  etiqueta: string;
  /** Solo se muestra si la subfamilia activa está en esta lista. */
  subfamilias?: string[];
  valores: (p: Producto) => string[];
  /** Orden de las opciones; por defecto, alfabético. */
  orden?: (a: string, b: string) => number;
};

function lista(v: ValorAtributo): string[] {
  if (v === null || v === undefined) return [];
  const arr = Array.isArray(v) ? v : [String(v)];
  return arr.filter((x) => x && x !== "ND" && x !== "n/a");
}

const attr = (clave: string) => (p: Producto) => lista(p.atributos[clave]);

/** Reduce "Sí (SMART SONAR™)" a "Sí" para que sea un filtro de casilla. */
const siNo = (clave: string) => (p: Producto) =>
  lista(p.atributos[clave]).map((v) => (v.startsWith("Sí") ? "Sí" : v)).filter((v) => v === "Sí");

const subfamilia: DefinicionFiltro = { id: "subfamilia", etiqueta: "Tipo de equipo", valores: (p) => [p.subfamilia] };
const marca: DefinicionFiltro = { id: "marca", etiqueta: "Marca", valores: (p) => [p.marca] };

const numerico = (a: string, b: string) => parseFloat(a.replace(/\./g, "")) - parseFloat(b.replace(/\./g, ""));

export const FILTROS_GENERALES: DefinicionFiltro[] = [
  { id: "familia", etiqueta: "Familia", valores: (p) => [nombreFamilia(p.familia)] },
  marca,
];

export const FILTROS: Record<FamiliaId, DefinicionFiltro[]> = {
  elevadores: [
    subfamilia,
    {
      id: "capacidad",
      etiqueta: "Capacidad",
      valores: (p) =>
        typeof p.atributos.capacidadKg === "number"
          ? [`${miles(p.atributos.capacidadKg)} kg`]
          : [],
      orden: numerico,
    },
    { id: "instalacion", etiqueta: "Instalación", valores: attr("instalacion") },
    { id: "vehiculos", etiqueta: "Vehículos (según catálogo)", valores: (p) => p.vehiculos.tipos },
    { id: "sincronizacion", etiqueta: "Sincronización", subfamilias: ["2 columnas"], valores: attr("sincronizacion") },
    { id: "aptoAlineacion", etiqueta: "Preparado para alineación", valores: siNo("aptoAlineacion") },
  ],
  alineacion: [
    { ...subfamilia, etiqueta: "Tecnología" },
    { id: "visualizacion", etiqueta: "Visualización", valores: attr("visualizacion") },
    marca,
  ],
  neumaticos: [
    subfamilia,
    marca,
    {
      id: "llanta",
      etiqueta: "Diámetro máx. de llanta",
      subfamilias: ["Desmontadoras"],
      valores: (p) => (typeof p.atributos.llantaMaxPulg === "number" ? [`Hasta ${p.atributos.llantaMaxPulg}″`] : []),
    },
    { id: "motorInverter", etiqueta: "Motor inverter", subfamilias: ["Desmontadoras"], valores: siNo("motorInverter") },
    { id: "brazoAyuda", etiqueta: "Brazo de ayuda", subfamilias: ["Desmontadoras"], valores: attr("brazoAyuda") },
    { id: "runFlat", etiqueta: "Run Flat", subfamilias: ["Desmontadoras"], valores: attr("runFlat") },
    { id: "altoVolumen", etiqueta: "Alto volumen de trabajo", subfamilias: ["Desmontadoras"], valores: siNo("altoVolumen") },
    { id: "monitor", etiqueta: "Pantalla / monitor", subfamilias: ["Equilibradoras"], valores: attr("monitor") },
    { id: "sonar", etiqueta: "Sonar (ancho de llanta)", subfamilias: ["Equilibradoras"], valores: siNo("sonar") },
    { id: "laser", etiqueta: "Láser", subfamilias: ["Equilibradoras"], valores: siNo("laser") },
    { id: "bloqueo", etiqueta: "Bloqueo de rueda", subfamilias: ["Equilibradoras"], valores: attr("bloqueo") },
    { id: "uso", etiqueta: "Uso", subfamilias: ["Equilibradoras"], valores: attr("uso") },
  ],
  "aire-comprimido": [
    subfamilia,
    { id: "presion", etiqueta: "Presión", valores: attr("presionBar"), orden: numerico },
    { id: "deposito", etiqueta: "Depósito", valores: attr("deposito") },
    { id: "alimentacion", etiqueta: "Alimentación (V/fase/Hz)", valores: attr("alimentacion") },
  ],
  "aire-acondicionado": [
    { id: "refrigerante", etiqueta: "Refrigerante", valores: attr("refrigerante") },
    { id: "hibridos", etiqueta: "Híbridos y eléctricos", valores: siNo("hibridos") },
    { id: "pantalla", etiqueta: "Pantalla", valores: attr("pantalla") },
    { id: "impresora", etiqueta: "Impresora", valores: attr("impresora") },
    { id: "recuperacion", etiqueta: "Capacidad de recuperación", valores: attr("recuperacion") },
    marca,
  ],
  "servicio-liquidos": [{ id: "aplicacion", etiqueta: "Aplicación", valores: attr("aplicacion") }, marca],
};

export type Seleccion = Record<string, string[]>;

export function filtrosVisibles(defs: DefinicionFiltro[], seleccion: Seleccion): DefinicionFiltro[] {
  const subs = seleccion.subfamilia ?? [];
  return defs.filter((d) => !d.subfamilias || (subs.length > 0 && subs.every((s) => d.subfamilias!.includes(s))));
}

export function aplicarFiltros(productos: Producto[], defs: DefinicionFiltro[], seleccion: Seleccion): Producto[] {
  return productos.filter((p) =>
    defs.every((d) => {
      const elegidos = seleccion[d.id];
      if (!elegidos?.length) return true;
      const v = d.valores(p);
      return elegidos.some((e) => v.includes(e));
    }),
  );
}

/** Opciones de un filtro con el número de productos que quedarían al marcarlas. */
export function opciones(
  productos: Producto[],
  def: DefinicionFiltro,
  defs: DefinicionFiltro[],
  seleccion: Seleccion,
): { valor: string; cuenta: number }[] {
  const resto = { ...seleccion, [def.id]: [] };
  const base = aplicarFiltros(productos, defs, resto);
  const cuentas = new Map<string, number>();
  for (const p of productos) for (const v of def.valores(p)) if (!cuentas.has(v)) cuentas.set(v, 0);
  for (const p of base) for (const v of new Set(def.valores(p))) cuentas.set(v, (cuentas.get(v) ?? 0) + 1);
  const orden = def.orden ?? ((a: string, b: string) => a.localeCompare(b, "es"));
  return [...cuentas.entries()].map(([valor, cuenta]) => ({ valor, cuenta })).sort((a, b) => orden(a.valor, b.valor));
}
