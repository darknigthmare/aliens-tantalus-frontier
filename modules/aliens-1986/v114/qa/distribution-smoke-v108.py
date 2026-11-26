"""Separate release smoke for the exact HTML and generated documents.
No game state hook, security-policy override, or generated images.
Requires Python Playwright and a local Chromium executable.
"""
from pathlib import Path
import hashlib,json
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parent.parent
checks=[];errors=[];requests=[]
transport={'directFileNavigation':'not attempted','fallback':None}
def check(name,ok):
 checks.append({'name':name,'ok':bool(ok)});print(name,ok,flush=True);assert ok,name
def observe(pg):
 pg.on('pageerror',lambda e:errors.append(str(e)))
 pg.on('request',lambda req:requests.append(req.url) if req.url.startswith(('http:','https:')) else None)
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 page=browser.new_page(viewport={'width':1440,'height':900},accept_downloads=True);observe(page)
 try:
  page.goto((R/'JOUER_ALIENS_V108.html').as_uri(),timeout=12000)
  transport['directFileNavigation']='passed'
 except Exception as e:
  if 'ERR_BLOCKED_BY_ADMINISTRATOR' not in str(e):raise
  transport['directFileNavigation']='blocked by administrator policy; not validated'
  transport['fallback']='authorized exact HTML bytes through set_content; no security settings changed'
  page.close();page=browser.new_page(viewport={'width':1440,'height':900},accept_downloads=True);observe(page)
  page.set_content((R/'JOUER_ALIENS_V108.html').read_text(),wait_until='load')
 page.locator('#start-operation').wait_for()
 check('HTML distribué initialisé par son chargeur Blob',page.locator('#start-operation').is_visible())
 page.locator('#start-operation').click();page.wait_for_timeout(120);page.locator('#pause-open').click()
 with page.expect_download() as download:page.locator('#export').click()
 data=json.loads(Path(download.value.path()).read_text())
 check('Export réel : schéma108 et six lieux',data['schema']==108 and data['mode']=='operation' and len(data['worlds'])==6)
 check('Cinq sas partagés présents dans le point exporté',len(data['contacts']['links'])==5)
 check('Aucune requête externe pendant le jeu',requests==[])
 page.goto('about:blank');page.set_content((R/'CODEX_LEVEL_DESIGN_V108.html').read_text())
 check('Six fiches géométriques Codex',page.locator('.room').count()==6)
 page.locator('#filter').fill('bed-west')
 check('Filtrage du mobilier médical',page.locator('.room:not(.hide)').count()==1)
 page.locator('#filter').fill('')
 check('Réinitialisation du filtre Codex',page.locator('.room:not(.hide)').count()==6)
 page.screenshot(path='/mnt/data/V108_CODEX_DISTRIBUTION_PREVIEW.png',full_page=False)
 page.goto('about:blank');page.set_content((R/'RAPPORT_ILLUSTRE_V108.html').read_text())
 check('Seize images de preuve embarquées',page.locator('figure img').count()==16)
 page.locator('figure img').evaluate_all('(imgs)=>imgs.forEach(i=>i.loading="eager")')
 decoded=page.evaluate('''async()=>{for(const i of document.querySelectorAll('figure img'))await i.decode();return [...document.querySelectorAll('figure img')].every(i=>i.naturalWidth>=844&&i.naturalHeight>=390)}''')
 check('Seize PNG du navigateur décodables',decoded)
 page.screenshot(path='/mnt/data/V108_REPORT_DISTRIBUTION_PREVIEW.png',full_page=False)
 check('Documents et jeu sans erreur JavaScript observée',not errors)
 check('Aucune requête média externe requise',not requests)
 expected=json.loads((R/'report/browser-results-v108.json').read_text())['htmlSha256']
 actual=hashlib.sha256((R/'JOUER_ALIENS_V108.html').read_bytes()).hexdigest()
 check('HTML distribué identique au fichier de recette',actual==expected)
 browser.close()
out={'version':'108.0.0-rc.1','separateFromGameplayChecks':True,'transport':transport,'htmlSha256':actual,'checks':checks,'pageErrors':errors,'externalRequests':requests}
(R/'report/distribution-smoke-v108.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'passed':len(checks),'transport':transport,'errors':errors},ensure_ascii=False))
