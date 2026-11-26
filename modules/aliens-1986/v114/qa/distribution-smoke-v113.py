"""Separate distribution checks using exact HTML bytes; no simulation editor hook."""
from pathlib import Path
import json,hashlib,base64
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parent.parent
checks=[];errors=[];console=[];requests=[]
def ck(name,ok,detail=None):
 checks.append({'name':name,'ok':bool(ok),'detail':detail});print(name,bool(ok),flush=True);assert ok,(name,detail)
def export(p):
 with p.expect_download() as dl:p.locator('#export').click()
 return json.loads(Path(dl.value.path()).read_text())
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 p=b.new_page(viewport={'width':1280,'height':900},accept_downloads=True);p.set_default_timeout(15000)
 p.on('pageerror',lambda e:errors.append(str(e)));p.on('console',lambda e:console.append(e.text) if e.type=='error' else None);p.on('request',lambda r:requests.append(r.url) if r.url.startswith(('http:','https:')) else None)
 data=(R/'JOUER_ALIENS_V113.html').read_bytes();h=hashlib.sha256(data).hexdigest();p.set_content(data.decode());p.locator('#start-operation').wait_for();p.locator('[data-sector]').first.wait_for(state='attached')
 ck('Initialisation du document exact V113',p.locator('#start-operation').is_visible())
 ck('Dix inspections présentes',p.locator('[data-sector]').count()==10)
 p.locator('#start-operation').click();p.locator('#pause-open').click();s=export(p)
 ck('Export réel au schéma 113',s['schema']==113)
 ck('Inventaire logistique neuf vide',s['logistics']['inventory']=={'ammo':0,'medical':0,'sentry':0})
 ck('Aucune plaque offerte',s['engineering']['plates']==0 and not s['engineering']['collected'])
 ck('Aucune balise offerte',s['beacons']['schema']==112 and not s['beacons']['collected'] and s['beacons']['charges']==s['beacons']['spent']==len(s['beacons']['markers'])==0)
 ck('Onze structures intactes',len(s['engineering']['links'])==11 and all(v['hp']==100 and v['brace']==0 for v in s['engineering']['links'].values()))
 ck('Onze liaisons sauvegardées',len(s['contacts']['links'])==11)
 ck('Deux extrémités de dérivation commencent fermées',not s['contacts']['links']['ops-optics']['open'] and not s['contacts']['links']['conduit-medical']['open'] and s['contacts']['links']['optics-conduit']['open'])
 ck('Dix lieux sauvegardés',len(s['worlds'])==10)
 ck('Ancien contrat de torche conservé',s['lighting']['schema']==111 and s['lighting']['torch']['on'] is True)
 ck('Deux pièces nouvelles hors tension',not s['worlds']['v112-workshop']['circuits']['service'] and not s['worlds']['v112-conduit']['circuits']['service'])
 ck('Les huit anciens services démarrent inchangés',all(w['circuits']['service'] is True for id,w in s['worlds'].items() if not id.startswith('v112-')))
 ck('Commande P unique et contrôles L/K conservés',p.locator('#beacon-throw').count()==1 and p.locator('#torch-toggle').count()==1 and p.locator('#light-switch').count()==1)
 ck('Trois commandes tactiques uniques',all(p.locator('#'+id).count()==1 for id in ['post-order','sector-order','fire-discipline']))
 ck('Postes tactiques initialement vides',all(v is None for v in s['tactics']['posts'].values()))
 ck('Discipline sans gain de ressources',s['tactics']['discipline']=={'hicks':'free','hudson':'free'} and all(v==0 for v in s['tactics']['metrics'].values()))
 ck('Affût non orienté gratuitement',s['tactics']['sentries']['sentry-a']=={'angle':None,'fire':'free'})
 ck('Jeu sans demande réseau externe',not requests)
 p.set_content((R/'CODEX_LEVEL_DESIGN_V113.html').read_text());ck('Dix fiches Codex',p.locator('article.room').count()==10)
 ck('Aucune nouvelle pièce revendiquée',p.locator('article.room.new').count()==0)
 ck('60 règles de conception',p.locator('details').count()==60)
 p.locator('#filter').fill('atelier');p.wait_for_timeout(70);ck('Recherche des nouveaux raccords',0<p.locator('article.room:visible').count()<10)
 p.locator('#filter').fill('zz_inconnu_abc');ck('Filtre sans résultat',p.locator('article.room:visible').count()==0)
 p.locator('#filter').fill('');ck('Retour aux dix fiches',p.locator('article.room:visible').count()==10)
 ck('Dix plans présents et étiquetés comme calculés',p.locator('svg.diagram').count()==10 and 'Plan calculé' in p.locator('body').inner_text())
 p.set_viewport_size({'width':390,'height':844});p.wait_for_timeout(80);ck('Codex portrait sans débordement',p.evaluate('document.documentElement.scrollWidth<=innerWidth'))
 p.set_viewport_size({'width':1280,'height':900});p.set_content((R/'RAPPORT_ILLUSTRE_V113.html').read_text())
 ck('Dix captures intégrées au rapport',p.locator('img').count()==10)
 p.locator('img').evaluate_all('(xs)=>xs.forEach(i=>i.loading="eager")')
 decode=p.evaluate('Promise.all([...document.images].map(async i=>{try{await i.decode();return i.naturalWidth>0&&i.naturalHeight>0}catch{return false}}))')
 ck('Les dix PNG décodent correctement',len(decode)==10 and all(decode))
 selection=json.loads((R/'report/report-selection-v113.json').read_text());urls=p.locator('img').evaluate_all('(xs)=>xs.map(x=>x.src)')
 ck('Images embarquées identiques aux PNG bruts',len(urls)==len(selection['files']) and all(base64.b64decode(u.split(',',1)[1])==(R/'report/captures-v113'/name).read_bytes() for u,name in zip(urls,selection['files'])))
 ck('Rapport sans dépendance externe',not requests)
 p.set_viewport_size({'width':390,'height':844});p.wait_for_timeout(80);ck('Rapport portrait sans débordement',p.evaluate('document.documentElement.scrollWidth<=innerWidth'))
 ck('Hash identique à celui de toutes les recettes gameplay',h==json.loads((R/'report/browser-results-v113.json').read_text())['htmlSha256'])
 # Review screenshot is separate, never counted among raw gameplay images.
 p.set_viewport_size({'width':1280,'height':900});p.screenshot(path=str(R/'report/document-review-v113.png'))
 direct={'validated':False}
 try:
  p.goto((R/'JOUER_ALIENS_V113.html').as_uri());p.locator('[data-sector]').first.wait_for(state='attached')
  ck('file:// initialise le document exact',p.locator('[data-sector]').count()==10)
  p.locator('#start-operation').click();p.locator('#pause-open').click();local=export(p)
  ck('Export file:// initial valide',local['schema']==113 and local['beacons']['charges']==0)
  direct={'validated':True,'scope':'Chromium local de cette recette, pas tous les navigateurs ni politiques système'}
 except Exception as ex:direct={'validated':False,'reason':str(ex)[:400]}
 ck('Aucune erreur JavaScript/console',not errors and not console,{'page':errors,'console':console});b.close()
out={'version':'113.0.0-rc.1','htmlSha256':h,'codexSha256':hashlib.sha256((R/'CODEX_LEVEL_DESIGN_V113.html').read_bytes()).hexdigest(),'reportSha256':hashlib.sha256((R/'RAPPORT_ILLUSTRE_V113.html').read_bytes()).hexdigest(),'checks':checks,'pageErrors':errors,'consoleErrors':console,'externalRequests':requests,'transport':{'tested':'set_content of exact distributed bytes; unmodified Blob loader','directFileNavigation':direct},'nativeActivated':False}
(R/'report/distribution-smoke-v113.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'passed':len(checks),'directFileNavigation':direct,'errors':errors}))
