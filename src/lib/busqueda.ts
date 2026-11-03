// Búsqueda tolerante: ignora mayúsculas, tildes, espacios, guiones y puntos
// en referencias; entiende "4200 kg" = "4.200 kg", "26 pulgadas" = 26″ y
// admite una letra de diferencia en palabras largas.
import { nombreFamilia } from "./familias";
import type { Producto } from "./types";

const SINONIMOS: Record<string, string> = {
  pulgadas: "pulg",
  pulgada: "pulg",
  kgs: "kg",
  kilos: "kg",
  climatizacion: "acondicionado",
  clima: "acondicionado",
  aa: "acondicionado",
  furgonetas: "furgon",
  furgoneta: "furgon",
  furgones: "furgon",
  van: "furgon",
  ruedas: "rueda",
  neumatico: "neumatic",
  neumaticos: "neumatic",
  tijeras: "tijera",
  hibrido: "hibrid",
  hibridos: "hibrid",
  electricos: "electric",
  electrico: "electric",
};

export function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/a\/a/g, " acondicionado ")
    .replace(/[″”"]/g, " pulg ")
    .replace(/(\d)\.(?=\d{3}\b)/g, "$1") // 4.200 -> 4200
    .replace(/(\d),(\d)/g, "$1.$2") // 26,5 -> 26.5
    .replace(/(\d)\s*(kg|kgs|bar|mm|kw|hp|l\/m|rpm|nm)\b/g, "$1 $2")
    .replace(/[^a-z0-9.\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Palabra en singular y con sinónimos aplicados. */
function singular(palabra: string): string {
  const w = SINONIMOS[palabra] ?? palabra;
  if (/\d/.test(w)) return w;
  if (w.length > 5 && w.endsWith("es")) return w.slice(0, -2);
  if (w.length > 4 && w.endsWith("s")) return w.slice(0, -1);
  return w;
}

/** Raíz de una palabra: singular recortado a 6 letras. */
function raiz(palabra: string): string {
  const s = singular(palabra);
  return /\d/.test(s) || s.length <= 6 ? s : s.slice(0, 6);
}

function compactar(texto: string): string {
  return texto.toLowerCase().replace(/[^a-z0-9]/g, "");
}

type Campo = { texto: string; peso: number };

type Indice = {
  producto: Producto;
  campos: { raices: string; palabras: Set<string>; peso: number }[];
  codigos: { compacto: string; peso: number }[];
};

function camposDe(p: Producto): { campos: Campo[]; codigos: Campo[] } {
  const extras = [...p.opcionales, ...p.accesorios];
  return {
    campos: [
      { texto: p.modelo, peso: 10 },
      { texto: `${p.marca} ${p.submarca ?? ""} ${p.fabricante === "ND" ? "" : p.fabricante}`, peso: 6 },
      { texto: `${nombreFamilia(p.familia)} ${p.subfamilia} ${p.tipoEquipo}`, peso: 6 },
      { texto: p.fichaRapida.map((d) => `${d.etiqueta} ${d.valor}`).join(" "), peso: 4 },
      { texto: p.descripcion, peso: 3 },
      { texto: p.destacados.join(" "), peso: 2 },
      { texto: p.caracteristicas.join(" "), peso: 2 },
      { texto: p.datosTecnicos.map((d) => `${d.etiqueta} ${d.valor}`).join(" "), peso: 2 },
      { texto: p.compatibilidades.join(" "), peso: 2 },
      { texto: p.vehiculos.tipos.join(" "), peso: 3 },
      { texto: extras.map((e) => e.nombre).join(" "), peso: 2 },
    ],
    codigos: [
      { texto: p.modelo, peso: 10 },
      { texto: p.marca, peso: 6 },
      ...(p.submarca ? [{ texto: p.submarca, peso: 6 }] : []),
      ...p.referencias.map((r) => ({ texto: r.valor, peso: 10 })),
      ...extras.filter((e) => e.referencia).map((e) => ({ texto: e.referencia, peso: 5 })),
    ],
  };
}

function indexar(p: Producto): Indice {
  const { campos, codigos } = camposDe(p);
  return {
    producto: p,
    campos: campos.map((c) => {
      const palabras = normalizar(c.texto).split(" ").filter(Boolean);
      return {
        raices: ` ${palabras.map(raiz).join(" ")} `,
        palabras: new Set(palabras.map(singular).filter((w) => w.length >= 4 && !/\d/.test(w))),
        peso: c.peso,
      };
    }),
    codigos: codigos.map((c) => ({ compacto: compactar(c.texto), peso: c.peso })),
  };
}

function unaLetraDeDiferencia(a: string, b: string): boolean {
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0;
  let j = 0;
  let cambios = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      i++;
      j++;
      continue;
    }
    if (++cambios > 1) return false;
    if (a.length > b.length) i++;
    else if (b.length > a.length) j++;
    else {
      i++;
      j++;
    }
  }
  return cambios + (a.length - i) + (b.length - j) <= 1;
}

/** Puntuación de un término en un producto; 0 si no aparece. */
function puntuarTermino(idx: Indice, termino: string): number {
  let mejor = 0;
  const compacto = compactar(termino);
  if (compacto.length >= 3) {
    for (const c of idx.codigos) {
      if (c.compacto === compacto) mejor = Math.max(mejor, c.peso * 2);
      else if (c.compacto.includes(compacto)) mejor = Math.max(mejor, c.peso);
    }
  }
  const r = raiz(termino);
  const numero = /\d/.test(r);
  const completo = singular(termino);
  for (const c of idx.campos) {
    if (c.raices.includes(` ${r} `)) mejor = Math.max(mejor, c.peso * 1.5);
    else if (!numero && r.length >= 2 && c.raices.includes(` ${r}`)) mejor = Math.max(mejor, c.peso);
    else if (!numero && completo.length >= 5) {
      for (const w of c.palabras) {
        if (unaLetraDeDiferencia(completo, w)) {
          mejor = Math.max(mejor, c.peso * 0.6);
          break;
        }
      }
    }
  }
  return mejor;
}

let indiceCache: Indice[] | null = null;
let productosCache: Producto[] | null = null;

export type Resultado = { producto: Producto; puntos: number };

export function buscar(productos: Producto[], consulta: string): { resultados: Resultado[]; parcial: boolean } {
  const q = consulta.trim();
  if (!q) return { resultados: productos.map((p) => ({ producto: p, puntos: 0 })), parcial: false };
  if (productosCache !== productos) {
    indiceCache = productos.map(indexar);
    productosCache = productos;
  }
  const indice = indiceCache!;
  const terminos = normalizar(q)
    .split(" ")
    .filter((t) => t && !["de", "del", "la", "el", "para", "con", "y", "en", "los", "las"].includes(t));
  if (!terminos.length) return { resultados: [], parcial: false };

  // Además de cada palabra, se prueba la consulta entera sin espacios
  // para encontrar referencias escritas por partes ("SDX 42 LIK").
  const consultaCompacta = compactar(q);
  const todos: Resultado[] = [];
  const parciales: Resultado[] = [];
  for (const idx of indice) {
    const puntos = terminos.map((t) => puntuarTermino(idx, t));
    const codigoEntero =
      consultaCompacta.length >= 4 && idx.codigos.some((c) => c.compacto.includes(consultaCompacta)) ? 25 : 0;
    const suma = puntos.reduce((a, b) => a + b, 0) + codigoEntero;
    if (codigoEntero || puntos.every((x) => x > 0)) todos.push({ producto: idx.producto, puntos: suma });
    else if (suma > 0) parciales.push({ producto: idx.producto, puntos: suma });
  }
  const orden = (a: Resultado, b: Resultado) => b.puntos - a.puntos;
  if (todos.length) {
    // Se descartan coincidencias marginales frente a la mejor (p. ej. una
    // palabra suelta en una característica).
    todos.sort(orden);
    const corte = todos[0].puntos * 0.4;
    return { resultados: todos.filter((r) => r.puntos >= corte), parcial: false };
  }
  return { resultados: parciales.sort(orden), parcial: parciales.length > 0 };
}
