"""Verify the immutable files recorded in DELIVERY_MANIFEST.json. No network."""
from pathlib import Path
import hashlib,json,sys
root=Path(__file__).resolve().parents[1]
manifest=json.loads((root/'DELIVERY_MANIFEST.json').read_text())
errors=[]
for rel,meta in manifest['files'].items():
 path=(root/rel).resolve()
 if not path.is_relative_to(root) or not path.is_file():errors.append(rel+': missing/invalid');continue
 raw=path.read_bytes()
 if len(raw)!=meta['bytes'] or hashlib.sha256(raw).hexdigest()!=meta['sha256']:errors.append(rel+': modified')
print(f"Verified {len(manifest['files'])} files; {len(errors)} mismatch(es)")
for error in errors:print(error)
sys.exit(bool(errors))
