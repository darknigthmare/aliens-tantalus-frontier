"""Read-only integrity check. Never regenerates its own reference manifest."""
from pathlib import Path
import hashlib,json,sys
R=Path(__file__).resolve().parent.parent
m=json.loads((R/'PACKAGE_MANIFEST.json').read_text());fail=[];listed=set()
for e in m['files']:
 rel=e['path'];p=R/rel
 if p.resolve().is_relative_to(R.resolve()) is False:fail.append(rel+' invalid path');continue
 listed.add(rel)
 if not p.is_file():fail.append(rel+' missing');continue
 data=p.read_bytes()
 if len(data)!=e['bytes'] or hashlib.sha256(data).hexdigest()!=e['sha256']:fail.append(rel+' changed')
actual={p.relative_to(R).as_posix() for p in R.rglob('*') if p.is_file() and '__pycache__' not in p.parts and p.name!='PACKAGE_MANIFEST.json'}
fail.extend('unlisted: '+x for x in sorted(actual-listed))
print(json.dumps({'ok':not fail,'hashedFiles':len(m['files']),'nativeActivated':m['nativeActivated'],'failures':fail},ensure_ascii=False,indent=2));sys.exit(bool(fail))
