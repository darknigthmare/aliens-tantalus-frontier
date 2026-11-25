#!/usr/bin/env python3
"""Document layout and embedded-capture validation; not gameplay assertions."""
from pathlib import Path
import json,os,hashlib
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parents[1];out=R/'docs/report-evidence';out.mkdir(exist_ok=True)
cases=[];errors=[];requests=[];doc=json.loads((R/'docs/DOCUMENTATION_BUILD.json').read_text())
def check(name,condition):
 if not condition:raise AssertionError(name)
 cases.append({'name':name,'passed':True});print('PASS',name,flush=True)
with sync_playwright() as p:
 b=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium'),args=['--no-sandbox','--disable-dev-shm-usage'])
 q=b.new_page(viewport={'width':1440,'height':1000});q.on('pageerror',lambda e:errors.append(str(e)));q.on('request',lambda r:requests.append(r.url));q.set_content((R/'RAPPORT_ILLUSTRE.html').read_text(),wait_until='load')
 check('Titre du rapport 0.7','v0.7' in q.title())
 check('Douze images actuelles décodées',q.locator('figure img').count()==12 and q.evaluate('Array.from(document.querySelectorAll("figure img")).every(i=>i.complete&&i.naturalWidth>0)'))
 check('Images intégrées en base64',q.evaluate('Array.from(document.images).every(i=>i.src.startsWith("data:image/png;base64,"))'))
 check('Chaque capture décrit sa préparation',q.locator('figure details').count()==12)
 check('Rapport sans JavaScript exécutable',q.locator('script').count()==0)
 for href in q.locator('nav a').evaluate_all('(a)=>a.map(x=>x.getAttribute("href"))'):check('Lien local existant '+href,(R/href).is_file())
 body=q.inner_text('body');check('Totaux issus des résultats courants',str(doc['modelCases'])+'/'+str(doc['modelCases']) in body and str(doc['browserCases'])+'/'+str(doc['browserCases']) in body)
 check('Limite du stockage natif explicite','persistance native après fermeture reste non qualifiée' in body)
 check('Anciens compteurs non additionnés','ne sont pas additionnés' in body)
 check('Aucune fusion native revendiquée','moteur natif de Tantalus n’est pas fusionné' in body)
 for w,h in [(1440,1000),(844,390),(390,844)]:
  q.set_viewport_size({'width':w,'height':h});check(f'Absence de débordement horizontal {w}×{h}',q.evaluate('document.documentElement.scrollWidth<=innerWidth+1'))
  if w==1440:q.screenshot(path=str(out/'report-overview.png'))
  if w==390:q.screenshot(path=str(out/'report-mobile.png'))
 q.set_viewport_size({'width':1440,'height':1000});q.locator('#capture-6').screenshot(path=str(out/'report-warning.png'))
 check('Aucune erreur JavaScript relevée',not errors);check('Aucun appel réseau du rapport',not requests);b.close()
r={'version':'0.7.0-candidate.1','passed':True,'cases':cases,'errors':errors,'reportSHA256':hashlib.sha256((R/'RAPPORT_ILLUSTRE.html').read_bytes()).hexdigest(),'screenshots':['docs/report-evidence/report-overview.png','docs/report-evidence/report-mobile.png','docs/report-evidence/report-warning.png'],'scope':'Document checks only, separate from gameplay browser totals'}
(R/'docs/REPORT_VISUAL_RESULTS.json').write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n');print(len(cases),'document checks PASS')
