from copy import deepcopy
from pathlib import Path
from tempfile import NamedTemporaryFile
from zipfile import ZIP_DEFLATED, ZipFile

from lxml import etree


ROOT = Path(__file__).resolve().parents[1]
DOCX = ROOT / "Phase 3 Doc" / "DS-PLPI BAR - Phase 2-B Pre Assembly to Post Assembly.docx"
SCREENSHOTS = ROOT / "tmp_ds_wireframe_update" / "screenshots"
NS = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
W = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"
XML_SPACE = "{http://www.w3.org/XML/1998/namespace}space"


REPLACEMENTS = [
    (
        "Pre-Assembly QC receives only batches that have completed the preceding printing and route-specific preparation activities. The Pre-Assembly QC user searches the eligible queue, opens one controlled record, confirms the printed-material rows, verifies the product sample against the BAR and Product Check Log (PCL), completes the mandatory Pre-Assembly Line Clearance, records specimen, leaflet-fold and tamper-seal counts, reviews the approved mock-up and signs the record. Successful sign-off makes the record read-only and makes the batch available to Production Control.",
        "Pre-Assembly QC receives batches in the Pre Assembly List. The user searches by B&S Batch Number or MFG Lot No., opens a batch, reviews the displayed product and route information, confirms each printed-material row, records specimen, leaflet-fold and tamper-seal counts, completes any required MARKS reason and Change of Pack Size initials, reviews the Mockup or prints the BAR as required, enters comments where applicable and signs the record. Successful sign-off records the user and date/time and moves the batch to Production Control.",
        "",
    ),
    (
        "The Production Controller uses the approved Seuic handheld path GOODS IN > STOCK TAKE OUT. The controller identifies the stock, verifies the Box ID, completes a new Line Clearance, confirms the box count and assigns the batch to an approved Assembly Room. Confirmation records the user and date/time, updates the BAR once and publishes the batch only to the selected room.",
        "The Production Controller uses the approved Seuic handheld path GOODS IN > STOCK TAKE OUT. The selected stock details are displayed, TRANSFER opens Box ID verification, and a nonblank Box ID opens Line Clearance. The controller confirms the product-label check and box count and selects an Assembly Room. CONFIRMED BY records the user, date/time and room and displays BAR UPDATED.",
        "",
    ),
    (
        "The Assembly Room user sees only batches allocated to that room. After attendance and batch-start confirmation, the user completes Initial Checks, Random Sample Check, one IPC Photo Check with one required photo, and Reconciliation and Closure. Each page is signed independently and becomes read-only. The batch can be finished only when all four pages are signed and no unresolved condition remains.",
        "The Assembly Room user opens the Active or Completed batch queue, records room attendance independently and confirms batch start before work begins. The active batch provides Initial Checks, Random Sample Check, timed IPC Photo & In Process Checks and Reconciliation & Closure. The first IPC is scheduled after 20 minutes of active assembly time and subsequent IPCs at 40-minute intervals; each displayed IPC requires the BAR checklist and a photo. Each page is marked done independently. When all four pages are complete, Finish Batch records completion and makes the batch available to Post-Assembly QC.",
        "",
    ),
    (
        "Post-Assembly QC receives only Assembly-complete batches. The user records finished-pack and box quantities, confirms any required per-box allocation, verifies every Pack Details Against BAR row, prints the controlled Quarantine Label and signs the completed record. Successful sign-off locks the record and releases it to the pre-QP stage.",
        "Post-Assembly QC receives Assembly-complete batches. The user records Total Packs, Total Boxes and No. of Packs Checked, confirms per-box quantities when more than one box is present, confirms every Pack Details Against BAR row, may use Print Quarantine Label or Test Print, enters comments where applicable and signs the record. Successful sign-off records the user and date/time, shows the batch as completed and makes it available to Pre-QP.",
        "",
    ),
    (
        "Workflow control: A cancelled, failed or incomplete action does not advance the batch. Every completion action rechecks the required data and current status. Completed records remain read-only in the normal workflow; an approved correction retains the original value, the changed value, the reason, the authorised user and date/time.",
        "Workflow control: A cancelled, failed or incomplete action does not advance the batch. Each controlled completion action checks the fields and confirmations displayed for that action. A completed record cannot be signed a second time and remains available through the applicable Completed or history view.",
        "Workflow control: ",
    ),
    (
        "Figure 2 - Pre-Assembly verification, line clearance, reference-sample controls and sign-off",
        "Figure 2 - Pre-Assembly product, route, printed-material, count and sign-off controls",
        "",
    ),
    (
        "Callout 5 - Product sample, Mock-up and Print BAR. The user verifies the product sample against the BAR and Product Check Log (PCL), including product identity, pack size, batch details and expiry date, and uses the approved mock-up for preparation or comparison. Opening the mock-up or printing the BAR does not sign or complete the record.",
        "Callout 5 - Mockup and Print BAR. The user may open the displayed Mockup and may print the generated BAR. These actions do not sign or complete the record.",
        "Callout 5 - ",
    ),
    (
        "Callout 6 - User Sign Off. The action becomes available only after every displayed material check, the mandatory Pre-Assembly Line Clearance confirmation, product-sample verification, required count, conditional reason and applicable route amendment are complete.",
        "Callout 6 - User Sign Off. The action becomes available only after every displayed printed-material row is confirmed, the three count fields are populated, any changed MARKS has a reason, and both Change of Pack Size amendment initials are completed for Reboxing.",
        "Callout 6 - ",
    ),
    (
        "Step 3 - The user confirms every applicable printed-material row, completes the mandatory Pre-Assembly Line Clearance confirmation and enters the required count fields.",
        "Step 3 - The user confirms every applicable printed-material row and enters No. of specimen, No. of Leaflet Folds and Tamper seal per pack.",
        "Step 3 - ",
    ),
    (
        "Step 5 - The user verifies the product sample against the BAR and Product Check Log (PCL), opens the approved Mock-up and prepares or compares the assembly reference sample.",
        "Step 5 - The user opens the Mockup or prints the BAR as required and enters comments where applicable.",
        "Step 5 - ",
    ),
    (
        "Step 6 - User Sign Off rechecks all displayed requirements, records the authenticated user and date/time, locks the Pre-Assembly QC record and makes the batch available to Production Control.",
        "Step 6 - User Sign Off rechecks the displayed requirements, records the authenticated user and date/time, completes the Pre-Assembly record and moves the batch to Production Control.",
        "Step 6 - ",
    ),
    (
        "Validation and error handling: Missing printed-material checks, an incomplete Pre-Assembly Line Clearance confirmation, incomplete product-sample verification, blank or invalid counts, a required MARKS reason, incomplete route amendments or a stale/completed record prevent sign-off. Back, cancellation or print failure does not create a completed record.",
        "Validation and error handling: An unchecked printed-material row, a blank count field, a missing reason for changed MARKS, incomplete Reboxing amendment initials or a completed record prevents sign-off. Back, cancellation or a print action does not create a completed record.",
        "Validation and error handling: ",
    ),
    (
        "Callout 1 - Stock ID. The controller scans or manually enters the Stock ID used to load the controlled stock record.",
        "Callout 1 - Stock ID. The displayed Stock ID identifies the selected stock record whose details are shown for review.",
        "Callout 1 - ",
    ),
    (
        "Callout 1 - Box ID. A scanned or entered Box ID is mandatory and must relate to the displayed stock.",
        "Callout 1 - Box ID. A nonblank scanned or entered Box ID is required before the user can continue.",
        "Callout 1 - ",
    ),
    (
        "Callout 2 - CONFIRM. A valid Box ID opens a new blank Line Clearance. Blank or invalid input displays validation and does not advance.",
        "Callout 2 - CONFIRM. A nonblank Box ID opens a new blank Line Clearance. Blank input displays validation and does not advance.",
        "Callout 2 - ",
    ),
    (
        "Step 2 - Scan or enter Stock ID and review the read-only stock details.",
        "Step 2 - Review the displayed Stock ID and the product, part, batch, box, quantity, location, IMP and contract details.",
        "Step 2 - ",
    ),
    (
        "Step 7 - A later transfer opens a new blank Line Clearance. The earlier signed form is retained only as read-only history.",
        "Step 7 - After successful confirmation, the screen displays BAR UPDATED together with the confirmed user, date/time and room.",
        "Step 7 - ",
    ),
    (
        "Validation and error handling: Blank or invalid Stock ID or Box ID, a non-positive or non-whole box count, an unresolved count change, an incomplete check, a missing room or a previously completed record prevents confirmation. Back, Cancel or Power before CONFIRMED BY creates no Line Clearance completion or room allocation.",
        "Validation and error handling: A blank Box ID, a non-positive or non-whole box count, an unresolved count change, an incomplete check, a missing room or a completed Line Clearance prevents confirmation. Back, Cancel or Power before CONFIRMED BY creates no Line Clearance completion or room allocation.",
        "Validation and error handling: ",
    ),
    (
        "The Assembly Room queue displays only batches allocated to the authorised room. Active and Completed views are separate. Search and Refresh do not change batch data. Check In and Check Out record room attendance independently from batch completion.",
        "The Assembly Room Batch Queue provides separate Active and Completed views for batches with Production Controller allocation information. Search and Refresh do not change batch data. Check In and Check Out record room attendance independently from batch completion.",
        "",
    ),
    (
        "Callout 1 - Queue eligibility. Only batches assigned by Production Control to the selected room are displayed.",
        "Callout 1 - Queue and allocation. The queue displays available batches together with the room and lifecycle information produced by the Production Controller allocation.",
        "Callout 1 - ",
    ),
    (
        "Figure 11 - IPC Photo Check and supporting evidence",
        "Figure 11 - Timed IPC Photo and In Process Checks",
        "",
    ),
    (
        "Callout 1 - Required IPC photo. The page requires one clear photograph of the in-process product for the selected batch.",
        "Callout 1 - IPC timing. The first IPC becomes due after 20 minutes of active assembly time and subsequent IPCs become due at 40-minute intervals; the page displays the timing key and due state.",
        "Callout 1 - ",
    ),
    (
        "Callout 2 - Single-photo design. No timer, additional IPC row or separate IPC result entry is required on this page.",
        "Callout 2 - IPC records. Each displayed IPC column contains the BAR checklist, result status, photo evidence and confirmation attribution. Add IPC creates an additional IPC record and an empty additional IPC may be removed.",
        "Callout 2 - ",
    ),
    (
        "Callout 3 - Photo evidence. Take Picture or file selection associates the one required image with the current batch and records the evidence name, authenticated user and date/time.",
        "Callout 3 - Photo evidence. Take Picture or file selection associates one photo with the relevant IPC and records the evidence name, authenticated user and date/time.",
        "Callout 3 - ",
    ),
    (
        "Callout 4 - Page completion. Mark Done remains disabled until one IPC photo is attached. Successful completion records the user and date/time and makes the IPC Photo Check page read-only.",
        "Callout 4 - Page completion. Mark Done remains disabled until every displayed IPC has all BAR checklist confirmations and a photo. Successful completion records the user and date/time and makes the page read-only.",
        "Callout 4 - ",
    ),
    (
        "Callout 2 - Totals and yield. Total Used, Retention Sample, Yield and Total Damaged are calculated or entered according to the approved rule and are rechecked when the page is completed.",
        "Callout 2 - Totals and yield. Total Used, Retention Sample, Yield and Total Damaged are displayed for entry or review with the material reconciliation values.",
        "Callout 2 - ",
    ),
    (
        "Callout 4 - Mark Done and Finish Batch. Mark Done signs only the current page. Finish Batch becomes available only after Pages 1-4 are signed, the required IPC photo exists and no unresolved reconciliation condition remains.",
        "Callout 4 - Mark Done and Finish Batch. Mark Done signs only the current page. When all four pages are signed, the system prompts the user to confirm Finish Batch.",
        "Callout 4 - ",
    ),
    (
        "Step 4 - Attach one required IPC photo and sign the IPC Photo Check page.",
        "Step 4 - Complete the BAR checklist and attach one photo for every displayed timed IPC, then sign the IPC Photo & In Process Checks page.",
        "Step 4 - ",
    ),
    (
        "Step 6 - Finish Batch rechecks all four-page signatures and unresolved conditions, records finish user/date-time, locks the Assembly record and makes the batch available to Post-Assembly QC.",
        "Step 6 - After all four pages are signed, confirm Finish Batch. PLPI records the finish user and date/time, completes the Assembly record and makes the batch available to Post-Assembly QC.",
        "Step 6 - ",
    ),
    (
        "Validation and error handling: A user cannot open a batch assigned to another room, overwrite a signed page, omit a required sample row, sign the IPC Photo Check page without one attached photo, or complete the batch with an unresolved reconciliation condition. Break, Back or interruption retains completed page signatures but does not create final completion.",
        "Validation and error handling: A signed page cannot be signed again. A required sample row cannot be omitted, and the IPC page cannot be signed until every displayed IPC checklist and photo is complete. Initial Checks requires its displayed confirmations and team briefing; Reconciliation & Closure requires the displayed clearance confirmations and the required used quantity. Break, Back or interruption does not create final completion.",
        "Validation and error handling: ",
    ),
    (
        "Callout 1 - Finished quantities. Total Packs and Total Boxes accept positive whole numbers. No. of Packs Checked is calculated using the approved sampling formula (SQRT (Total Packs) + 1) and is revalidated when the quantity changes.",
        "Callout 1 - Finished quantities. Total Packs, Total Boxes and No. of Packs Checked accept positive numeric values. The initial No. of Packs Checked value is populated using CEILING(SQRT(assembled quantity)) + 1 and remains available for user entry.",
        "Callout 1 - ",
    ),
    (
        "Callout 3 - Pack Details Against BAR. Every applicable row is generated for the selected batch and requires confirmation against the controlled BAR. A mismatch remains incomplete until its approved disposition is recorded.",
        "Callout 3 - Pack Details Against BAR. Five displayed detail rows show the selected batch references and each row requires the user to select the verification checkbox.",
        "Callout 3 - ",
    ),
    (
        "Callout 4 - Quarantine Label. Test Print is a non-completing output. Print Quarantine Label uses the confirmed batch, box and quantity information and records the print result. The same Print Quarantine Label action remains available whenever printing is required; no separate label-printing exception action is provided.",
        "Callout 4 - Quarantine Label. Print Quarantine Label sets the label status to Printed and retains the current quantities, BAR checks and comments. Test Print displays a test-print status and does not set the label status to Printed.",
        "Callout 4 - ",
    ),
    (
        "Callout 5 - User Sign Off. The action remains disabled until the approved sampling result, quantities, box allocation, every BAR comparison row and at least one successful controlled Quarantine Label print are complete. Success records Signed by and Signed At, makes the record read-only and releases the batch to pre-QP.",
        "Callout 5 - User Sign Off. The action remains disabled until all three quantity fields are positive, every BAR comparison row is confirmed and the per-box allocation is complete when more than one box is entered. Quarantine Label printing is not a sign-off prerequisite. Success records Signed by and Signed At and makes the batch available to Pre-QP.",
        "Callout 5 - ",
    ),
    (
        "Step 2 - Record Total Packs and Total Boxes; PLPI calculates No. of Packs Checked using the approved formula (SQRT (Total Packs) + 1).",
        "Step 2 - Record or review Total Packs, Total Boxes and No. of Packs Checked. The initial sample value is populated using CEILING(SQRT(assembled quantity)) + 1.",
        "Step 2 - ",
    ),
    (
        "Step 4 - Confirm every Pack Details Against BAR row and record required comments or disposition.",
        "Step 4 - Confirm every Pack Details Against BAR row and enter comments where applicable.",
        "Step 4 - ",
    ),
    (
        "Step 5 - Successfully print the required controlled Quarantine Label before sign-off; a Test Print does not satisfy this requirement. The Print Quarantine Label action may be used whenever printing is required.",
        "Step 5 - Use Print Quarantine Label or Test Print when required. Either print action is separate from User Sign Off.",
        "Step 5 - ",
    ),
    (
        "Step 6 - User Sign Off rechecks all requirements, records user/date-time, locks the Post-Assembly QC record and makes the completed record available to pre-QP.",
        "Step 6 - User Sign Off rechecks the displayed requirements, records user and date/time, shows the batch as completed and makes it available to Pre-QP.",
        "Step 6 - ",
    ),
    (
        "Validation and error handling: An Assembly-incomplete batch, invalid quantities, an invalid approved sampling result, missing per-box entries, a box-total mismatch, unchecked BAR rows, unresolved mismatch or the absence of a successful controlled Quarantine Label print prevents sign-off. A failed or cancelled print does not satisfy the print requirement; the user may use Print Quarantine Label again when required.",
        "Validation and error handling: A non-positive Total Packs, Total Boxes or No. of Packs Checked value, missing per-box entries, a per-box total that does not equal Total Packs, an unchecked BAR row or a completed record prevents sign-off. Label printing and Test Print do not complete or sign the record.",
        "Validation and error handling: ",
    ),
    (
        "Exit condition: The signed Post-Assembly QC record is read-only, at least one successful controlled Quarantine Label print is retained for the batch and the record is available to pre-QP.",
        "Exit condition: The signed Post-Assembly QC record displays its completion attribution and is available to Pre-QP; a successful Quarantine Label print is retained when the print action was used.",
        "Exit condition: ",
    ),
    (
        "Correction control: An approved correction records the affected batch and field, previous value, new value, reason, authorised user and date/time. The original controlled event remains available in history.",
        "Pre-Assembly completion: User Sign Off records the user and date/time and changes the selected record from Active to Completed before it is made available to Production Control.",
        "",
    ),
    (
        "Room reallocation: Only an authorised role may change a confirmed allocation. The previous room, new room, reason, user and date/time are retained and the batch is not concurrently available in both rooms.",
        "Handheld allocation: CONFIRMED BY records the selected Assembly Room, confirmed box count, user and date/time and displays BAR UPDATED. Leaving before confirmation does not allocate the batch.",
        "",
    ),
    (
        "Interruption and resume: Committed signatures, attendance and lifecycle events remain recorded. Uncommitted values do not appear as completed data. The user returns to the last committed workflow state.",
        "Assembly lifecycle: Break and Resume control active assembly time. Partial Finish records completed and remaining quantities, and Partial Start resumes the lifecycle. These actions do not sign a page or finish the batch.",
        "",
    ),
    (
        "Audit content: Each controlled event retains the B&S Batch Number or MFG Lot No. where applicable, stage, action, result, authenticated user, role, date/time, status before and after, and any required reason, comment or previous/new value. Additional Non-Functional Requirements.",
        "Completion attribution: The wireframe displays the relevant user and date/time for Pre-Assembly sign-off, handheld confirmation, Assembly page completion and finish, IPC evidence and Post-Assembly sign-off. Additional Non-Functional Requirements.",
        "",
    ),
    (
        "PLPI shall retain successful and unsuccessful controlled events for Pre-Assembly QC material checks, line clearance, product-sample verification, counts, route changes, mock-up/BAR outputs and sign-off; Production Controller Handheld / Room Allocation stock, Box ID, count decision, Line Clearance, room allocation and BAR update; Assembly Room attendance, start, runtime, page completion, the required IPC photo, reconciliation and finish; and Post-Assembly QC approved sampling calculation, quantity, box allocation, BAR comparison, label printing and sign-off. Audit records shall not be replaced by a later status.",
        "PLPI shall retain controlled events for Pre-Assembly QC material confirmations, counts, route changes, mock-up/BAR outputs and sign-off; Production Controller Handheld stock display, Box ID entry, count decision, Line Clearance, room allocation and BAR update; Assembly Room attendance, start, runtime, page completion, timed IPC checklists and associated photos, reconciliation and finish; and Post-Assembly QC initial sampling value, quantities, box allocation, BAR confirmations, label actions and sign-off. Audit records shall not be replaced by a later status.",
        "",
    ),
    (
        "Only authorised roles shall access the applicable queue, room and controlled action. Signature identity shall come from the authenticated session and shall not be entered as free text. Completed records shall remain read-only except through an approved audited correction process.",
        "Only authorised roles shall access the applicable queue, room and controlled action. Signature identity shall come from the authenticated session and shall not be entered as free text. A completed record shall not permit a second sign-off, and retained completion attribution shall remain displayed.",
        "",
    ),
    (
        "Batch, product, material, reference, quantity, box, room, sample, evidence, reconciliation, label and signature data shall remain linked to the selected controlled batch. Whole-number, total, remaining, discrepancy and yield rules shall be checked again when the applicable controlled action is completed.",
        "Batch, product, material, reference, quantity, box, room, sample, evidence, reconciliation, label and signature data shall remain linked to the selected batch. Handheld box count and per-box allocations shall be positive whole numbers; Post-Assembly quantity fields shall be positive and each per-box total shall equal Total Packs before the applicable controlled action is completed.",
        "",
    ),
    (
        "Verification shall cover the approved URS and FS references, displayed controls, role access, status transitions, positive paths, boundary values, negative validation, cancellation, interruption, duplicate prevention, correction, room allocation, evidence, printing, signature and stage hand-off. Regression testing shall confirm that the Stage 8 inbound and Stage 13 outbound boundaries remain controlled.",
        "Verification shall cover the approved URS and FS references, displayed controls, role access, status transitions, positive paths, boundary values, negative validation, cancellation, interruption, duplicate prevention, room allocation, evidence, printing, signature and workflow hand-off. Regression testing shall confirm that the Leaflet Folding inbound and Pre-QP outbound boundaries remain controlled.",
        "",
    ),
]


