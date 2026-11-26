"""Run independent browser contexts, then merge their actual evidence.
Use --merge-only only after all ten parts have run in this working copy."""
from pathlib import Path
import sys,subprocess,json,hashlib
from concurrent.futures import ThreadPoolExecutor
R=Path(__file__).resolve().parent.parent
parts=['core','tail','contact-a','contact-b','touch','logistics','engineering','lighting','beacons','tactics']
if '--merge-only' not in sys.argv:
 h=hashlib.sha256((R/'JOUER_ALIENS_V114.html').read_bytes()).hexdigest()
 def run(part):
  receipt=R/f'report/browser-{part}-v114.json'
  if '--refresh' in sys.argv and receipt.exists():
   d=json.loads(receipt.read_text())
   if d.get('htmlSHA256')==h and all(t['ok'] for t in d['tests']) and not d.get('pageErrors') and not d.get('consoleErrors') and d['tests'][-1]['name'] in ['Aucune erreur JavaScript ou console','Aucune erreur JS ou console','Aucune erreur JS/console','Aucune erreur JavaScript']:
    print('Receipt current:',part,flush=True);return
  log=Path('/mnt/data')/f'v114-final-browser-{part}.log'
  with log.open('w') as f:subprocess.run([sys.executable,str(R/f'qa/browser-{part}-v114.py')],check=True,stdout=f,stderr=subprocess.STDOUT)
  print('Passed:',part,flush=True)
 with ThreadPoolExecutor(max_workers=2 if '--parallel' in sys.argv else 1) as pool:list(pool.map(run,parts))
data=[json.loads((R/f'report/browser-{part}-v114.json').read_text()) for part in parts]
out={'version':'114.0.0-rc.1','browser':'Chromium through Playwright','transport':'distributed HTML bytes via set_content, unmodified Blob module loader','htmlSha256':hashlib.sha256((R/'JOUER_ALIENS_V114.html').read_bytes()).hexdigest(),'nativeTantalus':False,'tests':sum([d['tests'] for d in data],[]),'captures':sum([d['captures'] for d in data],[]),'pageErrors':sum([d.get('pageErrors',[]) for d in data],[]),'consoleErrors':sum([d.get('consoleErrors',[]) for d in data],[]),'physicalPhoneTested':False}
assert all(d.get('htmlSHA256')==out['htmlSha256'] for d in data), 'Browser receipt belongs to different HTML bytes'
assert all(t['ok'] for t in out['tests']);assert not out['pageErrors'];assert not out['consoleErrors'];assert len(set(c['file'] for c in out['captures']))==len(out['captures'])
(R/'report/browser-results-v114.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'passed':len(out['tests']),'captures':len(out['captures']),'errors':out['pageErrors']}))
