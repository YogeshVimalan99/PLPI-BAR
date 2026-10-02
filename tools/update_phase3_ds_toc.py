from copy import deepcopy
from pathlib import Path
from tempfile import NamedTemporaryFile
from zipfile import ZIP_DEFLATED, ZipFile

from lxml import etree


ROOT = Path(__file__).resolve().parents[1]
DOCX = ROOT / "Phase 3 Doc" / "DS-PLPI BAR - Phase 2-B Pre Assembly to Post Assembly.docx"
NS = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
W = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"


def text_of(paragraph):
    return "".join(paragraph.xpath(".//w:t/text()", namespaces=NS)).strip()


def add_bookmark(paragraph, name, bookmark_id):
    for node in paragraph.xpath("./w:bookmarkStart|./w:bookmarkEnd", namespaces=NS):
        paragraph.remove(node)
    runs = paragraph.xpath("./w:r", namespaces=NS)
    if not runs:
        raise RuntimeError(f"Heading has no run: {text_of(paragraph)}")
    start = etree.Element(f"{W}bookmarkStart")
    start.set(f"{W}id", bookmark_id)
    start.set(f"{W}name", name)
    end = etree.Element(f"{W}bookmarkEnd")
    end.set(f"{W}id", bookmark_id)
    runs[0].addprevious(start)
    runs[-1].addnext(end)


def clone_toc_entry(template, title, page_number, anchor):
    entry = deepcopy(template)
    hyperlink = entry.find(f"{W}hyperlink")
    if hyperlink is None:
        raise RuntimeError("TOC template has no hyperlink")
    hyperlink.set(f"{W}anchor", anchor)
    text_nodes = entry.xpath(".//w:t", namespaces=NS)
    if len(text_nodes) < 2:
        raise RuntimeError("TOC template has insufficient text nodes")
    text_nodes[0].text = title
    text_nodes[-1].text = page_number
    instruction = entry.find(f".//{W}instrText")
    instruction.text = f" PAGEREF {anchor} \\h "
    return entry


with ZipFile(DOCX, "r") as source:
    document = etree.fromstring(source.read("word/document.xml"))
    paragraphs = document.xpath(".//w:body/w:p", namespaces=NS)
    by_text = {text_of(paragraph): paragraph for paragraph in paragraphs}

    heading_35 = by_text["3.5 Workflow Status and Completion Behaviour"]
    heading_4 = by_text["4. Additional Non-Functional Requirements"]
    add_bookmark(heading_35, "_TocPhase3DS35", "900")
    add_bookmark(heading_4, "_TocPhase3DS4", "901")

    toc_34 = by_text["3.4 Post-Assembly QC Module15"]
    toc_31 = by_text["3. Design Specification4"]
    toc_35 = clone_toc_entry(toc_34, "3.5 Workflow Status and Completion Behaviour", "17", "_TocPhase3DS35")
    toc_4 = clone_toc_entry(toc_31, "4. Additional Non-Functional Requirements", "18", "_TocPhase3DS4")
    toc_34.addnext(toc_35)
    toc_35.addnext(toc_4)

    updated_xml = etree.tostring(document, xml_declaration=True, encoding="UTF-8", standalone="yes")
    with NamedTemporaryFile(dir=DOCX.parent, suffix=".docx", delete=False) as temporary_file:
        temporary_path = Path(temporary_file.name)
    with ZipFile(temporary_path, "w", compression=ZIP_DEFLATED) as target:
        for info in source.infolist():
            data = updated_xml if info.filename == "word/document.xml" else source.read(info.filename)
            target.writestr(info, data)

temporary_path.replace(DOCX)
print(f"Updated TOC in {DOCX}")
