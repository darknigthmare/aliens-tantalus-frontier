#!/usr/bin/env python3
"""Package current source and evidence; verify archive contents, never publish remotely."""
from pathlib import Path
import hashlib,json,zipfile,os
R=Path(__file__).resolve().parents[1];sha=lambda b:hashlib.sha256(b).hexdigest();read=lambda p:json.loads((R/p).read_text())
D=read('docs/CONTENT_MANIFEST.json');version=D['manifest']['version'];assert version=='0.8.0-candidate.1'
for name in ['CORE_TEST_RESULTS','COLONY_TEST_RESULTS','EXPLORATION_TEST_RESULTS','PASSAGES_TEST_RESULTS','PERSISTENCE_TEST_RESULTS','LIFE_TEST_RESULTS','DEFENSE_TEST_RESULTS','DUCT_TEST_RESULTS','MOBILITY_TEST_RESULTS','INSTALLER_TEST_RESULTS','REAL_UPGRADE_TEST_RESULTS','BROWSER_V08A','BROWSER_V08B','BROWSER_V08C','QUALIFICATION_MODEL','DOCUMENTATION_BUILD','REPORT_VISUAL_RESULTS','DELIVERY_VALIDATION']:
 r=read('docs/'+name+'.json');assert r['passed'],name
for name in ['TRAVERSAL_RESULTS','TRAVERSAL_EXPLORATION_RESULTS','TRAVERSAL_LIFE_RESULTS','TRAVERSAL_DEFENSE_RESULTS','TRAVERSAL_DUCT_RESULTS','TRAVERSAL_MOBILITY_RESULTS']:
 runs=read('docs/'+name+'.json');runs=runs if isinstance(runs,list) else runs['cases'];assert len(runs)==6 and all(t['passed'] for t in runs),name
standalone=sha((R/'JOUER.html').read_bytes())
for part in 'ABC':assert read('docs/BROWSER_V08'+part+'.json')['htmlSHA256']==standalone
source_hashes={p.relative_to(R).as_posix():sha(p.read_bytes()) for p in sorted((R/'src/river-of-pain').iterdir()) if p.is_file()}
assert read('docs/QUALIFICATION_MODEL.json')['sourceDigests']==source_hashes
assert read('docs/DELIVERY_VALIDATION.json')['sourceDigests']==source_hashes
assert read('docs/DOCUMENTATION_BUILD.json')['standaloneSHA256']==standalone
assert read('docs/REPORT_VISUAL_RESULTS.json')['reportSHA256']==sha((R/'RAPPORT_ILLUSTRE.html').read_bytes())
lineage=read('docs/SOURCE_V08.json');previous=R.parent/lineage['sourceArchive']
if previous.is_file():assert sha(previous.read_bytes())==lineage['sha256']
exclude={'CHECKSUMS.sha256','DELIVERY_MANIFEST.json'};entries=[]
for p in sorted(R.rglob('*')):
 if p.is_symlink():raise RuntimeError('Symbolic link refused: '+str(p))
 if not p.is_file() or '__pycache__' in p.parts or p.suffix in ['.pyc','.zip','.tmp'] or p.name in exclude:continue
 blob=p.read_bytes();entries.append({'path':p.relative_to(R).as_posix(),'size':len(blob),'sha256':sha(blob)})
manifest={'id':'river-of-pain','version':version,'delivery':'Autonomous local playable fan DLC, sources and additive reversible launcher; NOT complete native Tantalus','published':False,'nativeEngineIntegrated':False,'sourceArchiveSHA256':lineage['sha256'],'standaloneSHA256':standalone,'counts':D['manifest']['counts'],'currentQA':'docs/QA_REPORT.md','archivePolicy':'Current screenshots and useful source history only; no nested previous ZIP or old galleries','files':entries,'excludedFromOwnHashList':sorted(exclude)}
(R/'DELIVERY_MANIFEST.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
(R/'CHECKSUMS.sha256').write_text(''.join(f'{e["sha256"]}  {e["path"]}\n' for e in entries)+f'{sha((R/"DELIVERY_MANIFEST.json").read_bytes())}  DELIVERY_MANIFEST.json\n')
archive=R.parent/'ALIENS_TANTALUS_DLC_FLEUVE_DOULEUR_v0.8.0.zip';temp=archive.with_suffix('.zip.tmp');files=[R/e['path'] for e in entries]+[R/'DELIVERY_MANIFEST.json',R/'CHECKSUMS.sha256']
try:
 with zipfile.ZipFile(temp,'w',zipfile.ZIP_DEFLATED,compresslevel=8) as z:
  for p in sorted(files):z.write(p,R.name+'/'+p.relative_to(R).as_posix())
 with zipfile.ZipFile(temp) as z:
  assert z.testzip() is None
  for p in files:assert z.read(R.name+'/'+p.relative_to(R).as_posix())==p.read_bytes()
 os.replace(temp,archive)
finally:
 if temp.exists():temp.unlink()
result={'archive':str(archive),'bytes':archive.stat().st_size,'sha256':sha(archive.read_bytes()),'entries':len(files),'crc':'PASS','allArchivedBytesMatchSource':True,'standaloneSHA256':standalone}
(archive.parent/'FLEUVE_DOULEUR_v08_DELIVERY.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n');print(json.dumps(result,indent=2))
