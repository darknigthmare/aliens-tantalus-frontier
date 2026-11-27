"""Separate delivery checks; do not add them to gameplay assertions.
Uses exact distributed HTML bytes with its normal Blob loader, no engine hooks."""
from pathlib import Path
import json,hashlib
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parent.parent
checks=[];errors=[];console=[];requests=[]
def ck(name,ok,detail=None):
 checks.append({'name':name,'ok':bool(ok),'detail':detail});print(name,bool(ok),flush=True);assert ok,(name,detail)
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 p=b.new_page(viewport={'width':1280,'height':900},accept_downloads=True);p.set_default_timeout(12000)
 p.on('pageerror',lambda e:errors.append(str(e)));p.on('console',lambda e:console.append(e.text) if e.type=='error' else None);p.on('request',lambda r:requests.append(r.url) if r.url.startswith(('http:','https:')) else None)
 data=(R/'JOUER_ALIENS_V110.html').read_bytes();h=hashlib.sha256(data).hexdigest();p.set_content(data.decode());p.locator('#start-operation').wait_for();p.locator('[data-sector]').first.wait_for(state='attached')
 ck('Initialisation du document exact V110',p.locator('#start-operation').is_visible())
 ck('Huit inspections dans le document distribué',p.locator('[data-sector]').count()==8)
 p.locator('#start-operation').click();p.locator('#pause-open').click()
 with p.expect_download() as dl:p.locator('#export').click()
 s=json.loads(Path(dl.value.path()).read_text())
 ck('Export réel au schéma 110',s['schema']==110)
 ck('Inventaire neuf vide',s['logistics']['inventory']=={'ammo':0,'medical':0,'sentry':0})
 ck('Aucune plaque offerte',s['engineering']['plates']==0 and not s['engineering']['collected'])
 ck('Structures neuves cohérentes',len(s['engineering']['links'])==8 and all(h['hp']==100 and h['brace']==0 for h in s['engineering']['links'].values()))
 ck('Huit sas réciproques sauvegardés',len(s['contacts']['links'])==8)
 ck('Huit lieux sauvegardés',len(s['worlds'])==8)
 ck('Jeu sans demande réseau externe',not requests)
 p.set_content((R/'CODEX_LEVEL_DESIGN_V110.html').read_text());ck('Huit fiches Codex',p.locator('article.room').count()==8)
 ck('Aucune salle revendiquée nouvelle dans cette passe',p.locator('article.room.new').count()==0)
 ck('26 règles de conception',p.locator('details.design-rule').count()==26)
 p.locator('#filter').fill('plaques');p.wait_for_timeout(70);ck('Filtre Codex fonctionnel',0<p.locator('article.room:visible').count()<8)
 p.locator('#filter').fill('zz_inconnu_abc');ck('Filtre sans résultat correctement vide',p.locator('article.room:visible').count()==0)
 p.locator('#filter').fill('');ck('Retour aux huit fiches',p.locator('article.room:visible').count()==8)
 ck('Plans des huit lieux présents',p.locator('svg.diagram').count()==8)
 p.set_viewport_size({'width':390,'height':844});p.wait_for_timeout(80);ck('Codex portrait sans débordement horizontal',p.evaluate('document.documentElement.scrollWidth<=innerWidth'))
 p.set_viewport_size({'width':1280,'height':900});p.set_content((R/'RAPPORT_ILLUSTRE_V110.html').read_text())
 ck('Douze captures intégrées au rapport',p.locator('img').count()==12)
 p.locator('img').evaluate_all('(xs)=>xs.forEach(i=>i.loading="eager")')
 decode=p.evaluate('Promise.all([...document.images].map(async i=>{try{await i.decode();return i.naturalWidth>0&&i.naturalHeight>0}catch{return false}}))')
 ck('Tous les PNG du rapport décodés',len(decode)==12 and all(decode))
 from base64 import b64decode
 selection=json.loads((R/'report/report-selection-v110.json').read_text());urls=p.locator('img').evaluate_all('(xs)=>xs.map(x=>x.src)')
 ck('Les captures embarquées sont les PNG exacts',all(b64decode(u.split(',',1)[1])==(R/'report/captures-v110'/name).read_bytes() for u,name in zip(urls,selection['files'])))
 ck('Rapport sans dépendance externe',not requests)
 p.set_viewport_size({'width':390,'height':844});p.wait_for_timeout(80);ck('Rapport portrait sans débordement horizontal',p.evaluate('document.documentElement.scrollWidth<=innerWidth'))
 expected=json.loads((R/'report/browser-results-v110.json').read_text())['htmlSha256'];ck('Hash identique au HTML de recette',h==expected)
 direct={'validated':False}
 try:
  p.goto((R/'JOUER_ALIENS_V110.html').as_uri());p.locator('[data-sector]').first.wait_for(state='attached')
  ck('Navigation file:// directe initialise le même jeu',p.locator('[data-sector]').count()==8)
  p.locator('#start-operation').click();p.locator('#pause-open').click()
  with p.expect_download() as dl:p.locator('#export').click()
  local=json.loads(Path(dl.value.path()).read_text());ck('Export réel depuis file:// au schéma 110',local['schema']==110 and local['engineering']['plates']==0)
  direct={'validated':True,'scope':'Chromium local de cette recette ; pas tous les navigateurs ou politiques administratives'}
 except Exception as ex:
  direct={'validated':False,'reason':str(ex)[:400]}
 ck('Aucune erreur JS ou console',not errors and not console,{'page':errors,'console':console});b.close()
out={'version':'110.0.0-rc.1','htmlSha256':h,'checks':checks,'pageErrors':errors,'consoleErrors':console,'externalRequests':requests,'transport':{'tested':'set_content exact authorized HTML bytes with distributed Blob loader','directFileNavigation':direct},'nativeActivated':False}
(R/'report/distribution-smoke-v110.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'passed':len(checks),'errors':errors}))
