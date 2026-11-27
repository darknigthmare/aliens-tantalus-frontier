"""Current browser qualification. Public buttons/keys and ordinary save import/export only.
A: baseline/migration/boarding. B: driving & persistence. C: service/threat/short screens.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json,sys,hashlib,traceback,time
R=Path(__file__).resolve().parents[1];PART=(sys.argv[1] if len(sys.argv)>1 else 'A').upper()
OUT=R/'docs'/f'BROWSER_V08{PART}.json'
report={'version':'0.8.0-candidate.1','part':PART,'htmlSHA256':hashlib.sha256((R/'JOUER.html').read_bytes()).hexdigest(),'cases':[],'captures':[],'errors':[],
 'method':'Exact standalone via set_content after HTTP was blocked (SMOKE_V08.json). Public keyboard/buttons, ordinary file import, real downloads. No live state/health/objective/clock writes. Localized prepared fixtures are labelled.'}
setup='New game'
def ok(name,**kw):report['cases'].append({'name':name,'passed':True,**kw});print('PASS',name,flush=True)
def read(q,expr='ROP_APP.simulation.s'):return q.evaluate(expr)
def wait(q,expr,timeout=24000):q.wait_for_function(expr,timeout=timeout)
def simwait(q,t):
 end=read(q,'ROP_APP.simulation.s.elapsed')+t
 q.wait_for_function('t=>ROP_APP.simulation.s.elapsed>=t||ROP_APP.simulation.s.status!=="playing"',arg=end,timeout=max(24000,int(t*7000)))
def load(q,name,real=False):
 global setup
 f=Path(name) if real else R/'tests/fixtures/v08'/f'{name}.json';setup=('Actual exported JSON: ' if real else 'Localized prepared fixture: ')+f.name
 q.locator('#import-file').set_input_files(str(f));q.get_by_role('button',name='CHARGER',exact=True).click();q.get_by_role('button',name='REPRENDRE LE PARCOURS',exact=True).click();wait(q,'!ROP_APP.modal&&ROP_APP.started')
def shot(q,name,text):
 q.screenshot(path=str(R/'captures'/name),timeout=15000)
 report['captures'].append({'file':'captures/'+name,'description':text,'setup':setup,'state':read(q,'({room:ROP_APP.simulation.s.room,chapter:ROP_APP.simulation.s.chapter,character:ROP_APP.simulation.s.character,mode:ROP_APP.simulation.s.mode,elapsed:ROP_APP.simulation.s.elapsed,mobility:ROP_APP.simulation.s.mobility,modal:ROP_APP.modal})')})
def panel(q):q.keyboard.press('Digit5');wait(q,'ROP_APP.modal==="rover"')
def action(q,a,id=None):
 loc=q.locator(f'[data-rover-action="{a}"]'+(f'[data-station="{id}"]' if id else ''));loc.click();wait(q,'!ROP_APP.modal')
def board(q):
 panel(q);action(q,'board');wait(q,'ROP_APP.simulation.s.mobility.rover.driver!==null')
def export(q,name):
 if not read(q,'ROP_APP.modal'):q.keyboard.press('Escape')
 with q.expect_download(timeout=12000) as event:q.get_by_role('button',name='EXPORTER',exact=True).click()
 f=R/'captures'/name;event.value.save_as(str(f));return f,json.loads(f.read_text())
def boot(q):
 q.on('pageerror',lambda e:report['errors'].append(str(e)))
 q.set_content((R/'JOUER.html').read_text(),wait_until='load');wait(q,'!!window.ROP_APP&&!!window.ROP_MOBILITY')
 assert read(q,'ROP_DATA.manifest.version')==report['version']
def brake(q):
 q.keyboard.up('KeyD');q.keyboard.up('KeyQ');q.keyboard.down('Space');wait(q,'Math.abs(ROP_APP.simulation.s.mobility.rover.speed)<.1');q.keyboard.up('Space')
try:
 with sync_playwright() as p:
  browser=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
  q=browser.new_page(viewport={'width':1600,'height':900},device_scale_factor=1);q.set_default_timeout(12000);boot(q)
  ok('Current HTML and new module load without external assets')
  if PART=='A':
   assert 'VERSION JOUABLE 0.8' in q.locator('.release').inner_text();ok('Title version 0.8 visible');shot(q,'01-title-v08.png','Menu initial de la version courante')
   q.locator('#difficulty').select_option('story');q.locator('#start').click();q.get_by_role('button',name='PRENDRE LE CONTRÔLE',exact=True).click()
   target=read(q,"ROP_APP.simulation.room.objects.find(o=>o.id==='welcome').x")
   q.keyboard.down('KeyD');q.wait_for_function('x=>ROP_APP.simulation.s.player.x>=x-55',arg=target);q.keyboard.up('KeyD');q.keyboard.press('KeyE');wait(q,'ROP_APP.simulation.s.objective===1');ok('First principal objective played using walking and E');shot(q,'02-first-task-v08.png','Premier objectif accompli au clavier, depuis une partie neuve')
   q.keyboard.press('KeyI');assert q.locator('[data-kit]').count()==7;assert q.get_by_role('button',name='TRACTEUR · 5',exact=True).is_visible();ok('Equipment retains seven on-foot actions and adds explicit rover access')
   q.get_by_role('button',name='TRACTEUR · 5',exact=True).click();assert q.locator('[data-rover-action="board"]').is_disabled();assert 'Préparez le tracteur' in q.locator('#dialog-content').inner_text();ok('No premature vehicle or remote board from initial room');q.keyboard.press('Escape')
   old=R/'tests/fixtures/real-v07-save.json';before=json.loads(old.read_text())['state'];load(q,old,True);after=read(q)
   assert after['chapter']==before['chapter'] and after['player']['ammo']==before['player']['ammo'];assert [(t['enemy']['id'],t['enemy']['hp']) for t in after['ducts']['transits']]==[(t['enemy']['id'],t['enemy']['hp']) for t in before['ducts']['transits']];assert after['mobility']['stats']['boarded']==0;ok('Actual 0.7 in-duct export imports with identity and progress preserved, no invented driving')
   load(q,'parked');q.keyboard.press('KeyC');q.keyboard.press('Digit5');assert not q.locator('[data-rover-action="board"]').is_disabled();ok('Local boarding command enabled near the actual vehicle')
   t=read(q,'ROP_APP.simulation.s.elapsed');q.wait_for_timeout(350);assert read(q,'ROP_APP.simulation.s.elapsed')==t;ok('Cabin menu pauses reading, not an active manipulation');shot(q,'03-cabin-panel-v08.png','Dossier de cabine ouvert à portée du tracteur')
   action(q,'board');wait(q,'ROP_APP.simulation.s.mobility.rover.driver!==null');assert read(q,'ROP_APP.simulation.s.mobility.stats.boarded')==1;assert q.locator('#rover-hud').is_visible();assert not q.locator('#hud').is_visible();assert not read(q,'ROP_APP.simulation.s.player.crouch');q.keyboard.down('KeyD');wait(q,'ROP_APP.simulation.s.mobility.rover.speed>80');brake(q);ok('Timed boarding clears crouch input; cabin HUD replaces combat HUD and throttle works');shot(q,'04-boarded-v08.png','Anne en cabine après la manœuvre de montée')
   q.keyboard.press('KeyL');assert read(q,'ROP_APP.simulation.s.mobility.rover.lights');assert not read(q,'ROP_APP.simulation.s.systems.flashlight');ok('L operates vehicle headlights, not pocket light')
   q.keyboard.down('KeyF');simwait(q,.25);q.keyboard.up('KeyF');assert read(q,'ROP_APP.simulation.s.stats.shots')==0;assert read(q,'ROP_APP.simulation.s.mobility.stats.horns')==1;ok('F uses horn without ammunition or bullets')
   panel(q);action(q,'exit');wait(q,'!ROP_APP.simulation.s.mobility.rover.driver');wait(q,'document.documentElement.dataset.driving==="false"');assert q.locator('#hud').is_visible();ok('Stopped descent restores on-foot controls and combat HUD')
   load(q,'parked');panel(q);action(q,'board');q.keyboard.down('KeyQ');simwait(q,1);q.keyboard.up('KeyQ');assert not read(q,'ROP_APP.simulation.s.mobility.rover.driver');assert read(q,'ROP_APP.simulation.s.mobility.stats.boarded')==0;ok('Walking away interrupts boarding without false boarded state')
  elif PART=='B':
   load(q,'parked');board(q);base=read(q,'ROP_APP.simulation.s.mobility.rover.battery');q.keyboard.down('KeyD');wait(q,'ROP_APP.simulation.s.mobility.rover.speed>250');q.keyboard.press('Digit5');q.keyboard.up('KeyD')
   assert q.locator('[data-rover-action="exit"]').is_disabled();assert 'Immobilisez' in q.locator('[data-rover-action="exit"]').inner_text();ok('Exit denied while moving, with an explicit instruction');q.keyboard.press('Escape');brake(q)
   assert read(q,'ROP_APP.simulation.s.mobility.rover.battery')<base;ok('Driving consumes rover battery and brakes stop inertia')
   q.keyboard.press('KeyL');q.keyboard.down('KeyD');wait(q,'ROP_APP.simulation.s.mobility.rover.x>1600');q.keyboard.up('KeyD');q.keyboard.press('Escape')
   shot(q,'05-driving-v08.png','Tracteur déplacé au clavier sur la piste ; pause ouverte pour conserver un export en mouvement')
   f,env=export(q,'browser-v08-driving.json');v=env['state']['mobility']['rover'];assert v['driver']=='anne' and abs(v['speed'])>50;ok('Real downloaded JSON contains a moving vehicle',speed=v['speed'])
   load(q,f,True);now=read(q,'ROP_APP.simulation.s.mobility');assert now['stats']['boarded']==env['state']['mobility']['stats']['boarded'];assert now['rover']['driver']=='anne';ok('Downloaded moving vehicle imports without duplicate boarding or replenishment');brake(q)
   q.keyboard.down('KeyD');wait(q,'ROP_APP.simulation.s.mobility.rover.x>3250');brake(q)
   x=read(q,'ROP_APP.simulation.s.mobility.rover.x')
   if x<3390:q.keyboard.down('KeyD');wait(q,'ROP_APP.simulation.s.mobility.rover.x>3390');brake(q)
   assert read(q,'ROP_APP.simulation.s.mobility.stats.distance')>2000;ok('Physical keyboard driving traverses the whole road')
   panel(q);assert not q.locator('[data-drive-to="plateau"]').is_disabled();q.locator('[data-drive-to="plateau"]').click();wait(q,'ROP_APP.simulation.s.room==="plateau"');assert read(q,'ROP_APP.simulation.s.mobility.rover.room')=='plateau';assert read(q,'ROP_APP.simulation.s.mobility.stats.crossings')==1;ok('Stopped real road portal transfers vehicle and driver exactly once')
   q.keyboard.down('KeyD');wait(q,'ROP_APP.simulation.s.mobility.rover.x>750');brake(q);simwait(q,.25);shot(q,'06-plateau-driving-v08.png','Arrivée sur le plateau après conduite et passage par la commande routière')
   before=read(q,'ROP_APP.simulation.s.objective');assert before==2;ok('Driving has not remotely completed the beacon objective')
   panel(q);action(q,'exit');wait(q,'!ROP_APP.simulation.s.mobility.rover.driver');wait(q,'document.documentElement.dataset.driving==="false"');shot(q,'07-parked-on-foot-v08.png','Descente sur un appui libre ; le tracteur reste stationné')
   x=read(q,'ROP_APP.simulation.s.mobility.rover.x');q.keyboard.down('KeyQ');simwait(q,.6);q.keyboard.up('KeyQ');assert read(q,'ROP_APP.simulation.s.mobility.rover.x')==x;ok('Walking away leaves the vehicle in place')
   q.keyboard.press('Tab');q.get_by_role('button',name='PIÈCE ACTUELLE',exact=True).click();assert 'Tracteur stationné' in q.locator('#dialog-content').inner_text();assert 'Dépôt de prospection' in q.locator('#dialog-content').inner_text();ok('Local map shows actual parked rover and service station');q.keyboard.press('Escape')
   load(q,'classic');board(q);z=read(q,'ROP_APP.simulation.s.mobility.rover.z');q.keyboard.down('KeyD');q.keyboard.down('KeyZ');simwait(q,.7);q.keyboard.up('KeyZ');brake(q);assert read(q,'ROP_APP.simulation.s.mobility.rover.z')==z==.7;ok('Classic driving stays on its lateral plane')
   panel(q);action(q,'exit');wait(q,'!ROP_APP.simulation.s.mobility.rover.driver');assert read(q,'ROP_APP.simulation.s.player.z')==.7;assert read(q,'ROP_APP.simulation.s.mobility.rover.z')==.42;ok('Classic parking frees the front walking strip without enclosing the player')
  else:
   load(q,'station');panel(q);assert not q.locator('[data-rover-action="repair"]').is_disabled();action(q,'repair');wait(q,'ROP_APP.simulation.s.mobility.stations["service-road"].repairs===0');assert read(q,'ROP_APP.simulation.s.mobility.rover.hp')==93;ok('Real timed roadside repair consumes one finite kit and grants at most 55')
   panel(q);action(q,'charge');wait(q,'ROP_APP.simulation.s.mobility.stations["service-road"].charges===0');assert read(q,'ROP_APP.simulation.s.mobility.rover.battery')==90;ok('Real timed recharge consumes one finite accumulator and grants at most 65')
   f,env=export(q,'browser-v08-serviced.json');assert env['state']['mobility']['stations']['service-road']=={'repairs':0,'charges':0};load(q,f,True);assert read(q,'ROP_APP.simulation.s.mobility.rover.hp')==93;panel(q);assert q.locator('[data-rover-action="repair"]').is_disabled();assert q.locator('[data-rover-action="charge"]').is_disabled();ok('Actual serviced export/import preserves damage and empty stores');shot(q,'08-finite-service-v08.png','Borne de service après réparation, recharge et véritable export/import')
   load(q,'station');panel(q);action(q,'repair');q.keyboard.down('KeyQ');simwait(q,1);q.keyboard.up('KeyQ');assert read(q,'ROP_APP.simulation.s.mobility.stations["service-road"].repairs')==1;assert read(q,'ROP_APP.simulation.s.mobility.rover.hp')==38;ok('Interrupted repair does not consume finite supply')
   load(q,'threat');wait(q,'ROP_APP.simulation.s.mobility.rover.hp<100',30000);assert read(q,'ROP_APP.simulation.s.player.hp')==100;shot(q,'09-hull-under-attack-v08.png','Scène de menace préparée : un adulte attaque le châssis plutôt que de traverser sa collision');ok('An existing adult can reach and damage the occupied hull while driver HP initially stays intact')
   f,env=export(q,'browser-v08-damaged-hull.json');assert env['state']['mobility']['rover']['hp']<100;load(q,f,True);assert read(q,'ROP_APP.simulation.s.mobility.rover.hp')<=env['state']['mobility']['rover']['hp'];ok('Actual hull-damage export/import does not repair the rover')
   load(q,'newt');panel(q);assert q.locator('[data-rover-action="board"]').is_disabled();assert 'Newt ne conduit' in q.locator('#dialog-content').inner_text();ok('Newt boarding blocked through ordinary UI');q.keyboard.press('Escape')
   load(q,'parked');q.keyboard.press('Escape');q.locator('#text-scale').select_option('1.3');q.keyboard.press('Escape');q.set_viewport_size({'width':390,'height':844});panel(q);q.wait_for_timeout(250)
   assert read(q,'document.documentElement.scrollWidth<=innerWidth+1');assert q.get_by_role('button',name='RETOUR AU TERRAIN',exact=True).is_visible();ok('Cabin panel at 130% on portrait is scrollable without horizontal overflow');shot(q,'10-cabin-portrait-v08.png','Dossier cabine à 130 % de texte sur écran portrait émulé')
   action(q,'board');wait(q,'ROP_APP.simulation.s.mobility.rover.driver!==null');q.wait_for_timeout(200);shot(q,'11-driving-portrait-v08.png','Conduite en portrait émulé ; HUD de cabine et châssis visibles')
   q.set_viewport_size({'width':844,'height':390});panel(q);q.wait_for_timeout(200);assert read(q,'document.documentElement.scrollWidth<=innerWidth+1');assert q.get_by_role('button',name='RETOUR AU TERRAIN',exact=True).is_visible();ok('Short landscape cabin layout remains reachable at 130%');shot(q,'12-cabin-landscape-v08.png','Dossier cabine en paysage court, texte à 130 %')
  q.close();browser.close()
 report['passed']=not report['errors'] and all(c['passed'] for c in report['cases'])
except Exception as e:
 report['passed']=False;report['failure']=str(e);report['traceback']=traceback.format_exc();print(report['traceback'],flush=True)
finally:
 OUT.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print(len(report['cases']),'checks',PART,report['passed'],flush=True)
if not report['passed']:raise SystemExit(1)
