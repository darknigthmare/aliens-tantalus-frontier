from pathlib import Path
import json,hashlib,base64,re
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parent.parent;checks=[];sha=lambda b:hashlib.sha256(b).hexdigest();game=(R/'JOUER_ALIENS_V114.html').read_bytes();codex=(R/'CODEX_LEVEL_DESIGN_V114.html').read_bytes();report=(R/'RAPPORT_ILLUSTRE_V114.html').read_bytes();errs=[];logs=[];requests=[]
def ck(n,ok):checks.append({'name':n,'ok':bool(ok)});print(n,ok,flush=True);assert ok,n
reg=json.JSONDecoder().raw_decode(game.decode().split('const registry=',1)[1])[0]
ck('46 modules distribués',len(reg)==46);ck('Sources embarquées byte-for-byte',all(v['source'].encode()==(R/k).read_bytes() and v['sha256']==sha((R/k).read_bytes()) for k,v in reg.items()));ck('Imports internes résolus',all(x in reg for v in reg.values() for x in v['deps'].values()))
seen=set();stack=set()
def visit(k):
 assert k not in stack,'Module cycle'
 if k in seen:return
 stack.add(k)
 for v in reg[k]['deps'].values():visit(v)
 stack.remove(k);seen.add(k)
for k in reg:visit(k)
ck('Chargeur sans cycle',len(seen)==46);ck('CSS exact intégré',('<style>'+(R/'preview/style.css').read_text()+'</style>') in game.decode())
B=json.loads((R/'report/browser-results-v114.json').read_text());F=json.loads((R/'report/browser-fidelity-v114.json').read_text());ck('377 contrôles gameplay passent sur le même HTML',len(B['tests'])+len(F['tests'])==377 and all(x['ok']for x in B['tests']+F['tests']) and B['htmlSha256']==F['htmlSHA256']==sha(game))
selection=json.loads((R/'report/report-selection-v114.json').read_text());images=[base64.b64decode(s)for s in re.findall(r'src="data:image/png;base64,([A-Za-z0-9+/=]+)"',report.decode())];ck('12 PNG exacts embarqués',len(images)==12 and [sha(p)for p in images]==[sha((R/'report/captures-v114'/name).read_bytes())for name in selection['files']]);ck('76 captures uniques réellement présentes',len(B['captures'])+len(F['captures'])==len({c['file']for c in B['captures']+F['captures']})==76 and all((R/'report/captures-v114'/c['file']).is_file()for c in B['captures']+F['captures']))
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox']);p=b.new_page(viewport={'width':1440,'height':980},accept_downloads=True)
 p.on('pageerror',lambda e:errs.append(str(e)));p.on('console',lambda e:logs.append(e.text)if e.type=='error'else None);p.on('request',lambda r:requests.append(r.url)if r.url.startswith(('http:','https:'))else None)
 p.set_content(game.decode());p.locator('[data-sector]').first.wait_for(state='attached');ck('Menu :25 lieux',p.locator('[data-sector]').count()==25);p.click('#start-operation');p.click('#pause-open')
 with p.expect_download() as d:p.click('#export')
 s=json.loads(Path(d.value.path()).read_text());ck('Export114 neuf à Hadley',s['schema']==114 and s['roomId']=='v106-hadley');ck('Onze lieux d’opération,25 mondes exportés',len(s['worlds'])==25);ck('Munitions secondaires non offertes à Ripley',all(v==0 for v in s['arsenal']['remaining']['ripley'].values()));ck('Hicks a six cartouches propres',s['arsenal']['remaining']['hicks']['shells']==6);ck('Newt sans arme',s['arsenal']['selected']['newt']is None and all(v==0 for v in s['arsenal']['remaining']['newt'].values()))
 p.goto('about:blank');p.set_content(codex.decode());ck('Codex :25 fiches',p.locator('article.room').count()==25);ck('Codex :80 règles',len(re.findall(r'<h3>\d{2} —',codex.decode()))==80);ck('Codex :44 références lieu+personnage',p.locator('section.entry').count()==44);ck('25 schémas étiquetés',p.locator('svg[aria-label^="Schéma calculé"]').count()==25);p.locator('#search').fill('smartgun');ck('Recherche filtrante réelle',p.locator('.filterable:not([hidden])').count()>0 and p.locator('.filterable:not([hidden])').count()<149);p.locator('#search').fill('');p.screenshot(path=str(R/'report/codex-review-v114.png'));p.set_viewport_size({'width':390,'height':844});ck('Codex portrait sans débordement',p.evaluate('document.documentElement.scrollWidth<=innerWidth'))
 p.goto('about:blank');p.set_content(report.decode());ck('Douze images du rapport décodées',p.locator('img').count()==12 and p.locator('img').evaluate_all('(a)=>a.every(i=>i.complete&&i.naturalWidth>0)'));ck('Rapport :provenance et limites affichées','1:1' in p.locator('body').inner_text() and 'exports intacts' in p.locator('body').inner_text());ck('Rapport portrait sans débordement',p.evaluate('document.documentElement.scrollWidth<=innerWidth'))
 ck('Aucune requête externe nécessaire',not requests);ck('Aucune erreur JavaScript/console',not errs and not logs)
 try:p.goto((R/'JOUER_ALIENS_V114.html').as_uri(),wait_until='domcontentloaded',timeout=10000);p.locator('[data-sector]').first.wait_for(timeout=6000);transport={'validated':True,'method':'real file URI navigation'}
 except Exception as ex:transport={'validated':False,'reason':str(ex)[:700]}
 b.close()
(R/'report/distribution-smoke-v114.json').write_text(json.dumps({'checks':checks,'htmlSha256':sha(game),'codexSha256':sha(codex),'reportSha256':sha(report),'externalRequests':requests,'pageErrors':errs,'consoleErrors':logs,'directFileTransport':transport},ensure_ascii=False,indent=2));print(json.dumps({'checks':len(checks),'file':transport}))
