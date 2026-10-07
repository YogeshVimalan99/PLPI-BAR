"""Refresh TOC page numbers in Word while keeping Revision History out of the TOC."""

from copy import deepcopy
from pathlib import Path
from tempfile import NamedTemporaryFile
from zipfile import ZIP_DEFLATED, ZipFile

from lxml import etree


ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "Phase 3 Doc" / "DS-PLPI BAR - Phase 2-B Pre Assembly to Post Assembly.docx"
NS = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
W = "{" + NS["w"] + "}"

with ZipFile(TARGET) as source:
    document = etree.fromstring(source.read("word/document.xml"))
    styles = etree.fromstring(source.read("word/styles.xml"))
    settings = etree.fromstring(source.read("word/settings.xml"))

    revision = next(
        p for p in document.xpath(".//w:body/w:p", namespaces=NS)
        if "".join(p.xpath(".//w:t/text()", namespaces=NS)).strip() == "Revision(s) History:"
    )
    reference_heading = styles.xpath(
        "./w:style[@w:styleId='Heading1']", namespaces=NS
    )
    if len(reference_heading) != 1:
        raise RuntimeError("Heading 1 style is missing")
    custom_id = "RevisionHistoryHeading"
    if not styles.xpath(f"./w:style[@w:styleId='{custom_id}']", namespaces=NS):
        custom = deepcopy(reference_heading[0])
        custom.set(f"{W}styleId", custom_id)
        name = custom.find(f"{W}name")
        if name is None:
            name = etree.Element(f"{W}name")
            custom.insert(0, name)
        name.set(f"{W}val", "Revision History Heading")
        based_on = custom.find(f"{W}basedOn")
        if based_on is None:
            based_on = etree.SubElement(custom, f"{W}basedOn")
        based_on.set(f"{W}val", "Heading1")
        properties = custom.find(f"{W}pPr")
        if properties is None:
            properties = etree.SubElement(custom, f"{W}pPr")
        outline = properties.find(f"{W}outlineLvl")
        if outline is None:
            outline = etree.SubElement(properties, f"{W}outlineLvl")
        outline.set(f"{W}val", "9")
        styles.append(custom)

    revision_style = revision.find(f"{W}pPr/{W}pStyle")
    if revision_style is None:
        raise RuntimeError("Revision History style is missing")
    revision_style.set(f"{W}val", custom_id)

    update = settings.find(f"{W}updateFields")
    if update is None:
        update = etree.SubElement(settings, f"{W}updateFields")
    update.set(f"{W}val", "true")

    for field in document.xpath(".//w:fldChar[@w:fldCharType='begin']", namespaces=NS):
        field.set(f"{W}dirty", "true")

    changed = {
        "word/document.xml": etree.tostring(document, xml_declaration=True, encoding="UTF-8", standalone="yes"),
        "word/styles.xml": etree.tostring(styles, xml_declaration=True, encoding="UTF-8", standalone="yes"),
        "word/settings.xml": etree.tostring(settings, xml_declaration=True, encoding="UTF-8", standalone="yes"),
    }
    with NamedTemporaryFile(dir=TARGET.parent, suffix=".docx", delete=False) as temporary:
        temporary_path = Path(temporary.name)
    with ZipFile(temporary_path, "w", compression=ZIP_DEFLATED) as output:
        for item in source.infolist():
            output.writestr(item, changed.get(item.filename, source.read(item.filename)))

temporary_path.replace(TARGET)
print(f"Enabled field refresh in {TARGET}")
