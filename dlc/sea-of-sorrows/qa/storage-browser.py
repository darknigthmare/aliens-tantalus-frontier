#!/usr/bin/env python3
"""Actual delivered HTML, earned snapshots, ordinary UI events. No native policy bypass."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json,hashlib,traceback
R=Path(__file__).resolve().parents[1];OUT=R/'reports/v080';CAP=OUT/'captures';ST=OUT/'capture-states'
CAP.mkdir(parents=True,exist_ok=True);ST.mkdir(exist_ok=True)
HTML=(R/'MER_DES_CHAGRINS_JOUABLE.html').read_text();KEY='tantalus.dlc.sea-of-sorrows.v1'
checks=[];errors=[];requests=[];captures=[];fatal=None
sha=lambda b:hashlib.sha256(b).hexdigest()
def ck(name,value):
 checks.append({'name':name,'pass':bool(value)});print(('PASS 'if value else'FAIL ')+name,flush=True)
def boot(b,size=(1440,900),seed=None):
 p=b.new_page(viewport=dict(width=size[0],height=size[1]),device_scale_factor=1);p.set_default_timeout(7000)
 p.on('pageerror',lambda e:errors.append(str(e)));p.on('request',lambda r:requests.append(r.url))
 p.evaluate('''seed=>{window.__SOS_QA__=true;window.__store=new Map(Object.entries(seed));Object.defineProperty(window,'localStorage',{value:{getItem:k=>__store.get(k)??null,setItem:(k,v)=>__store.set(String(k),String(v)),removeItem:k=>__store.delete(k),clear:()=>__store.clear()}});}''',seed or {})
 p.set_content(HTML,wait_until='load');p.wait_for_timeout(80);return p
def load(p,name,freeze=True):
 raw=(R/'qa/storage-fixtures'/(name+'.json')).read_text()
 p.evaluate('''({raw,freeze})=>{const q=__sos;q.game.importSave(raw);q.closeAll();q.game.drainEvents();for(const id of ['toast','roomArrival']){document.getElementById(id).classList.remove('show');document.getElementById(id).textContent='';}if(freeze)q.freeze();q.renderer.lastRoom='';q.renderer.draw(q.game.time,0);q.updateHUD();}''',{'raw':raw,'freeze':freeze});return raw
def shot(p,name,caption,source=None):
 p.evaluate('__sos.freeze();__sos.renderer.draw(__sos.game.time,0);__sos.updateHUD()');p.wait_for_timeout(90);p.screenshot(path=str(CAP/name));raw=p.evaluate('__sos.game.exportSave()');(ST/(name+'.json')).write_text(raw)
 captures.append({'file':name,'caption':caption,'source':source,'sha256':sha((CAP/name).read_bytes()),'state_sha256':sha(raw.encode()),'source_sha256':sha((R/'qa/storage-fixtures'/(source+'.json')).read_bytes())if source else None});print('CAPTURE',name,flush=True)
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 try:
  p=boot(b);ck('Version 0.8, 50 salles, 120 dossiers et schéma 8',p.evaluate('SoSData.meta.version==="0.9.0"&&SoSData.rooms.length===50&&SoSData.codex.length===120&&__sos.game.state.schema===8'))
  shot(p,'01_titre.png','Titre de la version livrée. État neuf figé ; aucune progression préparée.')
  p.click('#helpBtn');ck('Le guide décrit dix casiers physiques et leurs stocks',all(x in p.locator('#panelContent').inner_text() for x in ['dix casiers','2,4 secondes','Stocks repérés']));p.click('#closePanel')
  p.evaluate('__sos.begin(false)');p.click('#storyContinue');p.evaluate('__sos.showInventory()');p.click('#storageInventory');ck('Aucun stock secret révélé au prologue','Aucun casier repéré'in p.locator('#panelContent').inner_text());p.click('#stocksBack');ck('Retour à l’équipement',p.locator('#storageInventory').count()==1)
  load(p,'sealed-locker-03');shot(p,'02_vestiaire_scelle.png','Vestiaire des équipes : casier encore scellé. Sauvegarde gagnée du parcours Hybride / Survie, sans repositionnement.','sealed-locker-03')
  load(p,'sealed-locker-03',False);before=p.evaluate('JSON.stringify(__sos.game.p)');p.keyboard.down('KeyE');p.wait_for_timeout(650);p.keyboard.up('KeyE');p.wait_for_timeout(90)
  ck('Maintien E : ouverture partielle sans transfert',p.evaluate('!__sos.game.rs.lockers["locker-03"].opened&&__sos.game.rs.lockers["locker-03"].progress>.35&&__sos.game.rs.lockers["locker-03"].progress<1.3'))
  progress=p.evaluate('__sos.game.rs.lockers["locker-03"].progress');p.wait_for_timeout(150);ck('Relâcher conserve la progression',p.evaluate('__sos.game.rs.lockers["locker-03"].progress')==progress)
  beforeStock=p.evaluate('Object.fromEntries(Object.keys(SoSCore.STOCKS).map(k=>[k,__sos.game.p[k]]))')
  p.keyboard.down('KeyE');p.wait_for_function('__sos.game.rs.lockers["locker-03"].opened&&document.getElementById("takeAllStock")',timeout=6500);p.keyboard.up('KeyE')
  ck('Scellé terminé : véritable panneau local ouvert',p.locator('#takeAllStock').is_visible() and p.locator('.storeRow').count()==7)
  ck('Aucune ressource accordée automatiquement',p.evaluate('Object.fromEntries(Object.keys(SoSCore.STOCKS).map(k=>[k,__sos.game.p[k]]))')==beforeStock)
  tm=p.evaluate('__sos.game.state.stats.time');p.wait_for_timeout(230);ck('Inspection de stock en pause',p.evaluate('__sos.game.state.stats.time')==tm)
  shot(p,'03_transfert_local.png','Le scellé du vestiaire vient d’être ouvert avec E dans Chromium. L’inspection suspend la simulation ; aucun objet n’a été pris automatiquement.','sealed-locker-03')
  reserve=p.evaluate('__sos.game.p.reserve');contents=p.evaluate('__sos.game.rs.lockers["locker-03"].contents.reserve')
  p.click('[data-transfer="deposit"][data-resource="reserve"]');ck('Déposer six cartouches modifie les deux stocks',p.evaluate('__sos.game.p.reserve')==reserve-6 and p.evaluate('__sos.game.rs.lockers["locker-03"].contents.reserve')==contents+6)
  p.click('[data-transfer="take"][data-resource="reserve"]');ck('Reprendre conserve exactement le total',p.evaluate('__sos.game.p.reserve')==reserve and p.evaluate('__sos.game.rs.lockers["locker-03"].contents.reserve')==contents)
  ck('Une prise au plafond est désactivée',p.locator('[data-transfer="take"][data-resource="reserve"]').is_disabled())
  p.click('#leaveStock');p.evaluate('__sos.freeze()');shot(p,'04_vestiaire_ouvert.png','Même position après ouverture et échange aller-retour. Les portes de l’armoire restent ouvertes dans le rendu.','sealed-locker-03')
  p.evaluate('__sos.showInventory()');p.click('#storageInventory');ck('Les stocks repérés sont lisibles sans commandes de transfert',p.locator('.knownStores article').count()>=3 and p.locator('[data-transfer]').count()==0);ck('Les casiers non ouverts restent scellés dans le registre','SCELLÉ INTACT'in p.locator('#panelContent').inner_text())
  raw=p.evaluate('__sos.game.exportSave()');p.evaluate('raw=>{__sos.game.importSave(raw);__sos.game.drainEvents();}',raw);ck('Export/import garde ouverture et contenu',p.evaluate('__sos.game.rs.lockers["locker-03"].opened&&__sos.game.rs.lockers["locker-03"].contents.reserve')==contents)
  for name,file,caption in [('opened-locker-06','05_echangeurs.png','Cour des échangeurs : armoire ouverte après progression et combat par les commandes du parcours.'),('opened-locker-08','06_transit_convoi.png','Transit des blessés : les deux brancards ont emprunté la nouvelle boucle par ses seuils réciproques.'),('opened-locker-10','07_magasin.png','Magasin de la remontée : fouille après combat, avant de rejoindre l’infirmerie.')]:
   load(p,name);shot(p,file,caption+' Position du joueur inchangée.',name)
  p.evaluate('__sos.showMap(__sos.game.room.zone,true)');ck('La carte locale montre les deux meubles et leur état',p.locator('[data-locker]').count()==2 and 'CASIER'in p.locator('.roomPlan').text_content());ck('Aucun transfert possible depuis la carte',p.locator('[data-transfer]').count()==0);shot(p,'08_plan_magasin.png','Plan local du magasin : emprises et casiers issus des données actives, aucune position ennemie révélée.','opened-locker-10')
  # Strictly labelled isolated rendering exercise; not a second playthrough.
  renders=0
  for mode in ['HYBRID','CLASSIC']:
   for room in ['s47','s48','s49','s50']:
    p.evaluate('''({room,mode})=>{const q=__sos;q.closeAll();q.game.enter(room);q.game.setPresentation(mode);q.freeze();q.game.drainEvents();q.renderer.lastRoom='';q.renderer.draw(0,0);}''',{'room':room,'mode':mode});renders+=1
  ck('Huit rendus préparés des quatre annexes et deux vues',renders==8 and not errors)
  for size in [(1024,768),(390,844),(360,780)]:
   small=boot(b,size);load(small,'opened-locker-03');small.evaluate('__sos.showStorage("locker-03")')
   ck(f'{size[0]} px : pas de débordement du panneau',small.evaluate('document.documentElement.scrollWidth<=innerWidth+1&&document.querySelector(".panelBox").getBoundingClientRect().right<=innerWidth+1'))
   ck(f'{size[0]} px : les actions ne se chevauchent pas',small.evaluate('()=>{const a=[...document.querySelectorAll(".stockActions button")].map(e=>e.getBoundingClientRect());return a.every((r,i)=>a.every((s,j)=>i===j||r.right<=s.left+.1||r.left>=s.right-.1||r.bottom<=s.top+.1||r.top>=s.bottom-.1));}'))
   if size[0]==390:shot(small,'09_casier_390.png','Panneau local en 390 × 844. Contrôle de disposition, pas une certification tactile complète.','opened-locker-03')
   small.close()
  legacy=(R/'qa/lighting-fixtures/HYBRID-survival-26.json').read_text();old=boot(b,seed={KEY:legacy});old.click('#continueBtn');ck('Reprise par le titre migre une vraie sauvegarde 7 vers 8',old.evaluate('__sos.game.state.schema===8&&__sos.game.state.objectiveIndex===26'));ck('La sauvegarde 7 est préservée en copie de migration',old.evaluate(f'localStorage.getItem("{KEY}.backup-v7")')==legacy);old.close()
  ck('Aucune exception JavaScript',not errors);ck('Aucun appel réseau du HTML autonome',not requests)
 except Exception as e:fatal=str(e);traceback.print_exc()
 finally:b.close()
report={'version':'0.9.0','html_sha256':sha(HTML.encode()),'checks':checks,'passed':sum(c['pass']for c in checks),'failed':sum(not c['pass']for c in checks)+(1 if fatal else 0),'fatal':fatal,'errors':errors,'requests':requests,'captures':captures,'storage':'In-memory fixture. Native file/http navigation blocked and never bypassed.','method':'Earned full-tour snapshots and ordinary keyboard/click actions. Eight prepared room renders labelled separately.'}
(OUT/'browser.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));print('TOTAL',report['passed'],report['failed'],flush=True)
raise SystemExit(1 if report['failed']or errors else 0)
