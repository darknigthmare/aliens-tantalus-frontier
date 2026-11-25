"""Separate documentation audit, not counted as gameplay QA."""
from pathlib import Path
import json,hashlib,base64,io,shutil
from urllib.parse import urlsplit,unquote
from bs4 import BeautifulSoup
from PIL import Image
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parents[1];checks=[];errors=[]
def check(name,ok,detail=None):checks.append(dict(name=name,ok=bool(ok),detail=detail));print(bool(ok),name,flush=True)
files=['RAPPORT_ILLUSTRE.html','docs/CODEX_LEVEL_DESIGN.html','docs/AUDIT_FIDELITE_V010.json','LIRE_AVANT_DE_JOUER.md','LIVRAISON.json','qa/RESULTATS_QA_V010.json']
soups={f:BeautifulSoup((R/f).read_text(),'html.parser') for f in files[:2]}
for f,soup in soups.items():
 check(f+' : français et méta V0.10',soup.html.get('lang')=='fr' and soup.select_one('meta[name="application-version"]').get('content')=='0.10.0')
 ids=[x.get('id') for x in soup.select('[id]')];check(f+' : identifiants uniques',len(ids)==len(set(ids)))
 missing=[]
 for a in soup.select('a[href]'):
  href=a['href'];u=urlsplit(href)
  if u.scheme in ('http','https','data','mailto'):continue
  path=(R/f).parent/unquote(u.path) if u.path else R/f
  if not path.exists():missing.append(href);continue
  if u.fragment and path.suffix=='.html':
   dest=soup if path.resolve()==(R/f).resolve() else BeautifulSoup(path.read_text(),'html.parser')
   if not dest.find(id=unquote(u.fragment)):missing.append(href)
 check(f+' : tous les liens locaux aboutissent',not missing,missing)
 images=soup.select('img');bad=[]
 for im in images:
  try:
   assert im.get('alt');assert im['src'].startswith('data:image/png;base64,');raw=base64.b64decode(im['src'].split(',',1)[1]);Image.open(io.BytesIO(raw)).verify();assert raw==(R/'captures'/im['alt']).read_bytes()
  except Exception as e:bad.append(str(e))
 check(f+' : images intégrées correspondent aux PNG réels',not bad,{'images':len(images),'bad':bad})
cod=soups[files[1]];report=soups[files[0]];audit=json.loads((R/files[2]).read_text());qa=json.loads((R/files[5]).read_text())
check('41 plans et 41 fiches de pièce',len(cod.select('.room'))==41 and len(cod.select('svg.plan'))==41)
check('182 retours de cloison dans les plans',len(cod.select('svg.plan .wall'))==182)
check('104 approches réciproques dans le registre',sum(len(r['portals']) for r in audit['rooms'])==104)
check('18 entrées de matériel sans total canonique inventé',len(audit['equipment'])==18 and 'inventaire exhaustif certifié' in cod.get_text())
check('10 profils tous explicitement provisoires',len(audit['appearance'])==10 and all('provisoire' in p['status'] for p in audit['appearance'].values()))
check('Les six zones de manque sont publiées',len(audit['gaps'])==6 and all(g['area'] in report.get_text() for g in audit['gaps']))
check('Le rapport utilise 21 scènes V0.10 vérifiées',len(report.select('figure'))==21)
check('Totaux courants sans échec',qa['failed']==0 and qa['tests']==qa['nodeTests']+qa['browserTests'])
check('Source secondaire du projecteur conservée',next(a for a in audit['equipment'] if a['id']=='acid')['evidence']=='secondaire')
check('Schémas 1 à 10 et 36 vrais instantanés indiqués',json.loads((R/'LIVRAISON.json').read_text())['save']['accepts']==list(range(1,11)) and qa['legacySnapshots']==36)
with sync_playwright() as p:
 b=p.chromium.launch(executable_path=shutil.which('chromium'),args=['--no-sandbox']);page=b.new_page(viewport={'width':1600,'height':1000});page.on('pageerror',lambda e:errors.append(str(e)))
 for f in files[:2]:
  page.set_content((R/f).read_text());page.wait_for_timeout(180)
  check(f+' : document non vide',len(page.locator('body').inner_text())>1500)
  check(f+' : bureau sans dépassement horizontal',page.evaluate('document.documentElement.scrollWidth<=innerWidth'))
  target=R/'qa/document-previews-v010';target.mkdir(exist_ok=True)
  if f.startswith('RAPPORT'):page.screenshot(path=str(target/'rapport-haut.png'))
  else:
   page.locator('#filter').fill('vestibule');check('Filtre de codex masque les autres salles',page.locator('.room:visible').count()==2);page.locator('#filter').fill('');page.locator('#boarding').scroll_into_view_if_needed();page.screenshot(path=str(target/'codex-vestibule.png'));check('Registre des portes et plan affichés ensemble',page.locator('#boarding svg').is_visible())
  page.set_viewport_size({'width':390,'height':844});page.wait_for_timeout(80);check(f+' : mobile sans largeur perdue',page.evaluate('document.documentElement.scrollWidth<=innerWidth'));page.set_viewport_size({'width':1600,'height':1000})
 check('Aucune exception JavaScript dans les documents',not errors,errors);b.close()
result=dict(version='0.10.0',scope='documentation-only, not added to gameplay total',tests=len(checks),passed=sum(c['ok'] for c in checks),failed=sum(not c['ok'] for c in checks),documentsSHA256={f:hashlib.sha256((R/f).read_bytes()).hexdigest() for f in files},checks=checks)
(R/'qa/document-audit-v010.json').write_text(json.dumps(result,ensure_ascii=False,indent=2));print(json.dumps(result,ensure_ascii=False,indent=2))
if result['failed']:raise SystemExit(1)
