#!/usr/bin/env python3
"""Public input on exact standalone; valid imported late-scene fixtures are explicit."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json, os, traceback
ROOT=Path(__file__).resolve().parents[1]
REPORT={'version':'0.6.0-candidate.1','method':'Exact bundled HTML via set_content; no origin/security bypass. Public keyboard/buttons and ordinary JSON downloads/imports. Prepared fixtures explicitly labelled.','cases':[],'captures':[],'errors':[]}
CURRENT='New game through menu'
def settle(page, milliseconds):
    """Wait for normal browser simulation time, not CPU-dependent wall-clock frame count.
    Menus remain paused. This function never advances or changes game state itself.
    """
    target=page.evaluate("ms=>window.ROP_APP?.started&&!ROP_APP.modal&&ROP_APP.simulation.s.status==='playing'?ROP_APP.simulation.s.elapsed+ms/1000:null", milliseconds)
    if target is None:page.wait_for_timeout(milliseconds)
    else:page.wait_for_function("t=>!!ROP_APP.modal||ROP_APP.simulation.s.status!=='playing'||ROP_APP.simulation.s.elapsed>=t",arg=target,timeout=max(12000,milliseconds*10))

def ok(name,**more):
 REPORT['cases'].append({'name':name,'passed':True,**more});print('PASS',name,flush=True)
def shot(q,file,description):
 q.screenshot(path=str(ROOT/'captures'/file),timeout=10000)
 REPORT['captures'].append({'file':'captures/'+file,'description':description,'setup':CURRENT,'state':q.evaluate('({room:ROP_APP.simulation.s.room,chapter:ROP_APP.simulation.s.chapter,character:ROP_APP.simulation.s.character,mode:ROP_APP.simulation.s.mode,defense:ROP_APP.simulation.s.defense})')})
def load(q,text,label):
 global CURRENT
 CURRENT=label
 q.locator('#import-file').set_input_files({'name':'v06-test.json','mimeType':'application/json','buffer':text if isinstance(text,bytes) else text.encode()})
 q.get_by_role('button',name='CHARGER',exact=True).click();q.get_by_role('button',name='REPRENDRE LE PARCOURS',exact=True).click()
 settle(q,50)
def fixture(q,id='shutter-concourse',ci=0,mode='hybrid',side=0,closed=False,threat=False,alarm=False):
 text=q.evaluate('''([id,ci,mode,side,closed,threat,alarm])=>{const s=ROP_CORE.createState('story',mode),ch=ROP_DATA.chapters[ci],c=ROP_DATA.characters[ch.character],d=alarm?ROP_DEFENSE.alarms.get(id):ROP_DEFENSE.shutters.get(id),p=alarm?d:d.controls[side];Object.assign(s,{room:d.room,visited:[d.room],chapter:ci,character:ch.character,phase:ch.phase});Object.assign(s.player,{x:p.x,z:mode==='classic'?.7:p.z,ammo:c.clip,reserve:c.reserve,medkits:c.medkits,flares:c.flares});if(closed)s.defense.shutters[id].state='closed';if(threat){s.player.x=d.x+200;s.player.z=.7;}const sim=new ROP_CORE.Simulation(s);sim.ensureRoom().enemies=[];if(threat){const x=d.x-110;sim.ensureRoom().enemies=[{id:'browser-shutter-attacker',x,z:.7,hp:72,kind:'adult',state:'chase',facing:1,notice:1,cooldown:0,windup:0,repath:0,path:[],timer:0,origin:{x,z:.7},memory:{x:s.player.x,z:.7,ttl:8}}];}return sim.save();}''',[id,ci,mode,side,closed,threat,alarm])
 load(q,text,f'Validated prepared fixture {id}, chapter {ci+1}, {mode}, control {side}; imported with ordinary file input. Threat fixture={threat}. No forced progress during browser actions.')
 return text
def click_def(q,action,id=None):
 sel=f'[data-defense-action="{action}"]'+(f'[data-defense-id="{id}"]' if id else '')
 q.locator(sel).click()
def export(q,file):
 q.keyboard.press('Escape')
 with q.expect_download() as dl:q.get_by_role('button',name='EXPORTER',exact=True).click()
 out=ROOT/'captures'/file;dl.value.save_as(str(out));return out
try:
 with sync_playwright() as p:
  browser=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium'),args=['--no-sandbox','--disable-dev-shm-usage'])
  q=browser.new_page(viewport={'width':1600,'height':900},device_scale_factor=1);q.set_default_timeout(12000);requests=[]
  q.on('pageerror',lambda e:REPORT['errors'].append(str(e)));q.on('request',lambda r:requests.append(r.url))
  q.set_content((ROOT/'JOUER.html').read_text(),wait_until='load')
  fixture(q,'shutter-service',7,closed=True,threat=True);q.wait_for_function('!!ROP_APP.simulation.s.world.service.enemies[0].bash');assert q.evaluate('ROP_APP.simulation.s.defense.shutters["shutter-service"].hp')==100;ok('Frappes ennemies annoncées avant les dégâts');shot(q,'55-frappe-annoncee-v06.png','Adulte contre un volet fermé, après observation de sa première préparation de frappe. Scène de menace préparée ; la simulation continue pendant la capture.')
  q.wait_for_function('ROP_APP.simulation.s.defense.shutters["shutter-service"].state==="broken"');hpplayer=q.evaluate('ROP_APP.simulation.s.player.hp');assert hpplayer==100;shot(q,'56-volet-detruit-v06.png','Volet détruit après plusieurs frappes réelles du modèle. Le passage est libéré.');ok('Rupture réelle sans blessure du joueur à travers le volet');q.keyboard.press('Escape')
  fixture(q,'alarm-concourse',alarm=True);q.keyboard.press('Enter');click_def(q,'alarm');q.wait_for_function('ROP_APP.simulation.s.defense.alarms["alarm-concourse"].uses===1');assert q.evaluate('ROP_APP.simulation.s.defense.alarms["alarm-concourse"].delay')>0;ok('Avertisseur : manipulation puis délai avant le premier signal')
  out=export(q,'browser-v06-alarm-delay.json');delay=json.loads(out.read_text())['state']['defense']['alarms']['alarm-concourse']['delay'];assert delay>0;settle(q,180);assert q.evaluate('ROP_APP.simulation.s.defense.alarms["alarm-concourse"].delay')==delay;ok('Pause fige le délai de l’alarme et l’export le conserve')
  load(q,out.read_bytes(),'Actual exported alarm arming delay after public programming; ordinary import');q.wait_for_function('ROP_APP.simulation.s.defense.alarms["alarm-concourse"].buzz>0');assert q.evaluate('ROP_APP.simulation.s.defense.alarms["alarm-concourse"].uses')==1;shot(q,'57-alarme-active-v06.png','Avertisseur actif après un vrai export/import pendant son délai. Un seul cycle consommé.');ok('Import du signal : reprise sans double consommation')
  q.keyboard.press('Enter');assert q.locator('[data-defense-action="alarm"]').is_disabled();ok('Pas de second déclenchement pendant le signal ou le réarmement');q.keyboard.press('Escape')
  fixture(q,'alarm-concourse',7,alarm=True);q.keyboard.press('Enter');assert q.locator('[data-defense-action="alarm"]').is_disabled();assert 'circuit' in q.locator('[data-defense-action="alarm"]').inner_text().lower();ok('Avertisseur indisponible sur circuit coupé');q.keyboard.press('Escape')
  fixture(q,'alarm-med',6,alarm=True);q.keyboard.press('Enter');assert q.locator('[data-defense-action="alarm"]').is_disabled();ok('Newt ne déclenche pas les avertisseurs industriels');q.keyboard.press('Escape')
  old=(ROOT/'tests/fixtures/real-v05-save.json').read_bytes();oldstate=json.loads(old)['state'];load(q,old,'Real v0.5 export of a crafted decoy from the pristine prior archive; not a current fixture renamed');assert q.evaluate('ROP_APP.simulation.s.defense.stats.closed')==0;assert q.evaluate('ROP_APP.simulation.s.life.pockets.brackett.decoy')==oldstate['life']['pockets']['brackett']['decoy'];assert q.evaluate('ROP_APP.simulation.s.objective')==oldstate['objective'];ok('Véritable sauvegarde 0.5 : progression et poches conservées, dispositifs neufs')
  fixture(q);q.keyboard.press('Escape');q.locator('#text-scale').select_option('1.3');q.locator('#high-contrast').check();q.keyboard.press('Escape')
  for w,h in [(1280,720),(844,390),(390,844)]:
   q.set_viewport_size({'width':w,'height':h});q.keyboard.press('Enter');assert q.evaluate('document.documentElement.scrollWidth<=innerWidth+1');q.locator('[data-defense-action="close"]').scroll_into_view_if_needed();assert q.locator('[data-defense-action="close"]').is_visible();ok(f'Dossier de défense utilisable à 130 % en {w}×{h}')
   if w==390:shot(q,'58-dispositifs-portrait-v06.png','Dossier des dispositifs en portrait 390×844, contraste et texte 130 %, panneau défilant.')
   q.keyboard.press('Escape')
  assert not REPORT['errors'],REPORT['errors'];ok('Aucune erreur JavaScript dans les nouvelles scènes');assert not requests,requests;ok('Aucune requête réseau par le HTML autonome');browser.close()
except Exception as exc:
 REPORT['cases'].append({'name':'Recette interrompue','passed':False,'error':str(exc)});traceback.print_exc()
 try:q.screenshot(path=str(ROOT/'docs/browser-v06-failure.png'),timeout=3000)
 except Exception:pass
finally:
 REPORT['passed']=bool(REPORT['cases']) and all(c['passed'] for c in REPORT['cases']) and not REPORT['errors']
 (ROOT/'docs/BROWSER_V06B_TEST_RESULTS.json').write_text(json.dumps(REPORT,ensure_ascii=False,indent=2))
 print(json.dumps({'passed':REPORT['passed'],'cases':len(REPORT['cases']),'captures':len(REPORT['captures']),'errors':REPORT['errors']},ensure_ascii=False),flush=True)
 if not REPORT['passed']:raise SystemExit(1)
