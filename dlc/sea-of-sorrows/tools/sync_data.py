#!/usr/bin/env python3
"""Compile editable campaign JSON into the dependency-free browser data module."""
from pathlib import Path
import json
root=Path(__file__).resolve().parents[1]
data=json.loads((root/'data/campaign.json').read_text(encoding='utf-8'))
for key in ['meta','rooms','chapters','edges','codex','difficulties']:
    if key not in data:raise ValueError(f'Clé obligatoire absente : {key}')
for key in ['rooms','chapters','codex']:
    ids=[x['id'] for x in data[key]]
    if len(ids)!=len(set(ids)):raise ValueError(f'Identifiants en double : {key}')
source='/* Authored room graph and original adaptation text. */\n(function(root){const data='+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';if(typeof module!=="undefined"&&module.exports)module.exports=data;root.SoSData=data;})(typeof globalThis!=="undefined"?globalThis:this);\n'
(root/'src/data.js').write_text(source,encoding='utf-8')
print('src/data.js synchronisé avec data/campaign.json')
