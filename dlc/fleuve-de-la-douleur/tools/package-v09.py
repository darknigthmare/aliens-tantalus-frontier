#!/usr/bin/env python3
"""Package the current DLC only; verify every extracted byte before announcing success."""
from pathlib import Path
import hashlib,json,re,subprocess,sys,tempfile,zipfile
R=Path(__file__).resolve().parents[1];version='0.9.0';rootname='ALIEN_FLEUVE_DOULEUR_v'+version
archive=R.parent/('ALIENS_TANTALUS_DLC_FLEUVE_DOULEUR_v'+version+'.zip')
run=subprocess.run([sys.executable,'-X','utf8','-S',str(R/'tools/verify-v09.py')])
if run.returncode:sys.exit(run.returncode)
def include(p):
 rel=p.relative_to(R);parts=rel.parts
 if '__pycache__' in parts or p.suffix in ('.pyc','.zip'):return False
 if parts[0] in ('captures','qa-v09'):return False
 if parts[0]=='history' and ('report-evidence' in parts or p.suffix in ('.png','.html','.log')):return False
 if parts[0]=='tools' and p.name=='run-initial-v09.py':return False
 if p.name in ('DELIVERY_MANIFEST.json','CHECKSUMS.sha256','PACKAGE_VALIDATION_V09.json'):return False
 return parts[0] in ('src','tools','tests','docs','history','captures-v09') or rel.as_posix() in (
 'JOUER.html','RAPPORT_ILLUSTRE.html','README.md','package.json','LANCER_WINDOWS.bat','LICENSE_NOTICE.md')
paths=sorted(p for p in R.rglob('*') if p.is_file() and include(p))
records=[{'path':p.relative_to(R).as_posix(),'size':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in paths]
manifest={'version':version+'-candidate.1','files':records,'scope':'Current independent DLC, not native Tantalus or a full-novel 1:1 certification.'}
(R/'DELIVERY_MANIFEST.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
(R/'CHECKSUMS.sha256').write_text('\n'.join(v['sha256']+'  '+v['path'] for v in records)+'\n',encoding='utf-8')
paths += [R/'DELIVERY_MANIFEST.json',R/'CHECKSUMS.sha256']
with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
 for p in paths:z.write(p,rootname+'/'+p.relative_to(R).as_posix())
checks=[]
with tempfile.TemporaryDirectory(prefix='rop-v09-package-') as td:
 with zipfile.ZipFile(archive) as z:
  assert z.testzip() is None
  for member in z.infolist():
   q=Path(member.filename);assert not q.is_absolute() and '..' not in q.parts
  z.extractall(td)
 base=Path(td)/rootname
 for v in records:
  p=base/v['path'];assert p.stat().st_size==v['size'] and hashlib.sha256(p.read_bytes()).hexdigest()==v['sha256']
  checks.append(v['path'])
 h=hashlib.sha256((base/'JOUER.html').read_bytes()).hexdigest()
 for tool in ['build-content.py','build-standalone.py']:
  p=subprocess.run([sys.executable,'-X','utf8','-S',str(base/'tools'/tool)],capture_output=True,text=True)
  if p.returncode:raise RuntimeError(p.stderr)
 assert hashlib.sha256((base/'JOUER.html').read_bytes()).hexdigest()==h
result={'passed':True,'archive':archive.name,'size':archive.stat().st_size,'sha256':hashlib.sha256(archive.read_bytes()).hexdigest(),'files':len(paths),'verifiedPayloadFiles':len(checks),'rebuiltFromExtractedArchive':True,'htmlSHA256':h}
(R.parent/'FLEUVE_DOULEUR_V09_PACKAGE_VALIDATION.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
print(json.dumps(result,indent=2))
