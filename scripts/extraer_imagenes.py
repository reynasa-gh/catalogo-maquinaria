"""Extrae las imágenes del PDF del catálogo y las optimiza para la web.

Uso:  python scripts/extraer_imagenes.py "<ruta al PDF del catálogo>"

Genera:
  public/img/productos/<slug>/<n>.webp   (máx. 1400 px)
  public/img/productos/<slug>/<n>-sm.webp (máx. 560 px, para tarjetas)
  public/img/portada/*.webp
  src/data/imagenes.json  (rutas, tamaños, tipo y texto alternativo)

Cada imagen se identifica por su xref dentro del PDF. Si el PDF cambia,
hay que revisar el mapa IMAGENES de abajo.
"""
import json
import os
import shutil
import sys

import pymupdf
from PIL import Image, ImageFilter

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SALIDA = os.path.join(RAIZ, "public", "img")
MANIFIESTO = os.path.join(RAIZ, "src", "data", "imagenes.json")

# slug -> lista de (xref, tipo, texto alternativo / pie[, factor de ampliación])
# tipo: producto | detalle | pantalla | accesorio | plano
# El factor fuerza la ampliación; si no se indica, se calcula con factor_auto().
IMAGENES = {
    "sdx35": [
        (132, "producto", "Elevador SDX35 de 2 columnas"),
        (141, "detalle", "Motor reforzado"),
        (144, "detalle", "Rodamiento de larga duración"),
        (147, "detalle", "Polea de aluminio refrigerada"),
        (138, "detalle", "Tacos con enganche rápido para suplementos"),
        (150, "detalle", "Tuerca de trabajo en bronce"),
        (135, "plano", "Posicionamiento de brazos por vehículo"),
    ],
    "sdx42lik": [
        (195, "producto", "Elevador SDX42LIK de 2 columnas"),
        (201, "plano", "Posicionamiento de brazos por vehículo y cotas"),
    ],
    "sdx55": [
        (233, "producto", "Elevador SDX55 de 2 columnas"),
        (236, "plano", "Plano de dimensiones del SDX55"),
    ],
    "sfl5535": [
        (283, "producto", "Elevador de tijera SFL5535 con vehículo"),
        (286, "detalle", "Detalle del mecanismo de seguridad"),
        (289, "detalle", "Instalación empotrada en taller"),
    ],
    "sf6402nilt": [
        (309, "producto", "Elevador de tijera SF6402NILT con vehículo"),
        (326, "detalle", "Elevador SF6402NILT plegado"),
        (315, "detalle", "Detalle de articulación"),
        (318, "detalle", "Operario bajo el elevador"),
        (312, "detalle", "Detalle del circuito hidráulico"),
        (321, "detalle", "Plataforma con plato giratorio"),
        (356, "plano", "Plano de cimentación del elevador de tijera"),
    ],
    "spa3dtower-4": [
        (582, "producto", "Alineador SPA3DTOWER.4 con consola"),
        (585, "detalle", "Cruz 3D SPA.3DTOW.702067"),
    ],
    "sptd2-0wifi-3": [
        (612, "producto", "Tableta del alineador SPTD2.0WIFI.3"),
        (629, "detalle", "Garra del captador"),
        (624, "pantalla", "Pantalla de resultados"),
        (621, "pantalla", "Pantalla de giro de ruedas"),
        (618, "pantalla", "Pantalla de bloqueo de volante"),
        (615, "pantalla", "Pantalla de ajuste"),
    ],
    "v-2180": [
        (650, "producto", "Alineador V 2180 con barra de cámaras"),
        (660, "detalle", "Barra de cámaras giratoria"),
        (663, "accesorio", "Platos giratorios incluidos"),
        (670, "accesorio", "Garras de 4 puntos AC 100"),
        (656, "accesorio", "Kit móvil (no incluido)"),
    ],
    "ga2641d-24": [
        (709, "producto", "Desmontadora GA2641D.24"),
    ],
    "sg45-26d": [
        (742, "producto", "Desmontadora gama SG45.26 con detalles"),
        (821, "accesorio", "Pneumatic bead press arm (VSG.PL100.900401)"),
        (830, "accesorio", "Bandeja de almacenamiento (G800A141)"),
        (848, "accesorio", "Plastic tool"),
        (836, "accesorio", "Kit inflado tubeless (G800A137)"),
        (842, "accesorio", "Elevador (G800A138)"),
        (845, "accesorio", "Destalonador 2 posiciones y pala ajustable"),
        (827, "accesorio", "Posicionamiento neumático"),
    ],
    "sg45-26dp-plus": [
        (742, "producto", "Desmontadora gama SG45.26 con detalles"),
        (827, "accesorio", "Posicionamiento neumático"),
    ],
    "super-lx-24": [
        (879, "producto", "Desmontadora SUPER LX 24"),
    ],
    "super-lx-26": [
        (917, "producto", "Desmontadora SUPER LX 26"),
    ],
    "er455ws": [
        (954, "producto", "Equilibradora ER455WS"),
        (957, "detalle", "Posicionamiento del plomo"),
        (969, "detalle", "Bloqueo rápido de la rueda"),
        (960, "pantalla", "Programa ALU-S"),
        (972, "pantalla", "Programa dinámico"),
        (963, "pantalla", "Pantalla de programas"),
        (966, "pantalla", "Medición del alabeo"),
    ],
    "s-1280": [
        (994, "producto", "Equilibradora S 1280"),
        (997, "detalle", "Eje de bloqueo"),
        (1000, "detalle", "Conos y garra de bloqueo"),
    ],
    "s-1450-s": [
        (1025, "producto", "Equilibradora S 1450 S"),
        (1028, "pantalla", "Pantalla táctil"),
        (1031, "detalle", "Eje principal de 225 mm"),
        (997, "detalle", "Eje de bloqueo"),
    ],
    "s-1750-s": [
        (1055, "producto", "Equilibradora S 1750 S"),
        (1058, "detalle", "Quick BAL: tiempo de lanzamiento 6 s"),
        (1061, "detalle", "Rueda en el eje"),
        (997, "detalle", "Eje de bloqueo"),
    ],
    "treadreader": [
        (1100, "producto", "Rampa escáner de suelo TreadReader"),
        (1106, "pantalla", "Escaneo 3D de la banda de rodadura"),
        (1187, "pantalla", "Plataforma en la nube en monitor"),
        (1190, "pantalla", "Informe de escaneos en portátil"),
        (1103, "detalle", "Escaneo de neumático"),
        (1279, "detalle", "Marco para instalación empotrada"),
        (1287, "plano", "Plano de obra civil TreadReader"),
    ],
    "cross-900-10": [
        (1506, "producto", "Compresor de tornillo CROSS 900 10"),
    ],
    "cool-72": [
        (1550, "producto", "Secador frigorífico COOL 72"),
    ],
    "dv-1000-126-kit": [
        (1584, "producto", "Depósito vertical DV-1000/126"),
        (1590, "accesorio", "Accesorios incluidos: manómetro, válvula de seguridad y grifo de purga"),
        (1587, "plano", "Plano de conexiones del depósito"),
    ],
    "cross-500-10-200": [
        (1641, "producto", "Compresor CROSS 500 10 200 sobre depósito"),
    ],
    "eck-next-pro": [
        (1692, "producto", "Estación de carga A/A ECK NEXT PRO"),
    ],
    "optima": [
        (1744, "producto", "Estación de carga automática A/A OPTIMA"),
    ],
    "x-cross": [
        (1787, "producto", "Estación A/A X-CROSS para exterior"),
    ],
    "ds903": [
        (1841, "producto", "Equipo de sangrado DS903"),
        (1804, "accesorio", "Kits de boquillas"),
        (1810, "accesorio", "Adaptadores"),
        (1816, "accesorio", "Tapón universal"),
    ],
    "syncro-exprex": [
        (1876, "producto", "SYNCRO EXPREX"),
    ],
    "syncro-plus": [
        (1893, "producto", "SYNCRO PLUS"),
    ],
}

