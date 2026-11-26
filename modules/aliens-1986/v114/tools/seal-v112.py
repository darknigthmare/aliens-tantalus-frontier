"""Authoring-only explicit seal. verify-package.py remains strictly read-only."""
from pathlib import Path
import sys,json,hashlib
R=Path(__file__).resolve().parent.parent
if '--seal' not in sys.argv:raise SystemExit('Pour contrôler : python tools/verify-package.py. --seal crée les références de livraison.')
release=json.loads((R/'report/RELEASE_CHECK_V112.json').read_text())
if not release['ok']:raise SystemExit('Release check failed')
h=hashlib.sha256((R/'JOUER_ALIENS_V112.html').read_bytes()).hexdigest()
if h!=release['htmlSha256']:raise SystemExit('HTML modifié depuis la recette')
files=[]
for p in sorted(R.rglob('*')):
 if not p.is_file() or '__pycache__' in p.parts or p.name=='PACKAGE_MANIFEST.json':continue
 if p.is_symlink():raise SystemExit('Lien symbolique interdit')
 b=p.read_bytes();files.append({'path':p.relative_to(R).as_posix(),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()})
m={'release':'112.0.0-rc.1','title':'ALIENS — Baliser le repli','artifactType':'continued-autonomous-V111-branch-with-sources-and-evidence','nativeActivated':False,'fullTantalusArchive':False,'baseArchive':'ALIENS_1986_V111_DANS_LE_NOIR_RC1.zip','baseSha256':release['sourceArchiveSha256'],'htmlSha256':h,'contract':release['contract'],'integrity':{'algorithm':'SHA-256','selfExcluded':'PACKAGE_MANIFEST.json','authenticatesPublisher':False},'evidence':{k:release[k] for k in ['nodeTestsPassed','gameBrowserChecksPassed','separateDistributionChecksPassed','separateSaveCorpusChecks','automatedFullOperations','pursuitEnemyTransfers','directBrowserCaptures','embeddedReportCaptures','nativeCampaignRuns','directFileNavigation']},'files':files}
(R/'PACKAGE_MANIFEST.json').write_text(json.dumps(m,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'filesHashed':len(files),'nativeActivated':False,'htmlSha256':h}))
