import { miles } from "./familias";
import type { FamiliaId, Producto, ValorAtributo } from "./types";

export const MAX_COMPARAR = 4;

type Fila = { etiqueta: string; valor: (p: Producto) => string };

function texto(v: ValorAtributo): string {
  if (v === null || v === undefined || v === "") return "ND";
  if (Array.isArray(v)) return v.length ? v.join(" · ") : "ND";
  if (typeof v === "number") return miles(v);
  return v;
}

const a = (etiqueta: string, clave: string): Fila => ({ etiqueta, valor: (p) => texto(p.atributos[clave]) });
const tipo: Fila = { etiqueta: "Tipo", valor: (p) => p.tipoEquipo };

export const FILAS_COMPARAR: Record<FamiliaId, Fila[]> = {
  elevadores: [
    tipo,
    {
      etiqueta: "Capacidad",
      valor: (p) => (typeof p.atributos.capacidadKg === "number" ? `${miles(p.atributos.capacidadKg)} kg` : "ND"),
    },
    a("Columnas", "columnas"),
    a("Hueco entre columnas", "huecoColumnas"),
    a("Brazos", "brazos"),
    a("Plataforma", "plataforma"),
    a("Altura plegado", "alturaPlegado"),
    a("Doble elevación", "dobleElevacion"),
    a("Motores", "motores"),
    a("Sincronización", "sincronizacion"),
    a("Instalación", "instalacion"),
    a("Preparado para alineación", "aptoAlineacion"),
    { etiqueta: "Vehículos (según catálogo)", valor: (p) => texto(p.vehiculos.tipos) },
  ],
  alineacion: [tipo, a("Tecnología", "tecnologia"), a("Visualización", "visualizacion"), a("Garras", "garras"), a("Impresora", "impresora")],
  neumaticos: [
    tipo,
    { etiqueta: "Llanta máx.", valor: (p) => (typeof p.atributos.llantaMaxPulg === "number" ? `${p.atributos.llantaMaxPulg}″` : "ND") },
    a("Neumático máx.", "neumaticoMax"),
    a("Plato", "plato"),
    a("Motor inverter", "motorInverter"),
    a("Brazo de ayuda", "brazoAyuda"),
    a("Run Flat", "runFlat"),
    a("Alto volumen", "altoVolumen"),
    a("Pantalla / monitor", "monitor"),
    a("Sonar", "sonar"),
    a("Láser", "laser"),
    a("Bloqueo de rueda", "bloqueo"),
    a("Rueda máx.", "ruedaMax"),
    a("Uso", "uso"),
    a("Montaje", "montaje"),
    a("Precisión", "precision"),
  ],
  "aire-comprimido": [tipo, a("Presión", "presionBar"), a("Potencia", "potencia"), a("Caudal", "caudal"), a("Depósito", "deposito"), a("Alimentación", "alimentacion")],
  "aire-acondicionado": [
    tipo,
    a("Refrigerante", "refrigerante"),
    a("Híbridos y eléctricos", "hibridos"),
    a("Pantalla", "pantalla"),
    a("Impresora", "impresora"),
    a("Recuperación", "recuperacion"),
  ],
  "servicio-liquidos": [tipo, a("Aplicación", "aplicacion")],
};

export type FilaTabla = { etiqueta: string; valores: string[]; diferente: boolean };

/** Filas de la tabla comparativa: atributos de la familia + datos técnicos de todos. */
export function tablaComparativa(productos: Producto[]): { principales: FilaTabla[]; tecnicos: FilaTabla[] } {
  const crear = (etiqueta: string, valores: string[]): FilaTabla => ({
    etiqueta,
    valores,
    diferente: new Set(valores.map((v) => v.toLowerCase())).size > 1,
  });
  const util = (f: FilaTabla) => f.valores.some((v) => v !== "ND");
  if (!productos.length) return { principales: [], tecnicos: [] };
  const filas = FILAS_COMPARAR[productos[0].familia];
  const principales = filas.map((f) => crear(f.etiqueta, productos.map(f.valor))).filter(util);

  const etiquetas: string[] = [];
  for (const p of productos) for (const d of p.datosTecnicos) if (!etiquetas.includes(d.etiqueta)) etiquetas.push(d.etiqueta);
  const tecnicos = etiquetas
    .map((e) => crear(e, productos.map((p) => p.datosTecnicos.find((d) => d.etiqueta === e)?.valor ?? "ND")))
    .filter(util);
  return { principales, tecnicos };
}