PORTADA = {
    "tijera": 55,
    "desmontadora": 49,
    "columnas": 74,
}


def extraer(doc, xref):
    """Devuelve la imagen del PDF como PIL.Image, con transparencia si la tiene."""
    info = doc.extract_image(xref)
    smask = info.get("smask") or 0
    pix = pymupdf.Pixmap(doc, xref)
    if smask:
        try:
            pix = pymupdf.Pixmap(pix, pymupdf.Pixmap(doc, smask))
        except Exception:
            pass
    if pix.colorspace and pix.colorspace.n >= 4:
        pix = pymupdf.Pixmap(pymupdf.csRGB, pix)
    modo = "RGBA" if pix.alpha else "RGB"
    return Image.frombytes(modo, (pix.width, pix.height), pix.samples)


# Las fotos del PDF de menos de LADO_MIN px se amplían al doble: algo más
# grandes que el original sin llegar a pixelarse (más de 2× se nota).
# Los planos se dejan tal cual.
LADO_MIN = 500
FACTOR_MAX = 2


def factor_auto(img, tipo):
    if tipo == "plano" or max(img.size) >= LADO_MIN:
        return 1
    return FACTOR_MAX


def ampliar(img, factor):
    """Amplía una imagen pequeña con remuestreo de calidad y un enfoque suave."""
    grande = img.resize((img.width * factor, img.height * factor), Image.LANCZOS)
    return grande.filter(ImageFilter.UnsharpMask(radius=1.2, percent=40, threshold=2))


