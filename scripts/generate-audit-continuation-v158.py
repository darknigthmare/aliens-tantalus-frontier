"""Deterministically rebuild the V158 workbook from its reviewed JSON (stdlib).

This command only writes the V158 XLSX and its hash in progress-v158.json.
It never refreshes runtime pins or rewrites any historical document.
"""
import argparse
import hashlib
import json
from pathlib import Path
import re
import xml.etree.ElementTree as ET
import zipfile

M = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'
R = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
P = 'http://schemas.openxmlformats.org/package/2006/relationships'
C = 'http://schemas.openxmlformats.org/package/2006/content-types'
ET.register_namespace('', M)
ET.register_namespace('r', R)


def xml(root):
    return ET.tostring(root, encoding='utf-8', xml_declaration=True)


def tag(parent, name, attrs=None, text=None, namespace=M):
    element = ET.SubElement(parent, '{' + namespace + '}' + name, attrs or {})
    if text is not None:
        element.text = str(text)
    return element


def rebuild(directory):
    path = directory / 'progress-v158.json'
    record = json.loads(path.read_text(encoding='utf-8'))
    assert record['lot'] == 'V158'
    assert record['workbook'] == 'XENO_TRIALS_SUIVI_V158.xlsx'
    for entry in record['historyWorkbooks']:
        source = directory / Path(entry['path']).name
        assert hashlib.sha256(source.read_bytes()).hexdigest() == entry['sha256'], entry['path']
    sheets = ['00_Synthese', *record['tables']]
    entries = {}
    book = ET.Element('{' + M + '}workbook')
    sheet_list = tag(book, 'sheets')
    tag(book, 'calcPr', {'calcId': '191029', 'fullCalcOnLoad': '1'})
    relationships = ET.Element('{' + P + '}Relationships')
    types = ET.Element('{' + C + '}Types')
    for extension, content in [('rels', 'application/vnd.openxmlformats-package.relationships+xml'), ('xml', 'application/xml')]:
        tag(types, 'Default', {'Extension': extension, 'ContentType': content}, namespace=C)
    override = lambda name, kind: tag(types, 'Override', {'PartName': '/' + name, 'ContentType': kind}, namespace=C)
    override('xl/workbook.xml', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml')
    override('xl/styles.xml', 'application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml')

    for index, name in enumerate(sheets, 1):
        tag(sheet_list, 'sheet', {'name': name, 'sheetId': str(index), '{' + R + '}id': 'rId' + str(index)})
        tag(relationships, 'Relationship', {'Id': 'rId' + str(index), 'Type': R + '/worksheet', 'Target': 'worksheets/sheet' + str(index) + '.xml'}, namespace=P)
        doc = ET.Element('{' + M + '}worksheet')
        views = tag(doc, 'sheetViews')
        view = tag(views, 'sheetView', {'workbookViewId': '0'})
        tag(view, 'pane', {'ySplit': '5', 'topLeftCell': 'A6', 'activePane': 'bottomLeft', 'state': 'frozen'})
        cols = tag(doc, 'cols')
        count = 5 if index == 1 else len(record['tables'][name]['headers'])
        assert count <= 26
        for col in range(1, count + 1):
            tag(cols, 'col', {'min': str(col), 'max': str(col), 'width': '38', 'customWidth': '1'})
        data = tag(doc, 'sheetData')
        row_nodes = {}

        def cell(row, col, value, formula=None, style=0):
            node = row_nodes.get(row)
            if node is None:
                node = tag(data, 'row', {'r': str(row), 'ht': '48' if row >= 5 else '24', 'customHeight': '1'})
                row_nodes[row] = node
            attrs = {'r': chr(64 + col) + str(row), 's': str(style)}
            if isinstance(value, str) and formula is None:
                attrs['t'] = 'inlineStr'
            elif isinstance(value, bool):
                attrs['t'] = 'b'
            c = tag(node, 'c', attrs)
            if formula is not None:
                assert formula.startswith('=')
                tag(c, 'f', text=formula[1:])
                tag(c, 'v', text=value)
            elif isinstance(value, str):
                inline = tag(c, 'is')
                tag(inline, 't', {'{http://www.w3.org/XML/1998/namespace}space': 'preserve'}, value)
            elif value is not None:
                tag(c, 'v', text=int(value) if isinstance(value, bool) else value)

        cell(1, 1, 'Tantalus Frontier — V158', style=1)
        cell(2, 1, name)
        cell(3, 1, 'Prépublication : implémentation et validation du commit restent distinctes.')
        if index == 1:
            cell(5, 1, 'Indicateur', style=1)
            cell(5, 5, 'Compte vérifiable', style=1)
            for indicator in record['indicators']:
                match = re.fullmatch(r'E(\d+)', indicator['cell'])
                assert match
                row = int(match.group(1))
                cell(row, 1, indicator['label'])
                cell(row, 5, indicator['expected'], indicator['formula'])
        else:
            table = record['tables'][name]
            for row, values in enumerate([table['headers'], *table['rows']], 5):
                assert len(values) == count
                for col, value in enumerate(values, 1):
                    cell(row, col, value, style=int(row == 5))
            number = index - 1
            ref = 'A5:' + chr(64 + count) + str(5 + len(table['rows']))
            tab = ET.Element('{' + M + '}table', {'id': str(number), 'name': 'AuditV158Table' + str(number),
                'displayName': 'AuditV158Table' + str(number), 'ref': ref, 'totalsRowShown': '0'})
            tag(tab, 'autoFilter', {'ref': ref})
            columns = tag(tab, 'tableColumns', {'count': str(count)})
            for col, header in enumerate(table['headers'], 1):
                tag(columns, 'tableColumn', {'id': str(col), 'name': header})
            tag(tab, 'tableStyleInfo', {'name': 'TableStyleMedium2', 'showFirstColumn': '0', 'showLastColumn': '0', 'showRowStripes': '1', 'showColumnStripes': '0'})
            entries['xl/tables/table' + str(number) + '.xml'] = xml(tab)
            override('xl/tables/table' + str(number) + '.xml', 'application/vnd.openxmlformats-officedocument.spreadsheetml.table+xml')
            parts = tag(doc, 'tableParts', {'count': '1'})
            tag(parts, 'tablePart', {'{' + R + '}id': 'rId1'})
            rel = ET.Element('{' + P + '}Relationships')
            tag(rel, 'Relationship', {'Id': 'rId1', 'Type': R + '/table', 'Target': '../tables/table' + str(number) + '.xml'}, namespace=P)
            entries['xl/worksheets/_rels/sheet' + str(index) + '.xml.rels'] = xml(rel)
        entries['xl/worksheets/sheet' + str(index) + '.xml'] = xml(doc)
        override('xl/worksheets/sheet' + str(index) + '.xml', 'application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml')

    style = ET.Element('{' + M + '}styleSheet')
    fonts = tag(style, 'fonts', {'count': '2'})
    for bold in [False, True]:
        font = tag(fonts, 'font')
        tag(font, 'sz', {'val': '11'})
        tag(font, 'name', {'val': 'Calibri'})
        if bold:
            tag(font, 'b')
            tag(font, 'color', {'rgb': 'FFFFFFFF'})
    fills = tag(style, 'fills', {'count': '3'})
    for pattern in ['none', 'gray125', 'solid']:
        fill = tag(fills, 'fill')
        pattern_node = tag(fill, 'patternFill', {'patternType': pattern})
        if pattern == 'solid':
            tag(pattern_node, 'fgColor', {'rgb': 'FF26344F'})
            tag(pattern_node, 'bgColor', {'indexed': '64'})
    borders = tag(style, 'borders', {'count': '1'})
    border = tag(borders, 'border')
    for edge in ['left', 'right', 'top', 'bottom', 'diagonal']:
        tag(border, edge)
    base = tag(style, 'cellStyleXfs', {'count': '1'})
    tag(base, 'xf', {'numFmtId': '0', 'fontId': '0', 'fillId': '0', 'borderId': '0'})
    formats = tag(style, 'cellXfs', {'count': '2'})
    for header in [False, True]:
        xf = tag(formats, 'xf', {'numFmtId': '0', 'fontId': str(int(header)), 'fillId': '2' if header else '0', 'borderId': '0', 'xfId': '0', 'applyAlignment': '1'})
        tag(xf, 'alignment', {'vertical': 'top', 'wrapText': '1'})
    styles = tag(style, 'cellStyles', {'count': '1'})
    tag(styles, 'cellStyle', {'name': 'Normal', 'xfId': '0', 'builtinId': '0'})
    tag(relationships, 'Relationship', {'Id': 'rIdStyles', 'Type': R + '/styles', 'Target': 'styles.xml'}, namespace=P)
    root_rel = ET.Element('{' + P + '}Relationships')
    tag(root_rel, 'Relationship', {'Id': 'rId1', 'Type': R + '/officeDocument', 'Target': 'xl/workbook.xml'}, namespace=P)
    entries.update({'[Content_Types].xml': xml(types), '_rels/.rels': xml(root_rel),
        'xl/workbook.xml': xml(book), 'xl/_rels/workbook.xml.rels': xml(relationships), 'xl/styles.xml': xml(style)})
    target = directory / record['workbook']
    # Stored entries avoid zlib-version differences between local and CI Python.
    # The document is a review source and is excluded from the shipped game.
    with zipfile.ZipFile(target, 'w', compression=zipfile.ZIP_STORED) as archive:
        for name, payload in sorted(entries.items()):
            info = zipfile.ZipInfo(name, (2026, 1, 1, 0, 0, 0))
            info.compress_type = zipfile.ZIP_STORED
            archive.writestr(info, payload)
    record['workbookSha256'] = hashlib.sha256(target.read_bytes()).hexdigest()
    path.write_text(json.dumps(record, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    return {'workbook': record['workbook'], 'sha256': record['workbookSha256'], 'sheets': len(sheets), 'tables': len(sheets) - 1}


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('directory', type=Path, nargs='?', default=Path(__file__).resolve().parents[1] / 'docs/forge/xeno-trials')
    args = parser.parse_args()
    print(json.dumps(rebuild(args.directory), ensure_ascii=False))
