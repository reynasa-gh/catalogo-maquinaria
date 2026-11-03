// Asistente "¿Qué equipo necesito?". Cada respuesta evalúa un producto con
// los datos del catálogo y devuelve el motivo; si el catálogo no lo dice,
// el resultado es "nd" y el producto pasa a "revisar", nunca a recomendado.
import { miles } from "./familias";
import type { FamiliaId, Producto } from "./types";

export type Evaluacion = { estado: "si" | "no" | "nd"; motivo: string };

export type Opcion = { id: string; etiqueta: string; evaluar?: (p: Producto) => Evaluacion };

export type Pregunta = {
  id: string;
  texto: string;
  opciones: Opcion[];
  /** La pregunta solo aparece si otra pregunta tiene una de estas respuestas. */
  soloSi?: { pregunta: string; respuestas: string[] };
};

export type Area = {
  id: string;
  etiqueta: string;
  descripcion: string;
  familia: FamiliaId;
  preguntas: Pregunta[];
};

const si = (motivo: string): Evaluacion => ({ estado: "si", motivo });
const no = (motivo: string): Evaluacion => ({ estado: "no", motivo });
const nd = (motivo: string): Evaluacion => ({ estado: "nd", motivo });
const INDIFERENTE: Opcion = { id: "indiferente", etiqueta: "Indiferente" };

const kg = (p: Producto) => (typeof p.atributos.capacidadKg === "number" ? p.atributos.capacidadKg : null);
const txt = (p: Producto, clave: string) => {
  const v = p.atributos[clave];
  const s = Array.isArray(v) ? v.join(" ") : v == null ? "" : String(v);
  return s === "ND" ? "" : s;
};

function vehiculo(tipo: Producto["vehiculos"]["tipos"][number]) {
  return (p: Producto): Evaluacion => {
    if (p.vehiculos.tipos.includes(tipo)) return si(p.vehiculos.fuente);
    if (!p.vehiculos.tipos.length) return nd("El catálogo no indica para qué vehículos está pensado.");
    return no(`El catálogo no lo cita para ${tipo.toLowerCase()}.`);
  };
}

function capacidad(min: number, max: number, etiqueta: string) {
  return (p: Producto): Evaluacion => {
    const c = kg(p);
    if (c === null) return nd("Capacidad no indicada.");
    const t = `Capacidad ${miles(c)} kg`;
    return c >= min && c <= max ? si(t) : no(`${t}, fuera de ${etiqueta}.`);
  };
}

function subfamilia(nombre: string) {
  return (p: Producto): Evaluacion => (p.subfamilia === nombre ? si(p.tipoEquipo) : no(""));
}

