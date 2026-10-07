"""Rebuild existing Phase 2C content using the actual Phase 3 sample package."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
from copy import deepcopy
from lxml import etree as E
import json, hashlib, sys

ROOT=Path(__file__).resolve().parents[1]
REF=ROOT/'Phase 3 Doc/URS - PLPI Software - VMP-A5-0007-01_v24.2 Sep 2026.docx'
OUT=ROOT/'Phase 4 Doc/URS-PLPI BAR - Phase 2C Pre-QP to Batch Record.docx'
WORK=ROOT/'.urs_phase2c_work/sample-correction'
EXPECTED='b2b33fcb4e31cf7c14572f610d8e46de233143ef97fc3ece9e6c3362f15dfc83'
sys.path.insert(0,'C:/Users/vimalyog/.codex/plugins/cache/openai-primary-runtime/documents/26.909.11814/skills/documents/scripts')
from docx_ooxml_patch import NS, _qn
def txt(node): return ''.join(node.xpath('.//w:t/text()',namespaces=NS))
def clone(node):
    node=deepcopy(node)
    for item in node.xpath('.//w:bookmarkStart|.//w:bookmarkEnd|.//w:lastRenderedPageBreak',namespaces=NS):
        item.getparent().remove(item)
    for item in node.iter():
        for key in list(item.attrib):
            if E.QName(key).localname in ['paraId','textId']:
                del item.attrib[key]
    return node
def settext(node,value):
    texts=node.xpath('.//w:t',namespaces=NS)
    assert texts
    texts[0].text=value
    texts[0].set('{http://www.w3.org/XML/1998/namespace}space','preserve')
    for t in texts[1:]: t.text=''
def para(pattern,value):
    p=clone(pattern); settext(p,value); return p
def filltable(pattern,rows):
    table=clone(pattern)
    old=table.findall('w:tr',NS)
    rowpattern=old[1]
    for row in old[1:]: table.remove(row)
    for values in rows:
        row=clone(rowpattern)
        for cell,value in zip(row.findall('w:tc',NS),values): settext(cell,value)
        # Keep each short requirement together without changing source typography.
        pr=row.find('w:trPr',NS)
        if pr is None: pr=E.SubElement(row,_qn('w','trPr'))
        E.SubElement(pr,_qn('w','cantSplit'))
        table.append(row)
    return table
assert hashlib.sha256(REF.read_bytes()).hexdigest()==EXPECTED
WORK.mkdir(exist_ok=True)
backup=WORK/'before-template-correction.docx'
if backup.exists():
    assert backup.read_bytes()==OUT.read_bytes(), 'Output changed since backup'
else:
    backup.write_bytes(OUT.read_bytes())
with ZipFile(REF) as z: parts={n:z.read(n) for n in z.namelist()}
with ZipFile(backup) as z: content=E.fromstring(z.read('word/document.xml'))
content_body=content.find('w:body',NS)
sections={}; current=None
modules=[]; requirements={}; abbrevs=[]
for node in content_body:
    text=txt(node)
    if node.tag==_qn('w','p'):
        style=node.find('w:pPr/w:pStyle',NS)
        if style is not None and style.get(_qn('w','val')) in ['Heading1','Heading2']:
            current=text; sections[current]=[]
            if text.startswith(('4.1 ','4.2 ','4.3 ','4.4 ','4.5 ')): modules.append(text)
        elif current and text: sections[current].append(text)
    elif node.tag==_qn('w','tbl'):
        rows=node.findall('w:tr',NS)
        if rows and txt(rows[0]).startswith('URS ID'):
            requirements[current]=[[txt(c) for c in r.findall('w:tc',NS)] for r in rows[1:]]
        elif rows and txt(rows[0])=='TermDefinition':
            abbrevs=[[txt(c) for c in r.findall('w:tc',NS)] for r in rows[1:]]
assert sum(map(len,requirements.values()))==28
r=E.fromstring(parts['word/document.xml']); body=r.find('w:body',NS); src=list(body)
# Source package is the layout authority, including cover, TOC, logo and page furniture.
for node in src[13:]: body.remove(node)
for t in src[8].xpath('.//w:t',namespaces=NS):
    if t.text: t.text=t.text.replace('Jayesh Patel','David Dunnee').replace('Assembly Manager','Quality Director')

for heading in ['1. Introduction','2. Scope']:
    body.append(para(src[13],heading))
    for value in sections[heading]: body.append(para(src[14],value))
body.append(para(src[13],'3. Abbreviations'))
body.append(filltable(src[20],abbrevs))
body.append(clone(src[21]))
body.append(para(src[22],'4. User Requirements Specification'))
for value in sections['4. User Requirements Specification']: body.append(para(src[14],value))
for heading in modules:
    body.append(para(src[23],heading))
    body.append(filltable(src[24],requirements[heading]))
    body.append(clone(src[27]))
for heading in ['5. User Access','6. Testing','7. Documents and Training','8. Support and Administration']:
    body.append(para(src[13],heading))
    for value in sections[heading]: body.append(para(src[14],value))
body.append(para(src[13],'9. Revision History'))
history=deepcopy(src[45])
last=history.findall('w:tr',NS)[-1].findall('w:tc',NS)
assert txt(last[0])=='24.2'
settext(last[2],'Post-Assembly scope covering Pre-QP, Release Log Sheet, QP Approval, Certified Batches and Batch Record, including document download and retention-sample quantity exclusion.')
settext(last[3],'For approval')
body.append(history); body.append(deepcopy(src[46])); body.append(deepcopy(src[47]))
parts['word/document.xml']=E.tostring(r,xml_declaration=True,encoding='UTF-8',standalone=True)
with ZipFile(OUT,'w',ZIP_DEFLATED) as z:
    for name,data in parts.items(): z.writestr(name,data)
with ZipFile(REF) as a, ZipFile(OUT) as b:
    changed=[n for n in a.namelist() if a.read(n)!=b.read(n)]
assert changed==['word/document.xml']
(WORK/'pre-refresh.docx').write_bytes(OUT.read_bytes())
(WORK/'content-baseline.json').write_text(json.dumps({'sections':sections,'requirements':requirements,'abbreviations':abbrevs},indent=2),encoding='utf-8')
(WORK/'package-inventory.json').write_text(json.dumps({n:{'bytes':len(v),'sha256':hashlib.sha256(v).hexdigest()} for n,v in parts.items()},indent=2),encoding='utf-8')
print(json.dumps({'template':str(REF),'output':str(OUT),'requirement_count':28,'template_parts_changed':changed,'reference_unchanged':hashlib.sha256(REF.read_bytes()).hexdigest()==EXPECTED},indent=2))
