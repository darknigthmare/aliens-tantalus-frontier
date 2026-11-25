"""Explicit authoring-only seal. tools/verify-package.py is read-only."""
from pathlib import Path
import sys,json,hashlib
R=Path(__file__).resolve().parent.parent
if '--seal' not in sys.argv:
 raise SystemExit('Pour contrôler : python tools/verify-package.py. --seal crée de nouvelles références de livraison.')
release=json.loads((R/'report/RELEASE_CHECK_V108.json').read_text())
if not release['ok']:raise SystemExit('Release check failed')
html_hash=hashlib.sha256((R/'JOUER_ALIENS_V108.html').read_bytes()).hexdigest()
if html_hash!=release['htmlSha256']:raise SystemExit('HTML modifié depuis la validation')
files=[]
for p in sorted(R.rglob('*')):
 if not p.is_file() or '__pycache__' in p.parts or p.name=='PACKAGE_MANIFEST.json':continue
 if p.is_symlink():raise SystemExit('Lien symbolique interdit: '+str(p))
 data=p.read_bytes();files.append({'path':p.relative_to(R).as_posix(),'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()})
m={'release':'108.0.0-rc.1','title':'ALIENS — Contact persistant','artifactType':'continued-autonomous-V107-branch-with-source-and-evidence','nativeActivated':False,'fullTantalusArchive':False,'baseArchive':'ALIENS_1986_V107_RALLIER_OPERATIONS_RC1.zip','baseSha256':release['baselineSha256'],'htmlSha256':html_hash,'contract':release['contract'],'integrity':{'algorithm':'SHA-256','selfExcluded':'PACKAGE_MANIFEST.json','authenticatesPublisher':False},'evidence':{k:release[k] for k in ['nodeTestsPassed','gameBrowserChecksPassed','separateDistributionChecksPassed','automatedFullOperations','pursuitEnemyTransfers','directBrowserCaptures','nativeCampaignRuns','directFileNavigation']},'files':files}
(R/'PACKAGE_MANIFEST.json').write_text(json.dumps(m,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'filesHashed':len(files),'nativeActivated':False,'htmlSha256':html_hash}))
