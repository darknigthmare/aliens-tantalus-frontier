#!/usr/bin/env python3
"""Build an offline HTML using the exact shipped runtime sources. Python 3.9+."""
from pathlib import Path
import re
ROOT=Path(__file__).resolve().parents[1]
SRC=ROOT/'src'/'river-of-pain'
html=(SRC/'index.html').read_text(encoding='utf-8')
css=(SRC/'style.css').read_text(encoding='utf-8')
html=html.replace('<link rel="stylesheet" href="style.css">','<style>'+css+'</style>')
for name in ('data.js','colony.js','exploration.js','passages.js','life.js','defense.js','ducts.js','mobility.js','armory.js','core.js','persistence.js','render.js','architecture.js','field-visuals.js','passage-visuals.js','life-visuals.js','life-ui.js','defense-visuals.js','defense-ui.js','ducts-visuals.js','ducts-ui.js','mobility-visuals.js','mobility-ui.js','fidelity-visuals.js','fidelity-ui.js','ui.js'):
    code=(SRC/name).read_text(encoding='utf-8')
    code=re.sub(r'</script',r'<\\/script',code,flags=re.I)
    html=html.replace(f'<script src="{name}"></script>',f'<script>\n{code}\n</script>')
(ROOT/'JOUER.html').write_text(html,encoding='utf-8')
print('JOUER.html:',len(html.encode('utf-8')),'octets')
