"""Record the current delivery files for tools/verify_delivery.py.
Re-run only after a deliberate change. The manifest excludes itself and caches.
"""
from pathlib import Path
import hashlib, json
R=Path(__file__).resolve().parents[1]
files={}
for p in sorted(R.rglob('*')):
    if not p.is_file() or p.is_symlink(): continue
    rel=p.relative_to(R)
    if '__pycache__' in rel.parts or p.suffix in ('.pyc','.pid') or str(rel)=='DELIVERY_MANIFEST.json':continue
    b=p.read_bytes();files[rel.as_posix()]={'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
manifest={'id':'tantalus.alien-isolation','version':json.loads((R/'package.json').read_text())['version'],'status':'standalone-playable-prototype','nativeIntegration':False,'pushed':False,'deployed':False,'files':files}
(R/'DELIVERY_MANIFEST.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'version':manifest['version'],'files':len(files),'bytes':sum(f['bytes'] for f in files.values())}))
