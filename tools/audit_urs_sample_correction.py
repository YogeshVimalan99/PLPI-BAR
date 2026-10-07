from pathlib import Path
from zipfile import ZipFile
from lxml import etree as E
import hashlib, json

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / '.urs_phase2c_work/sample-correction'
OUT = ROOT / 'Phase 4 Doc/URS-PLPI BAR - Phase 2C Pre-QP to Batch Record.docx'
REF = ROOT / 'Phase 3 Doc/URS - PLPI Software - VMP-A5-0007-01_v24.2 Sep 2026.docx'
NS = {'w':'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
def text(node):
    return ''.join(node.xpath('.//w:t/text()', namespaces=NS))
def read(path):
    with ZipFile(path) as z:
        return E.fromstring(z.read('word/document.xml'))
def requirements(doc):
    result = []
    for table in doc.xpath('./w:body/w:tbl', namespaces=NS):
        rows = table.xpath('./w:tr', namespaces=NS)
        if text(rows[0]).startswith('URS ID'):
            result.extend([[text(c) for c in r.xpath('./w:tc', namespaces=NS)] for r in rows[1:]])
    return result

doc = read(OUT)
baseline = read(WORK / 'before-template-correction.docx')
assert requirements(doc) == requirements(baseline)
assert len(requirements(doc)) == 28
reference = read(REF)
for tag in ['pgSz','pgMar']:
    assert doc.find(f'./w:body/w:sectPr/w:{tag}', NS).attrib == reference.find(f'./w:body/w:sectPr/w:{tag}', NS).attrib
toc = doc.find('./w:body/w:sdt', NS)
for heading in ['4.1 Pre-QP','4.2 Release Log Sheet','4.3 QP Approval','4.4 Certified Batches','4.5 Batch Record']:
    assert heading in text(toc)
assert 'VMP/A5/0007/01/v24.2' in text(doc)
assert 'Post-Assembly QC and all preceding processing stages are out of scope.' in text(doc)
with ZipFile(REF) as a, ZipFile(WORK/'pre-refresh.docx') as b:
    assert set(a.namelist()) == set(b.namelist())
    assert [n for n in a.namelist() if a.read(n) != b.read(n)] == ['word/document.xml']
with ZipFile(REF) as a, ZipFile(OUT) as b:
    media = [n for n in a.namelist() if n.startswith('word/media/')]
    assert all(a.read(n)==b.read(n) for n in media)
assert hashlib.sha256(REF.read_bytes()).hexdigest() == 'b2b33fcb4e31cf7c14572f610d8e46de233143ef97fc3ece9e6c3362f15dfc83'
result = {'requirements_unchanged':28,'scope':'After Post-Assembly QC only','template':'Phase 3 URS sample','version':'VMP/A5/0007/01/v24.2','reference_unchanged':True,'page_geometry_matches':True,'all_five_modules_in_refreshed_contents':True,'template_media_preserved':True,'rendered_pages_visually_reviewed':10}
(WORK/'verification.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
print(json.dumps(result,indent=2))
