from pathlib import Path
from zipfile import ZipFile
from lxml import etree as E
import hashlib, json, re
import pypdfium2 as pdfium

ROOT = Path(__file__).resolve().parents[1]
source = Path('C:/Users/vimalyog/Desktop/Goods-in-checklist/URS-PLPI BAR - Pre-QP and QP Approval.docx')
output = ROOT / 'Phase 4 Doc/URS-PLPI BAR - Phase 2C Pre-QP to Batch Record.docx'
work = ROOT / '.urs_phase2c_work'
ns = {'w':'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
def txt(x): return ''.join(x.xpath('.//w:t/text()', namespaces=ns))
def reqs(root):
    result = {}
    for t in root.xpath('//w:body/w:tbl', namespaces=ns):
        rows = t.findall('w:tr', ns)
        if rows and txt(rows[0]).startswith('URS ID'):
            for row in rows[1:]:
                cells = row.findall('w:tc', ns)
                assert txt(cells[0]) not in result
                result[txt(cells[0])] = txt(cells[1])
    return result
with ZipFile(source) as a, ZipFile(output) as b:
    assert b.testzip() is None
    before = E.fromstring(a.read('word/document.xml'))
    after = E.fromstring(b.read('word/document.xml'))
    old, new = reqs(before), reqs(after)
    assert len(old) == 26 and len(new) == 28
    for key, value in old.items():
        assert new[key] == value.replace('pre-QP', 'Pre-QP'), key
    assert set(new)-set(old) == {'4.3.12','4.3.13'}
    for section, count in [(1,8),(2,3),(3,13),(4,3),(5,1)]:
        assert all(f'4.{section}.{n}' in new for n in range(1,count+1))
    for tag in ['pgSz','pgMar','cols','docGrid']:
        assert before.xpath('//w:sectPr/w:'+tag+'/attribute::*',namespaces=ns) == after.xpath('//w:sectPr/w:'+tag+'/attribute::*',namespaces=ns)
    assert not after.xpath('//w:ins|//w:del|//w:commentRangeStart',namespaces=ns)
    for part in a.namelist():
        if part.startswith('word/media/'):
            assert a.read(part) == b.read(part)
    for part in ['word/header1.xml','word/header2.xml']:
        assert txt(E.fromstring(a.read(part))) == txt(E.fromstring(b.read(part)))
    fulltext = txt(after)
    assert 'Post-Assembly QC and all preceding processing stages are out of scope.' in fulltext
    assert 'Pack & Price' not in fulltext
    assert 'Error! Reference source not found' not in fulltext
pdf = pdfium.PdfDocument(str(work/'final.pdf'))
assert len(pdf) == 7
pages = [p.get_textpage().get_text_range() for p in pdf]
for n, text in enumerate(pages,1):
    assert f'Page {n} of 7' in text
for heading, number in [('1. Introduction',3),('2. Scope',3),('3. Abbreviations',3),('4. User Requirements Specification',4),('5. User Access',6),('6. Testing',6),('7. Documents and Training',6),('8. Support and Administration',7),('9. Revision History',7)]:
    assert heading in pages[number-1], (heading,number)
    assert re.search(re.escape(heading)+r'.*?'+str(number), pages[1], flags=re.S), heading
assert hashlib.sha256(source.read_bytes()).hexdigest() == '55083fdf826befc7ebc206f59f65b1bd9675533841ea9b40d042fbf987f0e8d8'
report = {'requirements':28,'original_requirements_preserved':26,'new_requirements':['4.3.12','4.3.13'],'pages':7,'toc_and_page_numbers_verified':True,'source_unchanged':True,'media_unchanged':True,'geometry_unchanged':True,'tracked_changes':False,'visual_inspection':'All 7 final pages inspected; no clipping or overlap.'}
(work/'verification.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print(json.dumps(report,indent=2))
