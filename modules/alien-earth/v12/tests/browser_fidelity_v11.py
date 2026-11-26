"""Real Chromium UI checks. Room selection/positions are controlled fixtures, not a playthrough.
Opaque-page execution follows an administrator-blocked URL attempt. No storage shim.
"""
from pathlib import Path
import json, hashlib, os, traceback
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parents[1]; CAP=R/'docs/v11/captures';CAP.mkdir(parents=True,exist_ok=True)
html=(R/'JOUER_ALIEN_EARTH_V11.html').read_text()
report={'bundleSha256':hashlib.sha256(html.encode()).hexdigest(),'transport':'set_content of standalone HTML with QA attribute, no storage mock; URL blocked separately','checks':[],'captures':[],'pageErrors':[]}
def check(name,ok,detail=''):
 report['checks'].append({'name':name,'pass':bool(ok),'detail':detail});print(('PASS ' if ok else 'FAIL ')+name,flush=True)
 if not ok:raise AssertionError(name+' '+str(detail))
with sync_playwright() as p:
 b=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium'),headless=True,args=['--no-sandbox']);report['browser']=b.version
 page=b.new_page(viewport={'width':1480,'height':1040},accept_downloads=True);page.on('pageerror',lambda e:report['pageErrors'].append(str(e)))
 def ev(s):return page.evaluate(s)
 def press(k):page.keyboard.press(k);page.wait_for_timeout(80)
 def click(s):page.locator('#panel '+s).first.click();page.wait_for_timeout(100)
 def shot(name,why):
  page.screenshot(path=str(CAP/name));report['captures'].append({'file':'docs/v11/captures/'+name,'description':why});print('CAPTURE '+name,flush=True)
 def load(id):ev(f"__EARTH_QA.loadRoom('{id}')");page.wait_for_timeout(70)
 def field_until(condition):
  page.keyboard.down('KeyE')
  try:page.wait_for_function(condition,timeout=9000)
  finally:page.keyboard.up('KeyE')
  page.wait_for_timeout(100)
 try:
  page.set_content(html.replace('<html lang="fr">','<html lang="fr" data-earth-qa="1">'),wait_until='load');page.wait_for_timeout(200)
  check('Title is actual V11 and clearly nonofficial','11.0.0' in page.inner_text('#panel') and 'non officielle' in page.inner_text('#panel'))
  check('Opaque origin storage limitation is visible','stockage local' in page.inner_text('#panel'));shot('v11-01-titre.png','Écran titre du HTML livré. Aucun état de partie préparé ; avertissement de stockage opaque conservé.')
  click('[data-act="fidelity"]');check('Registry lists all 70 delivered locations',page.locator('.reference-places article').count()==70)
  check('Registry never enables travel before starting',page.locator('.reference-places [data-act="track"]:enabled').count()==0)
  click('[data-tab="cast"]');check('All twenty-five distinct character canvases rendered',page.locator('[data-portrait]').count()==25)
  check('NPC reference mapping separates Curly from Wendy',ev("__EARTH_QA.data.speakerRoles.Curly==='curly' && __EARTH_QA.data.speakerRoles.Kirsh==='kirsh'"))
  shot('v11-02-silhouettes.png','Registre des silhouettes, ouvert depuis le titre. Les portraits sont les rendus de jeu ; pas des photos ni seize personnages jouables.')
  click('[data-tab="gear"]');check('Five referenced weapons have separate silhouettes',page.locator('[data-weapon]').count()==5)
  check('Equipment distinguishes nonplayable, nonmaneuverable and inventions','non jouable' in page.inner_text('#panel') and 'non maniable' in page.inner_text('#panel') and 'inventions' in page.inner_text('#panel'))
  shot('v11-03-dotations.png','Registre des armes : état d’intégration explicite. La lecture ne donne aucun objet au personnage.')
  click('[data-tab="limits"]');check('Unfinished 1:1 scope and sources are visible',page.locator('#panel a[href]').count()>=18 and 'pas une certification' in page.inner_text('#panel'))
  press('Escape');click('[data-act="new"]');click('[data-act="confirmNew"]');click('[data-act="start"]')
  check('New campaign begins unarmed without optional unlocks',ev("__EARTH_QA.engine().weaponId==='none' && !__EARTH_QA.state().fidelityGear.ksgOwned"))
  load('R05');check('Joe starts on sourced MCS-X',ev("__EARTH_QA.engine().weaponId==='mcsx'"));press('Digit6');check('Key6 selects distinct Maxim 9 sidearm',ev("__EARTH_QA.engine().weaponId==='maxim9'"));press('Digit6');check('Key6 returns to MCS-X',ev("__EARTH_QA.engine().weaponId==='mcsx'"))
  for room in ev('__EARTH_QA.data.rooms.map(r=>r.id)'):
   load(room);ev('__EARTH_QA.freeze()');page.wait_for_timeout(25)
   check(room+' loads and renders its actual room label without exceptions',ev('__EARTH_QA.state().room')==room and not report['pageErrors'])
  for room,name,x,z in [('R63','v11-04-medbay-one.png',1100,125),('R64','v11-05-engine-room.png',1250,125),('R65','v11-06-containment-room.png',1150,125),('R66','v11-07-lobby.png',1100,125),('R67','v11-08-atrium.png',1200,125),('R68','v11-09-talking-room.png',950,125),('R69','v11-10-medical-bay.png',1100,125),('R70','v11-11-secure-lab.png',1250,125)]:
   load(room);ev(f'__EARTH_QA.place({x},{z});__EARTH_QA.freeze()');page.wait_for_timeout(100)
   shot(name,f'Inspection du lieu {room} : pièce et position sélectionnées pour cadrer le rendu réel. Aucun trajet complet ni plan officiel revendiqué.')
  load('R59');press('Tab')
  check('Maginot schematic contains all fourteen places',page.locator('.map-room').count()==14, page.locator('#panel').inner_text()[:100])
  shot('v11-12-carte-maginot.png','Carte réelle du chapitre Maginot à onze lieux ; plan de connectivité schématique, pas plan métrique de tournage.')
  press('Escape');load('R57');press('Tab');check('Neverland first chapter contains twelve places',page.locator('.map-room').count()==12)
  press('Escape');load('R05');press('Tab');check('Unextended sector still includes seven places',page.locator('.map-room').count()==7)
  press('Escape');load('R62');ev('(()=>{const e=__EARTH_QA.engine();__EARTH_QA.place(e.room.task.x,e.room.task.z);})()')
  page.keyboard.down('KeyE');page.wait_for_timeout(400);page.keyboard.up('KeyE');page.wait_for_timeout(150)
  check('Brief armory interaction does not grant the weapon',ev('!__EARTH_QA.state().fidelityGear.ksgOwned'))
  field_until('__EARTH_QA.state().fidelityGear.ksgOwned')
  check('Physical armory hold grants exactly six arc and three foam charges',ev('__EARTH_QA.state().fidelityGear.arc===6 && __EARTH_QA.state().fidelityGear.foam===3'))
  press('Digit6');check('Key6 switches to actual acquired KSG-AL',ev("__EARTH_QA.engine().weaponId==='ksg-al'"))
  # Actual keyboard shot on a controlled position of an existing room resident; not a natural encounter traversal.
  ev("(()=>{const e=__EARTH_QA.engine();e.enter('R19');__EARTH_QA.events();const a=e.enemies[0];__EARTH_QA.place(520,125);Object.assign(a,{x:675,z:125,stun:0});e.player.facing=1;e.fireCooldown=0;})()")
  before=ev('__EARTH_QA.state().player.ammo');press('KeyJ')
  check('Real J arc spends only special charge',ev('__EARTH_QA.state().fidelityGear.arc===5') and ev('__EARTH_QA.state().player.ammo')==before)
  check('Existing resident receives actual temporary stun',ev('__EARTH_QA.engine().enemies[0].stun>3'))
  page.wait_for_timeout(1000);press('Digit7');check('Real7 applies foam to stunned resident without capture reward',ev('__EARTH_QA.state().fidelityGear.foam===2 && Object.keys(__EARTH_QA.state().fidelityGear.foamUntil).length===1'))
  ev('__EARTH_QA.freeze()');shot('v11-13-mousse.png','Dotation acquise avec E à l’armurerie. Pour l’essai, Morrow et un habitant existant sont replacés sur un axe libre dans R19 ; J puis 7 produisent l’étourdissement et la mousse. Ce n’est pas une capture en enceinte.')
  ev('__EARTH_QA.resume();__EARTH_QA.pause()')
  with page.expect_download() as dl:click('[data-act="export"]')
  path=R/'docs/v11/QA_EXPORT_V11.json';dl.value.save_as(str(path));raw=json.loads(path.read_text())
  check('Downloaded save carries schema11 and finite gear reserves',raw['schema']==11 and raw['fidelityGear']['arc']==5 and raw['fidelityGear']['foam']==2)
  page.locator('#importFile').set_input_files(str(path));page.wait_for_timeout(220)
  check('Actual file chooser reimports acquired gear without refill',ev('__EARTH_QA.state().fidelityGear.arc===5 && __EARTH_QA.state().fidelityGear.ksgOwned'))
  page.locator('#importFile').set_input_files(str(R/'data/qa-export-v9.json'));page.wait_for_timeout(220)
  check('Actual V9 export imports without free optional gear',ev('__EARTH_QA.state().schema===11 && !__EARTH_QA.state().fidelityGear.ksgOwned'))
  load('R58');ev('(()=>{const r=__EARTH_QA.engine().room;__EARTH_QA.place(r.task.x,r.task.z);})()');field_until('__EARTH_QA.state().fidelityGear.observedCutter')
  press('Digit6');check('Observing massicot does not arm prologue Wendy',ev("__EARTH_QA.engine().weaponId==='none'"))
  press('Digit5');click('[data-tab="cast"]');t=ev('__EARTH_QA.state().playSeconds');page.wait_for_timeout(220);check('Registry pauses live simulation',ev('__EARTH_QA.state().playSeconds')==t)
  page.set_viewport_size({'width':390,'height':844});page.wait_for_timeout(200)
  check('Cast registry fits390px without horizontal overflow',ev('document.documentElement.scrollWidth<=390 && document.getElementById("panel").scrollWidth<=document.getElementById("panel").clientWidth+1'))
  shot('v11-14-mobile.png','Galerie de silhouettes à 390 × 844. Contrôle du navigateur, pas essai sur un appareil mobile physique.')
  page.set_viewport_size({'width':1480,'height':1040});press('Escape')
  # Return-trip using actual door actions. Only prereq acquisition/starting position are fixture setup.
  load('R02');ev("(()=>{const e=__EARTH_QA.engine();e.state.completed.push('AE-02');const d=e.room.portals.find(p=>p.to==='R57');__EARTH_QA.place(d.x,d.z);})()")
  press('KeyE');check('Actual E crosses rear-wall threshold to dormitory',ev("__EARTH_QA.state().room==='R57'"))
  ev("(()=>{const e=__EARTH_QA.engine(),d=e.room.portals.find(p=>p.to==='R02');__EARTH_QA.place(d.x,d.z);})()")
  press('KeyE');check('Reciprocal door returns to source room without task completion',ev("__EARTH_QA.state().room==='R02' && !__EARTH_QA.state().completed.includes('AE-57')"))
  check('No browser page errors throughout all checks',not report['pageErrors'],str(report['pageErrors']))
 except Exception as exc:
  report['exception']=traceback.format_exc();print(report['exception']);page.screenshot(path=str(CAP/'failure.png'))
 finally:
  report['passed']=sum(c['pass'] for c in report['checks']);report['total']=len(report['checks']);report['ok']=not report.get('exception') and not report['pageErrors']
  (R/'docs/v11/QA_BROWSER_FIDELITY_V11.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));b.close()
if not report['ok']:raise SystemExit(1)
print(f"SUCCESS {report['passed']}/{report['total']}")
