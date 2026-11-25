#!/usr/bin/env python3
"""Document checks on current report bytes and real screenshot provenance; not gameplay tests."""
from pathlib import Path
from html.parser import HTMLParser
import hashlib,json,base64
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parents[1];sha=lambda b:hashlib.sha256(b).hexdigest()
class Parser(HTMLParser):
 def __init__(self):super().__init__();self.images=[];self.links=[];self.figures=0
 def handle_starttag(self,t,a):
  d=dict(a)
  if t=='img':self.images.append(d)
  if t=='a':self.links.append(d.get('href',''))
  if t=='figure':self.figures+=1
blob=(R/'RAPPORT_ILLUSTRE.html').read_bytes();text=blob.decode();p=Parser();p.feed(text);cases=[];errors=[]
def check(name,ok):
 if not ok:raise AssertionError(name)
 cases.append({'name':name,'passed':True})
caps=[]
for part in 'ABC':
 q=json.loads((R/f'docs/BROWSER_V08{part}.json').read_text());check('Browser capture source '+part,q['passed'] and q['htmlSHA256']==sha((R/'JOUER.html').read_bytes()));caps+=q['captures']
cap_paths={c['file'] for c in caps};check('Exactly twelve game figures',p.figures==len(p.images)==len(caps)==12)
for im in p.images:
 check('Exact PNG bytes and alt '+im['data-source'],im.get('alt') and im['data-source'] in cap_paths and base64.b64decode(im['src'].split(',',1)[1])==(R/im['data-source']).read_bytes())
check('No missing local navigation links',all(h and not h.startswith(('http:', 'https:')) and (R/h).is_file() for h in p.links))
check('Current feature and totals text',all(t in text for t in ['0.8.0-CANDIDATE.1','921/921','35/35','36/36','km/h','pas','Newt']))
check('Native persistence caveat visible','persistance native après fermeture' in text and 'stockage simulé' in text)
check('No duplicate game figures',len({im['data-source'] for im in p.images})==12)
evidence=R/'docs/report-evidence';evidence.mkdir(exist_ok=True)
with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 page=browser.new_page(viewport={'width':1440,'height':1000},device_scale_factor=1)
 page.on('pageerror',lambda e:errors.append(str(e)));page.set_content(text,wait_until='load',timeout=60000)
 check('Report title loaded',page.title()=='Fleuve de la Douleur — Rapport 0.8')
 check('All embedded PNGs decode',page.locator('img').evaluate_all('(xs)=>xs.every(x=>x.complete&&x.naturalWidth>0)'))
 check('Desktop no document overflow',page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'))
 page.screenshot(path=str(evidence/'report-overview.png'))
 page.locator('figure').nth(5).screenshot(path=str(evidence/'report-vehicle-figure.png'))
 page.set_viewport_size({'width':390,'height':844});page.evaluate('window.scrollTo(0,0)')
 check('Portrait no document overflow',page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'))
 check('Portrait title readable',page.locator('h1').is_visible())
 page.screenshot(path=str(evidence/'report-portrait.png'))
 page.locator('details').nth(5).locator('summary').click()
 check('PNG provenance expands',page.locator('details').nth(5).get_attribute('open') is not None)
 check('No report JavaScript errors',not errors)
 browser.close()
result={'version':'0.8.0-candidate.1','passed':True,'cases':cases,'reportSHA256':sha(blob),'standaloneSHA256':sha((R/'JOUER.html').read_bytes()),'errors':errors,'scope':'Current HTML report rendered in Chromium; local links checked from filesystem; no gameplay counts or native storage claim.'}
(R/'docs/REPORT_VISUAL_RESULTS.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n');print(len(cases),'document checks PASS')
