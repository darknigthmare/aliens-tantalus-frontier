"""Run independent browser contexts, then merge their actual evidence.
Use --merge-only only after all six parts have run in this working copy."""
from pathlib import Path
import sys,subprocess,json,hashlib
R=Path(__file__).resolve().parent.parent
parts=['core','tail','contact-a','contact-b','touch','logistics']
if '--merge-only' not in sys.argv:
 for part in parts:subprocess.run([sys.executable,str(R/f'qa/browser-{part}-v109.py')],check=True)
data=[json.loads((R/f'report/browser-{part}-v109.json').read_text()) for part in parts]
out={'version':'109.0.0-rc.1','browser':'Chromium through Playwright','transport':'distributed HTML bytes via set_content, unmodified Blob module loader','htmlSha256':hashlib.sha256((R/'JOUER_ALIENS_V109.html').read_bytes()).hexdigest(),'nativeTantalus':False,'tests':sum([d['tests'] for d in data],[]),'captures':sum([d['captures'] for d in data],[]),'pageErrors':sum([d.get('pageErrors',[]) for d in data],[]),'consoleErrors':sum([d.get('consoleErrors',[]) for d in data],[]),'physicalPhoneTested':False}
assert all(t['ok'] for t in out['tests']);assert not out['pageErrors'];assert not out['consoleErrors'];assert len(set(c['file'] for c in out['captures']))==len(out['captures'])
(R/'report/browser-results-v109.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'passed':len(out['tests']),'captures':len(out['captures']),'errors':out['pageErrors']}))
