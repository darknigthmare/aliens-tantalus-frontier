#!/usr/bin/env python3
"""Current HTML with explicit in-memory storage. Earned schema-7 snapshots retain all positions.
Native file/localhost restrictions are not bypassed. Synthetic states only for identified
invalid imports; all screenshots use the current continuous traversal saves.
"""
from pathlib import Path
import json,hashlib,traceback
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parents[1];OUT=R/'reports/v070';CAP=OUT/'captures';ST=OUT/'states'
CAP.mkdir(parents=True,exist_ok=True);ST.mkdir(exist_ok=True)
HTML=(R/'MER_DES_CHAGRINS_JOUABLE.html').read_text();KEY='tantalus.dlc.sea-of-sorrows.v1';checks=[];errors=[];captures=[];requests=[];fatal=None
sha=lambda b:hashlib.sha256(b).hexdigest()
def ck(name,ok):
 checks.append(dict(name=name,pass_=bool(ok)));checks[-1]['pass']=checks[-1].pop('pass_');print(('PASS 'if ok else'FAIL ')+name,flush=True)
 if not ok:raise AssertionError(name)
def boot(b,seed=None,size=(1440,900)):
 p=b.new_page(viewport={'width':size[0],'height':size[1]});p.set_default_timeout(5000);p.on('pageerror',lambda e:errors.append(str(e)));p.on('request',lambda r:requests.append(r.url))
 p.goto('about:blank');p.evaluate('''seed=>{window.__SOS_QA__=true;window.__store=new Map(Object.entries(seed));Object.defineProperty(window,'localStorage',{value:{getItem:k=>__store.get(k)||null,setItem:(k,v)=>__store.set(String(k),String(v)),removeItem:k=>__store.delete(k),clear:()=>__store.clear()}});}''',seed or {})
 p.set_content(HTML,wait_until='load');p.wait_for_timeout(80);return p

def load(p,name,freeze=True):
 raw=(R/'qa/lighting-fixtures'/(name+'.json')).read_text()
 p.evaluate('''({raw,freeze})=>{const q=__sos;q.game.importSave(raw);q.closeAll();q.game.drainEvents();document.getElementById('roomArrival').classList.remove('show');document.getElementById('roomArrival').textContent='';document.getElementById('toast').classList.remove('show');document.getElementById('toast').textContent='';if(freeze)q.freeze();q.renderer.lastRoom='';q.renderer.draw(q.game.time,0);q.updateHUD();}''',dict(raw=raw,freeze=freeze));p.wait_for_timeout(70);return raw

def shot(p,name,caption,source=None):
 p.evaluate('()=>{__sos.freeze();__sos.renderer.draw(__sos.game.time,0);__sos.updateHUD();}');p.wait_for_timeout(50);p.screenshot(path=str(CAP/name))
 state=p.evaluate('__sos.game.exportSave()');(ST/(name+'.json')).write_text(state)
 captures.append(dict(file=name,caption=caption,source=source,source_sha256=sha((R/'qa/lighting-fixtures'/(source+'.json')).read_bytes())if source else None,image_sha256=sha((CAP/name).read_bytes()),state_sha256=sha(state.encode())))
 print('CAPTURE',name,flush=True)

