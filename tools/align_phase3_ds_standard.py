"""Match the Phase 3 DS presentation to the Phase 2 DS without changing workflow text."""

from copy import deepcopy
from pathlib import Path
from tempfile import NamedTemporaryFile
from zipfile import ZIP_DEFLATED, ZipFile

from lxml import etree
from PIL import Image
from io import BytesIO


ROOT = Path(__file__).resolve().parents[1]
REFERENCE = ROOT / "Phase 2 Doc" / "DS - PLPI Software  VMP-A5-0007-09_v14 Sep 2026.docx"
TARGET = ROOT / "Phase 3 Doc" / "DS-PLPI BAR - Phase 2-B Pre Assembly to Post Assembly.docx"
NS = {
    "w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main",
    "wp": "http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing",
    "a": "http://schemas.openxmlformats.org/drawingml/2006/main",
}
W = "{" + NS["w"] + "}"
EMU_PER_INCH = 914400


def paragraph_text(node):
    return "".join(node.xpath(".//w:t/text()", namespaces=NS)).strip()


with ZipFile(REFERENCE) as reference, ZipFile(TARGET) as target:
    reference_xml = etree.fromstring(reference.read("word/document.xml"))
    target_xml = etree.fromstring(target.read("word/document.xml"))
    reference_body = reference_xml.find(f"{W}body")
    target_body = target_xml.find(f"{W}body")

    reference_heading = next(
        p for p in reference_body.xpath("./w:p", namespaces=NS)
        if paragraph_text(p) == "Revision(s) History:"
    )
    revision_table = reference_heading.getnext().getnext()
    if revision_table.tag != f"{W}tbl":
        raise RuntimeError("Phase 2 revision history table was not found")

    new_heading = deepcopy(reference_heading)
    for bookmark in new_heading.xpath("./w:bookmarkStart|./w:bookmarkEnd", namespaces=NS):
        new_heading.remove(bookmark)
    for rendered_break in new_heading.xpath(".//w:lastRenderedPageBreak", namespaces=NS):
        rendered_break.getparent().remove(rendered_break)
    new_table = deepcopy(revision_table)
    rows = new_table.xpath("./w:tr", namespaces=NS)
    for row in rows[2:]:
        new_table.remove(row)
    if len(new_table.xpath("./w:tr", namespaces=NS)) != 2:
        raise RuntimeError("Revision table must contain only its header and initial issue row")

    intro = next(
        p for p in target_body.xpath("./w:p", namespaces=NS)
        if paragraph_text(p) == "1. Introduction"
    )
    existing_page_break = intro.getprevious()
    if existing_page_break is None or not existing_page_break.xpath(".//w:br[@w:type='page']", namespaces=NS):
        raise RuntimeError("Expected the original page break before Introduction")
    existing_page_break.addprevious(new_heading)
    existing_page_break.addprevious(deepcopy(reference_heading.getnext()))
    existing_page_break.addprevious(new_table)

    reference_workflow_heading = next(
        p for p in reference_body.xpath("./w:p", namespaces=NS)
        if paragraph_text(p) == "3.8 Workflow Status, Corrections and Audit Behaviour"
    )
    target_workflow_heading = next(
        p for p in target_body.xpath("./w:p", namespaces=NS)
        if paragraph_text(p) == "3.5 Workflow Status and Completion Behaviour"
    )
    old_ppr = target_workflow_heading.find(f"{W}pPr")
    if old_ppr is not None:
        target_workflow_heading.remove(old_ppr)
    target_workflow_heading.insert(0, deepcopy(reference_workflow_heading.find(f"{W}pPr")))
    reference_run = reference_workflow_heading.xpath("./w:r", namespaces=NS)[0]
    reference_rpr = reference_run.find(f"{W}rPr")
    for run in target_workflow_heading.xpath("./w:r", namespaces=NS):
        old_rpr = run.find(f"{W}rPr")
        if old_rpr is not None:
            run.remove(old_rpr)
        if reference_rpr is not None:
            run.insert(0, deepcopy(reference_rpr))

    reference_image_paragraph = reference_xml.xpath(
        ".//w:body/w:p[.//wp:extent]", namespaces=NS
    )[0]
    image_ppr = reference_image_paragraph.find(f"{W}pPr")
    image_paragraphs = target_xml.xpath(".//w:body/w:p[.//wp:extent]", namespaces=NS)
    if len(image_paragraphs) != 14:
        raise RuntimeError(f"Expected 14 screenshots, found {len(image_paragraphs)}")
    for index, paragraph in enumerate(image_paragraphs, start=1):
        original_ppr = paragraph.find(f"{W}pPr")
        if original_ppr is not None:
            paragraph.remove(original_ppr)
        paragraph.insert(0, deepcopy(image_ppr))

        name = f"word/media/image{index}.png"
        with Image.open(BytesIO(target.read(name))) as screenshot:
            pixel_width, pixel_height = screenshot.size
        display_width = 2.0 if 3 <= index <= 6 else 6.15
        display_height = display_width * pixel_height / pixel_width
        cx = str(round(display_width * EMU_PER_INCH))
        cy = str(round(display_height * EMU_PER_INCH))
        for extent in paragraph.xpath(".//wp:extent|.//a:xfrm/a:ext", namespaces=NS):
            extent.set("cx", cx)
            extent.set("cy", cy)

    result_xml = etree.tostring(
        target_xml, xml_declaration=True, encoding="UTF-8", standalone="yes"
    )
    with NamedTemporaryFile(dir=TARGET.parent, suffix=".docx", delete=False) as temporary:
        temporary_path = Path(temporary.name)
    with ZipFile(temporary_path, "w", compression=ZIP_DEFLATED) as output:
        for item in target.infolist():
            data = result_xml if item.filename == "word/document.xml" else target.read(item.filename)
            output.writestr(item, data)

temporary_path.replace(TARGET)
print(f"Aligned formatting in {TARGET}")
