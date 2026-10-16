"""Read-only ZIP/XML verification of the artifact_tool-authored workbook."""
import json, sys, hashlib, zipfile, re, xml.etree.ElementTree as ET
from pathlib import Path
root=Path(sys.argv[1])
manifest=json.loads((root/'manifest-v146.json').read_text(encoding='utf-8'))
xlsx=root/manifest['workbook']
assert hashlib.sha256(xlsx.read_bytes()).hexdigest()==manifest['sha256']
ns={'s':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
with zipfile.ZipFile(xlsx) as z:
    assert z.testzip() is None
    names=z.namelist()
    assert not any('/externalLinks/' in n or n.endswith('vbaProject.bin') for n in names)
    workbook=ET.fromstring(z.read('xl/workbook.xml'))
    sheets=workbook.find('s:sheets',ns)
    actual=[s.get('name') for s in sheets]
    assert actual==manifest['sheets'],actual
    assert len(set(actual))==20
    tables=[n for n in names if re.fullmatch(r'xl/tables/table\d+\.xml',n)]
    assert len(tables)==18
    errors=0;formulas=0
    for n in names:
        if not re.fullmatch(r'xl/worksheets/sheet\d+\.xml',n):continue
        doc=ET.fromstring(z.read(n))
        errors+=len(doc.findall('.//s:c[@t="e"]',ns))
        formulas+=len(doc.findall('.//s:f',ns))
        for col in doc.findall('.//s:cols/s:col',ns):
            assert float(col.get('width','0'))<=40.1, (n,col.attrib)
    assert errors==0
    dashboard=ET.fromstring(z.read('xl/worksheets/sheet2.xml'))
    expected={'A8':189,'D8':6,'G8':10,'J8':0,'A12':3402,'D12':567,
        'G12':378,'J12':378,'A16':1890,'D16':192,'G16':945,'J16':0,
        'D24':122,'D25':41,'D26':13,'D27':8,'D28':4,'D29':1}
    for address,value in expected.items():
        c=dashboard.find(f'.//s:c[@r="{address}"]',ns)
        assert c is not None and c.find('s:f',ns) is not None,address
        assert float(c.find('s:v',ns).text)==value,(address,c.find('s:v',ns).text)
    for i,name in enumerate(actual,1):
        if name not in manifest['tableRows']:continue
        doc=ET.fromstring(z.read(f'xl/worksheets/sheet{i}.xml'))
        pane=doc.find('.//s:pane',ns)
        assert pane is not None and pane.get('ySplit')=='5', name
        datarows=[r for r in doc.findall('.//s:sheetData/s:row',ns) if 6<=int(r.get('r'))<=manifest['tableRows'][name]+5]
        assert len(datarows)==manifest['tableRows'][name],name
print(json.dumps({'ok':True,'sheets':len(actual),'tables':len(tables),'formulas':formulas,'formulaErrors':errors}))