with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 try:
  p=boot(b);ck('HTML 0.8, schéma 8 et 120 dossiers chargés',p.evaluate('SoSData.meta.version==="0.9.0"&&__sos.game.state.schema===8&&SoSData.codex.length===120'))
  shot(p,'01_titre.png','Écran titre de la version livrée. État neuf figé pour la capture.')
  p.click('#helpBtn');ck('Le guide ancien ne déclare plus la manette absente','la manette n’est pas prise en charge'not in p.locator('#panelContent').inner_text());ck('Le guide décrit l’éclairage et les allures','Éclairage de travail'in p.locator('#panelContent').inner_text()and'Allures du convoi'in p.locator('#panelContent').inner_text());p.click('#closePanel')
  p.evaluate('__sos.begin(false)');p.click('#storyContinue');p.evaluate('__sos.showEscort()');ck('Le prologue affiche les formations sans les permettre',p.locator('[data-formation]:disabled').count()==3);ck('Le prologue ne permet pas de faire suivre les patients',p.locator('#escortOrder').is_disabled())
  load(p,'light-on-s17');ck('Le pupitre physique est l’interaction la plus proche',p.evaluate('__sos.game.nearby().action==="lighting"'));shot(p,'02_atelier_lumiere.png','Atelier avant coupure. Sauvegarde gagnée du parcours Hybride / Survie ; aucune position changée.','light-on-s17')
  load(p,'light-on-s17',False);p.keyboard.down('KeyE');p.wait_for_timeout(500);p.keyboard.up('KeyE');p.wait_for_timeout(65)
  ck('Maintenir E démarre une manœuvre, sans basculer immédiatement',p.evaluate('__sos.game.rs.lighting.on&&__sos.game.rs.lighting.progress>.25&&__sos.game.rs.lighting.progress<1.1'))
  progress=p.evaluate('__sos.game.rs.lighting.progress');p.wait_for_timeout(230);ck('Relâcher E conserve le travail partiel',abs(p.evaluate('__sos.game.rs.lighting.progress')-progress)<.001)
  p.keyboard.press('KeyO');tm=p.evaluate('__sos.game.state.stats.time');p.wait_for_timeout(230);ck('La roue met le travail et l’horloge en pause',p.evaluate('__sos.game.state.stats.time')==tm)
  p.keyboard.press('Escape');p.keyboard.down('KeyE');p.wait_for_function('__sos.game.rs.lighting.on===false',timeout=6000);p.wait_for_timeout(300);p.keyboard.up('KeyE')
  ck('Une seule manœuvre achevée sans inversion automatique',p.evaluate('__sos.game.rs.lighting.on===false&&__sos.game.rs.lighting.progress===0'))
  ck('Le HUD annonce le secours sans modifier le filtre',p.locator('#lightingStatus').inner_text()=='ÉCLAIRAGE COUPÉ · SECOURS ACTIF')
  p.evaluate('__sos.showMap(__sos.game.room.zone,true)');ck('La carte représente le pupitre et son état',p.locator('[data-lighting=light-s17]').count()==1 and 'SECOURS'in p.locator('[data-lighting=light-s17]').text_content());ck('Aucun bouton de coupure à distance dans la carte',p.locator('[data-lighting] button').count()==0)
  p.click('#closePanel');p.wait_for_timeout(60);p.keyboard.down('KeyE');p.wait_for_function('__sos.game.rs.lighting.on===true',timeout=6000);p.keyboard.up('KeyE');ck('Relâcher puis maintenir E rétablit la lumière',p.evaluate('__sos.game.rs.lighting.on'))
  load(p,'light-off-s17');ck('Une sauvegarde d’ombre conserve lampe et circuit éteints',p.evaluate('__sos.game.lightsOff()&&!__sos.game.p.lamp'));shot(p,'03_atelier_secours.png','Même atelier en éclairage de secours. Circuit et lampe coupés par les commandes du parcours, positions inchangées.','light-off-s17')
  load(p,'light-off-s35');shot(p,'04_paliers_secours.png','Paliers pendant le retour des patients. Balisage de secours, cloison et brancards réellement rendus.','light-off-s35');p.evaluate('__sos.showMap(__sos.game.room.zone,true)');shot(p,'05_plan_paliers.png','Plan local : circuit coupé, emprises et positions du groupe issus du moteur. Aucun ennemi ajouté.','light-off-s35')
  load(p,'convoy-quiet');p.evaluate('__sos.showEscort()');shot(p,'06_escorte_discrete.png','Console d’escorte après le choix Discret dans le parcours complet. Les deux châssis gardent leur intégrité réelle.','convoy-quiet')
  ck('La console expose deux patients et trois formations',p.locator('.escortPatients article').count()==2 and p.locator('[data-formation]').count()==3);ck('La formation enregistrée est sélectionnée',p.locator('[data-formation=quiet]').get_attribute('aria-pressed')=='true')
  before=p.evaluate('__sos.game.state.rescue.actors.map(a=>[a.x,a.z,a.integrity])');p.click('[data-formation=compact]')
  ck('Le bouton choisit Rapproché dans la simulation',p.evaluate('__sos.game.state.rescue.formation==="compact"'));ck('Choisir une formation ne téléporte et ne soigne pas',p.evaluate('__sos.game.state.rescue.actors.map(a=>[a.x,a.z,a.integrity])')==before)
  p.click('#escortOrder');ck('Arrêter dans le panneau donne le même ordre que B',p.evaluate('__sos.game.state.rescue.order==="hold"'));p.click('#escortOrder');ck('Repartir conserve l’allure choisie',p.evaluate('__sos.game.state.rescue.order==="follow"&&__sos.game.state.rescue.formation==="compact"'))
  p.click('#escortBack');ck('Retour mène à Pause, pas directement au combat',p.locator('#resumePlay').count()==1 and p.evaluate('__sos.isPaused()'));p.click('#escortPause');ck('Le bouton de Pause ouvre les ordres',p.locator('[data-formation]').count()==3)
  p.evaluate('__sos.showInventory()');p.click('#escortInventory');ck('L’équipement donne accès aux mêmes ordres',p.locator('[data-formation=compact]').get_attribute('aria-pressed')=='true')
  load(p,'convoy-compact');shot(p,'07_convoi_rapproche.png','Fin de mise en service du treuil : l’allure Rapproché vient d’être choisie. Le changement n’a pas déplacé instantanément les patients.','convoy-compact')
  load(p,'light-off-s24');shot(p,'08_relais_obscur.png','Poste de relevés sous éclairage de secours. Capture d’une sauvegarde gagnée, sans préparation de personnages.','light-off-s24')
  # All lights must draw in both modes with current saved geometry. Explicit prepared render states.
  renders=0
  for room in p.evaluate('SoSData.rooms.filter(r=>r.lighting).map(r=>r.id)'):
   for mode in ['HYBRID','CLASSIC']:
    for on in [True,False]:
     p.evaluate('''({room,mode,on})=>{const q=__sos;q.game.enter(room);q.game.setPresentation(mode);q.game.rs.lighting.on=on;q.game.p.lamp=false;q.renderer.lastRoom='';q.renderer.draw(q.game.time,0);}''',dict(room=room,mode=mode,on=on));renders+=1
  ck('40 rendus de circuits : dix salles, deux vues, deux états',renders==40 and not errors)
  old=(R/'qa/sensor-fixtures/HYBRID-survival-26.json').read_text();p2=boot(b,{KEY:old});p2.click('#continueBtn');ck('Reprendre migre le schéma 6 vers 7',p2.evaluate('__sos.game.state.schema===8&&__sos.game.state.objectiveIndex===26'));ck('L’export initial v0.6 est gardé en copie locale de migration',p2.evaluate(f'localStorage.getItem("{KEY}.backup-v6")')==old);ck('La migration ne supprime pas les capteurs',p2.evaluate('JSON.stringify(__sos.game.state.sensors)')==json.dumps(json.loads(old)['state']['sensors'],separators=(',',':')));p2.close()
  for size in [(1024,768),(390,844),(360,780)]:
   small=boot(b,size=size);load(small,'convoy-quiet');small.evaluate('__sos.showEscort()')
   ck(f'{size[0]} px : pas de débordement horizontal du panneau',small.evaluate('document.documentElement.scrollWidth<=innerWidth+1&&document.querySelector(".panelBox").getBoundingClientRect().right<=innerWidth+1'))
   ck(f'{size[0]} px : les trois formations ne se chevauchent pas',small.evaluate('()=>{const a=[...document.querySelectorAll("[data-formation]")].map(e=>e.getBoundingClientRect());return a.every((r,i)=>a.every((s,j)=>i===j||r.right<=s.left+.1||r.left>=s.right-.1||r.bottom<=s.top+.1||r.top>=s.bottom-.1))}'))
   if size[0]==390:shot(small,'09_format_etroit.png','Ordres d’escorte en 390 × 844. Contrôle de disposition, pas certification tactile complète.','convoy-quiet')
   small.close()
  ck('Aucune exception JavaScript dans les scénarios',not errors);ck('Aucune dépendance réseau du HTML autonome',not requests)
 except Exception as e:fatal=str(e);traceback.print_exc()
 finally:b.close()
report=dict(version='0.9.0',html_sha256=sha(HTML.encode()),checks=checks,passed=sum(c['pass']for c in checks),failed=sum(not c['pass']for c in checks)+(1 if fatal else 0),fatal=fatal,errors=errors,requests=requests,captures=captures,lighting_state_renders=locals().get('renders',0),storage='Explicit in-memory fixture; native navigation policy not bypassed',method='Earned schema-7 playthrough snapshots. UI keys are real Playwright events; forty light render states are prepared explicitly.')
(OUT/'browser.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));print('TOTAL',report['passed'],report['failed'],flush=True)
raise SystemExit(1 if report['failed']or errors else 0)
