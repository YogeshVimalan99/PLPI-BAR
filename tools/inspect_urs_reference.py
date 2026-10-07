from pathlib import Path
from zipfile import ZipFile
from lxml import etree as E
import json, sys, hashlib

NS={'w':'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
for name in sys.argv[1:]:
    p=Path(name)
    print('\nFILE',str(p),'SHA256',hashlib.sha256(p.read_bytes()).hexdigest())
    with ZipFile(p) as z:
        root=E.fromstring(z.read('word/document.xml'))
        for i,child in enumerate(root.find('w:body',NS)):
            if child.tag.endswith('}p'):
                txt=''.join(child.xpath('.//w:t/text()',namespaces=NS))
                st=child.xpath('./w:pPr/w:pStyle/@w:val',namespaces=NS)
                if txt: print('P',i,st,txt)
            elif child.tag.endswith('}tbl'):
                print('TABLE',i)
                for r in child.findall('w:tr',NS):
                    print(' | '.join(''.join(c.xpath('.//w:t/text()',namespaces=NS)) for c in r.findall('w:tc',NS)))
        print('SECTIONS', [E.tostring(s).decode() for s in root.xpath('//w:sectPr',namespaces=NS)])
        for part in z.namelist():
            if part.startswith(('word/header','word/footer')) and part.endswith('.xml'):
                print(part, ''.join(E.fromstring(z.read(part)).xpath('//w:t/text()',namespaces=NS)))
