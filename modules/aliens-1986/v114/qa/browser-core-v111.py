import hashlib
"""Real Chromium captures of the shipped offline HTML; no QA API in the build.
Only UI events, real exported files and full-operation driver snapshots are used.
The browser recipe is separate from the two full Node input-driven playthroughs.
"""
from pathlib import Path
import json,time
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parent.parent
HTML=(ROOT/'JOUER_ALIENS_V111.html').read_text()
CAP=ROOT/'report/captures-v111';CAP.mkdir(exist_ok=True,parents=True)
results=[];errors=[];console=[];captures=[]
def check(name,ok,detail=None):
 results.append({'name':name,'ok':bool(ok),'detail':detail});(ROOT/'report/browser-core-v111.json').write_text(json.dumps({'tests':results,'pageErrors':errors,'consoleErrors':console,'captures':captures},ensure_ascii=False,indent=2));print(name,ok,flush=True);assert ok,(name,detail)
def export(pg):
 if not pg.locator('#pause-panel').is_visible():pg.locator('#pause-open').click()
 with pg.expect_download() as d:pg.locator('#export').click()
 return json.loads(Path(d.value.path()).read_text())
def resume(pg):pg.locator('#pause-panel [data-close]').first.click()
def load(pg,data):
 if not pg.locator('#pause-panel').is_visible():pg.locator('#pause-open').click()
 pg.locator('#import-file').set_input_files({'name':'point.json','mimeType':'application/json','buffer':json.dumps(data).encode()});pg.wait_for_timeout(80)
def snapshot(pg,name,origin):
 pg.screenshot(path=str(CAP/name));captures.append({'file':name,'origin':origin,'htmlSHA256':hashlib.sha256(HTML.encode()).hexdigest(),'nativeTantalus':False,'imageEdited':False})
