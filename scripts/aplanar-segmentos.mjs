// Next 16 exporta los datos de prefetch como carpetas
// (ruta/__next.producto/$d$id/__PAGE__.txt), pero el navegador los pide con
// el nombre aplanado (ruta/__next.producto.$d$id.__PAGE__.txt). En un hosting
// estático como GitHub Pages eso da 404, así que creamos también la copia plana.
import { copyFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const OUT = new URL("../out/", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
let copias = 0;

function recorrer(dir) {
  for (const nombre of readdirSync(dir)) {
    const ruta = join(dir, nombre);
    if (!statSync(ruta).isDirectory()) continue;
    if (nombre.startsWith("__next.")) aplanar(dir, ruta);
    else recorrer(ruta);
  }
}

function aplanar(base, carpeta) {
  const pila = [carpeta];
  while (pila.length) {
    const actual = pila.pop();
    for (const nombre of readdirSync(actual)) {
      const ruta = join(actual, nombre);
      if (statSync(ruta).isDirectory()) pila.push(ruta);
      else {
        const plano = relative(base, ruta).split(sep).join(".");
        copyFileSync(ruta, join(base, plano));
        copias++;
      }
    }
  }
}

recorrer(decodeURIComponent(OUT));
console.log(`Segmentos aplanados: ${copias}`);
