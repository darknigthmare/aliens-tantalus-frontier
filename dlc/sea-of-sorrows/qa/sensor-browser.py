#!/usr/bin/env python3
"""Actual delivered HTML. Prepared scenes use earned schema-6 saves. Controller inputs
are explicit synthetic Gamepad fixtures, never a physical-hardware certification.
Local navigation policy remains intact; storage is an explicit in-memory fixture.
"""
from pathlib import Path
import json,hashlib
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parents[1];OUT=R/'reports/v060';CAP=OUT/'captures';ST=OUT/'states'
CAP.mkdir(parents=True,exist_ok=True);ST.mkdir(exist_ok=True)
HTML=(R/'MER_DES_CHAGRINS_JOUABLE.html').read_text();KEY='tantalus.dlc.sea-of-sorrows.v1'
checks=[];errors=[];requests=[];captures=[];fatal=None
sha=lambda s:hashlib.sha256(s).hexdigest()
def ck(name,ok):
 checks.append({'name':name,'pass':bool(ok)});print(('PASS 'if ok else'FAIL ')+name,flush=True)
 if not ok:raise AssertionError(name)
def boot(b,seed=None,size=(1440,900)):
 p=b.new_page(viewport=dict(width=size[0],height=size[1]));p.set_default_timeout(4000);p.on('pageerror',lambda e:errors.append(str(e)));p.on('request',lambda req:requests.append(req.url))
 p.goto('about:blank');p.evaluate('''seed=>{window.__SOS_QA__=true;window.__store=new Map(Object.entries(seed));Object.defineProperty(window,'localStorage',{value:{getItem:k=>__store.get(k)||null,setItem:(k,v)=>__store.set(String(k),String(v)),removeItem:k=>__store.delete(k),clear:()=>__store.clear()}});window.__pad=null;Object.defineProperty(navigator,'getGamepads',{value:()=>window.__pad?[window.__pad]:[]});}''',seed or {})
 p.set_content(HTML,wait_until='load');p.wait_for_timeout(100);return p
def load(p,name,freeze=False):
 raw=(R/'qa/sensor-fixtures'/(name+'.json')).read_text()
 p.evaluate('''({raw,freeze})=>{const q=__sos;q.game.importSave(raw);q.closeAll();q.game.drainEvents();if(freeze)q.freeze();document.getElementById('toast').classList.remove('show');document.getElementById('toast').textContent='';q.renderer.lastRoom='';q.renderer.draw(q.game.time,0);q.updateHUD();}''',dict(raw=raw,freeze=freeze));p.wait_for_timeout(70)
 return raw

def shot(p,name,caption,source=None):
 p.evaluate('()=>{__sos.freeze();__sos.renderer.draw(__sos.game.time,0);__sos.updateHUD();}');p.wait_for_timeout(45)
 p.screenshot(path=str(CAP/name));state=p.evaluate('__sos.game.exportSave()');(ST/(name+'.json')).write_text(state)
 captures.append(dict(file=name,caption=caption,source=source,source_sha256=sha((R/'qa/sensor-fixtures'/(source+'.json')).read_bytes())if source else None,image_sha256=sha((CAP/name).read_bytes()),state_sha256=sha(state.encode())))
 print('CAPTURE',name,flush=True)
def pad(p,buttons=None,axes=None,wait=110):
 p.evaluate('''({buttons,axes})=>{window.__pad={id:'Virtual standard pad (test only)',index:0,connected:true,mapping:'standard',axes,buttons:Array.from({length:17},(_,i)=>({pressed:buttons.includes(i),value:buttons.includes(i)?1:0}))};}''',dict(buttons=buttons or [],axes=axes or [0,0,0,0]));p.wait_for_timeout(wait);p.evaluate('()=>new Promise(resolve=>{let n=0;function tick(){if(++n>=3)resolve();else requestAnimationFrame(tick)}requestAnimationFrame(tick)})')
