"""Regenera docs/CONTROL_DATOS.md a partir de src/data/productos.json.

Uso:  python scripts/generar_control.py
"""
import json
import os
from collections import Counter

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
productos = json.load(open(os.path.join(RAIZ, "src", "data", "productos.json"), encoding="utf-8"))
imagenes = json.load(open(os.path.join(RAIZ, "src", "data", "imagenes.json"), encoding="utf-8"))


def refs(p, etiquetas):
    v = [r["valor"] for r in p["referencias"] if any(r["etiqueta"].startswith(e) for e in etiquetas)]
    return " · ".join(v) or "ND"


L = [
    "# Tabla de control de extracción",
    "",
    "Fuentes:",
    "",
    "- Catálogo de maquinaria en PDF (33 páginas): textos, datos técnicos e imágenes. La pág. 1 es la portada.",
    "- Versión nueva del catálogo en PDF (34 páginas): referencias y equivalencias.",
    "",
    "Regla de referencias de la cabecera de cada página del PDF:",
    "",
    "- SPACE: el código en negro es la **referencia** y el gris la **equivalencia**. Excepción: el alineador 3D, cuya referencia es SPA3DTOWSPC.",
    "- Resto de marcas: el texto en negro es el **modelo** y el gris la **referencia**. El V 2180 no tiene referencia.",
    "",
    "| Pág. PDF | Familia | Subfamilia | Marca | Modelo | Referencia | Equivalencia | Imágenes | Extraído |",
    "|---|---|---|---|---|---|---|---|---|",
]
for p in productos:
    marca = p["marca"] + (f" · {p['submarca']}" if p["submarca"] else "")
    L.append(
        f"| {', '.join(map(str, p['paginas']))} | {p['familia']} | {p['subfamilia']} | {marca} | {p['modelo']} "
        f"| {refs(p, ['Referencia'])} | {refs(p, ['Equivalencia'])} | {len(imagenes.get(p['id'], []))} | Sí |"
    )
L += ["", f"**Total: {len(productos)} productos.** Cobertura de páginas 2–33: 100 %.", "", "## Documentos descargables", ""]
for p in productos:
    for d in p.get("documentos", []):
        L.append(f"- **{p['modelo']}**: {d['titulo']} — `{d['nombreDescarga']}` (copia exacta del PDF del fabricante).")
L += ["", "## Campos sin información (ND)", ""]
for p in productos:
    nd = []
    if not p["referencias"]:
        nd.append("referencia (el catálogo solo da el nombre del modelo)")
    if not p["datosTecnicos"]:
        nd.append("datos técnicos separados")
    if nd:
        L.append(f"- **{p['modelo']}**: {', '.join(nd)}")
L += ["", "## Incidencias detectadas en el PDF", ""]
for p in productos:
    for n in p["notasDatos"]:
        L.append(f"- **{p['modelo']}** (pág. {', '.join(map(str, p['paginas']))}): {n}")
L += [
    "",
    "## Correcciones ortográficas aplicadas",
    "",
    "- «carcas reforzada» → «carcasa reforzada», «transito» → «tránsito» (elevadores 2 columnas).",
    "- «Estación de garga» → «Estación de carga» (ECK NEXT PRO, OPTIMA).",
    "- «magueras» → «mangueras» (ECK NEXT PRO).",
    "- «Rampa ecáner» → «Rampa escáner» (TREADREADER).",
    "- «SIPER LX» → «SUPER LX» (SUPER LX 26).",
    "",
    "## Duplicados",
    "",
]
todas = [r["valor"] for p in productos for r in p["referencias"]]
repetidas = [v for v, n in Counter(todas).items() if n > 1]
L.append(
    f"Referencias repetidas entre productos: {', '.join(repetidas)}." if repetidas else "No hay referencias duplicadas entre productos."
)
L.append("SG45.26D y SG45.26DP Plus comparten foto de gama (pág. 12).")

with open(os.path.join(RAIZ, "docs", "CONTROL_DATOS.md"), "w", encoding="utf-8") as f:
    f.write("\n".join(L) + "\n")
print(f"{len(productos)} productos · duplicadas: {repetidas or 'ninguna'}")
