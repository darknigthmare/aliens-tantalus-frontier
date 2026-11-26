#!/usr/bin/env python3
"""Hash every file shipped in the DLC, excluding this manifest itself."""
from pathlib import Path
import json,hashlib
root=Path(__file__).resolve().parents[1];out=root/'MANIFEST_SHA256.json'
items=[]
for p in sorted(root.rglob('*')):
    if p.is_file() and p!=out and '__pycache__' not in p.parts:
        b=p.read_bytes();items.append({'path':p.relative_to(root).as_posix(),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()})
out.write_text(json.dumps({'dlc':'Alien : La Mer des Chagrins','version':json.loads((root/'package.json').read_text())['version'],'status':'prototype_autonome_non_integre','files':items},ensure_ascii=False,indent=2),encoding='utf-8')
print(len(items),'fichiers contrôlés')
