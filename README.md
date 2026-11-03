# Catálogo Maquinaria

Web app para el equipo comercial: el catálogo de maquinaria de taller en PDF convertido en una herramienta para **buscar, filtrar, comparar, presentar y compartir** equipos desde ordenador, tablet o móvil.

- 28 equipos en 6 familias, extraídos de las 33 páginas del PDF (ver [docs/CONTROL_DATOS.md](docs/CONTROL_DATOS.md)).
- Sin backend: es una web estática (Next.js), lista para GitHub Pages.
- La marca de la app es neutra. Se cambia en [src/config/marca.ts](src/config/marca.ts).

## Qué incluye

| Función | Dónde |
|---|---|
| Portada con buscador central y accesos por familia | `/` |
| Buscador con resultados mientras se escribe (atajo `/` o `Ctrl+K`) | Cabecera y portada |
| Catálogo completo y páginas de familia con filtros adaptados | `/catalogo/`, `/categoria/<familia>/` |
| Ficha de producto: galería, ficha rápida, pestañas técnicas, PDF original | `/producto/<id>/` (p. ej. `/producto/sdx42lik/`) |
| Comparador de hasta 4 equipos de la misma familia, con diferencias resaltadas | `/comparador/` |
| Asistente «¿Qué equipo necesito?» con recomendaciones justificadas | `/asistente/` |
| Favoritos («Mis equipos»), guardados en el navegador | `/favoritos/` |
| Modo presentación para tablet (pantalla completa, flechas entre equipos) | Botón en cada ficha |
| Compartir: copiar enlace, WhatsApp, email y ficha PDF (impresión) | Botón en cada ficha |

La búsqueda no distingue mayúsculas ni tildes e ignora espacios, guiones y puntos en las referencias. Entiende `4200 kg` = `4.200 kg` y `26 pulgadas` = `26″`, y tolera una letra de error (`elevdor`).

El asistente solo recomienda lo que el catálogo justifica. Si un dato no aparece en el PDF, el equipo sale como «a revisar», nunca como recomendado.

## Uso en local

Requisitos: Node.js 20 o superior.

```bash
npm install
```

```bash
npm run dev
```

Se abre en http://localhost:3000. Para generar la web estática (carpeta `out/`):

```bash
npm run build
```

## Datos

| Archivo | Contenido |
|---|---|
| `src/data/productos.json` | Fuente de verdad: un objeto por equipo con la misma estructura para todos |
| `src/data/imagenes.json` | Imágenes de cada equipo (generado por el script de imágenes) |
| `src/data/resumen.json` | Índice ligero para la cabecera y el comparador (se genera en cada build) |
| `public/img/productos/` | Fotos en WebP, tamaño completo y miniatura |
| `public/docs/catalogo-maquinaria.pdf` | El PDF original, enlazado por página desde cada ficha |

Reglas de los datos:

- Todo sale del PDF. Si un dato no aparece, vale `"ND"`. No se completan especificaciones por suposición.
- Referencias, según el color de la cabecera del PDF: en SPACE, el código en negro es la **referencia** y el gris la **equivalencia** (salvo el alineador 3D, con referencia SPA3DTOWSPC). En el resto de marcas, el negro es el **modelo** y el gris la **referencia**. Las referencias salen de la versión nueva del catálogo.
- `atributos` contiene los valores que usan los filtros, el comparador y el asistente.
- `notasDatos` recoge las incoherencias del PDF. Se muestran en la ficha, en «Observaciones comerciales».

Para **editar un equipo**, cambia `productos.json` y vuelve a construir. Tras editar datos, `python scripts/generar_control.py` actualiza la tabla de control. Para **añadir uno**, copia un objeto de la misma familia y cambia el `id` (es la URL de la ficha).

### Volver a extraer las imágenes

Solo hace falta si cambia el PDF. Necesita Python con `pymupdf` y `Pillow`:

```bash
pip install pymupdf pillow
```

```bash
npm run imagenes -- "<ruta al PDF del catálogo>"
```

El mapa de qué imagen del PDF corresponde a cada equipo está en `scripts/extraer_imagenes.py`. Las fotos que en el PDF miden menos de 500 px se amplían al doble al extraerlas; más ampliación se pixela.

Los logotipos de marca y el pictograma de 220 V salen de `scripts/extraer_logos.py` (carpeta `public/img/marcas/`):

```bash
python scripts/extraer_logos.py "<ruta al PDF del catálogo>"
```

### Planos descargables

Los planos de obra del SF6402NILT y del TreadReader están en `public/docs/planos/`. Son copia exacta de los PDF del fabricante (mismo contenido byte a byte) y se descargan con su nombre original. Se enlazan desde el campo `documentos` de cada producto en `productos.json`.

## Publicar en GitHub Pages

El repositorio incluye el workflow `.github/workflows/desplegar.yml`, que construye y publica la web en cada cambio en la rama `main`.

1. Crea un repositorio en GitHub (por ejemplo `catalogo-maquinaria`) y sube este proyecto a la rama `main`.
2. En el repositorio, ve a **Settings → Pages** y en **Source** elige **GitHub Actions**.
3. El workflow se ejecuta solo. Al terminar, la web queda en `https://<usuario>.github.io/<repositorio>/`.

Con una cuenta gratuita, el repositorio y la web son **públicos**: cualquiera con el enlace puede verlos.

## Arquitectura

```
src/
  app/            Páginas (App Router, exportación estática)
  components/     Componentes de interfaz reutilizables
  config/marca.ts Nombre y subtítulo de la app
  data/           JSON del catálogo
  lib/
    catalogo.ts   Única puerta de acceso a los datos
    busqueda.ts   Búsqueda tolerante
    filtros.ts    Filtros por familia
    comparador.ts Filas de la tabla comparativa
    asistente.ts  Preguntas y reglas del asistente
    store.tsx     Favoritos, comparador y modo presentación (localStorage)
scripts/          Extracción de imágenes y utilidades de build
docs/             Tabla de control de la extracción
```

**Migrar a Supabase, PostgreSQL o una API:** el modelo de `src/lib/types.ts` equivale a una tabla `productos` (con `atributos` como JSONB) más una tabla `imagenes`. Solo habría que reescribir las funciones de `src/lib/catalogo.ts` para leer de la base de datos. Si los datos deben cambiar sin reconstruir la web, habría que pasar a un hosting con servidor, como Vercel o Netlify.

## Limitaciones conocidas

- Favoritos y comparador se guardan en cada navegador: no se sincronizan entre dispositivos ni entre comerciales.
- Algunas imágenes del PDF son de baja resolución (detalles y capturas de pantalla). Se muestran en tamaño pequeño.
- La ficha PDF se genera con la impresión del navegador («Guardar como PDF»).
- Incoherencias del PDF pendientes de confirmar con el proveedor: ver [docs/CONTROL_DATOS.md](docs/CONTROL_DATOS.md).
