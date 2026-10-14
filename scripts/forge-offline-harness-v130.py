"""Offline DOM fixture using real ES modules through a local data import map.
No HTTP navigation, real disk storage, service worker or campaign runtime is claimed.
"""
import base64
import json
import posixpath
from pathlib import Path
import re


def build_offline_html(root: Path) -> str:
    imports = {}
    pending = ['src/editor.js', 'src/forge-save-v62.js']
    pattern = r'''(\bfrom\s*|\bimport\s*\(\s*|\bimport\s*)(['"])(\.[^'"\n]+)\2'''
    while pending:
        name = pending.pop()
        if 'atf/' + name in imports:
            continue
        source = (root / name).read_text()
        def rewrite(match):
            prefix, quote, relative = match.groups()
            target = posixpath.normpath(posixpath.join(posixpath.dirname(name), relative))
            if not target.startswith('src/') or not (root / target).is_file():
                raise ValueError('Fixture import outside src: ' + target)
            pending.append(target)
            return f'{prefix}{quote}atf/{target}{quote}'
        source = re.sub(pattern, rewrite, source)
        source = source.replace('import.meta.url', json.dumps('https://fixture.invalid/' + name))
        imports['atf/' + name] = 'data:text/javascript;base64,' + base64.b64encode(source.encode()).decode()
    html = (root / 'scripts/fixtures/forge-v130.html').read_text()
    script = re.search(r'<script type="module">(.*?)</script>', html, re.S).group(1)
    script = re.sub(pattern, lambda m: m.group(1) + m.group(2) + 'atf/' + posixpath.normpath(posixpath.join('scripts/fixtures', m.group(3))) + m.group(2), script)
    html = re.sub(r'<script type="module">.*?</script>', '', html, flags=re.S)
    styles = ''.join(f'<style id="{id}">{(root / path).read_text()}</style>' for id, path in [
        ('forge-styles-v130', 'src/forge-editor-v130.css'),
        ('forge-styles-v133', 'src/forge-workbench-v133.css')
    ] if (root / path).is_file())
    return html + styles + '<script type="importmap">' + json.dumps({'imports': imports}) + '</script><script type="module">' + script + '</script>'


def prepare_offline_page(page, html, records=None):
    page.goto('about:blank')
    page.evaluate('''records=>{
      const map=new Map(Object.entries(records));
      const storage={getItem:key=>map.get(String(key))??null,setItem:(key,value)=>map.set(String(key),String(value)),removeItem:key=>map.delete(String(key)),clear:()=>map.clear(),dump:()=>Object.fromEntries(map)};
      Object.defineProperty(window,'localStorage',{value:storage,configurable:true});
    }''', records or {})
    page.set_content(html, wait_until='load')