def paragraph_text(paragraph):
    return "".join(paragraph.xpath(".//w:t/text()", namespaces=NS)).strip()


def run_properties(run):
    properties = run.find(f"{W}rPr")
    return deepcopy(properties) if properties is not None else None


def append_run(paragraph, text, properties):
    run = etree.Element(f"{W}r")
    if properties is not None:
        run.append(deepcopy(properties))
    text_element = etree.SubElement(run, f"{W}t")
    if text.startswith(" ") or text.endswith(" "):
        text_element.set(XML_SPACE, "preserve")
    text_element.text = text
    paragraph.append(run)


def replace_paragraph(paragraph, new_text, prefix):
    runs = paragraph.xpath("./w:r", namespaces=NS)
    nonempty_runs = [run for run in runs if "".join(run.xpath(".//w:t/text()", namespaces=NS))]
    prefix_properties = run_properties(nonempty_runs[0]) if nonempty_runs else None
    body_properties = run_properties(nonempty_runs[-1]) if nonempty_runs else prefix_properties

    for child in list(paragraph):
        if child.tag in {f"{W}r", f"{W}hyperlink", f"{W}proofErr"}:
            paragraph.remove(child)

    if prefix and new_text.startswith(prefix):
        append_run(paragraph, prefix, prefix_properties)
        append_run(paragraph, new_text[len(prefix):], body_properties)
    else:
        append_run(paragraph, new_text, prefix_properties)


