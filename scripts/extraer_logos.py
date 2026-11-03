"""Extrae del PDF los logotipos de marca y el pictograma de 220 V.

Uso:  python scripts/extraer_logos.py "<ruta al PDF del catálogo>"

Los logos que son imagen se sacan tal cual; los que son dibujo vectorial
(SNAP-ON y TREADREADER) se renderizan a alta resolución sin el fondo de la
cabecera. En todos, el blanco del fondo pasa a ser transparente. Salida: public/img/marcas/*.png
"""
import os
import sys

import pymupdf
from PIL import Image, ImageChops

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SALIDA = os.path.join(RAIZ, "public", "img", "marcas")

# nombre -> (página, xref de la imagen)
RASTER = {
    "space": (2, 156),
    "boxer": (10, 675),
    "abac": (24, 1513),
    "ecotechnics": (28, 1698),
    "wigam": (29, 1750),
    "micrauto": (31, 1822),
    "pictograma-220v": (16, 891),
}
# nombre -> (página, recorte en puntos PDF)
VECTOR = {
    "snap-on": (10, (208, 14, 366, 64)),
    "treadreader": (21, (250, 12, 364, 54)),
}


def recortar(img: Image.Image) -> Image.Image:
    """Quita los márgenes blancos o transparentes alrededor del logo."""
    rgba = img.convert("RGBA")
    blanco = Image.new("RGBA", rgba.size, (255, 255, 255, 255))
    blanco.alpha_composite(rgba)
    marca = blanco.convert("L").point(lambda v: 255 if v < 240 else 0)
    return rgba.crop(marca.getbbox() or (0, 0, *rgba.size))


def blanco_a_transparente(img: Image.Image) -> Image.Image:
    """El dibujo vectorial trae un recuadro blanco detrás: se vuelve transparente."""
    r, g, b, a = img.split()
    oscuro = ImageChops.darker(ImageChops.darker(r, g), b)
    visible = oscuro.point(lambda v: 0 if v > 245 else 255)
    return Image.merge("RGBA", (r, g, b, ImageChops.multiply(a, visible)))


def raster(doc, pagina, xref):
    info = doc.extract_image(xref)
    pix = pymupdf.Pixmap(doc, xref)
    if info.get("smask"):
        pix = pymupdf.Pixmap(pix, pymupdf.Pixmap(doc, info["smask"]))
    if pix.colorspace and pix.colorspace.n >= 4:
        pix = pymupdf.Pixmap(pymupdf.csRGB, pix)
    modo = "RGBA" if pix.alpha else "RGB"
    return Image.frombytes(modo, (pix.width, pix.height), pix.samples)


def vectorial(ruta_pdf, pagina, clip):
    doc = pymupdf.open(ruta_pdf)  # copia en memoria: se le quitan las imágenes
    page = doc[pagina - 1]
    page.add_redact_annot(page.rect)
    page.apply_redactions(
        images=pymupdf.PDF_REDACT_IMAGE_REMOVE,
        graphics=pymupdf.PDF_REDACT_LINE_ART_NONE,
        text=pymupdf.PDF_REDACT_TEXT_NONE,
    )
    pix = page.get_pixmap(clip=pymupdf.Rect(clip), matrix=pymupdf.Matrix(8, 8), alpha=True)
    return Image.frombytes("RGBA", (pix.width, pix.height), pix.samples)


def main(ruta_pdf):
    os.makedirs(SALIDA, exist_ok=True)
    doc = pymupdf.open(ruta_pdf)
    for nombre, (pagina, xref) in RASTER.items():
        # Fondo blanco a transparente: la ficha tiene fondo gris claro.
        img = recortar(blanco_a_transparente(raster(doc, pagina, xref).convert("RGBA")))
        img.save(os.path.join(SALIDA, f"{nombre}.png"), optimize=True)
        print(nombre, img.size)
    for nombre, (pagina, clip) in VECTOR.items():
        img = recortar(blanco_a_transparente(vectorial(ruta_pdf, pagina, clip)))
        img.thumbnail((900, 300), Image.LANCZOS)
        img.save(os.path.join(SALIDA, f"{nombre}.png"), optimize=True)
        print(nombre, img.size)


if __name__ == "__main__":
    main(sys.argv[1])
