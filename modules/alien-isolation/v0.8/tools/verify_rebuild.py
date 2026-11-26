"""Rebuild current content/art/launcher and optionally compare original v0.7 bytes."""
from pathlib import Path
import subprocess,sys,json,hashlib,zipfile
R=Path(__file__).resolve().parents[1]
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
paths=['src/content.json','src/content.js','src/assets.js','JOUER_ISOLATION.html','integration/dlc-manifest.json']
before={p:sha(R/p) for p in paths}
subprocess.run([sys.executable,str(R/'tools/rebuild_content.py')],cwd=R,check=True)
after={p:sha(R/p) for p in paths}
checks=[{'name':'Reconstruction déterministe '+p,'ok':before[p]==after[p]} for p in paths];art=[];retention={}
if len(sys.argv)>1:
 archive=Path(sys.argv[1]);c=json.loads((R/'src/content.json').read_text())
 with zipfile.ZipFile(archive) as z:
  for name in sorted(n for n in z.namelist() if '/assets/' in n and n.endswith('.svg')):
   rel='assets/'+name.split('/assets/',1)[1];p=R/rel
   art.append({'file':rel,'sameAsV07':p.is_file() and hashlib.sha256(z.read(name)).hexdigest()==sha(p)})
  checks.append({'name':'155 SVG 0.7 conservés octet pour octet','ok':len(art)==155 and all(a['sameAsV07'] for a in art)})
  old=json.loads(z.read(next(n for n in z.namelist() if n.endswith('/src/content.json'))))
  for name,key,expected in [('Lieux','rooms',64),('Liaisons','links',88),('Tâches','optional',20),('Archives','logs',45)]:
   a={i['id'] for i in old[key]};b={i['id'] for i in c[key]};checks.append({'name':f'{expected} anciens identifiants {name} conservés','ok':len(a)==expected and a<=b});retention[key]={'before':len(a),'after':len(b),'missing':sorted(a-b)}
  a={p['id'] for r in old['rooms'] for p in r['props']};b={p['id'] for r in c['rooms'] for p in r['props']};checks.append({'name':'708 identifiants de placements conservés (positions corrigées documentées)','ok':len(a)==708 and a<=b});retention['props']={'before':len(a),'after':len(b),'missing':sorted(a-b)}
  for key in ['goals','chapters']:
   checks.append({'name':key+' précédents conservés intégralement','ok':old[key]==c[key]})
  retention['sourceArchive']=archive.name;retention['sourceSha256']=sha(archive)
out={'version':'0.8.0','before':before,'after':after,'checks':checks,'retention':retention,'artComparison':art,'pass':sum(x['ok'] for x in checks),'fail':sum(not x['ok'] for x in checks)}
(R/'qa/rebuild-checks.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n');print(json.dumps({k:v for k,v in out.items() if k!='artComparison'},ensure_ascii=False));assert not out['fail']
