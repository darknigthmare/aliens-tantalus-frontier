"""V0.5 integration checks: real rendered HTML and ordinary keys on prepared scenes.
Native loading is attempted, never inferred from successful set_content execution.
"""
from pathlib import Path
import json,shutil,hashlib
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parents[1];CAP=R/'captures';checks=[];errors=[];notes=[];shots=[]
def check(name,ok,detail=None):
 checks.append({'name':name,'ok':bool(ok),'detail':detail});print('CHECK',bool(ok),name,flush=True)
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
  page.screenshot(path=str(CAP/name));shots.append({'file':name,'caption':caption,'method':'Capture réelle Chromium du HTML V0.8 (scénario de non-régression V0.5). Scène préparée puis touches ou simulation décrites dans la légende.'})
 def scenario(n=0,room='bridge',x=170,y=88,clear=False):
  page.evaluate('''([n,room,x,y,clear])=>{const s=OTH_ENGINE.createState();s.completed=OTH_DATA.DATA.chapters.flatMap(c=>c.objectives).slice(0,n).map(o=>o.id);s.room=room;const v=OTH_ENGINE.restore(OTH_ENGINE.serialize(s));v.player.x=x;v.player.y=y;if(clear)OTH_ENGINE.roomWorld(v).enemies=[];__OTH_QA.replace(v);}''',[n,room,x,y,clear]);page.wait_for_timeout(50)
 def state(expr):return page.evaluate('__OTH_QA.state'+expr)
 def hold(key,ms):page.keyboard.down(key);page.wait_for_timeout(ms);page.keyboard.up(key)
 def close():page.keyboard.press('Escape');page.wait_for_timeout(40)
 def sim(seconds,controls=None):page.evaluate('''([seconds,input])=>{for(let i=0;i<seconds/.05;i++)__OTH_QA.step(input||{},.05)}''',[seconds,controls]);page.wait_for_timeout(35)
 def adult(room,x,y=88,id='browser-acoustic'):
  page.evaluate('''([room,x,y,id])=>{const s=__OTH_QA.state;s.world[room]={enemies:[{id,type:'adult',x,y,home:x,state:'patrol',targetX:x,targetY:y,stun:0,cool:0,search:0,dir:-1}],eggs:{},cleared:false,spawned:true,visitTime:s.elapsed};}''',[room,x,y,id])
 check('Version HTML V0.5 chargée',page.locator('meta[name="application-version"]').get_attribute('content')=='0.10.0')
 shot('49_menu_v05.png','Menu de la V0.5 ; ouverture initiale, sans état de campagne injecté.')
 page.locator('[data-action="continue"]').click();x=state('.player.x');t=state('.elapsed');page.keyboard.down('v');page.keyboard.down('d');page.wait_for_timeout(350)
 check('V immobilise le joueur malgré D',state('.player.x')==x);check('V ne suspend pas le temps',state('.elapsed')>t);check('Le statut d’écoute est lisible','ÉCOUTE' in page.locator('#oth-message').inner_text());shot('50_ecoute.png','V tenu dans la passerelle. Le joueur s’arrête, mais la simulation continue ; aucun contact silencieux n’est inventé.')
 page.keyboard.up('v');page.wait_for_timeout(180);page.keyboard.up('d');check('Relâcher V permet de repartir',state('.player.x')>x)
 # A physical torch burst carries through one eligible adjacency.
 scenario(27,'pump',190,88,True);adult('haul',2600);hold('f',100);page.wait_for_timeout(80)
 check('La flamme engage une enquête dans la pièce voisine',page.evaluate('__OTH_QA.state.world.haul.enemies[0].passage?.reason')=='sound')
 check('Le joueur n’a pas changé de pièce',state('.room')=='pump');check('Une trace de chaleur est rendue',page.evaluate('__OTH_QA.state.residue.pump.some(q=>q.kind==="scorch")'))
 # At x190 the latch is physically reachable. The investigator reaches it on its own.
 hold('b',1050);page.wait_for_timeout(500);page.keyboard.down('v');page.wait_for_timeout(160)
 check('L’écoute distingue une pression au seuil',page.evaluate('OTH_ENGINE.listenReport(__OTH_QA.state).signals.some(q=>q.edge==="e20")'))
 shot('51_ecoute_cloison.png','Scène préparée : un adulte dans la galerie. F émet le bruit, B ferme, puis V écoute sa pression depuis le pompage. Aucun changement de pièce du joueur.')
 page.keyboard.up('v');page.keyboard.press('k');before=page.evaluate('JSON.stringify([__OTH_QA.state.elapsed,__OTH_QA.state.soundField,__OTH_QA.state.world.haul.enemies[0].passage])');page.wait_for_timeout(220)
 check('La lecture suspend aussi l’enquête acoustique',page.evaluate('JSON.stringify([__OTH_QA.state.elapsed,__OTH_QA.state.soundField,__OTH_QA.state.world.haul.enemies[0].passage])')==before);close()
 page.evaluate('__OTH_QA.state.player.x=700');sim(8)
 check('Même identité traverse après rupture',page.evaluate('Object.values(__OTH_QA.state.world).flatMap(w=>w.enemies).filter(e=>e.id==="browser-acoustic").length')==1 and page.evaluate('__OTH_QA.state.world.pump.enemies.some(e=>e.id==="browser-acoustic")'))
 check('Griffures enregistrées aux deux faces',page.evaluate('["haul","pump"].every(id=>__OTH_QA.state.residue[id]?.some(q=>q.kind==="scrape"))'))
 shot('52_enquete_sonore.png','Même rencontre après simulation de la rupture et du passage. Le point du joueur a été préparé plus loin pour observer le transfert sans l’interrompre.')
 # A machine is a loud, local masking source.
 scenario(27,'pump',410,145,True);hold('e',1000);page.keyboard.down('v');page.wait_for_timeout(150)
 check('Une machine active masque les sons faibles',page.evaluate('OTH_ENGINE.listenReport(__OTH_QA.state).masked'));shot('53_masque_machine.png','Cycle de rinçage déclenché par E, écoute maintenue avec V. Le moteur masque les pas proches, sans désactiver la menace.')
 page.keyboard.up('v')
 # A visible casing persists after the real five-second lifetime.
 scenario(12,'boarding',1050,88,True);hold('r',2000);check('Un appui R prolongé ne dépense qu’une charge',state('.player.decoys')==7)
 shot('54_leurre_actif.png','Un seul boîtier lancé malgré deux secondes de maintien de R. Le signal est actif à son point d’impact.')
 sim(5.2);check('Un boîtier épuisé persiste au sol',state('.lures')==[] and page.evaluate('__OTH_QA.state.residue.boarding.some(q=>q.kind==="decoy")'))
 hold('f',100);page.wait_for_timeout(650);shot('55_traces_sol.png','Même secteur après expiration du leurre, puis une brève flamme. Boîtier et marque de chaleur restent au sol ; ils ne bloquent pas le passage.')
 # Two completed inspections establish bounded local memory, then a third toss.
 scenario(12,'boarding',750,88,True);adult('boarding',974,id='learner')
 page.evaluate('''()=>{const s=__OTH_QA.state;for(let n=0;n<2;n++){s.player.x=750;s.player.face=1;s.decoyCooldown=0;OTH_ENGINE.dropDecoy(s);s.player.x=200;for(let i=0;i<24;i++)__OTH_QA.step({},.05);}s.player.x=750;s.decoyCooldown=0;OTH_ENGINE.dropDecoy(s);s.player.x=200;for(let i=0;i<3;i++)__OTH_QA.step({},.05);}''');page.wait_for_timeout(60)
 check('Deux inspections suivies d’un leurre ignoré',state('.metrics.decoysInspected')==2 and state('.metrics.decoysIgnored')>=1)
 shot('56_signal_reconnu.png','Trois lancers préparés au même endroit avec déplacements de fixture entre les essais. L’IA a effectué les deux inspections en simulation ; le troisième signal est ignoré.')
 # Genuine local line-of-sight response from the dynamic companion.
 scenario(24,'vestibule',1100,105,True);adult('vestibule',1250,105,'crew-threat');page.wait_for_timeout(180)
 check('Compagnon avertit et prend une posture prudente',state('.companion.alert')>0 and state('.companion.crouch'))
 shot('57_compagnon_prudence.png','Hoop auprès de Ripley : menace préparée dans sa ligne de vue. Son alerte et sa posture résultent des pas de simulation, pas d’un dialogue injecté.')
 hold('g',50);pos=page.evaluate('[__OTH_QA.state.companion.x,__OTH_QA.state.companion.y]');page.wait_for_timeout(180)
 check('L’ordre attendre reste respecté malgré le danger',state('.companion.mode')=='wait' and page.evaluate('[__OTH_QA.state.companion.x,__OTH_QA.state.companion.y]')==pos)
 # Evidence panel is read-only and based on player-emitted sounds.
 scenario(12,'boarding',1050,88,True);hold('r',80);sim(5.1);hold('f',80);page.keyboard.press('Escape');page.locator('[data-panel="evidence"]').click()
 check('Panneau Traces et sons disponible','Empreintes du passage' in page.locator('dialog').inner_text());check('Panneau terrain sans télécommande',page.locator('dialog [data-action]').count()==0)
 check('Traces réelles affichées','Boîtier épuisé' in page.locator('dialog').inner_text() and 'Trace de chaleur' in page.locator('dialog').inner_text());shot('58_journal_terrain.png','Journal ouvert depuis la pause : sons émis et traces obtenues dans la séquence précédente. Il ne révèle pas les ennemis cachés.')
 t=state('.elapsed');page.wait_for_timeout(250);check('Relevé de terrain en pause',state('.elapsed')==t);close()
 page.keyboard.press('Escape')
 with page.expect_download() as dl:page.locator('[data-action="export-save"]').click()
 output=R/'qa/browser-export-v05.json';dl.value.save_as(output);raw=json.loads(output.read_text());check('Export schéma 5 avec preuves de terrain',raw['schema']==10 and raw['residue']['boarding']);close()
 scenario();page.keyboard.press('Escape');page.locator('#oth-import').set_input_files(str(output));page.wait_for_timeout(100);check('Import rétablit les traces et les sons produits',state('.room')=='boarding' and state('.residue')==raw['residue'] and state('.soundLog')==raw['soundLog'])
 page.keyboard.press('Escape');page.locator('#oth-import').set_input_files({'name':'corrupt.json','mimeType':'application/json','buffer':b'{nope'});page.wait_for_timeout(100);check('Import corrompu ne remplace pas la partie',state('.residue')==raw['residue']);close()
 # Regression of explicit visibility, not a brittle hard-coded codex card count.
 page.keyboard.press('j');page.locator('#oth-search').fill('Un leurre ne rend pas invisible');check('Nouvelle fiche de survie consultable',page.locator('.oth-codex-card').count()==1);close()
 # Real pointer on the small-screen V control; no synthetic pointer capture workaround.
 page.set_viewport_size({'width':390,'height':844});scenario();box=page.locator('[data-touch="v"]').bounding_box();check('V tactile dans le viewport',0<=box['x'] and box['x']+box['width']<=390 and box['y']+box['height']<=844)
 page.mouse.move(box['x']+box['width']/2,box['y']+box['height']/2);page.mouse.down();page.wait_for_timeout(250)
 check('V tactile maintient l’écoute',state('.listening'));shot('59_mobile_ecoute.png','390 × 844 : maintien réel du bouton tactile V avec un pointeur. Le relevé ne masque pas le personnage ni les directions.')
 page.mouse.up();page.wait_for_timeout(90);check('Relâchement du pointeur arrête l’écoute',not state('.listening'))
 page.set_viewport_size({'width':844,'height':390});scenario();page.keyboard.down('v');page.wait_for_timeout(120)
 foot=page.locator('.oth-foot').bounding_box();check('Pied d’écran complet en paysage',foot['y']+foot['height']<=391)
 check('Pas de débordement horizontal global en paysage',page.evaluate('document.documentElement.scrollWidth<=innerWidth'))
 shot('60_paysage_ecoute.png','844 × 390 : écoute active en paysage. La simulation n’est pas arrêtée ; les commandes et le pied d’écran restent dans le viewport.');page.keyboard.up('v')
 # Interactive objects no longer erase the whole actor on a foreground overlap.
 page.set_viewport_size({'width':1600,'height':1000});scenario(27,'pump',1150,88,True)
 check('Coffret devant le joueur rendu avec transparence locale',page.evaluate('''()=>{const a=OTH_DATA.DATA.interactables.find(a=>a.id==='light-pump');return OTH_RENDER.occlusionAlpha(__OTH_QA.state,'activity',{...a,y:a.y-46})===.3;}'''))
 shot('61_coffret_transparent.png','Correction trouvée à la revue des captures : même position devant le coffret du pompage. Le coffret au premier plan s’estompe pour laisser voir Ripley ; la collision n’est pas modifiée.')
 # WebAudio nodes are exercised, not claimed as a listened-to mix certification.
 scenario(12,'boarding',850,88,True);page.keyboard.press('Escape');page.locator('#oth-sound').check();page.locator('[data-action="resume"]').click();hold('r',80);page.wait_for_timeout(100)
 check('Signaux sonores procéduraux effectivement déclenchés',page.evaluate('__OTH_QA.audioStatus.cuesPlayed')>0)
 page.keyboard.press('Escape');page.wait_for_timeout(80);check('Pause suspend le contexte sonore',page.evaluate('__OTH_QA.audioStatus.state')=='suspended')
 page.locator('#oth-sound').uncheck();close()
 # Every room still renders after the extension, on its author-specified mode.
 page.set_viewport_size({'width':1280,'height':720})
 for room in page.evaluate('OTH_DATA.DATA.rooms.map(r=>r.id)'):
  scenario(0,room);check('Rendu V0.5 sans exception : '+room,not errors)
 check('Aucune exception JavaScript pendant la suite',not errors,errors)
 if not native:check('Stockage des autres DLC laissé intact',page.evaluate('__TEST_STORE.get("another-dlc")')=='untouched')
 b.close()
result={'version':'0.10.0','suite':'chromium-v05','tests':len(checks),'passed':sum(c['ok'] for c in checks),'failed':sum(not c['ok'] for c in checks),'htmlSHA256':hashlib.sha256((R/'JOUER_HORS_DES_OMBRES.html').read_bytes()).hexdigest(),'nativeNavigation':native,'nativePersistenceCertified':False,'fallback':None if native else 'document injected; explicit Map-backed localStorage test double','navigationAttempts':notes,'errors':errors,'checks':checks,'captures':shots}
(R/'qa/browser-results-v05.json').write_text(json.dumps(result,ensure_ascii=False,indent=2));(CAP/'CATALOGUE_CAPTURES_V05.json').write_text(json.dumps(shots,ensure_ascii=False,indent=2));print(json.dumps(result,ensure_ascii=False,indent=2));raise SystemExit(1 if result['failed'] else 0)
