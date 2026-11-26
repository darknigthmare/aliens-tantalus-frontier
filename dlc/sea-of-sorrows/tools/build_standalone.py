#!/usr/bin/env python3
"""Rebuild the self-contained HTML from the exact game sources."""
from pathlib import Path
root=Path(__file__).resolve().parents[1]
html=(root/'index.html').read_text()
html=html.replace('<link rel="stylesheet" href="styles.css">','<style>\n'+(root/'styles.css').read_text()+'\n</style>')
for name in ['data','core','render','world-art','tactics-art','controls','support','soundscape','main']:
    html=html.replace(f'<script src="src/{name}.js"></script>','<script>\n'+(root/f'src/{name}.js').read_text().replace('</script','<\\/script')+'\n</script>')
p=root/'MER_DES_CHAGRINS_JOUABLE.html';p.write_text(html);print(p,p.stat().st_size)
