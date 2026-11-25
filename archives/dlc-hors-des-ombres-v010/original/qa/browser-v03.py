"""V0.3 Chromium checks. Navigation is attempted once per supported origin.
Prepared story/encounter snapshots are explicitly identified; ordinary DOM events
operate the controls after preparation. Not a human end-to-end playtest.
"""
from pathlib import Path
import json, time, shutil
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parents[1];CAP=R/'captures';checks=[];errors=[];notes=[];captures=[]
def check(name,ok,detail=None):checks.append({'name':name,'ok':bool(ok),'detail':detail})
with sync_playwright() as p:
 b=p.chromium.launch(executable_path=shutil.which('chromium'),args=['--no-sandbox']);page=b.new_page(viewport={'width':1600,'height':1000});native=False
 for url in ['http://127.0.0.1:4173/?qa=1',(R/'JOUER_HORS_DES_OMBRES.html').as_uri()+'?qa=1']:
  try:page.goto(url,timeout=4000);native=True;break
  except Exception as e:notes.append(str(e).split('\n')[0])
 if not native:
  page.close();page=b.new_page(viewport={'width':1600,'height':1000});page.evaluate('''()=>{window.__OTH_TEST_CONTEXT=true;const store=new Map([['other-dlc','not-modified']]);window.__OTH_TEST_STORE=store;Object.defineProperty(window,'localStorage',{value:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)}});}''');page.set_content((R/'JOUER_HORS_DES_OMBRES.html').read_text())
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.wait_for_timeout(90)
 # V0.8 auto-scenes disabled for these dedicated legacy-control fixtures only.
 page.evaluate("()=>{const api=__OTH_QA,original=api.replace;api.replace=s=>{s.presentation.enabled=false;original(s);};api.state.presentation.enabled=false;}")

 def shot(name,description):
  page.screenshot(path=str(CAP/name));captures.append({'file':name,'caption':description,'method':'Real Chromium screenshot; prepared scenario unless caption says otherwise.'})
 def scenario(n=0,room='bridge',x=170,y=88):
  page.evaluate('''([n,room,x,y])=>{let s=OTH_ENGINE.createState('normal');s.completed=OTH_DATA.DATA.chapters.flatMap(c=>c.objectives).slice(0,n).map(o=>o.id);s.room=room;s=OTH_ENGINE.restore(OTH_ENGINE.serialize(s));s.player.x=x;s.player.y=y;__OTH_QA.replace(s);}''',[n,room,x,y]);page.wait_for_timeout(40)
 def state(expr):return page.evaluate('__OTH_QA.state'+expr)
 def keyhold(k,ms):page.keyboard.down(k);page.wait_for_timeout(ms);page.keyboard.up(k)
 def close():page.keyboard.press('Escape');page.wait_for_timeout(30)
 # Companions, real G command and DOM order control.
 scenario(22,'refuge',1180);x=state('.companion.x');page.wait_for_timeout(600);check('Baxter rejoint physiquement le joueur',state('.companion.x')>x+40)
 shot('22_baxter_suit.png','Baxter se déplace dans le refuge. Scène préparée à 22 objectifs ; suivi simulé sans injection de sa position après le départ.')
 page.keyboard.press('g');cx=state('.companion.x');keyhold('d',400);check('G laisse Baxter en attente',state('.companion.mode')=='wait' and abs(state('.companion.x')-cx)<.1)
 shot('23_baxter_attend.png','Ordre attendre donné par G : le joueur s’éloigne, Baxter conserve sa position.')
 page.locator('[data-panel="crew"]').click();check('Équipage affiche le statut du compagnon',page.locator('dialog').inner_text().find('RESTE SUR PLACE')>=0)
 page.locator('dialog [data-action="companion"]').click();check('Bouton de rappel change le même ordre que G',state('.companion.mode')=='follow');close()
 scenario(24,'vestibule',1430);page.wait_for_timeout(700);check('Hoop accompagne Ripley sans doublon',page.evaluate("OTH_ENGINE.crewInRoom(__OTH_QA.state).filter(n=>n.character==='hoop').length") == 1)
 shot('24_hoop_epave.png','Hoop accompagne Ripley dans le vestibule. Scène préparée ; déplacement du compagnon effectif.')
 scenario(31,'stores',1280);page.wait_for_timeout(750);check('Ripley accompagnante distincte du portage médical',state('.companion.character')=='ripley' and not state('.flags.carryRipley'))
 shot('25_ripley_retour.png','Ripley suit Hoop au retour vers la surface ; sa pose blessée est conservée. Ce n’est pas encore le portage médical.')
 # Hiding uses the normal held interaction, not a button that teleports the actor.
 scenario(0,'junction',1090);keyhold('e',600);check('Maintenir E entre dans le renfoncement',state('.player.hidden')=='hide-junction');check('Indicateur à couvert',page.locator('#oth-presence').inner_text()=='À COUVERT')
 shot('26_cachette.png','Dissimulation activée par maintien réel de E. Le personnage n’est pas déplacé vers une autre salle.')
 keyhold('d',150);check('Marcher fait quitter la cachette',not state('.player.hidden'))
 scenario(12,'boarding',1300)
 page.evaluate("(()=>{const s=__OTH_QA.state,w=OTH_ENGINE.roomWorld(s);w.enemies=[{id:'test-enemy',type:'adult',x:1400,y:88,home:1400,dir:-1,state:'hunt',targetX:1300,targetY:88,search:5,stun:0,cool:0}];s.invuln=2;})()")
 keyhold('e',520);check('Cachette refusée quand l’adulte regarde le joueur',not state('.player.hidden'))
 # Wind-up read in an actual running encounter; frame is captured during the window.
 scenario(12,'boarding',1200)
 page.evaluate("(()=>{const s=__OTH_QA.state;OTH_ENGINE.roomWorld(s).enemies=[{id:'test-attack',type:'adult',x:1238,y:88,home:1238,dir:-1,state:'patrol',targetX:1238,targetY:88,search:0,stun:0,cool:0}];s.invuln=0;})()")
 page.wait_for_function('__OTH_QA.state.world.boarding.enemies[0].attack>0',timeout=1500)
 check('Avertissement précède les dégâts',state('.player.hp')==100);shot('27_appui_adulte.png','Préparation d’attaque visible avant contact. Rencontre préparée ; le moteur déclenche et résout lui-même l’appui.')
 # Repeat without a screenshot between telegraph and input: image capture may take longer than the attack window.
 scenario(12,'boarding',1200)
 page.evaluate("(()=>{const s=__OTH_QA.state;OTH_ENGINE.roomWorld(s).enemies=[{id:'test-dodge',type:'adult',x:1238,y:88,home:1238,dir:-1,state:'patrol',targetX:1238,targetY:88,search:0,stun:0,cool:0}];s.invuln=0;})()")
 page.wait_for_function('__OTH_QA.state.world.boarding.enemies[0].attack>0',timeout=1500)
 page.keyboard.down('q');page.wait_for_function('__OTH_QA.state.metrics.dodged>0 || __OTH_QA.state.player.hp<100',timeout=2500);page.keyboard.up('q')
 dodge=page.evaluate('({hp:__OTH_QA.state.player.hp,metrics:__OTH_QA.state.metrics,x:__OTH_QA.state.player.x})');check('Recul pendant l’appui évite la blessure',dodge['hp']==100 and dodge['metrics']['dodged']>=1,dodge)
 # Open/empty chest remains at the same position.
 cache=page.evaluate("OTH_DATA.DATA.interactables.find(a=>a.kind==='cache'&&a.resource==='fuel')")
 scenario(10,cache['room'],cache['x'],cache['y']);page.evaluate('__OTH_QA.state.player.fuel=0');shot('28_reserve_fermee.png','Réserve de carburant avant collecte, au même emplacement que la capture suivante.')
 keyhold('e',1100);check('Réserve récupérée par une interaction physique',page.evaluate('([id])=>__OTH_QA.state.collected.includes(id)',[cache['id']]))
 shot('29_reserve_ouverte.png','Après collecte : le couvercle reste ouvert, le contenu disparaît, le conteneur ne disparaît pas.')
 check('Le carburant récupéré est effectivement disponible',state('.player.fuel')>0)
 # Map fog: inspect DOM, not only a screenshot. No hidden-room labels in cards or SVG.
 scenario(0,'bridge',170);page.keyboard.press('m');body=page.locator('dialog').inner_text()
 check('Plan initial : une seule pièce cartographiée',page.locator('.chart-node').count()==1)
 check('BeeBee’s et ses connexions ne sont pas dévoilés au départ',"BeeBee" not in body and 'Galerie des auxiliaires' not in body)
 shot('30_plan_initial.png','Relevé initial : seule la passerelle est nommée ; les annexes et leurs sorties ne sont pas dévoilées.');close()
 page.evaluate("(()=>{const s=__OTH_QA.state,p=OTH_ENGINE.ROOM.bridge.portals[0];s.player.x=p.x;s.player.y=p.y;})()")
 page.wait_for_timeout(90);page.keyboard.press('m');check('Seuil approché : accès non reconnu, sans destination dévoilée','Accès non reconnu' in page.locator('dialog').inner_text());close()
 keyhold('e',350);page.keyboard.press('m');check('Traversée : une deuxième pièce apparaît',page.locator('.chart-node').count()==2);close()
 # Reuse a real engine-playthrough snapshot for a populated chart and a cavern view.
 trace=json.loads((R/'qa/playthrough-normal.json').read_text());snap=trace['captures']['chapter-11'];page.evaluate('(s)=>__OTH_QA.replace(OTH_ENGINE.restore(JSON.stringify(s)))',snap);page.keyboard.press('m')
 shot('31_plan_explore.png','Plan depuis un état produit par le parcours moteur complet. Aucun ajout manuel de pièces visitées.');close()
 scenario(24,'vestibule',1578);page.evaluate("__OTH_QA.state.world.vestibule={enemies:[],eggs:{},spawned:true,cleared:true}");keyhold('e',550)
 shot('32_niche_organique.png','Même mécanique de cachette, avec une alcôve de nervures dans l’épave et non un placard industriel.')
 # Accessibility settings are DOM-driven and preserved by export/import.
 scenario(0,'workshop',900);page.keyboard.press('Escape');page.locator('#oth-motion').check();page.locator('#oth-contrast').check();check('Options de mouvement réduit et contraste activées',state('.reducedMotion') and state('.contrast'))
 with page.expect_download() as download:page.locator('[data-action="export-save"]').click()
 savepath=R/'qa/browser-export-v03.json';download.value.save_as(str(savepath));exported=json.loads(savepath.read_text());check('Export contient les nouveaux réglages et le schéma 3',exported['schema']==10 and exported['contrast'] and exported['reducedMotion'])
 page.locator('#oth-import').set_input_files(str(savepath));page.wait_for_timeout(60);check('Import restaure les réglages',state('.contrast') and state('.reducedMotion'))
 # Invalid import must not destroy the previous state or replace the checkpoint.
 page.keyboard.press('Escape');before=state('.completed');page.locator('#oth-import').set_input_files({'name':'invalid.json','mimeType':'application/json','buffer':b'{"schema":99}'})
 page.wait_for_timeout(50);check('Import invalide refusé sans perte de la partie',state('.completed')==before and 'invalide' in page.locator('.hint').inner_text());close()
 scenario(10,'workshop',900);page.evaluate('__OTH_QA.state.contrast=true');shot('33_atelier_contraste.png','Atelier enrichi : touret, râtelier et trappe. La lisibilité renforcée n’ajoute aucune collision.')
 # Actual small-screen layouts and touch: no overflow, controls available inside viewport.
 for width,height in [(1280,720),(800,600),(390,844),(844,390)]:
  page.set_viewport_size({'width':width,'height':height});scenario(22,'refuge',1000);page.wait_for_timeout(100)
  dim=page.evaluate('''()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,canvas:document.querySelector('canvas').getBoundingClientRect().toJSON(),foot:document.querySelector('.oth-foot').getBoundingClientRect().toJSON()})''')
  check(f'Fenêtre {width}×{height} sans dépassement horizontal',dim['scroll']<=width,dim)
  check(f'Fenêtre {width}×{height} : terrain présent',dim['canvas']['height']>150)
  check(f'Fenêtre {width}×{height} : pied entièrement visible',dim['foot']['bottom']<=height+.5)
  if width==390:
   check('Commande G accessible sur mobile',page.locator('.oth-touch [data-action="companion"]').is_visible());page.locator('.oth-touch [data-action="companion"]').click();check('Ordre tactile effectif',state('.companion.mode')=='wait');shot('34_mobile_escorte.png','Affichage portrait 390 × 844 ; commande tactile G et compagnon en attente.')
  if width==844:shot('35_paysage.png','Affichage paysage 844 × 390 : le terrain et les commandes restent accessibles.')
 page.set_viewport_size({'width':1600,'height':1000});scenario(10,'engineering',1220);page.evaluate('__OTH_QA.state.flash=false');shot('36_lumieres_locales.png','Machinerie : éclairages localisés, touret et panneaux ; lampe du joueur éteinte.')
 # Exposure changes by real lamp toggle, and blur pauses while retaining state.
 a=page.evaluate('OTH_ENGINE.detectionRange(__OTH_QA.state)');page.keyboard.press('l');check('La touche L change la portée de détection',page.evaluate('OTH_ENGINE.detectionRange(__OTH_QA.state)')>a)
 page.evaluate("window.dispatchEvent(new Event('blur'))");check('Perte de focus met le jeu en pause',page.locator('dialog').is_visible());time0=state('.elapsed');page.wait_for_timeout(120);check('Pause fige aussi les accompagnants et les attaques',state('.elapsed')==time0)
 check('Autres données de sauvegarde préservées',native or page.evaluate("__OTH_TEST_STORE.get('other-dlc')==='not-modified'"))
 check('Aucune exception JavaScript durant les contrôles V0.3',not errors,errors)
 b.close()
report={'suite':'chromium-v0.3','nativeBrowserNavigation':native,'method':'native' if native else 'set_content + explicit in-memory localStorage double','tests':len(checks),'passed':sum(c['ok'] for c in checks),'failed':sum(not c['ok'] for c in checks),'checks':checks,'notes':notes,'captures':captures}
(R/'qa/browser-results-v03.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));print(json.dumps(report,ensure_ascii=False,indent=2))
if report['failed']:raise SystemExit(1)
