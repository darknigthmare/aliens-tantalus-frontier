import sys
sys.path.extend(['/opt/pyvenv/lib/python3.13/site-packages'])
from pathlib import Path
from playwright.sync_api import sync_playwright
import json,hashlib,traceback
R=Path(__file__).resolve().parents[1];dest=R/'docs/report-evidence-v09';dest.mkdir(exist_ok=True)
report={'version':'0.9.0-candidate.1','reportSHA256':hashlib.sha256((R/'RAPPORT_ILLUSTRE.html').read_bytes()).hexdigest(),'checks':[],'errors':[],'scope':'Document only, not gameplay checks.'}
def ck(n,c):
 if not c:raise AssertionError(n)
 report['checks'].append({'name':n,'passed':True})
try:
 with sync_playwright() as pw:
  b=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
  p=b.new_page(viewport={'width':1440,'height':1000})
  p.on('pageerror',lambda e:report['errors'].append(str(e)))
  p.set_content((R/'RAPPORT_ILLUSTRE.html').read_text(),wait_until='load')
  ck('14 figures',p.locator('figure').count()==14)
  for i in range(14):
   im=p.locator('figure img').nth(i)
   ck('Image décodée '+str(i+1),im.evaluate('(i)=>i.complete&&i.naturalWidth>0&&i.naturalHeight>0'))
  ck('Pas de débordement desktop',p.evaluate('document.documentElement.scrollWidth<=innerWidth+1'))
  ck('Comptes actuels du modèle', '1246/1246' in p.inner_text('main'))
  ck('Comptes actuels du navigateur', '35/35' in p.inner_text('main'))
  ck('Limites 1:1 visibles','Ce qui n’est pas encore 1:1' in p.inner_text('main'))
  p.screenshot(path=str(dest/'01-ouverture.png'))
  p.locator('figure').nth(5).scroll_into_view_if_needed()
  p.screenshot(path=str(dest/'02-serre.png'))
  p.set_viewport_size({'width':390,'height':844});p.evaluate('scrollTo(0,0)')
  ck('Pas de débordement portrait',p.evaluate('document.documentElement.scrollWidth<=innerWidth+1'))
  p.screenshot(path=str(dest/'03-portrait.png'))
  ck('Pas d’erreur JavaScript',not report['errors'])
  b.close()
 report['passed']=True
except Exception as e:
 report['passed']=False;report['failure']=str(e);report['traceback']=traceback.format_exc()
(R/'docs/REPORT_VISUAL_V09.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
print(json.dumps({'passed':report['passed'],'checks':len(report['checks']),'failure':report.get('failure')}))
if not report['passed']:sys.exit(1)
