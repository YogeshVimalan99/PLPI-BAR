from copy import deepcopy
from pathlib import Path
from tempfile import NamedTemporaryFile
from zipfile import ZIP_DEFLATED, ZipFile

from lxml import etree


ROOT = Path(__file__).resolve().parents[1]
DOCX = ROOT / "Phase 3 Doc" / "DS-PLPI BAR - Phase 2-B Pre Assembly to Post Assembly.docx"
NS = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
W = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"


OLD_SCOPE = "The scope starts when a printing-complete batch becomes available to Pre-Assembly QC and ends when Post-Assembly QC has signed the completed production-check record and released it to pre-QP. It includes pre-assembly material and reference-sample verification; Production Controller Stock Take Out, box verification, Line Clearance and Assembly Room allocation on the Seuic handheld; Assembly Room attendance, batch lifecycle, four controlled assembly pages and reconciliation; and post-assembly finished-pack verification, box allocation, Quarantine Label control and sign-off."
NEW_SCOPE = "The scope starts when a printing-complete batch becomes available to Pre-Assembly QC and ends when Post-Assembly QC has signed the completed production-check record and released it to Pre-QP. It includes Pre-Assembly printed-material confirmation, route information, counts, Mockup/BAR actions and sign-off; Production Controller Stock Take Out, Box ID verification, Line Clearance and Assembly Room allocation on the Seuic handheld; Assembly Room attendance, batch lifecycle, four controlled Assembly pages and reconciliation; and Post-Assembly finished-pack verification, box allocation, Quarantine Label actions and sign-off."


def text_of(node):
    return "".join(node.xpath(".//w:t/text()", namespaces=NS)).strip()


with ZipFile(DOCX, "r") as source:
    document = etree.fromstring(source.read("word/document.xml"))
    paragraphs = document.xpath(".//w:body/w:p", namespaces=NS)
    scope = next((paragraph for paragraph in paragraphs if text_of(paragraph) == OLD_SCOPE), None)
    if scope is None:
        raise RuntimeError("Scope paragraph not found")
    runs = scope.xpath("./w:r", namespaces=NS)
    run_properties = runs[0].find(f"{W}rPr") if runs else None
    for child in list(scope):
        if child.tag in {f"{W}r", f"{W}hyperlink", f"{W}proofErr"}:
            scope.remove(child)
    run = etree.SubElement(scope, f"{W}r")
    if run_properties is not None:
        run.append(deepcopy(run_properties))
    etree.SubElement(run, f"{W}t").text = NEW_SCOPE

    pcl_rows = [row for row in document.xpath(".//w:tr", namespaces=NS) if text_of(row) == "PCLProduct Check Log"]
    if len(pcl_rows) != 1:
        raise RuntimeError(f"Expected one PCL abbreviation row, found {len(pcl_rows)}")
    pcl_rows[0].getparent().remove(pcl_rows[0])

    updated_xml = etree.tostring(document, xml_declaration=True, encoding="UTF-8", standalone="yes")
    with NamedTemporaryFile(dir=DOCX.parent, suffix=".docx", delete=False) as temporary_file:
        temporary_path = Path(temporary_file.name)
    with ZipFile(temporary_path, "w", compression=ZIP_DEFLATED) as target:
        for info in source.infolist():
            data = updated_xml if info.filename == "word/document.xml" else source.read(info.filename)
            target.writestr(info, data)

temporary_path.replace(DOCX)
print(f"Finalized {DOCX}")
