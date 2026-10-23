"""Read-only ZIP/XML verification of the V163 tracker; standard library only."""
import hashlib
import json
from pathlib import Path
import re
import sys
import xml.etree.ElementTree as ET
import zipfile

root = Path(sys.argv[1])
record = json.loads((root / 'progress-v163.json').read_text(encoding='utf-8'))
workbook = root / record['workbook']
assert hashlib.sha256(workbook.read_bytes()).hexdigest() == record['workbookSha256']
ns = {'m': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main',
      'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'}
package_ns = {'p': 'http://schemas.openxmlformats.org/package/2006/relationships'}
expected_names = ['00_Synthese'] + list(record['tables'])
assert expected_names[-3:] == ['23_ChantiersV163', '24_CouvertureV163', '25_RosterEtatV163']
formula_count = 0
cell_count = 0
with zipfile.ZipFile(workbook) as archive:
    assert archive.testzip() is None
    names = archive.namelist()
    assert not any('/externalLinks/' in name or name.endswith('vbaProject.bin') for name in names)
    strings = []
    if 'xl/sharedStrings.xml' in names:
        strings = [''.join(item.itertext()) for item in ET.fromstring(archive.read('xl/sharedStrings.xml'))]

    def value(cell):
        if cell is None:
            return None
        kind = cell.get('t')
        entry = cell.find('m:v', ns)
        if kind == 'inlineStr':
            return ''.join(cell.find('m:is', ns).itertext())
        if kind == 's':
            return strings[int(entry.text)]
        if entry is None or entry.text is None:
            return None
        if kind == 'b':
            return entry.text == '1'
        try:
            number = float(entry.text)
            assert number == number and abs(number) != float('inf')
            return number
        except ValueError:
            return entry.text

    rels = ET.fromstring(archive.read('xl/_rels/workbook.xml.rels'))
    targets = {}
    for item in rels:
        assert item.get('TargetMode') != 'External'
        target = item.get('Target')
        targets[item.get('Id')] = target.lstrip('/') if target.startswith('/') else 'xl/' + target
    book = ET.fromstring(archive.read('xl/workbook.xml'))
    sheets = book.find('m:sheets', ns)
    assert [s.get('name') for s in sheets] == expected_names
    documents = {s.get('name'): ET.fromstring(archive.read(targets[s.get('{' + ns['r'] + '}id')])) for s in sheets}
    cells = {name: {c.get('r'): c for c in doc.findall('.//m:c', ns)} for name, doc in documents.items()}
    for name, doc in documents.items():
        assert not doc.findall('.//m:c[@t="e"]', ns), name
        pane = doc.find('.//m:pane', ns)
        assert pane is not None and pane.get('ySplit') == '5', name
        formula_count += len(doc.findall('.//m:f', ns))
        for col in doc.findall('.//m:cols/m:col', ns):
            if name != '00_Synthese':
                assert float(col.get('width', '0')) <= 40.1, (name, col.attrib)
    table_files = [n for n in names if re.fullmatch(r'xl/tables/table\d+\.xml', n)]
    assert len(table_files) == len(record['tables'])
    for index, (name, table) in enumerate(record['tables'].items(), 1):
        assert table['rows'], name
        col_count = len(table['headers'])
        assert col_count <= 26
        last_col = chr(64 + col_count)
        expected_ref = f'A5:{last_col}{len(table["rows"])+5}'
        table_xml = ET.fromstring(archive.read(f'xl/tables/table{index}.xml'))
        assert table_xml.get('ref') == expected_ref, (name, table_xml.get('ref'))
        assert [c.get('name') for c in table_xml.find('m:tableColumns', ns)] == table['headers']
        expected_cells = set()
        for row, values in enumerate([table['headers']] + table['rows'], 5):
            assert len(values) == col_count
            for col, expected in enumerate(values, 1):
                address = chr(64 + col) + str(row)
                expected_cells.add(address)
                assert value(cells[name].get(address)) == expected, (name, address, value(cells[name].get(address)), expected)
                assert cells[name].get(address) is None or cells[name][address].find('m:f', ns) is None
                cell_count += 1
        for address, cell in cells[name].items():
            row = int(re.search(r'\d+', address).group())
            if row >= 5 and value(cell) is not None:
                assert address in expected_cells, (name, 'untracked cell', address)
    assert formula_count == len(record['indicators']) == 32
    assert [i['cell'] for i in record['indicators']] == [f'E{i}' for i in range(7, 39)]
    assert [i['expected'] for i in record['indicators'][:7]] == [189, 4, 40, 200, 40, 40, 28]
    assert [i['expected'] for i in record['indicators'][9:11]] == [0, 0]
    assert [i['expected'] for i in record['indicators'][-6:]] == [len(record['newWorkstreamsV163']), 0, 0, 85, 189, 17]
    for indicator in record['indicators']:
        cell = cells['00_Synthese'][indicator['cell']]
        formula = cell.find('m:f', ns)
        assert formula is not None and '=' + formula.text == indicator['formula']
        assert value(cell) == indicator['expected']
        match = re.fullmatch(r"=(COUNTA|SUM|COUNTIF)\('([^']+)'!([A-Z]+)(\d+):\3(\d+)(?:,\"([^\"]*)\")?\)", indicator['formula'])
        assert match, indicator
        operation, sheet, col, first, last, criterion = match.groups()
        entries = [value(cells[sheet].get(f'{col}{row}')) for row in range(int(first), int(last)+1)]
        if operation == 'COUNTIF':
            assert criterion is not None
            calculated = sum(v == criterion for v in entries)
        else:
            assert criterion is None
            calculated = sum(v is not None and v != '' for v in entries) if operation == 'COUNTA' else sum(v for v in entries if isinstance(v, (int, float)))
        assert calculated == indicator['expected'], (indicator['id'], calculated)
print(json.dumps({'ok': True, 'sheets': len(expected_names), 'tables': len(table_files),
                  'sourceCells': cell_count, 'formulas': formula_count, 'formulaErrors': 0}))
