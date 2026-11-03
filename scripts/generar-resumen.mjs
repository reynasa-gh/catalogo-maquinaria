// Genera src/data/resumen.json: un índice mínimo (modelo, familia, miniatura)
// para la cabecera, el comparador y los favoritos, sin cargar todo el catálogo.
import { readFileSync, writeFileSync } from "node:fs";

const leer = (r) => JSON.parse(readFileSync(new URL(r, import.meta.url), "utf8"));
const productos = leer("../src/data/productos.json");
const imagenes = leer("../src/data/imagenes.json");

const resumen = productos.map((p) => {
  const img = (imagenes[p.id] ?? []).find((i) => i.tipo === "producto") ?? imagenes[p.id]?.[0];
  return {
    id: p.id,
    modelo: p.modelo,
    familia: p.familia,
    imagen: img ?? null,
  };
});

writeFileSync(new URL("../src/data/resumen.json", import.meta.url), JSON.stringify(resumen, null, 1) + "\n");
console.log(`Resumen: ${resumen.length} productos`);
