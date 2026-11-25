"""Intentional release sealing; verification is the separate read-only script."""
from pathlib import Path
import hashlib,json
R=Path(__file__).resolve().parent.parent
sha=lambda b:hashlib.sha256(b).hexdigest()
html=(R/'JOUER_ALIENS_V114.html').read_bytes()
files=[]
for p in sorted(R.rglob('*')):
 if not p.is_file() or '__pycache__' in p.parts or p.name=='PACKAGE_MANIFEST.json':continue
 if p.is_symlink():raise ValueError('Symlink disallowed')
 data=p.read_bytes();files.append({'path':p.relative_to(R).as_posix(),'bytes':len(data),'sha256':sha(data)})
m={'release':'114.0.0-rc.1','title':'Aliens 1986 — Lieux et identités','artifactType':'Standalone V113 branch continued; not the full Tantalus repository','nativeActivated':False,'fullTantalusArchive':False,'baseArchive':'ALIENS_1986_V113_TENIR_LES_ANGLES_RC1.zip','baseSha256':'079d01f8baa7c3ab7e7e6ea6cf38ee223fa506e2e57f7e2a2157265ed2726572','htmlSha256':sha(html),'contract':'c9520d41','integrity':{'algorithm':'sha256','selfExcluded':True},'evidence':{'nodeTests':665,'browserChecks':377,'distributionChecks':25,'operationVariants':9,'inspectionRoundTrips':3,'captures':76,'successfulCurrentImports':110,'successfulLegacyImports':84,'refusedLegacyImports':1},'files':files}
(R/'PACKAGE_MANIFEST.json').write_text(json.dumps(m,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'filesHashed':len(files),'htmlSha256':m['htmlSha256']},indent=2))