export const AREAS: Area[] = [
  {
    id: "elevacion",
    etiqueta: "Elevación",
    descripcion: "Elevadores de 2 columnas y de tijera",
    familia: "elevadores",
    preguntas: [
      {
        id: "capacidad",
        texto: "¿Qué capacidad de elevación busca?",
        opciones: [
          { id: "hasta3500", etiqueta: "Hasta 3.500 kg", evaluar: capacidad(0, 3500, "hasta 3.500 kg") },
          { id: "4000-4500", etiqueta: "4.000–4.500 kg", evaluar: capacidad(4000, 4500, "4.000–4.500 kg") },
          { id: "mas5000", etiqueta: "Más de 5.000 kg", evaluar: capacidad(5001, Infinity, "más de 5.000 kg") },
          INDIFERENTE,
        ],
      },
      {
        id: "instalacion",
        texto: "Tipo de instalación",
        opciones: [
          {
            id: "suelo",
            etiqueta: "Sobre suelo",
            evaluar: (p) => {
              const i = txt(p, "instalacion");
              if (i.includes("Sobre suelo")) return si("Instalación sobre suelo o empotrada.");
              if (i.includes("Sin base")) return si("Sin base: se instala sobre un buen suelo de hormigón.");
              return nd("Instalación no indicada.");
            },
          },
          {
            id: "empotrado",
            etiqueta: "Empotrado",
            evaluar: (p) =>
              txt(p, "instalacion").includes("Empotrado")
                ? si("Admite instalación empotrada.")
                : no("El catálogo no lo ofrece empotrado."),
          },
          INDIFERENTE,
        ],
      },
    ],
  },
  {
    id: "neumaticos",
    etiqueta: "Neumáticos",
    descripcion: "Desmontadoras, equilibradoras y escáner",
    familia: "neumaticos",
    preguntas: [
      {
        id: "equipo",
        texto: "¿Qué trabajo necesita cubrir?",
        opciones: [
          { id: "desmontar", etiqueta: "Montar y desmontar neumáticos", evaluar: subfamilia("Desmontadoras") },
          { id: "equilibrar", etiqueta: "Equilibrar ruedas", evaluar: subfamilia("Equilibradoras") },
          { id: "escanear", etiqueta: "Medir el desgaste del neumático", evaluar: subfamilia("Escáner de neumáticos") },
        ],
      },
      {
        id: "llanta",
        texto: "¿Hasta qué diámetro de llanta trabaja?",
        soloSi: { pregunta: "equipo", respuestas: ["desmontar"] },
        opciones: [
          { id: "24", etiqueta: "Hasta 24″", evaluar: llanta(24) },
          { id: "26", etiqueta: "Hasta 26″", evaluar: llanta(26) },
          INDIFERENTE,
        ],
      },
      {
        id: "volumen",
        texto: "¿Volumen de trabajo del taller?",
        soloSi: { pregunta: "equipo", respuestas: ["desmontar"] },
        opciones: [
          {
            id: "alto",
            etiqueta: "Alto",
            evaluar: (p) =>
              txt(p, "altoVolumen") === "Sí" ? si("Indicada para alto volumen de trabajo.") : nd("El catálogo no indica el volumen de trabajo."),
          },
          INDIFERENTE,
        ],
      },
      {
        id: "runflat",
        texto: "¿Necesita trabajar con neumáticos Run Flat?",
        soloSi: { pregunta: "equipo", respuestas: ["desmontar"] },
        opciones: [
          {
            id: "si",
            etiqueta: "Sí",
            evaluar: (p) =>
              txt(p, "runFlat") && txt(p, "runFlat") !== "ND"
                ? si("Accesorios Run Flat en la versión PLUS.")
                : nd("El catálogo no menciona Run Flat."),
          },
          { id: "no", etiqueta: "No" },
        ],
      },
      {
        id: "prioridad",
        texto: "¿Qué es lo más importante?",
        soloSi: { pregunta: "equipo", respuestas: ["equilibrar"] },
        opciones: [
          { id: "moto", etiqueta: "Equilibrar ruedas de moto", evaluar: vehiculo("Moto") },
          {
            id: "medio",
            etiqueta: "Volumen medio",
            evaluar: (p) => (txt(p, "uso") === "Volumen medio" ? si("Para talleres de volumen medio.") : txt(p, "uso") ? no("") : nd("Uso no indicado.")),
          },
          {
            id: "medioalto",
            etiqueta: "Volumen medio-alto",
            evaluar: (p) => (txt(p, "uso") === "Volumen medio-alto" ? si("Para talleres con volumen medio-alto.") : txt(p, "uso") && txt(p, "uso") !== "ND" ? no("") : nd("Uso no indicado.")),
          },
          {
            id: "tactil",
            etiqueta: "Pantalla táctil",
            evaluar: (p) => (txt(p, "monitor").includes("táctil") ? si("Pantalla táctil.") : no("")),
          },
          {
            id: "sonar",
            etiqueta: "Medición automática del ancho",
            evaluar: (p) => (txt(p, "sonar").startsWith("Sí") ? si(`Sonar: ${txt(p, "sonar").replace(/^Sí \(|\)$/g, "")}.`) : nd("No se indica sonar.")),
          },
          INDIFERENTE,
        ],
      },
    ],
  },
  {
    id: "alineacion",
    etiqueta: "Alineación",
    descripcion: "Alineadores 3D, CCD y por imagen",
    familia: "alineacion",
    preguntas: [
      {
        id: "tecnologia",
        texto: "¿Qué tecnología prefiere?",
        opciones: [
          { id: "3d", etiqueta: "3D", evaluar: subfamilia("3D") },
          { id: "ccd", etiqueta: "CCD", evaluar: subfamilia("CCD") },
          { id: "imagen", etiqueta: "Por imagen", evaluar: subfamilia("Por imagen") },
          INDIFERENTE,
        ],
      },
      {
        id: "visualizacion",
        texto: "¿Cómo quiere ver los resultados?",
        opciones: [
          {
            id: "consola",
            etiqueta: "Consola con PC",
            evaluar: (p) => (txt(p, "visualizacion").includes("Consola") ? si(txt(p, "visualizacion")) : no("")),
          },
          {
            id: "tableta",
            etiqueta: "Tableta portátil",
            evaluar: (p) => (txt(p, "visualizacion") === "Tableta" ? si("Control y visualización desde tableta.") : no("")),
          },
          INDIFERENTE,
        ],
      },
    ],
  },
  {
    id: "climatizacion",
    etiqueta: "Climatización",
    descripcion: "Estaciones de carga de aire acondicionado",
    familia: "aire-acondicionado",
    preguntas: [
      {
        id: "refrigerante",
        texto: "¿Con qué refrigerante trabaja?",
        opciones: [
          { id: "r134a", etiqueta: "R134a", evaluar: gas("R134a") },
          { id: "r1234yf", etiqueta: "R1234yf", evaluar: gas("R1234yf") },
          INDIFERENTE,
        ],
      },
      {
        id: "vehiculos",
        texto: "¿Qué vehículos atenderá?",
        opciones: [
          {
            id: "hibridos",
            etiqueta: "Híbridos y eléctricos",
            evaluar: (p) => (txt(p, "hibridos") === "Sí" ? si("Apta para híbridos y eléctricos.") : nd("El catálogo no lo indica.")),
          },
          { id: "agricola", etiqueta: "Agrícolas / obra pública", evaluar: vehiculo("Agrícola") },
          INDIFERENTE,
        ],
      },
      {
        id: "impresora",
        texto: "¿Necesita impresora?",
        opciones: [
          {
            id: "si",
            etiqueta: "Sí",
            evaluar: (p) => {
              const i = txt(p, "impresora");
              if (i === "Incorporada") return si("Impresora incorporada.");
              if (i === "Según versión") return si("Existe versión con impresora.");
              return nd("El catálogo no indica impresora.");
            },
          },
          INDIFERENTE,
        ],
      },
    ],
  },
  {
    id: "aire",
    etiqueta: "Aire comprimido",
    descripcion: "Compresores, secadores y depósitos",
    familia: "aire-comprimido",
    preguntas: [
      {
        id: "equipo",
        texto: "¿Qué equipo necesita?",
        opciones: [
          { id: "compresor", etiqueta: "Compresor", evaluar: subfamilia("Compresores") },
          { id: "secador", etiqueta: "Secador", evaluar: subfamilia("Secadores") },
          { id: "deposito", etiqueta: "Depósito", evaluar: subfamilia("Depósitos") },
        ],
      },
      {
        id: "deposito",
        texto: "¿El compresor debe llevar depósito?",
        soloSi: { pregunta: "equipo", respuestas: ["compresor"] },
        opciones: [
          {
            id: "con",
            etiqueta: "Con depósito",
            evaluar: (p) => (txt(p, "deposito") === "No incluido" ? no("Depósito no incluido.") : si(`Depósito de ${txt(p, "deposito")}.`)),
          },
          {
            id: "sin",
            etiqueta: "Sin depósito",
            evaluar: (p) => (txt(p, "deposito") === "No incluido" ? si("Depósito no incluido (compresor solo).") : no("Incluye depósito.")),
          },
          INDIFERENTE,
        ],
      },
    ],
  },
  {
    id: "mantenimiento",
    etiqueta: "Mantenimiento",
    descripcion: "Sangrado, purgado y cambio de líquidos",
    familia: "servicio-liquidos",
    preguntas: [
      {
        id: "trabajo",
        texto: "¿Qué servicio quiere ofrecer?",
        opciones: [
          {
            id: "frenos",
            etiqueta: "Líquido de frenos y embragues",
            evaluar: (p) => (txt(p, "aplicacion") === "Frenos y embragues" ? si("Sangrado y cambio de líquido de frenos y embragues hidráulicos.") : no("")),
          },
          {
            id: "refrigeracion",
            etiqueta: "Refrigerante / anticongelante",
            evaluar: (p) =>
              txt(p, "aplicacion").startsWith("Refrigeración")
                ? nd("El catálogo mezcla A/A y anticongelante en esta ficha: confirmar con el proveedor.")
                : no(""),
          },
        ],
      },
    ],
  },
];