with ZipFile(DOCX, "r") as source:
    document_xml = source.read("word/document.xml")
    document = etree.fromstring(document_xml)
    paragraphs = document.xpath(".//w:body/w:p", namespaces=NS)
    by_text = {}
    for paragraph in paragraphs:
        by_text.setdefault(paragraph_text(paragraph), []).append(paragraph)

    for old_text, new_text, prefix in REPLACEMENTS:
        matches = by_text.get(old_text, [])
        if len(matches) != 1:
            raise RuntimeError(f"Expected one paragraph match, found {len(matches)}: {old_text[:100]}")
        replace_paragraph(matches[0], new_text, prefix)

    updated_xml = etree.tostring(document, xml_declaration=True, encoding="UTF-8", standalone="yes")

    with NamedTemporaryFile(dir=DOCX.parent, suffix=".docx", delete=False) as temporary_file:
        temporary_path = Path(temporary_file.name)

    with ZipFile(temporary_path, "w", compression=ZIP_DEFLATED) as target:
        for info in source.infolist():
            if info.filename == "word/document.xml":
                data = updated_xml
            elif info.filename.startswith("word/media/image") and info.filename.endswith(".png"):
                image_name = Path(info.filename).name
                replacement = SCREENSHOTS / image_name
                data = replacement.read_bytes() if replacement.exists() else source.read(info.filename)
            else:
                data = source.read(info.filename)
            target.writestr(info, data)

temporary_path.replace(DOCX)
print(f"Updated {DOCX}")