def press(p,button):pad(p);pad(p,[button]);pad(p)
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 try:
  p=boot(b)
  ck('Version 0.8 / schéma 8 / 120 dossiers réellement chargés',p.evaluate('SoSData.meta.version==="0.9.0"&&__sos.game.state.schema===8&&SoSData.codex.length===120'))
  p.click('#controllerHelpBtn');ck('La commande Manette du titre ouvre le guide',p.locator('.padGuide article').count()==4);p.click('#closePanel')
  p.click('#newBtn');p.click('#storyContinue');p.keyboard.press('KeyO');p.wait_for_timeout(80)
  ck('O ouvre une roue de huit commandes avec trois onglets',p.locator('#tactical.open').count()==1 and p.locator('.wheelAction').count()==8 and p.locator('.wheelTabs button').count()==3)
  tm=p.evaluate('__sos.game.state.stats.time');p.wait_for_timeout(180);ck('La roue est une vraie pause, horloge stable',p.evaluate('__sos.game.state.stats.time')==tm)
  p.click('#wheelGear');ck('Les armes non reçues restent indisponibles',p.locator('[data-wheel=pistol]').get_attribute('aria-disabled')=='true')
  p.locator('[data-wheel=pistol]').dispatch_event('click');ck('Cliquer une action indisponible ne ferme ni ne fournit une arme',p.locator('#tactical.open').count()==1 and not p.evaluate('__sos.game.state.inventory.pistol'))
  p.keyboard.press('Escape');ck('Échap referme seulement la roue',p.locator('#tactical.open').count()==0 and not p.evaluate('__sos.isPaused()'))
  load(p,'HYBRID-survival-08',True);p.evaluate('__sos.showTactical(0)');shot(p,'01_roue_equipe.png','Roue Équipe sur un état gagné du parcours Hybride / Survie. Simulation figée.','HYBRID-survival-08')
  ck('La roue expose les ordres et les trois outils de travail',all(p.locator(f'[data-wheel={id}]').count()==1 for id in ['ally','discipline','rally','use','repair','shutter']))
  p.click('#wheelGear');shot(p,'02_roue_materiel.png','Onglet Matériel. Les entrées indisponibles restent visibles mais ne donnent aucune ressource.','HYBRID-survival-08')
  p.click('#wheelField');ck('Les menus de lecture sont accessibles dans la troisième page',all(p.locator(f'[data-wheel={id}]').count()==1 for id in ['sensors','map','journal','codex','view']))
  p.click('[data-wheel=sensors]');ck('Le panneau capteurs affiche trois appareils distincts',p.locator('.sensorCard').count()==3)
  ck('Les appareils rangés ne peuvent pas être activés à distance',p.locator('[data-sensor-toggle]:disabled').count()==3)
  load(p,'sensor-recovered');p.keyboard.press('KeyP');p.wait_for_timeout(100)
  ck('P pose physiquement un appareil récupéré pendant le parcours',p.evaluate('__sos.game.state.sensors.filter(b=>b.room===__sos.game.room.id).length===1'))
  battery=p.evaluate('__sos.game.state.sensors[0].charge');p.wait_for_timeout(300);ck('Une veille active consomme du temps de batterie',p.evaluate('__sos.game.state.sensors[0].charge')<battery)
  p.keyboard.press('KeyO');before=p.evaluate('__sos.game.state.sensors[0].charge');p.wait_for_timeout(250)
  ck('La pause arrête aussi la consommation du capteur',p.evaluate('__sos.game.state.sensors[0].charge')==before)
  p.click('#wheelField');p.click('[data-wheel=sensors]');p.click('[data-sensor-toggle=sensor-1]');ck('La coupure depuis la fiche atteint la simulation',p.evaluate('__sos.game.state.sensors[0].powered===false'))
  p.click('#closePanel');before=p.evaluate('__sos.game.state.sensors[0].charge');p.wait_for_timeout(300);ck('Une veille coupée ne consomme pas quand le jeu reprend',p.evaluate('__sos.game.state.sensors[0].charge')==before)
  p.wait_for_function('__sos.game.cooldowns.sensor<=0',timeout=4000);p.keyboard.press('KeyP');ck('P récupère sur place sans recharger',p.evaluate('__sos.game.state.sensors[0].room===null') and p.evaluate('__sos.game.state.sensors[0].charge')==before)
  load(p,'sensor-deployed',True);shot(p,'03_capteur_pose.png','Capteur posé avec la commande normale pendant le parcours, dans la tranchée. Position inchangée.','sensor-deployed')
  p.evaluate('__sos.showMap(__sos.game.room.zone,true)');ck('Le plan local contient le capteur, pas un nouveau symbole ennemi',p.locator('[data-sensor=sensor-1]').count()==1 and p.locator('.roomPlan [data-enemy]').count()==0)
  shot(p,'04_plan_capteur.png','Plan local du matériel posé ; aucun nouvel affichage de position ennemie.','sensor-deployed')
  load(p,'sensor-remote',True)
  ck('Le dernier scan reçu est conservé dans la sauvegarde distante',p.evaluate('__sos.game.state.sensors[0].room!==__sos.game.room.id&&__sos.game.sensorReports()[0].linked&&__sos.game.sensorReports()[0].age<.4'))
  shot(p,'05_liaison_distante.png','Le joueur est au belvédère, le capteur dans la tranchée. Scan réellement reçu pendant la poursuite du parcours.','sensor-remote')
  p.evaluate('__sos.showSensors()');shot(p,'06_veille.png','Fiche des appareils depuis le même état gagné : liaison, charge restante et heure du dernier mouvement.','sensor-remote')
  ck('Une observation montre son heure, pas une identité de créature', 'Dernier mouvement reçu' in p.locator('.sensorObservation').first.inner_text() and 'adult' not in p.locator('.sensorGrid').inner_text().lower())
  load(p,'closed-gate-s17');p.evaluate('__sos.showTactical(0)');p.click('[data-wheel=shutter]');
  ck('Choisir Cloison sélectionne un outil sans ouvrir instantanément',p.evaluate('__sos.getWorkTool()==="shutter"&&__sos.game.rs.shutters[__sos.game.room.shutters[0].id].status==="closed"'))
  p.keyboard.down('KeyE');p.wait_for_timeout(650);p.keyboard.up('KeyE')
  ck('E maintenu fait réellement progresser la manœuvre sélectionnée',p.evaluate('(()=>{let a=__sos.game.rs.shutters[__sos.game.room.shutters[0].id];return a.status==="closed"&&a.progress>.2})()'))
  p.keyboard.down('KeyE');p.wait_for_function('__sos.game.rs.shutters[__sos.game.room.shutters[0].id].status==="open"',timeout=6000);p.keyboard.up('KeyE');ck('La cloison s’ouvre seulement au bout de sa durée',p.evaluate('__sos.game.rs.shutters[__sos.game.room.shutters[0].id].status==="open"'))
  p.keyboard.press('KeyO');p.click('[data-wheel=use]');ck('La roue restaure l’outil standard',p.evaluate('__sos.getWorkTool()==="use"'))
  # Repeat protection across pause: a physically held key must be released.
  p.keyboard.down('ArrowLeft');p.wait_for_timeout(100);p.keyboard.press('KeyO');p.keyboard.press('Escape');x=p.evaluate('__sos.game.p.x');p.keyboard.down('ArrowLeft');p.wait_for_timeout(140)
  ck('Une touche maintenue avant la pause ne repart pas sur sa répétition',p.evaluate('__sos.game.p.x')==x);p.keyboard.up('ArrowLeft')
  # Standard controller connected via synthetic navigator.getGamepads data.
  load(p,'HYBRID-survival-08');pad(p);x=p.evaluate('__sos.game.p.x');pad(p,axes=[.7,0,0,0],wait=300);p.wait_for_function('x=>__sos.game.p.x>x+20',arg=x,timeout=5000);pad(p)
  ck('Le stick gauche standard produit un déplacement analogique',p.evaluate('__sos.game.p.x')>x+20)
  pos=p.evaluate('__sos.game.p.x');pad(p,axes=[.08,.08,0,0],wait=160);ck('La petite dérive du stick ne déplace pas Decker',p.evaluate('__sos.game.p.x')==pos);pad(p)
  pad(p,axes=[0,0,.8,-.3],wait=180);pad(p);ck('Le stick droit déplace un vrai viseur',p.locator('#crosshair').is_visible())
  shots=p.evaluate('__sos.game.state.stats.shots');press(p,7);ck('La gâchette droite appelle le vrai tir',p.evaluate('__sos.game.state.stats.shots')>shots)
  hp=p.evaluate('__sos.game.p.stress');pad(p,[6],wait=280);pad(p);ck('La gâchette gauche active l’empathie',p.evaluate('__sos.game.p.stress')>hp)
  press(p,4);ck('L1 / LB ouvre la roue',p.locator('#tactical.open').count()==1)
  press(p,5);ck('R1 / RB change la page de la roue',p.locator('[data-wheel=pistol]').count()==1)
  pad(p,axes=[0,1,0,0]);ck('Le stick choisit le secteur inférieur',p.locator('[data-wheel=medkit]').get_attribute('class').find('chosen')>=0)
  pad(p);press(p,1);ck('Rond / B annule la roue sans action',p.locator('#tactical.open').count()==0)
  # Open while firing, close, keep a trigger through rearm: no shot until neutral.
  pad(p,[4,7]);pad(p);pad(p,[1]);shots=p.evaluate('__sos.game.state.stats.shots');pad(p,[7],wait=220)
  ck('La fermeture de la roue ne relance pas une gâchette encore maintenue',p.evaluate('__sos.game.state.stats.shots')==shots);pad(p);press(p,7);ck('Relâcher puis presser à nouveau rend le tir disponible',p.evaluate('__sos.game.state.stats.shots')>shots)
  press(p,5);ck('R1 sélectionne le travail de réparation hors menu',p.evaluate('__sos.getWorkTool()==="repair"'))
  press(p,5);ck('R1 peut sélectionner le travail de cloison',p.evaluate('__sos.getWorkTool()==="shutter"'));press(p,5)
  press(p,12);ck('La flèche haute commande la lampe',p.evaluate('__sos.game.p.lamp===false'))
  press(p,14);ck('La flèche gauche commande Manning sans téléportation',p.evaluate('__sos.game.state.companion.order==="hold"'))
  press(p,8);ck('Select ouvre la carte',p.locator('.mapSvg').count()==1);press(p,1)
  press(p,9);ck('Start met le jeu en pause',p.locator('#resumePlay').count()==1);press(p,1)
  p.evaluate('window.__pad=null');p.wait_for_timeout(160);ck('Débrancher en partie ouvre Pause',p.locator('#resumePlay').count()==1 and p.evaluate('__sos.isPaused()'))
  tm=p.evaluate('__sos.game.state.stats.time');pad(p);p.wait_for_timeout(150);ck('Rebrancher ne reprend pas la partie automatiquement',p.evaluate('__sos.game.state.stats.time')==tm)
  p.click('#resumePlay');pad(p);press(p,4);shot(p,'07_roue_manette.png','Roue ouverte par un profil standard simulé. Les commandes passent par le même lecteur que navigator.getGamepads ; aucun matériel physique testé.')
  p.evaluate('window.__pad=null');p.evaluate('__sos.closeAll();__sos.showControllerHelp()');shot(p,'08_guide_manette.png','Guide de manette livré dans le jeu. Les boutons sont décrits par leur position standard.')
  # Recovery and native-storage isolation.
  old=(R/'qa/trace-fixtures/HYBRID-survival-14.json').read_text();p2=boot(b,{KEY:old,'tantalus.main.sentinel':'KEEP'});p2.click('#continueBtn');p2.wait_for_timeout(100)
  ck('Reprendre migre le schéma 5 avec trois appareils sans altérer la progression',p2.evaluate('__sos.game.state.schema===8&&__sos.game.state.objectiveIndex===14&&__sos.game.state.sensors.length===3'))
  ck('La copie de sauvegarde schéma 5 est conservée',p2.evaluate('(k)=>localStorage.getItem(k)',KEY+'.backup-v5')==old)
  ck('Aucune écriture dans la sauvegarde hôte',p2.evaluate("localStorage.getItem('tantalus.main.sentinel')")=='KEEP');p2.close()
  # Desktop and narrow layout geometry; no certified mobile gameplay.
  for w,h in [(1024,768),(390,844),(360,780)]:
   p.set_viewport_size(dict(width=w,height=h));load(p,'HYBRID-survival-08',True);p.evaluate('__sos.showTactical(1)');p.wait_for_timeout(100)
   ck(f'{w}×{h} : huit commandes restent dans le panneau sans débordement horizontal',p.evaluate('''()=>{const box=document.querySelector('.wheelPanel').getBoundingClientRect();return [...document.querySelectorAll('.wheelAction')].every(e=>{const r=e.getBoundingClientRect();return r.left>=box.left&&r.right<=box.right+1})&&document.documentElement.scrollWidth<=innerWidth+1;}'''))
   ck(f'{w}×{h} : aucune superposition des huit boutons',p.evaluate('(()=>{const b=[...document.querySelectorAll(".wheelAction")].map(x=>x.getBoundingClientRect());return b.every((r,i)=>b.every((s,j)=>i>=j||Math.min(r.right,s.right)-Math.max(r.left,s.left)<=.5||Math.min(r.bottom,s.bottom)-Math.max(r.top,s.top)<=.5))})()'))
   if w==390:shot(p,'09_roue_etroite.png','Roue en 390 × 844. Contrôle de disposition uniquement, pas une partie tactile complète.','HYBRID-survival-08')
  p.set_viewport_size(dict(width=1440,height=900));load(p,'closed-gate-s35',True);p.evaluate('__sos.showTactical(0)');shot(p,'10_convoi_ordres.png','Ordres disponibles pendant l’escorte, à partir de l’état gagné aux paliers supérieurs.','closed-gate-s35')
  ck('Les fonctions anciennes restent présentes après les nouvelles commandes',p.evaluate('typeof __sos.game.stepPursuits==="function"&&typeof __sos.game.repairStep==="function"&&typeof __sos.game.shutterStep==="function"'))
  ck('Aucune exception JavaScript pendant les contrôles',not errors)
  ck('Aucune requête de ressource réseau du HTML autonome',not requests)
 except Exception as e:
  fatal=str(e);print('FATAL',fatal,flush=True)
  try:p.screenshot(path=str(OUT/'failure.png'))
  except:pass
 finally:b.close()
report={'version':'0.9.0','html_sha256':sha(HTML.encode()),'checks':checks,'passed':sum(c['pass']for c in checks),'failed':sum(not c['pass']for c in checks)+(1 if fatal else 0),'fatal':fatal,'errors':errors,'requests':requests,'captures':captures,'storage':'Explicit in-memory fixture. Native navigation is probed separately and blocked by the environment.','controller':'Synthetic standard Gamepad objects through navigator.getGamepads; not physical hardware tests.'}
(OUT/'browser.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print('RESULT',report['passed'],report['failed']);raise SystemExit(1 if fatal or errors else 0)
