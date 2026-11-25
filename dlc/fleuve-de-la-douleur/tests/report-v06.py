#!/usr/bin/env python3
"""Visual and structural checks for the self-contained HTML report, not gameplay tests."""
from pathlib import Path
import json,os
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parents[1];out=R/'docs/report-evidence';out.mkdir(exist_ok=True)
cases=[];errors=[];doc=json.loads((R/'docs/DOCUMENTATION_BUILD.json').read_text())
def check(name,condition):
 if not condition:raise AssertionError(name)
 cases.append({'name':name,'passed':True});print('PASS',name,flush=True)
with sync_playwright() as p:
 b=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium'),args=['--no-sandbox','--disable-dev-shm-usage'])
 q=b.new_page(viewport={'width':1440,'height':1000});q.on('pageerror',lambda e:errors.append(str(e)));requests=[];q.on('request',lambda x:requests.append(x.url));q.set_content((R/'RAPPORT_ILLUSTRE.html').read_text(),wait_until='load')
 check('Titre du rapport 0.6', 'v0.6' in q.title())
 check('Douze images réellement décodées',q.locator('figure img').count()==12 and q.evaluate('Array.from(document.querySelectorAll("figure img")).every(i=>i.complete&&i.naturalWidth>0)'))
 check('Images incorporées au rapport',q.evaluate('Array.from(document.images).every(i=>i.src.startsWith("data:image/png;base64,"))'))
 check('Chaque figure décrit sa préparation',q.locator('figure details').count()==12)
 check('Rapport sans code exécutable',q.locator('script').count()==0)
 for href in q.locator('nav a').evaluate_all('(a)=>a.map(x=>x.getAttribute("href"))'):check('Lien local existant '+href,(R/href).is_file())
 check('Totaux courants affichés', str(doc['modelCases'])+'/'+str(doc['modelCases']) in q.inner_text('body') and str(doc['browserCases'])+'/'+str(doc['browserCases']) in q.inner_text('body'))
 check('Limite du stockage explicitement présente','persistance native après fermeture reste non qualifiée' in q.inner_text('body'))
 for w,h in [(1440,1000),(844,390),(390,844)]:
  q.set_viewport_size({'width':w,'height':h});check(f'Absence de débordement horizontal {w}×{h}',q.evaluate('document.documentElement.scrollWidth<=innerWidth+1'))
  if w==1440:q.screenshot(path=str(out/'report-overview.png'))
  if w==390:q.screenshot(path=str(out/'report-mobile.png'))
 q.set_viewport_size({'width':1440,'height':1000});q.locator('#capture-2').screenshot(path=str(out/'report-shutter.png'))
 check('Aucune erreur de page',not errors);check('Aucun appel réseau',not requests)
 b.close()
(R/'docs/REPORT_VISUAL_RESULTS.json').write_text(json.dumps({'version':'0.6.0-candidate.1','passed':True,'cases':cases,'errors':errors,'screenshots':['docs/report-evidence/report-overview.png','docs/report-evidence/report-mobile.png','docs/report-evidence/report-shutter.png'],'scope':'Document report only; not gameplay checks'},ensure_ascii=False,indent=2)+'\n')
print(len(cases),'report checks PASS')
