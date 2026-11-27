from pathlib import Path
import json,hashlib,zipfile,shutil
R=Path(__file__).resolve().parents[1];OUT=R.parent
H=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
q=json.loads((R/'docs/v11/QA_SUMMARY_V11.json').read_text())
assert q['bundleSha256']==H(R/'JOUER_ALIEN_EARTH_V11.html')
assert q['node']['pass']==q['node']['tests']==1216 and q['node']['fail']==0
assert q['browser']['passed']==q['browser']['total']==200 and len(q['browser']['suites'])==2
assert len(q['campaigns'])==17 and all(c['success'] and not c['errors'] for c in q['campaigns'])
r=json.loads((R/'docs/v11/QA_REPORT_DOCUMENT_V11.json').read_text())
assert r['ok'] and r['passed']==r['total']==9
assert r['reportSha256']==H(R/'docs/RAPPORT_QA_ALIEN_EARTH_V11.html')
assert r['auditSha256']==H(R/'docs/AUDIT_FIDELITE_ALIEN_EARTH_V11.html')
files=set()
def add(rel):
 p=R/rel
 if not p.is_file():raise FileNotFoundError(p)
 files.add(p)
for rel in ['package.json','index.html','earth.css','README_FR.md','NOTICE_FR.md','JOUER_ALIEN_EARTH_V11.html','integration/launcher.js']:
 add(rel)
for directory in ['src','data']:
 files.update(p for p in (R/directory).rglob('*') if p.is_file() and '__pycache__' not in p.parts)
for rel in ['scripts/build.mjs','scripts/serve.mjs','scripts/install-alien-earth.mjs','scripts/make_data_v11.mjs','scripts/make_delivery_docs_v11.py','scripts/package_v11.py']:
 add(rel)
for p in (R/'tests').glob('*.test.mjs'):files.add(p)
for rel in ['tests/legacy-contract-v10.mjs','tests/campaign_v11.mjs','tests/run_campaigns_v11.py','tests/browser_smoke_v11.py','tests/browser_fidelity_v11.py','tests/run_browser_v11.py','tests/verify_report_v11.py','tests/verify_package_v11.py']:
 if (R/rel).exists():add(rel)
for rel in ['docs/ALIEN_EARTH_CONTENT.json','docs/FIDELITE_V11.json','docs/CODEX_ALIEN_EARTH_V11.md','docs/AUDIT_FIDELITE_ALIEN_EARTH_V11.html','docs/RAPPORT_QA_ALIEN_EARTH_V11.html']:
 add(rel)
files.update((R/'docs').glob('QA_CAMPAIGN_V11*.json'))
for p in (R/'docs/v11').rglob('*'):
 if not p.is_file() or '__pycache__' in p.parts:continue
 if p.suffix.lower() in {'.json','.log','.png','.jpg','.jpeg'}:files.add(p)
files=sorted(files)
assert not any(p.suffix.lower() in {'.ttf','.otf','.woff','.woff2'} for p in files)
manifest={'version':'11.0.0','bundleSha256':q['bundleSha256'],'files':{str(p.relative_to(R)):{'bytes':p.stat().st_size,'sha256':H(p)} for p in files}}
(R/'MANIFEST_SHA256.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n');files.append(R/'MANIFEST_SHA256.json')
out=OUT/'ALIEN_EARTH_DLC_V11_MODULE_COMPLET.zip'
with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
 for p in files:z.write(p,str(Path('ALIEN_EARTH_DLC_V11')/p.relative_to(R)))
with zipfile.ZipFile(out) as z:
 assert z.testzip() is None
 for rel,m in manifest['files'].items():
  blob=z.read('ALIEN_EARTH_DLC_V11/'+rel)
  assert len(blob)==m['bytes'] and hashlib.sha256(blob).hexdigest()==m['sha256'],rel
for source,name in [
 ('JOUER_ALIEN_EARTH_V11.html','JOUER_ALIEN_EARTH_V11.html'),
 ('docs/CODEX_ALIEN_EARTH_V11.md','CODEX_ALIEN_EARTH_V11.md'),
 ('docs/RAPPORT_QA_ALIEN_EARTH_V11.html','RAPPORT_QA_ALIEN_EARTH_V11.html'),
 ('docs/AUDIT_FIDELITE_ALIEN_EARTH_V11.html','AUDIT_FIDELITE_ALIEN_EARTH_V11.html')]:shutil.copy2(R/source,OUT/name)
result={'archive':out.name,'bytes':out.stat().st_size,'sha256':H(out),'files':len(files),'manifestEntriesVerified':len(manifest['files']),'htmlSha256':q['bundleSha256'],'counts':q['counts'],'node':q['node'],'browser':q['browser'],'campaigns':len(q['campaigns']),'reportChecks':r['passed']}
(OUT/'ALIEN_EARTH_V11_LIVRAISON.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(result,ensure_ascii=False,indent=2))
