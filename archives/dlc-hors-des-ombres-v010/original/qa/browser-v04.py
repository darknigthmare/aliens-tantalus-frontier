"""Chromium checks for V0.4. Prepared scenes are identified in every screenshot.
HTTP and file navigation are attempted, with an explicit in-memory-storage fallback.
No screenshot is a concept image or a human playthrough claim.
"""
from pathlib import Path
import json,shutil
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parents[1];CAP=R/'captures';checks=[];errors=[];notes=[];shots=[]
def check(name,ok,detail=None):checks.append({'name':name,'ok':bool(ok),'detail':detail});print('CHECK',bool(ok),name,flush=True)
with sync_playwright() as p:
 b=p.chromium.launch(executable_path=shutil.which('chromium'),args=['--no-sandbox']);page=b.new_page(viewport={'width':1600,'height':1000});native=False
 page.on('pageerror',lambda e:errors.append(str(e)))
 for url in ['http://127.0.0.1:4173/?qa=1',(R/'JOUER_HORS_DES_OMBRES.html').as_uri()+'?qa=1']:
  try:page.goto(url,timeout=4500);native=True;break
  except Exception as e:notes.append(str(e).split('\n')[0])
 if not native:
  page.close();page=b.new_page(viewport={'width':1600,'height':1000});page.on('pageerror',lambda e:errors.append(str(e)))
  page.evaluate('''()=>{window.__OTH_TEST_CONTEXT=true;const store=new Map([['another-dlc','untouched']]);window.__TEST_STORE=store;Object.defineProperty(window,'localStorage',{value:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)}});}''');page.set_content((R/'JOUER_HORS_DES_OMBRES.html').read_text())
 page.wait_for_timeout(100)
 # V0.8 auto-scenes disabled for these dedicated legacy-control fixtures only.
 page.evaluate("()=>{const api=__OTH_QA,original=api.replace;api.replace=s=>{s.presentation.enabled=false;original(s);};api.state.presentation.enabled=false;}")

 def shot(name,caption):
  page.screenshot(path=str(CAP/name));shots.append({'file':name,'caption':caption,'method':'Capture réelle Chromium de la V0.5 (scénario de non-régression V0.4) ; scène préparée puis commandes ou simulation indiquées dans la légende.'})
 def scenario(n=0,room='bridge',x=170,y=88):
  page.evaluate('''([n,room,x,y])=>{const s=OTH_ENGINE.createState();s.completed=OTH_DATA.DATA.chapters.flatMap(c=>c.objectives).slice(0,n).map(o=>o.id);s.room=room;const v=OTH_ENGINE.restore(OTH_ENGINE.serialize(s));v.player.x=x;v.player.y=y;__OTH_QA.replace(v);}''',[n,room,x,y]);page.wait_for_timeout(35)
 def state(expr):return page.evaluate('__OTH_QA.state'+expr)
 def hold(key,ms):page.keyboard.down(key);page.wait_for_timeout(ms);page.keyboard.up(key)
 def close():page.keyboard.press('Escape');page.wait_for_timeout(35)
 def sim(seconds):page.evaluate('(seconds)=>{for(let i=0;i<seconds/.05;i++)__OTH_QA.step({},.05)}',seconds);page.wait_for_timeout(35)
 def service(id):return page.evaluate('(id)=>OTH_DATA.DATA.interactables.find(a=>a.id===id)',id)
 check('Document V0.4 et menu chargés',page.locator('meta[name="application-version"]').get_attribute('content')=='0.10.0')
 shot('37_menu_v04.png','Menu de la V0.5, document chargé sans état de campagne injecté.')
 scenario(0,'junction',1520,130);a=service('light-junction');check('Ancrage lumière bien chargé',a['x']==1520)
 before=page.evaluate('OTH_ENGINE.detectionRange(__OTH_QA.state)');shot('38_coursive_eclairee.png','Coursive, rampes allumées. Point de départ préparé devant la commande d’éclairage.')
 hold('e',800);check('E agit physiquement sur le coffret de lumière','junction' in state('.lightsOff'));check('Éclairage réduit la portée de détection',page.evaluate('OTH_ENGINE.detectionRange(__OTH_QA.state)')<before)
 shot('39_coursive_secours.png','Même position après interaction E : les rampes s’éteignent, le balisage reste visible.')
 page.keyboard.press('k');check('K ouvre le relevé en lecture seule',page.locator('dialog h2').inner_text()=='Services de la pièce');check('État SECOURS SEUL reflété par le relevé','SECOURS SEUL' in page.locator('dialog').inner_text());check('Aucune télécommande dans les services',page.locator('dialog [data-action]').count()==0)
 paused=state('.elapsed');page.wait_for_timeout(350);check('K met effectivement la simulation en pause',state('.elapsed')==paused);shot('40_services.png','Relevé des services locaux ouvert par K. Aucune activation distante.');close()
 # Mechanical latch, press-and-hold and map fog.
 portal=page.evaluate('OTH_ENGINE.ROOM.junction.portals.find(p=>p.edge==="e03")');scenario(0,'junction',portal['x'],portal['y'])
 hold('b',380);check('Appui B trop court ne ferme pas',not page.evaluate('OTH_ENGINE.doorStatus(__OTH_QA.state,"e03").sealed'))
 hold('b',1250);check('B maintenu ferme le verrou',page.evaluate('OTH_ENGINE.doorStatus(__OTH_QA.state,"e03").sealed'))
 shot('41_verrou_coursive.png','Fermeture du verrou par maintien de B. Le délai apparaît sur la porte.')
 page.keyboard.press('m');check('Le plan indique VERROU et n’expose pas la destination inconnue','VERROU' in page.locator('dialog').inner_text() and 'Distribution électrique' not in page.locator('dialog').inner_text());remaining=state('.doors.e03.remaining');page.wait_for_timeout(400);check('Lecture du plan suspend le délai du verrou',state('.doors.e03.remaining')==remaining);close()
 hold('e',1150);check('Libération E sans franchissement automatique immédiat',state('.room')=='junction' and not page.evaluate('OTH_ENGINE.doorStatus(__OTH_QA.state,"e03").sealed'))
 # Machine timed state and cooldown.
 a=service('noise-workshop');scenario(0,a['room'],a['x'],a['y']);decoys=state('.player.decoys');hold('e',1000)
 check('Compresseur en cycle après E',state('.machines["noise-workshop"].remaining')>0);check('Aucun leurre consommé',state('.player.decoys')==decoys)
 shot('42_compresseur.png','Compresseur déclenché par E. Rotation et état de cycle sont produits par la simulation, sur une scène préparée.')
 page.keyboard.press('k');remaining=state('.machines["noise-workshop"].remaining');page.wait_for_timeout(350);check('Services suspendent un cycle actif',state('.machines["noise-workshop"].remaining')==remaining);close();sim(10.2);hold('e',1000);check('Machine ne redémarre pas pendant le refroidissement',state('.machines["noise-workshop"].remaining')==0 and state('.machines["noise-workshop"].cooldown')>0)
 # Track the same adult through an observed doorway using E, then B.
 scenario(27,'haul',2750,88)
 page.evaluate('''()=>{const s=__OTH_QA.state;s.noise=1;OTH_ENGINE.roomWorld(s).enemies=[{id:'browser-pursuer',type:'adult',x:2410,y:88,home:2410,state:'hunt',targetX:2750,targetY:88,stun:0,cool:0,search:5,dir:1}];}''')
 hold('e',150);check('Sortie physique par E vers le pompage',state('.room')=='pump');check('Un indice de sortie déclenche un transit',page.evaluate('__OTH_QA.state.world.haul.enemies.some(e=>e.id==="browser-pursuer"&&e.passage)'))
 hold('b',1250);check('Verrou accessible juste après une arrivée',page.evaluate('OTH_ENGINE.doorStatus(__OTH_QA.state,"e20").sealed'))
 page.wait_for_function('__OTH_QA.state.doors.e20.strain>0.1',timeout=3500);check('Griffes locales signalées sans détecteur global','PRESSION' in page.locator('#oth-presence').inner_text())
 shot('43_pression_pompage.png','Rencontre préparée : E pour passer, B pour fermer. L’adulte rejoint réellement le seuil depuis la salle précédente, puis force la cloison.')
 page.keyboard.press('k');frozen=page.evaluate('JSON.stringify([__OTH_QA.state.doors.e20,__OTH_QA.state.world.haul.enemies[0].passage])');page.wait_for_timeout(350);check('Pression et transit suspendus dans le panneau',page.evaluate('JSON.stringify([__OTH_QA.state.doors.e20,__OTH_QA.state.world.haul.enemies[0].passage])')==frozen);close()
 hold('d',650);sim(5.8)
 check('Même identité transférée une seule fois après rupture',page.evaluate('Object.values(__OTH_QA.state.world).flatMap(w=>w.enemies).filter(e=>e.id==="browser-pursuer").length')==1 and page.evaluate('__OTH_QA.state.world.pump.enemies.some(e=>e.id==="browser-pursuer")'))
 check('Verrou forcé marqué endommagé',state('.doors.e20.jammed')>0);shot('44_passage_creature.png','Même rencontre après rupture du verrou. L’adulte porte la même identité ; aucun clone n’a été ajouté pour la capture.')
 # An organic link is never given an industrial latch.
 scenario(27,'fossils',2310,88);hold('b',1000);check('Aucun verrou humain inventé sur les arches de l’épave',not state('.doors'));shot('45_seuil_epave.png','Seuil organique : absence de verrou industriel. Scène préparée dans l’épave.')
 # Save/export/import uses the same state as play, with an in-memory-store fallback disclosed.
 a=service('light-junction');scenario(0,'junction',a['x'],a['y']);hold('e',750);page.keyboard.press('Escape')
 with page.expect_download() as dl:page.locator('[data-action="export-save"]').click()
 output=R/'qa/browser-export-v04.json';dl.value.save_as(output);raw=json.loads(output.read_text());check('Export JSON schéma 4 avec état des rampes',raw['schema']==10 and 'junction' in raw['lightsOff']);close()
 scenario();page.keyboard.press('Escape');page.locator('#oth-import').set_input_files(str(output));page.wait_for_timeout(100);check('Import UI restaure la salle et le circuit',state('.room')=='junction' and 'junction' in state('.lightsOff'))
 page.keyboard.press('Escape');page.locator('#oth-import').set_input_files({'name':'invalide.json','mimeType':'application/json','buffer':b'{invalid'});page.wait_for_timeout(100);check('Import malformé refusé sans écraser la partie',state('.room')=='junction' and 'invalide' in page.locator('dialog').inner_text());close()
 # All rooms render with their original modes, including services at every anchor.
 for room in page.evaluate('OTH_DATA.DATA.rooms.map(r=>r.id)'):
  scenario(0,room);check('Rendu sans exception : '+room,not errors)
 # Readable small viewports and mobile B command.
 page.set_viewport_size({'width':390,'height':844});scenario(0,'junction',portal['x'],portal['y'])
 box=page.locator('[data-touch="b"]').bounding_box();check('Bouton tactile B visible dans le viewport',box and 0<=box['x'] and box['x']+box['width']<=390)
 page.locator('[data-touch="b"]').dispatch_event('pointerdown',{'pointerId':1,'pointerType':'touch','bubbles':True});page.wait_for_timeout(1100);page.locator('[data-touch="b"]').dispatch_event('pointerup',{'pointerId':1,'pointerType':'touch','bubbles':True})
 # Synthetic pointer capture is rejected by some Chromium builds, so use a real mouse pointer over the touch control if necessary.
 if not page.evaluate('OTH_ENGINE.doorStatus(__OTH_QA.state,"e03").sealed'):
  box=page.locator('[data-touch="b"]').bounding_box();page.mouse.move(box['x']+box['width']/2,box['y']+box['height']/2);page.mouse.down();page.wait_for_timeout(1100);page.mouse.up()
 check('Contrôle tactile B engage le verrou',page.evaluate('OTH_ENGINE.doorStatus(__OTH_QA.state,"e03").sealed'));shot('46_mobile_cloison.png','Affichage 390 × 844, contrôle B visible et verrou engagé via le contrôle de terrain.')
 page.keyboard.press('k');check('Panneau mobile sans débordement horizontal',page.evaluate('document.querySelector("dialog").scrollWidth<=document.querySelector("dialog").clientWidth+2'));shot('47_mobile_services.png','Relevé K en format mobile ; la simulation est suspendue.');close()
 page.set_viewport_size({'width':844,'height':390});scenario(0,'workshop',1780,140);hold('e',1000);check('Pied d’écran accessible en paysage',page.locator('.oth-foot').bounding_box()['y']+page.locator('.oth-foot').bounding_box()['height']<=391);shot('48_paysage_services.png','Format paysage 844 × 390. La machine et les commandes de terrain restent accessibles.')
 check('Aucune exception JavaScript dans la suite',not errors,errors)
 if not native:check('La sauvegarde des autres DLC reste intacte',page.evaluate('__TEST_STORE.get("another-dlc")')=='untouched')
 b.close()
result={'version':'0.10.0','suite':'chromium-v04','tests':len(checks),'passed':sum(c['ok'] for c in checks),'failed':sum(not c['ok'] for c in checks),'nativeNavigation':native,'nativePersistenceCertified':False,'fallback':None if native else 'document injected; explicit Map-backed localStorage test double','navigationAttempts':notes,'errors':errors,'checks':checks,'captures':shots}
(R/'qa/browser-results-v04.json').write_text(json.dumps(result,ensure_ascii=False,indent=2));(CAP/'CATALOGUE_CAPTURES_V04.json').write_text(json.dumps(shots,ensure_ascii=False,indent=2));print(json.dumps(result,ensure_ascii=False,indent=2));raise SystemExit(1 if result['failed'] else 0)
