"""Verify a delivered cumulative ZIP on a fresh temporary extraction.
Usage: python3 tools/release_verify.py ARCHIVE_ZIP STANDALONE_HTML OUTPUT_JSON
Requires Node, Python Playwright and /usr/bin/chromium. No browser policy override.
The output JSON is intentionally outside the immutable archive.
"""
from pathlib import Path,PurePosixPath
import json,zipfile,tempfile,hashlib,subprocess,sys,stat,re
from playwright.sync_api import sync_playwright
if len(sys.argv)!=4:raise SystemExit(__doc__)
archive,standalone,out=map(lambda s:Path(s).resolve(),sys.argv[1:]);checks=[];errors=[]
def sha(b):return hashlib.sha256(b).hexdigest()
def check(name,ok):
 checks.append({'name':name,'ok':bool(ok)});print(('PASS ' if ok else 'FAIL ')+name,flush=True)
 if not ok:raise AssertionError(name)
with zipfile.ZipFile(archive) as z,tempfile.TemporaryDirectory(prefix='isolation-release-') as d:
 check('Intégrité CRC de toutes les entrées ZIP',z.testzip() is None)
 names=z.namelist();prefix=PurePosixPath(names[0]).parts[0];tmp=Path(d)
 for info in z.infolist():
  rel=PurePosixPath(info.filename)
  if rel.is_absolute() or '..' in rel.parts or rel.parts[0]!=prefix or stat.S_ISLNK(info.external_attr>>16):raise ValueError('Chemin ZIP invalide')
  if info.is_dir():continue
  dest=tmp.joinpath(*rel.parts);dest.parent.mkdir(parents=True,exist_ok=True);dest.write_bytes(z.read(info))
 root=tmp/prefix;manifest=json.loads((root/'DELIVERY_MANIFEST.json').read_text());content=json.loads((root/'src/content.json').read_text())
 verified=0
 for rel,meta in manifest['files'].items():
  p=(root/rel).resolve();assert p.is_relative_to(root) and p.is_file();data=p.read_bytes();assert len(data)==meta['bytes'] and sha(data)==meta['sha256'],rel;verified+=1
 check(f'{verified} empreintes et tailles des fichiers extraits',verified==len(manifest['files']))
 actual_files={p.relative_to(root).as_posix() for p in root.rglob('*') if p.is_file()}
 check('Aucun fichier supplémentaire non déclaré dans le ZIP',actual_files==set(manifest['files'])|{'DELIVERY_MANIFEST.json'})
 raw=(root/'JOUER_ISOLATION.html').read_bytes();check('HTML extrait identique au HTML séparé',raw==standalone.read_bytes())
 result=subprocess.run(['node','--test',*[str(p) for p in sorted((root/'tests').glob('*.test.mjs'))]],cwd=root,capture_output=True,text=True,timeout=40)
 expected=json.loads((root/'docs/METRIQUES.json').read_text())['nodePass']
 check(f'{expected} tests Node relancés depuis la copie extraite',result.returncode==0 and f'# pass {expected}\n' in result.stdout and '# fail 0\n' in result.stdout)
 # Use the exact extracted HTML, not a separately rebuilt source.
 with sync_playwright() as pw:
  b=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox']);p=b.new_page(viewport={'width':1440,'height':900});p.set_default_timeout(15000);p.on('pageerror',lambda e:errors.append(str(e)));p.on('dialog',lambda dialog:dialog.accept())
  p.set_content(raw.decode(),wait_until='load');p.wait_for_selector('body[data-ready="true"]')
  check('Menu extrait visible',p.locator('#newGame').is_visible())
  check('Métadonnées 0.8.0',p.evaluate('__isolation.CONTENT.meta.version')=='0.8.0')
  check('155 ressources décodées',p.evaluate('Object.keys(__isolation.renderer.images).length')==155)
  check('76 lieux et deux contacts dans la copie extraite',p.evaluate('__isolation.CONTENT.rooms.length===76&&__isolation.CONTENT.rescues.length===2'))
  p.select_option('#difficulty','recit');p.click('#newGame');p.keyboard.down('s');p.wait_for_function('__isolation.engine.s.y>=370');p.keyboard.up('s');p.keyboard.down('d');p.wait_for_function('__isolation.engine.s.x>=884');p.keyboard.up('d');p.keyboard.down('e');p.wait_for_function('__isolation.engine.s.goal===1');p.keyboard.up('e')
  check('Premier objectif accompli au clavier depuis le HTML extrait',p.evaluate('__isolation.engine.s.goal===1&&__isolation.engine.s.tools.torch'))
  p.keyboard.press('j');p.wait_for_timeout(120);check('Journal des deux contacts et deux projets présent dans le jeu extrait',p.locator('.rescue-card').count()==2 and p.locator('.refuge-card').count()==2)
  p.keyboard.press('Escape');p.keyboard.press('Tab');check('Roue du HTML extrait comporte quatre objets et reste en temps réel',p.locator('[data-quick]').count()==4 and p.locator('#quickWheel').is_visible() and p.evaluate('!__isolation.engine.paused'))
  p.keyboard.press('ArrowDown');p.keyboard.press('Enter');check('Sélection IEM au clavier dans la copie extraite',p.evaluate("__isolation.engine.s.signals.selected==='emp'"))
  p.keyboard.press('m');p.locator('#spatialRoomSelect').select_option('h_galleria_low');before=p.evaluate('({room:__isolation.engine.s.room,x:__isolation.engine.s.x,y:__isolation.engine.s.y,goal:__isolation.engine.s.goal})');p.click('[data-waypoint="h_galleria_low"]');after=p.evaluate('({room:__isolation.engine.s.room,x:__isolation.engine.s.x,y:__isolation.engine.s.y,goal:__isolation.engine.s.goal})')
  check('76 plans inspectables, repère sans déplacement ni objectif offert',p.locator('#spatialRoomSelect option').count()==76 and before==after and p.evaluate('__isolation.engine.s.spatial.waypoint==="h_galleria_low"'))
  check('Aucune ressource réseau externe',p.evaluate("performance.getEntriesByType('resource').filter(x=>/^https?:/.test(x.name)).length===0"));check('Aucune exception JavaScript',not errors);b.close()
 check('Manifest toujours intact après les tests',all(sha((root/rel).read_bytes())==meta['sha256'] for rel,meta in manifest['files'].items()))
 proof={'version':'0.8.0','archive':archive.name,'bytes':archive.stat().st_size,'sha256':sha(archive.read_bytes()),'entries':len(names),'uncompressedBytes':sum(i.file_size for i in z.infolist()),'htmlSha256':sha(raw),'verifiedFiles':verified,'checks':checks,'pass':sum(c['ok'] for c in checks),'fail':sum(not c['ok'] for c in checks),'errors':errors,'browserLoading':'Page.set_content of exact freshly extracted standalone HTML. Native file/HTTP navigation is blocked by policy. No browser policy override.','nativePersistenceVerified':False,'nativeIntegration':False,'pushed':False,'deployed':False}
 out.write_text(json.dumps(proof,ensure_ascii=False,indent=2)+'\n');print(json.dumps({k:v for k,v in proof.items() if k not in ['checks']},ensure_ascii=False))
