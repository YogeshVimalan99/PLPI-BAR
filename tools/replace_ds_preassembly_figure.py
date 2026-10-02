"""Replace the cropped Pre-Assembly figure with its complete sign-off view."""

from io import BytesIO
from pathlib import Path
from tempfile import NamedTemporaryFile
from zipfile import ZIP_DEFLATED, ZipFile

from lxml import etree
from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "Phase 3 Doc" / "DS-PLPI BAR - Phase 2-B Pre Assembly to Post Assembly.docx"
SOURCE = ROOT / "tmp_ds_format_update" / "preassembly-full.png"
NS = {
    "w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main",
    "wp": "http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing",
    "a": "http://schemas.openxmlformats.org/drawingml/2006/main",
}

with Image.open(SOURCE) as screenshot:
    if screenshot.size != (1920, 1800):
        raise RuntimeError(f"Unexpected source size: {screenshot.size}")
    cropped = screenshot.crop((0, 0, 1920, 1650))
    image_buffer = BytesIO()
    cropped.save(image_buffer, format="PNG")
    image_data = image_buffer.getvalue()

with ZipFile(TARGET) as source:
    document = etree.fromstring(source.read("word/document.xml"))
    figures = document.xpath(".//w:body/w:p[.//wp:extent]", namespaces=NS)
    if len(figures) != 14:
        raise RuntimeError(f"Expected 14 figures, found {len(figures)}")
    figure = figures[1]
    cx = str(round(6.15 * 914400))
    cy = str(round(6.15 * 1650 / 1920 * 914400))
    for extent in figure.xpath(".//wp:extent|.//a:xfrm/a:ext", namespaces=NS):
        extent.set("cx", cx)
        extent.set("cy", cy)

    updated_xml = etree.tostring(
        document, xml_declaration=True, encoding="UTF-8", standalone="yes"
    )
    with NamedTemporaryFile(dir=TARGET.parent, suffix=".docx", delete=False) as temporary:
        temporary_path = Path(temporary.name)
    with ZipFile(temporary_path, "w", compression=ZIP_DEFLATED) as output:
        for item in source.infolist():
            if item.filename == "word/document.xml":
                data = updated_xml
            elif item.filename == "word/media/image2.png":
                data = image_data
            else:
                data = source.read(item.filename)
            output.writestr(item, data)

temporary_path.replace(TARGET)
print(f"Replaced Pre-Assembly figure in {TARGET}")
