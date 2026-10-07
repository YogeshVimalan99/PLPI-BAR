from pathlib import Path
from zipfile import ZipFile
from lxml import etree

root_dir = Path(__file__).resolve().parents[1]
docx = root_dir / "Phase 3 Doc" / "DS-PLPI BAR - Phase 2-B Pre Assembly to Post Assembly.docx"
ns = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
with ZipFile(docx) as archive:
    root = etree.fromstring(archive.read("word/document.xml"))
paragraphs = root.xpath(".//w:body/w:p", namespaces=ns)
for number in (38, 44, 176, 183, 184):
    print(f"--- {number} ---")
    print(etree.tostring(paragraphs[number - 1], encoding="unicode", pretty_print=True))
