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
  assert q.evaluate('ROP_DATA.manifest.version')==REPORT['version'];assert q.evaluate('!!ROP_DEFENSE&&!!ROP_DEFENSE_UI');ok('17 modules courants chargés depuis le HTML exact sans dépendance externe')
  shot(q,'50-title-v06.png','Menu de la 0.6 : Tenir les passages. Rendu du jeu, aucun concept art substitué.')
  q.locator('#start').click();q.get_by_role('button',name='PRENDRE LE CONTRÔLE',exact=True).click()
  q.keyboard.press('Enter');assert 'Aucun volet' in q.locator('#dialog-content').inner_text();ok('Entrée ouvre les dispositifs de la pièce, pas une commande distante');q.keyboard.press('Escape')
  fixture(q);q.keyboard.press('KeyI');q.get_by_role('button',name='DISPOSITIFS LOCAUX · ENTRÉE',exact=True).click();assert q.locator('#dialog-title').inner_text()=='Tenir les passages';assert q.locator('[data-defense-action="close"]').is_enabled();assert q.locator('[data-defense-action="alarm"]').is_disabled();ok('Accès depuis équipement, proximité vérifiée séparément pour chaque poste')
  before=q.evaluate('ROP_APP.simulation.s.elapsed');settle(q,180);assert q.evaluate('ROP_APP.simulation.s.elapsed')==before;ok('Lecture du dossier suspend le temps, pas la manipulation suivante');shot(q,'51-dispositifs-v06.png','Dossier local : volet à portée et avertisseur éloigné désactivé.')
  click_def(q,'close');settle(q,250);assert q.evaluate('ROP_APP.simulation.s.work?.kind')=='defense';assert q.evaluate('ROP_APP.simulation.s.defense.shutters["shutter-concourse"].state')=='open';q.keyboard.down('KeyD');settle(q,450);q.keyboard.up('KeyD');assert q.evaluate('ROP_APP.simulation.s.work') is None;ok('La préparation est réelle et un déplacement interrompt la fermeture')
  fixture(q,'shutter-hab');q.keyboard.press('Enter');click_def(q,'close');q.wait_for_function('ROP_APP.simulation.s.defense.shutters["shutter-hab"].state==="closed"');shot(q,'52-volet-ferme-v06.png','Volet habitat fermé après manipulation depuis son poste gauche. Il occupe la bande de marche.')
  q.keyboard.down('KeyD');settle(q,400);q.keyboard.up('KeyD');assert q.evaluate('ROP_APP.simulation.s.player.x<ROP_DEFENSE.shutters.get("shutter-hab").x-38');ok('Le déplacement réel est arrêté par le volet fermé')
  q.keyboard.down('KeyF');settle(q,70);q.keyboard.up('KeyF');settle(q,150);hp=q.evaluate('ROP_APP.simulation.s.defense.shutters["shutter-hab"].hp');assert 0<hp<100;ok('Tir au clavier : projectile arrêté, intégrité du volet diminuée',integrity=hp)
  out=export(q,'browser-v06-closed-shutter.json');env=json.loads(out.read_text());assert env['state']['defense']['shutters']['shutter-hab']['hp']==hp;ok('Vrai téléchargement JSON du volet fermé et endommagé')
  load(q,out.read_bytes(),'Actual export after public UI closure, physical movement and keyboard shot; reimport via ordinary file input');assert q.evaluate('ROP_APP.simulation.s.defense.shutters["shutter-hab"].hp')==hp;ok('Import réel conserve fermeture et dégâts sans réparation')
  q.keyboard.press('Tab');q.locator('[data-map-mode="local"]').click();assert 'CF' in q.locator('#dialog-content').inner_text();assert q.locator('#dialog-content svg').is_visible();shot(q,'53-plan-volet-v06.png','Plan local : emprise du volet fermé, postes et accès de la pièce.');ok('Plan local reprend le volet physique et ses repères');q.keyboard.press('Escape')
  q.keyboard.press('Enter');click_def(q,'open');q.wait_for_function('ROP_APP.simulation.s.defense.shutters["shutter-hab"].state==="open"');assert q.evaluate('ROP_APP.simulation.s.defense.shutters["shutter-hab"].hp')==hp;ok('Réouverture exposée sans restauration de l’intégrité')
  fixture(q,'shutter-hab',6,side=1,closed=True);q.keyboard.press('Enter');assert 'POIGNÉE BASSE' in q.locator('[data-defense-action="open"]').inner_text();shot(q,'54-newt-secours-v06.png','Newt peut libérer la poignée basse du côté opposé, sans armer le volet.');click_def(q,'open');q.wait_for_function('ROP_APP.simulation.s.defense.shutters["shutter-hab"].state==="open"');q.keyboard.press('Enter');assert q.locator('[data-defense-action="close"]').is_disabled();ok('Newt libère le passage mais ne peut pas abaisser un volet');q.keyboard.press('Escape')
  assert not REPORT['errors'],REPORT['errors'];ok('Aucune erreur JavaScript dans les nouvelles scènes');assert not requests,requests;ok('Aucune requête réseau par le HTML autonome');browser.close()
except Exception as exc:
 REPORT['cases'].append({'name':'Recette interrompue','passed':False,'error':str(exc)});traceback.print_exc()
 try:q.screenshot(path=str(ROOT/'docs/browser-v06-failure.png'),timeout=3000)
 except Exception:pass
finally:
 REPORT['passed']=bool(REPORT['cases']) and all(c['passed'] for c in REPORT['cases']) and not REPORT['errors']
 (ROOT/'docs/BROWSER_V06A_TEST_RESULTS.json').write_text(json.dumps(REPORT,ensure_ascii=False,indent=2))
 print(json.dumps({'passed':REPORT['passed'],'cases':len(REPORT['cases']),'captures':len(REPORT['captures']),'errors':REPORT['errors']},ensure_ascii=False),flush=True)
 if not REPORT['passed']:raise SystemExit(1)