def guardar(img, ruta, lado_max):
    im = img.copy()
    im.thumbnail((lado_max, lado_max), Image.LANCZOS)
    im.save(ruta, "WEBP", quality=82, method=6)
    return im.size


def main(pdf):
    doc = pymupdf.open(pdf)
    destino = os.path.join(SALIDA, "productos")
    if os.path.isdir(destino):
        shutil.rmtree(destino)
    manifiesto = {}
    for slug, lista in IMAGENES.items():
        carpeta = os.path.join(destino, slug)
        os.makedirs(carpeta, exist_ok=True)
        manifiesto[slug] = []
        for n, (xref, tipo, alt, *extra) in enumerate(lista, 1):
            retocada = os.path.join(RAIZ, "scripts", "fotos-retocadas", f"{slug}-{n}.png")
            # Si hay una versión retocada (p. ej. sin fondo), se usa en lugar de la del PDF.
            img = Image.open(retocada) if os.path.exists(retocada) else extraer(doc, xref)
            original = max(img.size)
            factor = extra[0] if extra else factor_auto(img, tipo)
            if factor > 1:
                img = ampliar(img, factor)
            w, h = guardar(img, os.path.join(carpeta, f"{n}.webp"), 1400)
            guardar(img, os.path.join(carpeta, f"{n}-sm.webp"), 560)
            manifiesto[slug].append({
                "src": f"/img/productos/{slug}/{n}.webp",
                "thumb": f"/img/productos/{slug}/{n}-sm.webp",
                "w": w, "h": h, "tipo": tipo, "alt": alt,
                "calidad": "baja" if original < 300 else "ok",
            })
    portada = os.path.join(SALIDA, "portada")
    os.makedirs(portada, exist_ok=True)
    for nombre, xref in PORTADA.items():
        guardar(extraer(doc, xref), os.path.join(portada, f"{nombre}.webp"), 900)
    with open(MANIFIESTO, "w", encoding="utf-8") as f:
        json.dump(manifiesto, f, ensure_ascii=False, indent=1)
    total = sum(len(v) for v in manifiesto.values())
    print(f"{total} imágenes de {len(manifiesto)} productos")


if __name__ == "__main__":
    main(sys.argv[1])