function llanta(pulgadas: number) {
  return (p: Producto): Evaluacion => {
    const v = p.atributos.llantaMaxPulg;
    if (typeof v !== "number") return nd("Diámetro de llanta no indicado.");
    return v >= pulgadas ? si(`Llantas hasta ${v}″.`) : no(`Llantas hasta ${v}″.`);
  };
}

function gas(nombre: string) {
  return (p: Producto): Evaluacion => (txt(p, "refrigerante").includes(nombre) ? si(`Trabaja con ${nombre}.`) : nd(`No se indica ${nombre}.`));
}

export type Recomendacion = { producto: Producto; motivos: Evaluacion[] };

export function preguntasVisibles(area: Area, respuestas: Record<string, string>): Pregunta[] {
  return area.preguntas.filter((q) => !q.soloSi || q.soloSi.respuestas.includes(respuestas[q.soloSi.pregunta]));
}

export function recomendar(
  area: Area,
  productos: Producto[],
  respuestas: Record<string, string>,
): { recomendados: Recomendacion[]; revisar: Recomendacion[] } {
  const preguntas = preguntasVisibles(area, respuestas);
  const recomendados: Recomendacion[] = [];
  const revisar: Recomendacion[] = [];
  for (const p of productos.filter((x) => x.familia === area.familia)) {
    const motivos: Evaluacion[] = [];
    let descartado = false;
    for (const q of preguntas) {
      const op = q.opciones.find((o) => o.id === respuestas[q.id]);
      if (!op?.evaluar) continue;
      const e = op.evaluar(p);
      if (e.estado === "no") {
        descartado = true;
        break;
      }
      if (e.motivo) motivos.push(e);
    }
    if (descartado) continue;
    (motivos.some((m) => m.estado === "nd") ? revisar : recomendados).push({ producto: p, motivos });
  }
  return { recomendados, revisar };
}
