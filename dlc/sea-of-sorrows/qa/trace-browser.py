#!/usr/bin/env python3
"""Exact v0.5 HTML; explicit memory storage because native local navigation is blocked.
Main photographs: unmodified earned continuous-run saves, frozen for exposure.
Separate live keyboard/UI checks do not impose actor coordinates or health.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json,hashlib,sys
ROOT=Path(__file__).resolve().parents[1];HTML=(ROOT/'MER_DES_CHAGRINS_JOUABLE.html').read_text();KEY='tantalus.dlc.sea-of-sorrows.v1'
CAP=ROOT/'reports/captures-v050';CAP.mkdir(exist_ok=True);ST=ROOT/'reports/capture-states-v050';ST.mkdir(exist_ok=True)
checks=[];captures=[];errors=[];requests=[]
def ck(name,value):
 checks.append({'name':name,'pass':bool(value)});print(('PASS 'if value else'FAIL ')+name,flush=True)
def raw(name):return (ROOT/f'qa/trace-fixtures/{name}.json').read_text()
def boot(b,seed=None,frozen=False,width=1440,height=900):
 p=b.new_page(viewport={'width':width,'height':height},device_scale_factor=1);p.set_default_timeout(8000)
 p.on('pageerror',lambda e:errors.append(str(e)));p.on('request',lambda r:requests.append(r.url))
 p.evaluate('''({seed,frozen})=>{window.__SOS_QA__=true;window.__storage=new Map(Object.entries(seed));Object.defineProperty(window,'localStorage',{value:{getItem:k=>__storage.get(k)??null,setItem:(k,v)=>__storage.set(k,String(v)),removeItem:k=>__storage.delete(k)}});if(frozen)window.requestAnimationFrame=()=>0;}''',{'seed':seed or {},'frozen':frozen});p.set_content(HTML,wait_until='load');return p
def resume(p,name):
 p.evaluate('''raw=>{const q=__sos;q.game.importSave(raw);q.closeAll();q.game.drainEvents();q.updateHUD();q.renderer.lastRoom='';q.renderer.draw(q.game.time,0);}''',raw(name))
def shot(p,name,description,source=None):
 p.screenshot(path=str(CAP/name));state=p.evaluate('__sos.game.exportSave()');(ST/(name+'.json')).write_text(state)
 captures.append({'file':name,'description':description,'provenance':'UI or frozen render from earned continuous-run save; no actor repositioning'if source else'title/UI','source_save':source,'source_sha256':hashlib.sha256(raw(source).encode()).hexdigest()if source else None,'image_sha256':hashlib.sha256((CAP/name).read_bytes()).hexdigest(),'state_sha256':hashlib.sha256(state.encode()).hexdigest()});print('CAPTURE '+name,flush=True)
fatal=None
with sync_playwright() as w:
 b=w.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 try:
  p=boot(b,frozen=True)
  ck('Version 0.8, schéma 8 et 120 dossiers chargés',p.evaluate('SoSData.meta.version==="0.9.0"&&__sos.game.state.schema===8&&SoSData.codex.length===120'))
  ck('Aucun point de repli inventé au premier démarrage',p.locator('#recoveryBtn').is_disabled())
  shot(p,'01_titre.png','Écran titre de la v0.5.0 ; points de repli désactivés tant qu’aucune entrée n’est enregistrée.')
  p.click('#helpBtn');text=p.locator('#panelContent').inner_text();ck('Guide : poursuite, trois disciplines de tir, repli et journal',all(x in text for x in ['traque','ne pas tirer','trois dernières','Journal tactique']));p.close()
  old=(ROOT/'qa/rearguard-fixtures/HYBRID-survival-14.json').read_text()
  p=boot(b,seed={KEY:old,'tantalus.main.sentinel':'KEEP'},frozen=True);p.click('#continueBtn')
  ck('Reprendre migre une vraie sauvegarde 0.4 vers 0.5',p.evaluate('__sos.game.state.schema===8&&__sos.game.state.objectiveIndex===14'))
  ck('Copie backup-v4 identique à l’ancien fichier',p.evaluate('k=>localStorage.getItem(k)',KEY+'.backup-v4')==old)
  ck('La sauvegarde du jeu hôte n’a pas changé',p.evaluate('localStorage.getItem("tantalus.main.sentinel")')=='KEEP')
  ck('Reprendre offre un point de repli valide',p.evaluate('__sos.readRecoveries().length===1'));p.close()
  # Live game starts at an earned pursued departure, not at a constructed enemy arrangement.
  p=boot(b);resume(p,'trace-departure');q=p.evaluate('__sos.game.state.pursuit.pending[0]');ck('Une poursuite authentique est en cours à la reprise',q is not None)
  start=p.evaluate('q=>__sos.game.state.roomStates[q.from].enemies.find(e=>e.id===q.id).x',q)
  p.keyboard.down('ArrowRight');p.wait_for_timeout(700);p.keyboard.up('ArrowRight')
  after=p.evaluate('q=>__sos.game.state.roomStates[q.from].enemies.find(e=>e.id===q.id)?.x',q)
  ck('La créature progresse hors champ pendant un déplacement clavier',after is not None and after!=start)
  p.wait_for_function('__sos.game.pursuitSignals().length>0',timeout=8000)
  ck('Le signal visible provient du seuil réellement atteint','GRIFFES AU SEUIL' in p.locator('#pursuitStatus').inner_text())
  ck('Le signal n’ajoute pas un faux contact au détecteur',p.evaluate('__sos.game.trackerContacts().length===0'))
  p.keyboard.press('Escape');timer=p.evaluate('__sos.game.state.pursuit.pending[0].remaining');p.wait_for_timeout(350)
  ck('Pause fige le franchissement annoncé',p.evaluate('__sos.game.state.pursuit.pending[0].remaining')==timer)
  p.click('#journalPause');ck('Le journal contient le bruit entendu au seuil','griffes' in p.locator('#panelContent').inner_text())
  ck('Le journal affiche des faits, pas des coordonnées ennemies',p.locator('.fieldJournal article').count()>0 and 'enemyId'not in p.locator('#panelContent').inner_text())
  p.keyboard.press('Escape');p.wait_for_function('__sos.game.state.stats.pursuitArrivals>=1',timeout=6000)
  ck('L’arrivée ajoute la même identité dans la salle courante',p.evaluate('q=>__sos.game.rs.enemies.some(e=>e.id===q.id)',q))
  ck('L’ennemi a quitté la population de la salle source',not p.evaluate('q=>__sos.game.state.roomStates[q.from].enemies.some(e=>e.id===q.id)',q))
  ck('L’arrivée ne produit pas de doublon mondial',p.evaluate('q=>Object.values(__sos.game.state.roomStates).flatMap(r=>r.enemies).filter(e=>e.id===q.id).length',q)==1)
  p.keyboard.press('Escape');save=p.evaluate('__sos.game.exportSave()');p.evaluate('s=>__sos.game.importSave(s)',save)
  ck('Une arrivée suivie d’un import reste valide',p.evaluate('__sos.game.validate(__sos.game.state)'))
  p.close()
  p=boot(b,frozen=True);resume(p,'trace-before');before=p.evaluate('__sos.game.state.companion.order')
  ck('La retraite gagnée a utilisé la consigne ne pas tirer',p.evaluate('__sos.game.state.companion.fireMode==="hold"'))
  p.keyboard.press('KeyN');ck('N : ne pas tirer → riposte',p.evaluate('__sos.game.state.companion.fireMode==="return"'))
  p.keyboard.press('KeyN');ck('N : riposte → feu libre',p.evaluate('__sos.game.state.companion.fireMode==="free"'))
  p.keyboard.press('KeyN');p.evaluate('__sos.updateHUD()');ck('N : feu libre → ne pas tirer, visible dans le HUD','ne tire pas'in p.locator('#companionText').inner_text())
  ck('Le cycle N ne modifie pas l’ordre de déplacement',p.evaluate('__sos.game.state.companion.order')==before)
  p.keyboard.press('KeyU');ck('U ouvre le journal et met la partie en pause',p.locator('#panelTitle').inner_text()=='Journal de terrain'and p.evaluate('__sos.isPaused()'))
  p.close()
  # Valid recovery list from three distinct actual earned saves, stored separately.
  entries=[{'data':raw(n)} for n in ['trace-warning','trace-before','closed-gate-s17']]
  p=boot(b,seed={KEY:'CORRUPTED SAVE',KEY+'.recovery':json.dumps(entries)},frozen=True)
  ck('Une sauvegarde courante corrompue ne détruit pas les replis',p.locator('#recoveryBtn').is_enabled())
  p.click('#continueBtn');ck('La corruption est annoncée sans lancer une nouvelle partie','illisible'in p.locator('#saveWarning').inner_text())
  p.click('#recoveryBtn');ck('Trois points distincts sont proposés',p.locator('[data-recover]').count()==3)
  shot(p,'07_replis.png','Les trois points de repli proviennent de vraies sauvegardes gagnées. La sauvegarde courante est volontairement corrompue pour vérifier la récupération ; aucun acteur n’est déplacé.')
  p.click('[data-recover="0"]');ck('Restaurer exige une confirmation visible',p.locator('#confirmRecovery').is_visible())
  ck('Choisir seul n’a pas écrasé la sauvegarde',p.evaluate('localStorage.getItem("'+KEY+'")')=='CORRUPTED SAVE')
  p.click('#cancelRecovery');ck('Annuler revient à la liste sans restauration',p.locator('[data-recover]').count()==3)
  p.click('[data-recover="0"]');p.click('#confirmRecovery')
  ck('Restaurer reprend le véritable ticket de poursuite',p.evaluate('__sos.game.state.pursuit.pending.length===1&&__sos.game.room.id==="s43"'))
  ck('La restauration ne laisse pas le titre masquer le jeu',p.locator('#menu.open').count()==0 and p.locator('#panel.open').count()==0)
  ck('La sauvegarde remplacée est désormais un export valide',p.evaluate('JSON.parse(localStorage.getItem("'+KEY+'")).schema===8'))
  for name in ['trace-arrived','trace-secured','HYBRID-survival-26']:
   resume(p,name);p.evaluate('__sos.recordRecovery()')
  ck('La rotation conserve trois points au maximum',p.evaluate('__sos.readRecoveries().length')==3)
  resume(p,'trace-arrived')
  p.evaluate("()=>{localStorage.setItem=()=>{throw new Error('storage test failure')};}");p.evaluate('__sos.recordRecovery()')
  ck('L’échec d’écriture des replis est signalé', 'indisponible'in p.locator('#toast').inner_text())
  p.close()
  p=boot(b,seed={KEY+'.recovery':json.dumps([None,{'data':'bad'},{}])},frozen=True)
  ck('Les replis invalides sont ignorés sans erreur JavaScript',p.locator('#recoveryBtn').is_disabled());p.close()
  # Photography uses earned saves only, with no current-room/position/health injection.
  for key,file,desc in [
   ('trace-before','02_retraite.png','Tranchée de fouille : Decker rejoint le seuil du belvédère ; Manning a reçu ne pas tirer. Sauvegarde du parcours continu Hybride / Survie.'),
   ('trace-warning','03_seuil.png','Le même adulte atteint le seuil dans la salle quittée. Le belvédère reçoit un avertissement avant son entrée. Sauvegarde gagnée, rendu figé.'),
   ('trace-arrived','04_arrivee.png','L’adulte a franchi le seuil : identité transférée depuis la tranchée, sans nouvelle apparition artificielle. Sauvegarde gagnée, acteurs non replacés.'),
   ('trace-secured','05_securise.png','Après la retraite, le groupe sécurise le belvédère. La créature vaincue n’existe plus dans la tranchée et ne reviendra pas à chaque porte.'),
   ('closed-gate-s35','08_convoi.png','Les deux brancards aux paliers, dans le parcours complet de cette version. Les contrôles de seuil exigent aussi un trajet dégagé.')]:
   p=boot(b,frozen=True);resume(p,key);shot(p,file,desc,key);p.close()
  p=boot(b,frozen=True);resume(p,'trace-secured');p.keyboard.press('KeyU');shot(p,'06_journal.png','Journal réel du parcours : ordres de Manning, bruit du seuil et présence arrivée. Aucun ajout manuel au journal.','trace-secured');p.close()
  p=boot(b,seed={KEY:raw('HYBRID-survival-33')},frozen=True);p.click('#continueBtn')
  ck('Le bilan terminé conserve le franchissement réellement subi',p.evaluate('__sos.game.state.finished&&__sos.game.state.stats.pursuitArrivals===1')and'Franchissements ennemis : 1'in p.locator('#panelContent').inner_text())
  shot(p,'09_bilan.png','Bilan réel du parcours Hybride / Survie : 33 objectifs, 46 salles et une retraite réellement poursuivie.','HYBRID-survival-33');p.close()
  p=boot(b,frozen=True,width=960,height=720);resume(p,'trace-warning')
  ck('Avertissement et HUD accessibles en 960 × 720 sans débordement global',p.locator('#pursuitStatus').is_visible()and p.evaluate('document.documentElement.scrollWidth<=innerWidth'))
  shot(p,'10_format_960.png','Avertissement au seuil en 960 × 720, depuis la même sauvegarde gagnée. Contrôle de disposition, pas certification mobile.','trace-warning');p.close()
  ck('Aucune exception JavaScript pendant cette suite',not errors)
  ck('Le HTML autonome n’a demandé aucune ressource réseau',not requests)
 except Exception as e:
  fatal=str(e);errors.append(fatal);print('FATAL',fatal,flush=True)
 finally:b.close()
report={'version':'0.9.0','html_sha256':hashlib.sha256(HTML.encode()).hexdigest(),'checks':checks,'passed':sum(c['pass']for c in checks),'failed':sum(not c['pass']for c in checks)+(1 if fatal else 0),'captures':captures,'errors':errors,'requests':requests,'storage':'explicit memory fixture; native file and localhost blocked; no native persistence certification','method':'Earned continuous-run saves; live keyboard controls and unmodified frozen photographs are distinguished.'}
(ROOT/'reports/trace-browser.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));print('RESULT',report['passed'],report['failed']);sys.exit(bool(report['failed']))
