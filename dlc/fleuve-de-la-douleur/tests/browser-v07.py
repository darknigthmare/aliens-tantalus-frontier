#!/usr/bin/env python3
"""Focused current browser checks. Late fixtures are explicit; no live simulation writes.
Run parts A/B/C separately to bound browser resources. Uses public controls and JSON files.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from functools import partial
import threading,shutil,json,sys,traceback,time,hashlib
ROOT=Path(__file__).resolve().parents[1]
PART=(sys.argv[1] if len(sys.argv)>1 else 'A').upper()
OUT=ROOT/'docs'/f'BROWSER_V07{PART}.json'
REPORT={'version':'0.7.0-candidate.1','part':PART,'cases':[],'captures':[],'errors':[],'method':'Exact shipped HTML; real browser inputs. Prepared model fixtures imported via ordinary file selector. No position, health, objective or simulation-clock writes during browser interaction.'}
REPORT['html_sha256']=hashlib.sha256((ROOT/'JOUER.html').read_bytes()).hexdigest()
SETUP='New game from menu'
def ok(name,**detail):
 REPORT['cases'].append({'name':name,'passed':True,**detail});print('PASS',name,flush=True)
def state(q,expr='ROP_APP.simulation.s'):
 return q.evaluate(expr)
def wait(q,condition):q.wait_for_function(condition,timeout=24000)
def simwait(q,seconds):
 t=state(q,'ROP_APP.simulation.s.elapsed')+seconds
 q.wait_for_function('t=>ROP_APP.simulation.s.elapsed>=t||ROP_APP.simulation.s.status!=="playing"',arg=t,timeout=max(24000,int(seconds*7000)))
def load(q,name,fixture=True):
 global SETUP
 p=ROOT/'tests/fixtures/v07'/f'{name}.json' if fixture else Path(name)
 SETUP=('Prepared localized fixture: ' if fixture else 'Actual JSON export: ')+p.name
 q.locator('#import-file').set_input_files(str(p));q.get_by_role('button',name='CHARGER',exact=True).click()
 q.get_by_role('button',name='REPRENDRE LE PARCOURS',exact=True).click()
 wait(q,'ROP_APP.started&&!ROP_APP.modal')
def shot(q,name,label):
 q.screenshot(path=str(ROOT/'captures'/name),timeout=15000)
 REPORT['captures'].append({'file':'captures/'+name,'description':label,'setup':SETUP,'state':state(q,'({room:ROP_APP.simulation.s.room,chapter:ROP_APP.simulation.s.chapter,character:ROP_APP.simulation.s.character,mode:ROP_APP.simulation.s.mode,ducts:ROP_APP.simulation.s.ducts,elapsed:ROP_APP.simulation.s.elapsed,modal:ROP_APP.modal})')})
def export(q,name):
 if not state(q,'ROP_APP.modal'):q.keyboard.press('Escape')
 with q.expect_download(timeout=10000) as event:q.get_by_role('button',name='EXPORTER',exact=True).click()
 out=ROOT/'captures'/name;event.value.save_as(str(out));return out,json.loads(out.read_text())
def cmd(q,action):q.locator(f'[data-duct-action="{action}"]').click()
def open_duct(q):q.keyboard.press('Digit4');wait(q,'ROP_APP.modal==="ducts"')
def boot(q):
 q.on('pageerror',lambda e:REPORT['errors'].append(str(e)))
 q.set_content((ROOT/'JOUER.html').read_text(),wait_until='load')
 wait(q,'!!window.ROP_APP&&!!window.ROP_DUCTS')
try:
 with sync_playwright() as p:
  browser=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
  q=browser.new_page(viewport={'width':1600,'height':900},device_scale_factor=1);q.set_default_timeout(12000)
  if PART=='A':
   REPORT['agentBrowser']=shutil.which('agent-browser')
   server=ThreadingHTTPServer(('127.0.0.1',0),partial(SimpleHTTPRequestHandler,directory=str(ROOT)));thread=threading.Thread(target=server.serve_forever,daemon=True);thread.start()
   try:
    q.goto(f'http://127.0.0.1:{server.server_port}/JOUER.html',wait_until='load',timeout=10000)
    REPORT['http']={'loaded':True,'url':'loopback server','nativeStorageQualified':False}
   except Exception as e:REPORT['http']={'loaded':False,'error':str(e),'fallback':'set_content on allowed opaque origin, no policy modification'}
   finally:server.shutdown();server.server_close();thread.join(timeout=2)
  boot(q)
  assert state(q,'ROP_DATA.manifest.version')==REPORT['version'];assert state(q,'typeof ROP_DUCTS_UI')=='function';ok('Exact current runtime and grille modules load')
  if PART=='A':
   assert q.locator('.tracker-screen #tracker-scope').count()==0;ok('Tracker scope label stays outside the rounded radar clipping mask')
   assert 'VERSION JOUABLE 0.7' in q.locator('.release').inner_text();ok('Visible title version corrected to 0.7');shot(q,'01-title-v07.png','Menu initial de la version courante')
   q.locator('#difficulty').select_option('story');q.locator('#start').click();q.get_by_role('button',name='PRENDRE LE CONTRÔLE',exact=True).click()
   x=state(q,"ROP_APP.simulation.room.objects.find(o=>o.id==='welcome').x")
   q.keyboard.down('KeyD');q.wait_for_function('x=>ROP_APP.simulation.s.player.x>=x-65',arg=x);q.keyboard.up('KeyD');q.keyboard.press('KeyE');wait(q,'ROP_APP.simulation.s.objective===1');ok('First campaign task reached by walking and E, no position injection');shot(q,'03-first-task-v07.png','Premier objectif joué au clavier depuis une partie neuve')
   q.keyboard.press('KeyI');assert q.locator('[data-kit]').count()==7;assert q.get_by_role('button',name='GAINES TECHNIQUES · 4',exact=True).is_visible();ok('Equipment preserves seven actions and exposes maintenance register')
   q.get_by_role('button',name='GAINES TECHNIQUES · 4',exact=True).click();assert 'Aucune grille' in q.locator('#dialog-content').inner_text();ok('No remote controls appear outside a duct room');q.keyboard.press('Escape')
   old=ROOT/'tests/fixtures/real-v06-save.json';prior=json.loads(old.read_text())['state'];load(q,old,False)
   now=state(q);assert now['ducts']['stats']['closed']==0;assert now['chapter']==prior['chapter'];assert now['player']['ammo']==prior['player']['ammo'];ok('Actual 0.6 export imports without invented grille actions')
   load(q,'open-grille');q.keyboard.press('KeyE');wait(q,'ROP_APP.modal==="ducts"');assert not q.locator('[data-duct-action="close"]').is_disabled();ok('E opens the actual nearby grille without taking a door')
   t=state(q,'ROP_APP.simulation.s.elapsed');q.wait_for_timeout(350);assert state(q,'ROP_APP.simulation.s.elapsed')==t;ok('Register pauses simulation while reading');shot(q,'02-duct-panel-v07.png','Dossier local ouvert par E devant la grille de maintenance')
   cmd(q,'close');assert not state(q,'ROP_APP.modal');wait(q,"ROP_APP.simulation.s.ducts.mouths['duct-service'].state==='closed'");ok('Lock command runs in the world and closes after work');shot(q,'04-locked-grille-v07.png','Grille verrouillée par la commande ordinaire, état visible')
   f,env=export(q,'browser-v07-locked-grille.json');assert env['state']['ducts']['mouths']['duct-service']['state']=='closed';ok('Actual JSON download contains the closed grille')
   load(q,f,False);assert state(q,"ROP_APP.simulation.s.ducts.stats.closed")==1;assert state(q,"ROP_APP.simulation.s.ducts.mouths['duct-service'].state")== 'closed';ok('Downloaded grille reimports once without repeated manipulation')
   open_duct(q);cmd(q,'open');wait(q,"ROP_APP.simulation.s.ducts.mouths['duct-service'].state==='open'");ok('Local release action reopens the grille')
   simwait(q,1);open_duct(q);cmd(q,'listen');wait(q,'ROP_APP.simulation.s.ducts.reports.length===1');r=state(q,'ROP_APP.simulation.s.ducts.reports[0]');assert r['level']=='quiet';ok('An actual stationary listen records the qualified quiet result');open_duct(q);shot(q,'05-listening-record-v07.png','Observation obtenue sur place : silence perçu, pas pièce certifiée sûre');q.keyboard.press('Escape')
   q.keyboard.down('KeyA');simwait(q,1.4);q.keyboard.up('KeyA');open_duct(q);assert q.locator('[data-duct-action="open"],[data-duct-action="close"]').is_disabled();assert q.locator('[data-duct-action="listen"]').is_disabled();ok('Walking away disables the same controls; no remote actions')
   load(q,'damaged-grille');open_duct(q);cmd(q,'open');wait(q,"ROP_APP.simulation.s.ducts.mouths['duct-service'].state==='open'");assert state(q,"ROP_APP.simulation.s.ducts.mouths['duct-service'].hp")==66;ok('Reopening a prepared damaged grille does not repair it')
   q.keyboard.press('Tab');q.get_by_role('button',name='PIÈCE ACTUELLE',exact=True).click();assert 'G03A' in q.locator('#dialog-content').inner_text();ok('Local plan shows the service mouth separately from player portals');shot(q,'06-local-plan-v07.png','Plan local : G identifie une bouche technique, pas une porte jouable')
  elif PART=='B':
   q.set_viewport_size({'width':1920,'height':900});load(q,'entry-observation');wait(q,'ROP_APP.simulation.s.ducts.transits.length===1');assert state(q,"ROP_APP.simulation.s.world.service.enemies.length")==0;ok('Real AI removes the existing source adult and queues one owner')
   f,env=export(q,'browser-v07-mid-transit.json');assert env['state']['ducts']['transits'][0]['enemy']['hp']==46;assert env['state']['ducts']['transits'][0]['remaining']>0;ok('Actual export retains the damaged adult during travel')
   load(q,f,False);assert state(q,'ROP_APP.simulation.s.ducts.stats.entries')==1;assert state(q,"ROP_APP.simulation.s.world.service.enemies.length")==0;ok('Travel import has one specimen, not a respawn at the source')
   load(q,'warning-tracker');wait(q,'ROP_APP.simulation.s.ducts.transits[0]?.announced===true');q.keyboard.press('Escape');assert state(q,"ROP_APP.simulation.s.world.pump.enemies.length")==0;assert 'GAINE TECHNIQUE' in q.locator('#tracker-scope').inner_text();ok('A local warning and coarse tracker echo precede emergence')
   q.get_by_role('button',name='REPRENDRE',exact=True).click();shot(q,'07-exit-warning-v07.png','Grille de pompage en mouvement et écho du détecteur, avant sortie')
   wait(q,'ROP_APP.simulation.s.ducts.stats.arrivals===1');q.keyboard.press('Escape');e=state(q,"ROP_APP.simulation.s.world.pump.enemies[0]");assert e['id']=='v07-observed-specimen';assert e['hp']==46;ok('Warning ends with the same ID and health, exactly one arrival')
   q.get_by_role('button',name='REPRENDRE',exact=True).click();shot(q,'08-existing-adult-v07.png','Le même adulte à la sortie ; il ne s’agit pas d’un ennemi généré pour la gaine')
   load(q,'incoming-near');hp=state(q,'ROP_APP.simulation.s.player.hp');simwait(q,8);assert state(q,'ROP_APP.simulation.s.ducts.transits.length')==1;assert state(q,"ROP_APP.simulation.s.world.pump.enemies.length")==0;assert state(q,'ROP_APP.simulation.s.player.hp')==hp;ok('Waiting next to exit does not materialize or hurt a character in the clearance zone')
   load(q,'pressure-closed');wait(q,"ROP_APP.simulation.s.ducts.mouths['duct-pump'].hp<100");f,env=export(q,'browser-v07-grille-under-pressure.json');v=env['state']['ducts']['mouths']['duct-pump'];assert 0<v['hp']<100 and v['state']=='closed';ok('Actual export preserves damage inflicted by the queued adult, not a scripted health reset')
   load(q,f,False);assert state(q,"ROP_APP.simulation.s.ducts.mouths['duct-pump'].hp")==v['hp'];ok('Real damaged-pressure export restores integrity without another entry')
   shot(q,'09-grille-under-pressure-v07.png','Grille déjà endommagée par les coups, issue d’un véritable export/import')
   wait(q,"ROP_APP.simulation.s.ducts.mouths['duct-pump'].state==='broken'");q.keyboard.press('Escape');assert state(q,'ROP_APP.simulation.s.ducts.transits.length')==1;assert state(q,"ROP_APP.simulation.s.world.pump.enemies.length")==0;ok('Broken grille is followed by a fresh warning, not instant damage')
   q.get_by_role('button',name='REPRENDRE',exact=True).click();shot(q,'10-grille-torn-v07.png','Grille arrachée ; l’avertissement de sortie reste actif')
   wait(q,'ROP_APP.simulation.s.ducts.stats.arrivals===1');q.keyboard.press('Escape');assert state(q,'ROP_APP.simulation.s.ducts.stats.broken')==1;ok('Pressure sequence consumes no additional creature and records one rupture')
   load(q,'newt-listening');open_duct(q);assert q.locator('[data-duct-action="close"]').is_disabled();assert not q.locator('[data-duct-action="listen"]').is_disabled();ok('Newt can listen but industrial lock control remains unavailable')
   cmd(q,'listen');wait(q,'ROP_APP.simulation.s.ducts.stats.listened===1');q.keyboard.press('KeyF');assert state(q,'ROP_APP.simulation.s.stats.shots')==0;assert not state(q,'ROP_APP.simulation.s.systems.tracker');ok('Listening never grants Newt an armament or motion tracker')
  elif PART=='C':
   load(q,'open-grille');q.keyboard.press('Escape');q.locator('#text-scale').select_option('1.3');q.locator('#high-contrast').check();q.locator('#reduced-motion').check();q.get_by_role('button',name='REPRENDRE',exact=True).click()
   q.set_viewport_size({'width':390,'height':844});open_duct(q);assert q.locator('[data-duct-action="close"]').is_enabled();q.locator('[data-duct-action="close"]').scroll_into_view_if_needed();bounds=q.locator('[data-duct-action="close"]').bounding_box();assert bounds['x']>=0 and bounds['x']+bounds['width']<=391;ok('130% portrait text and wrap keep the lock button inside the viewport');shot(q,'11-grilles-portrait-v07.png','Dossier des gaines en 390×844, texte 130 %, contraste renforcé')
   assert state(q,"document.documentElement.scrollWidth<=document.documentElement.clientWidth");ok('No horizontal page overflow at portrait width')
   cmd(q,'close');wait(q,"ROP_APP.simulation.s.ducts.mouths['duct-service'].state==='closed'");ok('Portrait button performs a real lock, not only a layout snapshot')
   open_duct(q);q.locator('[data-duct-action="open"]').scroll_into_view_if_needed();cmd(q,'open');wait(q,"ROP_APP.simulation.s.ducts.mouths['duct-service'].state==='open'");ok('Portrait release is also operable')
   q.set_viewport_size({'width':844,'height':390});open_duct(q);q.locator('[data-duct-action="listen"]').scroll_into_view_if_needed();assert q.locator('[data-duct-action="listen"]').is_visible();ok('Short landscape viewport can scroll to listen');shot(q,'12-grilles-landscape-v07.png','Dossier court en paysage 844×390, réglages de lecture conservés')
   q.keyboard.press('Escape');q.set_viewport_size({'width':1280,'height':720});q.keyboard.press('KeyI');q.get_by_role('button',name='DISPOSITIFS LOCAUX · ENTRÉE',exact=True).click();assert q.locator('[data-defense-action]').count()>=1;ok('Inherited shutter/alarm controls remain reachable from equipment');q.keyboard.press('Escape')
   q.keyboard.press('KeyY');assert state(q,'ROP_APP.modal')=='contacts';ok('Inherited colony contact register remains accessible');q.keyboard.press('Escape')
   q.keyboard.press('KeyU');assert state(q,'ROP_APP.modal')=='detours';ok('Inherited six-detour register remains accessible');q.keyboard.press('Escape')
   q.keyboard.press('KeyO');assert state(q,'ROP_APP.modal')=='thresholds';ok('Inherited door-listening dossier remains separate from ducts');q.keyboard.press('Escape')
   q.keyboard.press('KeyJ');assert state(q,'ROP_APP.modal')=='journal';ok('Inherited archive journal remains accessible');q.keyboard.press('Escape')
   load(q,'open-grille');q.keyboard.press('KeyL');assert state(q,'ROP_APP.simulation.s.systems.flashlight');q.keyboard.press('KeyT');assert state(q,'ROP_APP.simulation.s.systems.tracker');ok('Lamp and marine tracker controls remain functional')
   open_duct(q);cmd(q,'close');simwait(q,.5);q.keyboard.down('KeyA');simwait(q,.35);q.keyboard.up('KeyA');assert state(q,'ROP_APP.simulation.s.work') is None;assert state(q,"ROP_APP.simulation.s.ducts.mouths['duct-service'].state")=='open';ok('Moving away interrupts an unfinished lock in the actual browser')
   load(q,'open-grille');open_duct(q);t=state(q,'ROP_APP.simulation.s.elapsed');q.wait_for_timeout(250);assert state(q,'ROP_APP.simulation.s.elapsed')==t;q.keyboard.press('Escape');assert state(q,'ROP_APP.modal') is None;ok('Escape closes the grille modal and releases input focus')
  else:raise ValueError(PART)
  assert not REPORT['errors'],REPORT['errors'];ok('No JavaScript page error in this completed browser part')
  browser.close()
except Exception as e:
 REPORT['cases'].append({'name':'Unfinished browser step','passed':False,'error':traceback.format_exc()});print(traceback.format_exc(),flush=True)
finally:
 REPORT['passed']=all(r['passed'] for r in REPORT['cases']) and not REPORT['errors'];OUT.write_text(json.dumps(REPORT,ensure_ascii=False,indent=2));print('RESULT',PART,REPORT['passed'],len(REPORT['cases']),flush=True)
if not REPORT['passed']:sys.exit(1)
