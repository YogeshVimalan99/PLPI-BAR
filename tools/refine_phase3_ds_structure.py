from copy import deepcopy
from pathlib import Path
from tempfile import NamedTemporaryFile
from zipfile import ZIP_DEFLATED, ZipFile

from lxml import etree


ROOT = Path(__file__).resolve().parents[1]
DOCX = ROOT / "Phase 3 Doc" / "DS-PLPI BAR - Phase 2-B Pre Assembly to Post Assembly.docx"
NS = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
W = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"
XML_SPACE = "{http://www.w3.org/XML/1998/namespace}space"


REPLACEMENTS = {
    "3.5 Workflow Status, Corrections and Audit Behaviour": "3.5 Workflow Status and Completion Behaviour",
    "Callout 4 - Controlled counts. No. of specimen, No. of Leaflet Folds and Tamper seal per pack accept whole-number values. A blank required value is not treated as zero.": "Callout 4 - Controlled counts. No. of specimen, No. of Leaflet Folds and Tamper seal per pack require populated values. A blank required value prevents sign-off.",
    "Callout 2 - Search and Refresh. B&S Batch, MFG Lot No. or product identity filters the current view; Refresh reloads the authorised room queue.": "Callout 2 - Search and Refresh. B&S Batch, MFG Lot No. or product identity filters the current view; Refresh reloads the current queue.",
    "Callout 3 - Page completion. The page cannot be signed until every required box row is complete. A later box correction follows the approved correction route and does not silently remove sample history.": "Callout 3 - Page completion. The page cannot be signed until every required box row is complete. Each row retains its checked state and confirmation attribution.",
    "The Post-Assembly QC queue contains only Assembly-complete batches. Search and selection do not change the batch. Active records open for controlled completion; completed records remain available as read-only history.": "The Post-Assembly QC queue contains Assembly-complete batches. Search and selection do not change the batch. Active records open for controlled completion; completed records remain visible and cannot be signed again.",
    "Callout 2 - Queue values. Product, description, quantity, assembled quantity, room, expiry, pack size and status values remain read-only.": "Callout 2 - Queue values. BNS Batch No., MFG Lot No., description, quantity, assembled quantity, expiry date, strength, pack size and status are displayed in the queue.",
}


def text_of(paragraph):
    return "".join(paragraph.xpath(".//w:t/text()", namespaces=NS)).strip()


def properties(run):
    value = run.find(f"{W}rPr")
    return deepcopy(value) if value is not None else None


def append_run(paragraph, text, run_properties=None):
    run = etree.Element(f"{W}r")
    if run_properties is not None:
        run.append(deepcopy(run_properties))
    node = etree.SubElement(run, f"{W}t")
    if text.startswith(" ") or text.endswith(" "):
        node.set(XML_SPACE, "preserve")
    node.text = text
    paragraph.append(run)


def reset_text(paragraph, text):
    runs = paragraph.xpath("./w:r", namespaces=NS)
    source_properties = properties(runs[0]) if runs else None
    for child in list(paragraph):
        if child.tag in {f"{W}r", f"{W}hyperlink", f"{W}proofErr"}:
            paragraph.remove(child)
    append_run(paragraph, text, source_properties)


with ZipFile(DOCX, "r") as source:
    document = etree.fromstring(source.read("word/document.xml"))
    paragraphs = document.xpath(".//w:body/w:p", namespaces=NS)
    by_text = {text_of(paragraph): paragraph for paragraph in paragraphs}

    for old_text, new_text in REPLACEMENTS.items():
        paragraph = by_text.get(old_text)
        if paragraph is None:
            raise RuntimeError(f"Paragraph not found: {old_text}")
        reset_text(paragraph, new_text)

    completion_text = "Completion attribution: The wireframe displays the relevant user and date/time for Pre-Assembly sign-off, handheld confirmation, Assembly page completion and finish, IPC evidence and Post-Assembly sign-off. Additional Non-Functional Requirements."
    completion = by_text.get(completion_text)
    if completion is None:
        raise RuntimeError("Completion-attribution paragraph not found")

    status_paragraph = by_text["Status control: Each queue derives its current status from completed controlled events. Opening, viewing, searching, refreshing, printing a test output or cancelling an action does not advance a batch."]
    status_runs = status_paragraph.xpath("./w:r", namespaces=NS)
    prefix_properties = properties(status_runs[0])
    body_properties = properties(status_runs[-1])
    for child in list(completion):
        if child.tag in {f"{W}r", f"{W}hyperlink", f"{W}proofErr"}:
            completion.remove(child)
    prefix = "Completion attribution: "
    body = "The wireframe displays the relevant user and date/time for Pre-Assembly sign-off, handheld confirmation, Assembly page completion and finish, IPC evidence and Post-Assembly sign-off."
    append_run(completion, prefix, prefix_properties)
    append_run(completion, body, body_properties)

    design_heading = by_text["3. Design Specification"]
    heading = etree.Element(f"{W}p")
    heading_properties = design_heading.find(f"{W}pPr")
    if heading_properties is not None:
        heading.append(deepcopy(heading_properties))
    heading_runs = design_heading.xpath("./w:r", namespaces=NS)
    append_run(heading, "4. Additional Non-Functional Requirements", properties(heading_runs[0]))
    completion.addnext(heading)

    updated_xml = etree.tostring(document, xml_declaration=True, encoding="UTF-8", standalone="yes")
    with NamedTemporaryFile(dir=DOCX.parent, suffix=".docx", delete=False) as temporary_file:
        temporary_path = Path(temporary_file.name)
    with ZipFile(temporary_path, "w", compression=ZIP_DEFLATED) as target:
        for info in source.infolist():
            data = updated_xml if info.filename == "word/document.xml" else source.read(info.filename)
            target.writestr(info, data)

temporary_path.replace(DOCX)
print(f"Refined {DOCX}")
