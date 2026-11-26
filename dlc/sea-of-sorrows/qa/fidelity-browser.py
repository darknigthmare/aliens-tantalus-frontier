#!/usr/bin/env python3
"""Actual Chromium renders + interaction checks. Explicit storage fixture. No native-policy bypass."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json,hashlib,traceback,threading,http.server
R=Path(__file__).resolve().parents[1];O=R/'reports/v0100';CAP=O/'captures';CAP.mkdir(parents=True,exist_ok=True);H=(R/'MER_DES_CHAGRINS_JOUABLE.html').read_text();checks=[];errs=[];captures=[];fatal=None;native={}
def ck(n,v):checks.append({'name':n,'pass':bool(v)});print(('PASS 'if v else'FAIL ')+n,flush=True)
def boot(b,w=1440,h=900):
 p=b.new_page(viewport={'width':w,'height':h},device_scale_factor=1);p.set_default_timeout(10000);p.on('pageerror',lambda e:errs.append(str(e)))
 p.evaluate('''()=>{window.__SOS_QA__=true;window.__memory=new Map();Object.defineProperty(window,'localStorage',{value:{getItem:k=>__memory.get(k)||null,setItem:(k,v)=>__memory.set(k,String(v)),removeItem:k=>__memory.delete(k)}});}''');p.set_content(H,wait_until='load');return p

def load(p,k,frozen=True):
 raw=(R/'qa/fidelity-fixtures'/f'{k}.json').read_text();p.evaluate('''({raw,frozen})=>{const q=__sos;q.game.importSave(raw);q.game.drainEvents();q.cueBus.reset();document.getElementById('toast').classList.remove('show');q.closeAll();if(frozen)q.freeze();q.renderer.lastRoom='';q.updateHUD();q.renderer.draw(0,0);}''',{'raw':raw,'frozen':frozen})
 if frozen:p.wait_for_timeout(220)  # allow the previous DOM toast opacity to finish; simulation remains frozen
 return raw

def shot(p,name,caption,source=None,prepared=False):
 p.screenshot(path=str(CAP/name));state=p.evaluate('__sos.game.exportSave()');(CAP/(name+'.json')).write_text(state);captures.append({'file':name,'caption':caption,'source':source,'prepared':prepared,'sha256':hashlib.sha256((CAP/name).read_bytes()).hexdigest()})

with sync_playwright()as pw:
 b=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 try:
  test=b.new_page();
  try:test.goto((R/'MER_DES_CHAGRINS_JOUABLE.html').as_uri(),timeout=10000);native['file']='loaded'
  except Exception as e:native['file']=str(e).split('Call log:')[0]
  class Quiet(http.server.SimpleHTTPRequestHandler):
   def __init__(self,*a,**kw):super().__init__(*a,directory=str(R),**kw)
   def log_message(self,*a):pass
  srv=http.server.ThreadingHTTPServer(('127.0.0.1',0),Quiet);threading.Thread(target=srv.serve_forever,daemon=True).start()
  try:test.goto(f'http://127.0.0.1:{srv.server_port}/MER_DES_CHAGRINS_JOUABLE.html',timeout=10000);native['http']='loaded'
  except Exception as e:native['http']=str(e).split('Call log:')[0]
  srv.shutdown();test.close()
  p=boot(b);ck('Version0.10 et registre présents',p.evaluate('SoSData.meta.version==="0.10.0"&&SoSData.codex.length===126'))
  shot(p,'01_titre.png','Écran titre de la version courante. Nouvelle partie sans sauvegarde préparée.')
  p.click('#fidelityBtn');ck('Les 50 lieux sont inspectables avant la partie',p.locator('.referenceCard').count()==50)
  p.click('[data-reference="personnages"]');ck('16 personnages identifiés, profil générique exclu du registre public',p.locator('.castPortrait').count()==16)
  ck('Les visages complets ne sont pas présentés comme authentifiés','ne suffisent pas à authentifier' in p.locator('#panelContent').inner_text())
  ck('Les rôles non joués sont signalés','scène individuelle non reconstituée'in p.locator('#panelContent').inner_text())
  shot(p,'02_personnages.png','Interprétations rendues par le même code que les personnages de terrain. Les traits sourcés et les inconnues sont séparés.')
  p.click('[data-reference="materiel"]');ck('Sept entrées d’armes et quatorze d’équipement',p.locator('.referenceCard').count()==21)
  p.click('[data-reference="ecarts"]');ck('Dix sources externes identifiées',p.locator('#panelContent a[target="_blank"]').count()==10)
  ck('La confrontation au texte intégral est explicitement absente','Texte intégral non confronté'in p.locator('#panelContent').inner_text())
  load(p,'HYBRID-survival-07',False);p.evaluate('__sos.showArmory()');ck('Aucun retrait à distance',p.locator('#claimRifles').is_disabled())
  p.click('#closePanel');p.keyboard.down('KeyD');p.wait_for_function('Math.abs(__sos.game.p.x-__sos.game.room.armoryRack.x)<55');p.keyboard.up('KeyD');p.wait_for_timeout(50);p.keyboard.press('KeyE')
  p.wait_for_selector('#claimRifles');ck('Le râtelier est accessible après marche physique',p.locator('#claimRifles').is_enabled());p.click('#claimRifles')
  ck('Une dotation de 90 cartouches impulsion et trois cellules plasma',p.evaluate('__sos.game.state.armory.pulseAmmo===30&&__sos.game.state.armory.pulseReserve===60&&__sos.game.state.armory.plasmaAmmo===12&&__sos.game.state.armory.plasmaCells===2'))
  ck('Retrait en double désactivé',p.locator('#claimRifles').is_disabled());p.click('[data-equip="plasma"]');ck('Sélection du plasma par le véritable bouton',p.evaluate('__sos.game.p.weapon==="plasma"'))
  shot(p,'03_armurerie.png','Marche au clavier jusqu’au râtelier depuis la sauvegarde07, puis retrait et sélection au moyen des boutons. Aucune attribution authentifiée de tout cet arsenal à Decker.','HYBRID-survival-07')
  p.click('#closePanel');p.evaluate('__sos.freeze();__sos.updateHUD();__sos.renderer.draw(0,0)');ck('HUD du plasma séparé du Reaper','CELL.'in p.locator('#weaponInfo').inner_text() if p.locator('#weaponInfo').count()else p.evaluate('__sos.game.weaponReadout().includes("CELL.")'))
  shot(p,'04_ratelier_terrain.png','Après le retrait sur place, arme tenue et allocation marquée retirée. Position obtenue au clavier, non remplacée pour la capture.','HYBRID-survival-07')
  for k,name,caption in [('HYBRID-survival-10','05_cage_puits.png','Tête de puits après validation de son objectif. La liaison verticale est dessinée comme une cage, non comme une porte de couloir.'),('closed-gate-s17','06_atelier.png','Atelier depuis une sauvegarde des manœuvres de cloison. Paroi de premier plan et accès latéraux visibles selon le cadrage du moteur.'),('HYBRID-survival-26','07_porteurs.png','Les deux porteurs pendant l’évacuation : parasites adhérents visibles. La variante royale d’Adams repose sur une notice secondaire ; proportions interprétées.'),('HYBRID-survival-31','08_stase.png','Consigne cryogénique après livraison. Tableau de stase interprété, fondé sur l’état des deux patients ; aucune guérison ajoutée.')]:
   load(p,k);shot(p,name,caption,k)
  # All-room render sweep is staged: it verifies the actual renderer, not an earned tour.
  base=(R/'qa/fidelity-fixtures/HYBRID-survival-26.json').read_text()
  for mode in ['HYBRID','CLASSIC']:
   for room in p.evaluate('SoSData.rooms.map(r=>r.id)'):
    ok=p.evaluate('''({raw,mode,room})=>{const q=__sos,g=q.game;g.importSave(raw);g.setPresentation(mode);g.enter(room);q.closeAll();q.freeze();q.renderer.lastRoom='';q.updateHUD();q.renderer.draw(0,0);let c=q.renderer.canvas,ctx=c.getContext('2d'),px=ctx.getImageData(Math.floor(c.width/2),Math.floor(c.height/2),1,1).data;return px[3]===255&&g.validate(g.state);}''',{'raw':base,'mode':mode,'room':room});ck(mode+' rendu de '+room,ok)
  # Close-range orientations, prepared solely for geometric/image review.
  for room in ['s17','s21']:
   p.evaluate('''({raw,room})=>{const q=__sos,g=q.game;g.importSave(raw);g.enter(room);const d=g.room.doors.find(d=>d.portal.mount==='front');g.p.x=d.x;g.p.z=g.zFor(d);g.ensureSafePosition(g.p);q.closeAll();q.freeze();q.renderer.lastRoom='';q.updateHUD();q.renderer.draw(0,0);}''',{'raw':base,'room':room})
   shot(p,'09_seuil_'+room+'.png','Contrôle préparé : joueur positionné à l’approche du seuil pour vérifier l’encastrement et la transparence. Ce cadrage n’est pas une progression gagnée.',prepared=True)
  for w,h in [(1024,768),(390,844),(360,780)]:
   small=boot(b,w,h);small.click('#fidelityBtn')
   for tab in ['lieux','personnages','materiel','ecarts']:
    small.click('[data-reference="'+tab+'"]');ck(str(w)+'px registre '+tab+' sans débordement horizontal',small.evaluate('document.documentElement.scrollWidth<=innerWidth+1&&document.querySelector(".panelBox").getBoundingClientRect().right<=innerWidth+1'))
   small.click('[data-reference="personnages"]');ck(str(w)+'px fermeture du registre accessible',small.locator('#closePanel').is_visible())
   if w==390:shot(small,'10_registre_390.png','Registre à390×844 : contrôle de disposition, pas certification d’un téléphone physique.')
   small.close()
  ck('Aucune exception dans les nouveaux panneaux et rendus',not errs)
 except Exception as e:fatal=str(e);traceback.print_exc()
 finally:b.close()
report={'version':'0.10.0','html_sha256':hashlib.sha256(H.encode()).hexdigest(),'native_attempts':native,'checks':checks,'passed':sum(x['pass']for x in checks),'failed':sum(not x['pass']for x in checks)+bool(fatal),'fatal':fatal,'errors':errs,'captures':captures,'method':'Chromium/Playwright with explicit memory storage after recorded native-navigation failures. Earned snapshots used for major captures; prepared geometry sweeps labelled separately.'};(O/'browser.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));print('RESULT',report['passed'],report['failed']);raise SystemExit(bool(report['failed']))