def start(pg,room=None):
 pg.goto('about:blank');pg.set_content(HTML);pg.locator('#start-operation').wait_for()
 if room:pg.locator('details.inspection summary').click();pg.locator('[data-sector='+room+']').click()
 else:pg.locator('#start-operation').click()
 pg.wait_for_timeout(100)
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 pg=browser.new_page(viewport={'width':1440,'height':900},accept_downloads=True,device_scale_factor=1)
 pg.set_default_timeout(10000)
 pg.on('pageerror',lambda e:errors.append(str(e)));pg.on('console',lambda m:console.append(m.text) if m.type=='error' else None)
 pg.goto('about:blank');pg.set_content(HTML);pg.locator('#start-operation').wait_for();check('Huit inspections et une opération distincte',pg.locator('[data-sector]').count()==8)
 snapshot(pg,'00_menu.png','HTML distribué au menu')
 start(pg);initial=export(pg);check('Démarrage opération à Hadley',initial['mode']=='operation' and initial['roomId']=='v106-hadley' and initial['step']==0)
 check('Newt dans son lieu avant le secours',next(a for a in initial['team'] if a['id']=='newt')['roomId']=='v106-medlab')
 check('État contient les huit lieux sans HTML de contrôle',len(initial['worlds'])==8 and 'window.engine' not in HTML and '__QA__' not in HTML)
 resume(pg);pg.keyboard.press('h');pg.keyboard.down('d');pg.wait_for_timeout(300);pg.keyboard.up('d');state=export(pg)
 h0=next(a for a in initial['team'] if a['id']=='hicks');h1=next(a for a in state['team'] if a['id']=='hicks')
 check('Ordre tenir au clavier conserve la position',h1['order']=='hold' and h1['x']==h0['x'] and h1['z']==h0['z'])
 resume(pg);pg.keyboard.press('g');pg.keyboard.down('d');pg.wait_for_timeout(1720);pg.keyboard.up('d');atDoor=export(pg);resume(pg);pg.keyboard.press('e');pg.wait_for_timeout(100)
 snapshot(pg,'01_ouverture_en_cours.png','Approche et ouverture au clavier depuis le début du parcours')
 state=export(pg);check('Ouverture réellement différée',state['action'] is not None and state['worlds']['v106-hadley']['doors']['service-gate']['open'] is False,state['action'])
 paused=state;pg.wait_for_timeout(250);check('Pause ne consomme pas le temps du geste',export(pg)==paused)
 load(pg,atDoor);resume(pg);pg.keyboard.press('e');pg.keyboard.down('a');pg.wait_for_timeout(90);pg.keyboard.up('a');state=export(pg);check('Déplacement annule le geste sans ouvrir',state['action'] is None and not state['worlds']['v106-hadley']['doors']['service-gate']['open'],state['action'])
 load(pg,atDoor);resume(pg);pg.keyboard.press('e');pg.wait_for_timeout(1700);state=export(pg);check('Ouverture achevée au clavier',state['worlds']['v106-hadley']['doors']['service-gate']['open'],{'action':state['action'],'p':state['team'][0],'note':pg.locator('#save-note').text_content()})
 # Each shot uses a mouse click at the rendered target. Reading an actual
 # export informs the driver; it never writes health/positions or invokes code.
 for i in range(22):
  enemies=[a for a in state['worlds']['v106-hadley']['actors'] if a['alive'] and a['id'].startswith('warrior')]
  if not enemies:break
  pl=next(a for a in state['team'] if a['id']=='ripley');enemy=min(enemies,key=lambda a:abs(a['x']-pl['x']))
  if enemy['x']-pl['x']>520:
   resume(pg);pg.keyboard.down('d');pg.wait_for_timeout(650);pg.keyboard.up('d');state=export(pg);continue
  resume(pg);b=pg.locator('#scene').bounding_box();scale=min(b['width']/1280,b['height']/720);left=b['x']+(b['width']-1280*scale)/2;cam=max(0,min(160,pl['x']-550))
  pg.mouse.click(left+(enemy['x']-cam)*scale,b['y']+(265+enemy['z']*.86-55)*scale);pg.wait_for_timeout(190);state=export(pg)
 check('Tirs réels consomment les munitions',next(a for a in state['team'] if a['id']=='ripley')['ammo']<48)
 check('Deux contacts neutralisés par les tirs UI',not any(a['alive'] for a in state['worlds']['v106-hadley']['actors']),state['worlds']['v106-hadley']['actors'])
 for attempt in range(16):
  x=next(a for a in state['team'] if a['id']=='ripley')['x']
  if abs(x-1348)<6:break
  resume(pg);key='d' if x<1348 else 'a';pg.keyboard.down(key);pg.wait_for_timeout(min(800,max(60,abs(1348-x)/172*1000*.92)));pg.keyboard.up(key);state=export(pg)
 resume(pg);pg.keyboard.press('g');pg.keyboard.press('e');pg.wait_for_timeout(2200);state=export(pg)
 check('Premier raccord traversé avec la vraie équipe',state['roomId']=='v107-operations' and all(a['roomId']=='v107-operations' for a in state['team'] if a['recruited']),state['roomId'])
 check('Porte de la salle quittée conservée',state['worlds']['v106-hadley']['doors']['service-gate']['open'])
 check('Objectif avancé seulement après transfert',state['step']==1)
 resume(pg);pg.wait_for_timeout(250);snapshot(pg,'02_operations_arrivee.png','Premier raccord depuis Hadley joué au clavier/souris')
 state=export(pg);before=state
 load(pg,before);after=export(pg);check('Export/import exact de tous les lieux',after==before)
 bad=json.loads(json.dumps(before));bad['team'][0]['radius']=1;load(pg,bad);check('Champ de rôle injecté refusé sans mutation',export(pg)==before)
 bad=json.loads(json.dumps(before));bad['worlds']['v106-sentry']['doors']['defense-gate']['open']='yes';load(pg,bad);check('État de porte erroné refusé sans mutation',export(pg)==before)
 browser.close()
(ROOT/'report/browser-core-v111.json').write_text(json.dumps({'browser':'Chromium through Python Playwright','transport':'distributed offline HTML via set_content; unchanged Blob module loader','htmlSHA256':hashlib.sha256(HTML.encode()).hexdigest(),'nativeTantalus':False,'tests':results,'pageErrors':errors,'consoleErrors':console,'captures':captures},ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'passed':sum(x['ok'] for x in results),'total':len(results),'errors':errors,'captures':len(captures)}))
