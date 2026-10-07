from pathlib import Path
from zipfile import ZipFile
from lxml import etree


DOCX = Path(__file__).resolve().parents[1] / "Phase 3 Doc" / "DS-PLPI BAR - Phase 2-B Pre Assembly to Post Assembly.docx"
NS = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}

with ZipFile(DOCX) as archive:
    root = etree.fromstring(archive.read("word/document.xml"))

for index, paragraph in enumerate(root.xpath(".//w:body/w:p", namespaces=NS), start=1):
    text = "".join(paragraph.xpath(".//w:t/text()", namespaces=NS)).strip()
    if text:
        print(f"{index}: {text}")
