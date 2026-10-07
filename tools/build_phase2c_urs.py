"""Create the post-assembly-scope URS from the user's corrected Phase 2C copy."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
from copy import deepcopy
from lxml import etree as E
import hashlib
import json
import sys

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / '.urs_phase2c_work'
SOURCE = Path('C:/Users/vimalyog/Desktop/Goods-in-checklist/URS-PLPI BAR - Pre-QP and QP Approval.docx')
OUTPUT = ROOT / 'Phase 4 Doc' / 'URS-PLPI BAR - Phase 2C Pre-QP to Batch Record.docx'
EXPECTED = '55083fdf826befc7ebc206f59f65b1bd9675533841ea9b40d042fbf987f0e8d8'
sys.path.insert(0, 'C:/Users/vimalyog/.codex/plugins/cache/openai-primary-runtime/documents/26.909.11814/skills/documents/scripts')
from docx_ooxml_patch import _qn, NS

def text(node):
    return ''.join(node.xpath('.//w:t/text()', namespaces=NS))

def set_text(node, value):
    texts = node.xpath('.//w:t', namespaces=NS)
    assert texts, 'Expected an existing editable text slot'
    texts[0].text = value
    texts[0].set('{http://www.w3.org/XML/1998/namespace}space', 'preserve')
    for item in texts[1:]:
        item.text = ''

def clean_clone(node):
    result = deepcopy(node)
    for tag in ['bookmarkStart', 'bookmarkEnd', 'lastRenderedPageBreak']:
        for item in result.xpath('.//w:' + tag, namespaces=NS):
            item.getparent().remove(item)
    return result

def add_row(table, values):
    row = clean_clone(table.findall('w:tr', NS)[-1])
    cells = row.findall('w:tc', NS)
    assert len(cells) == len(values)
    for cell, value in zip(cells, values):
        set_text(cell, value)
    table.append(row)

assert hashlib.sha256(SOURCE.read_bytes()).hexdigest() == EXPECTED
assert not OUTPUT.exists(), 'Preserve an existing output; inspect before replacing'
with ZipFile(SOURCE) as z:
    parts = {name: z.read(name) for name in z.namelist()}
inventory = {name: {'size': len(data), 'sha256': hashlib.sha256(data).hexdigest()} for name, data in parts.items()}
root = E.fromstring(parts['word/document.xml'])
body = root.find('w:body', NS)
slots = list(body)
original_tables = body.findall('w:tbl', NS)

set_text(slots[21], 'The PLPI Batch Record Automation Phase 2C continues the phased improvement programme to replace paper-dependent release controls with controlled electronic records. This URS defines the business and user needs after Post-Assembly QC, from receipt of a completed batch at Pre-QP through QP release decisions and access to the archived Batch Record.')
set_text(slots[24], 'In scope are Pre-QP review, Release Log Sheet generation, QP review and approval, QP Certified Batches and Batch Record access. The scope includes supporting-document access, review findings, comments, authenticated sign-off, decision history, record locking and controlled handoffs between these modules.')
scope_exclusion = clean_clone(slots[24])
set_text(scope_exclusion, 'Post-Assembly QC and all preceding processing stages are out of scope. Their completed records are inputs to this workflow; this URS does not change how those upstream activities are performed. Existing functionality outside the stated requirements remains unchanged.')
slots[24].addnext(scope_exclusion)

# Keep the user's 26 existing statements and IDs, with terminology casing only.
for item in root.xpath('//w:t', namespaces=NS):
    if item.text:
        item.text = item.text.replace('pre-QP', 'Pre-QP')
abbreviations = slots[26]
for row in abbreviations.findall('w:tr', NS):
    cells = row.findall('w:tc', NS)
    if text(cells[0]) == 'IPC':
        set_text(cells[1], 'In-Process Checks')
add_row(abbreviations, ['Rel ID', 'Release identifier linking a Release Log Sheet to its batches'])
qp_table = slots[36]
add_row(qp_table, ['4.3.12', 'Authorised QP users shall be able to view and download the supporting documents associated with the selected batch.'])
add_row(qp_table, ['4.3.13', 'The QP user shall be able to confirm the quantity released for sale, with one retention sample excluded and this exclusion clearly identified.'])

set_text(slots[48], 'The PLPI system owner shall coordinate risk-based verification with IT, QA and Operations. Testing shall trace to the approved URS and cover Pre-QP review, Release Log Sheet generation, QP findings and decisions, final approval, certified records, release labels and archived Batch Records. Verification shall include document viewing and downloading, the retention-sample quantity exclusion, incomplete checks, unresolved findings and unauthorised actions.')
set_text(slots[49], 'Regression testing shall confirm correct receipt of completed Post-Assembly QC records without changing the upstream process. Positive, negative, boundary and role-access scenarios shall be included. Representative Pre-QP, QP, QA, Operations and support users shall complete user acceptance testing before release.')
add_row(slots[55], ['1.1', '1', 'Clarified the scope as steps after Post-Assembly QC only. Retained the user-corrected requirements and added QP document download and the retention-sample quantity exclusion.', 'For approval\n02 Oct 2026'])

# Prevent a single requirement breaking across pages; retain template sizing.
for table in body.findall('w:tbl', NS):
    rows = table.findall('w:tr', NS)
    if rows and text(rows[0]).startswith('URS ID'):
        pr = rows[0].find('w:trPr', NS)
        if pr is None:
            pr = E.SubElement(rows[0], _qn('w','trPr'))
        if pr.find('w:tblHeader', NS) is None:
            E.SubElement(pr, _qn('w','tblHeader'))
        for row in rows:
            pr = row.find('w:trPr', NS)
            if pr is None:
                pr = E.SubElement(row, _qn('w','trPr'))
            if pr.find('w:cantSplit', NS) is None:
                E.SubElement(pr, _qn('w','cantSplit'))

parts['word/document.xml'] = E.tostring(root, xml_declaration=True, encoding='UTF-8', standalone=True)
settings = E.fromstring(parts['word/settings.xml'])
update = settings.find('w:updateFields', NS)
if update is None:
    update = E.SubElement(settings, _qn('w','updateFields'))
update.set(_qn('w','val'), 'true')
parts['word/settings.xml'] = E.tostring(settings, xml_declaration=True, encoding='UTF-8', standalone=True)

ids = []
requirements = {}
for table in body.findall('w:tbl', NS):
    rows = table.findall('w:tr', NS)
    if rows and text(rows[0]).startswith('URS ID'):
        for row in rows[1:]:
            cells = row.findall('w:tc', NS)
            ids.append(text(cells[0]))
            requirements[text(cells[0])] = text(cells[1])
assert len(ids) == len(set(ids)) == 28
OUTPUT.parent.mkdir(exist_ok=True)
with ZipFile(OUTPUT, 'w', ZIP_DEFLATED) as z:
    for name, data in parts.items():
        z.writestr(name, data)
with ZipFile(SOURCE) as a, ZipFile(OUTPUT) as b:
    changed = [name for name in a.namelist() if a.read(name) != b.read(name)]
assert set(changed) <= {'word/document.xml', 'word/settings.xml'}
assert hashlib.sha256(SOURCE.read_bytes()).hexdigest() == EXPECTED
(WORK / 'package-inventory.json').write_text(json.dumps(inventory, indent=2), encoding='utf-8')
(WORK / 'requirements.json').write_text(json.dumps(requirements, indent=2), encoding='utf-8')
(WORK / 'pre-refresh.docx').write_bytes(OUTPUT.read_bytes())
print(json.dumps({'output': str(OUTPUT), 'requirements': len(ids), 'changed_parts': changed, 'source_unchanged': True}, indent=2))
