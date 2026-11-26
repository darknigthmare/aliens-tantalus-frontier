#!/usr/bin/env python3
"""Reconstruct one original ZIP from its exact, ordered archive fragments."""
from pathlib import Path
import argparse, hashlib, json, zipfile

parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('manifest',type=Path)
parser.add_argument('--destination',type=Path,required=True)
args=parser.parse_args()
manifest_path=args.manifest.resolve()
repo=manifest_path
while repo.parent!=repo and not (repo/'archives').is_dir():repo=repo.parent
if not (repo/'archives').is_dir():raise SystemExit('Repository archives directory not found')
manifest=json.loads(manifest_path.read_text(encoding='utf-8'))
name=manifest['originalFilename']
if Path(name).name!=name:raise SystemExit('Unsafe original filename')
args.destination.mkdir(parents=True,exist_ok=True)
output=args.destination/name
if output.exists():raise SystemExit(f'Refusing to overwrite {output}')
temporary=output.with_name(output.name+'.reconstructing')
if temporary.exists():raise SystemExit(f'Refusing to overwrite {temporary}')
whole=hashlib.sha256();length=0
try:
 with temporary.open('xb') as out:
  for entry in manifest['parts']:
   source=(repo/entry['path']).resolve()
   if not source.is_relative_to(repo/'archives'):raise ValueError('Unsafe fragment path')
   content=source.read_bytes()
   if len(content)!=entry['size'] or hashlib.sha256(content).hexdigest()!=entry['sha256']:
    raise ValueError(f'Fragment failed verification: {entry["path"]}')
   out.write(content);whole.update(content);length+=len(content)
 expected=manifest['archive']
 if length!=expected['size'] or whole.hexdigest()!=expected['sha256']:
  raise ValueError('Reconstructed ZIP failed whole-file verification')
 with zipfile.ZipFile(temporary) as z:
  failed=z.testzip()
  if failed:raise ValueError(f'Invalid CRC: {failed}')
 temporary.rename(output)
except BaseException:
 temporary.unlink(missing_ok=True)
 raise
print(json.dumps({'filename':output.name,'bytes':length,'sha256':whole.hexdigest(),'zipCrcValid':True}))
