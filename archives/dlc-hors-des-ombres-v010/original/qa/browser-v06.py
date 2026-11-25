"""V0.8 UI integration: ordinary keyboard/pointer controls on explicit scene fixtures.
Screenshots are actual rendered frames, never concept illustrations. Native loading
is attempted first and reported separately from document-injection validation.
"""
from pathlib import Path
import json,shutil,hashlib
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parents[1];CAP=R/'captures';checks=[];errors=[];notes=[];shots=[]
def check(name,ok,detail=None): checks.append({'name':name,'ok':bool(ok),'detail':detail})
with sync_playwright() as p:
 b=p.chromium.launch(executable_path=shutil.which('chromium'),args=['--no-sandbox']);page=b.new_page(viewport={'width':1600,'height':1000});native=False
 page.on('pageerror',lambda e:errors.append(str(e)))
 for url in ['http://127.0.0.1:4173/?qa=1',(R/'JOUER_HORS_DES_OMBRES.html').as_uri()+'?qa=1']:
  try:page.goto(url,timeout=4500);native=True;break
  except Exception as e:notes.append(str(e).split('\n')[0])
 if not native:
  page.close();page=b.new_page(viewport={'width':1600,'height':1000});page.on('pageerror',lambda e:errors.append(str(e)))
  page.evaluate('''()=>{window.__OTH_TEST_CONTEXT=true;window.__TEST_STORE=new Map([['other-dlc','unchanged']]);Object.defineProperty(window,'localStorage',{value:{getItem:k=>__TEST_STORE.get(k)||null,setItem:(k,v)=>__TEST_STORE.set(k,String(v)),removeItem:k=>__TEST_STORE.delete(k)}});}''')
  page.set_content((R/'JOUER_HORS_DES_OMBRES.html').read_text())
 page.wait_for_timeout(100)
 # V0.8 auto-scenes disabled for these dedicated legacy-control fixtures only.
 page.evaluate("()=>{const api=__OTH_QA,original=api.replace;api.replace=s=>{s.presentation.enabled=false;original(s);};api.state.presentation.enabled=false;}")

 def state(expr):return page.evaluate('__OTH_QA.state'+expr)
 def shot(name,caption):
  page.screenshot(path=str(CAP/name));shots.append({'file':name,'caption':caption,'method':'Capture Chromium V0.8 ; états de scène préparés, puis commandes / simulation explicitement décrites.'})
 def scenario(n=0,room='bridge',x=170,y=88):
  page.evaluate('''([n,room,x,y])=>{const s=OTH_ENGINE.createState();s.completed=OTH_DATA.DATA.chapters.flatMap(c=>c.objectives).slice(0,n).map(o=>o.id);s.room=room;const v=OTH_ENGINE.restore(OTH_ENGINE.serialize(s));v.player.x=x;v.player.y=y;OTH_ENGINE.roomWorld(v).enemies=[];__OTH_QA.replace(v);}''',[n,room,x,y]);page.wait_for_timeout(60)
 def stock(count=8):
  page.evaluate('''count=>{const s=__OTH_QA.state,old=[s.room,s.player.x,s.player.y];for(const a of OTH_DATA.DATA.interactables.filter(a=>a.kind==='salvage').slice(0,count)){s.room=a.room;s.player.x=a.x;s.player.y=a.y;if(!s.visited.includes(a.room))s.visited.push(a.room);OTH_ENGINE.useActivity(s,a.id);}s.room=old[0];s.player.x=old[1];s.player.y=old[2];}''',count)
 def hold(key,ms):page.keyboard.down(key);page.wait_for_timeout(ms);page.keyboard.up(key)
 def close():page.keyboard.press('Escape');page.wait_for_timeout(80)
 def repair_step(id,n):
  page.keyboard.up('e');page.wait_for_timeout(90);page.keyboard.down('e')
  page.wait_for_function('''([id,n])=>OTH_ENGINE.maintenanceStatus(__OTH_QA.state,id).stage===n''',arg=[id,n],timeout=7000)
  page.wait_for_timeout(80);page.keyboard.up('e')
 check('HTML courant et schéma 8',page.locator('meta[name="application-version"]').get_attribute('content')=='0.10.0' and state('.schema')==10)
 shot('62_menu_v06.png','Menu au chargement initial. La marque V0.8 distingue cette archive des versions précédentes.')
 page.locator('[data-action="continue"]').click();page.keyboard.press('i')
 check('I ouvre le sac, sans accès de fabrication distante',page.locator('#oth-dialog-title').inner_text()=='Le sac de maintenance' and page.locator('[data-craft]').count()==0)
 now=state('.elapsed');page.wait_for_timeout(150);check('Le sac suspend réellement le monde',state('.elapsed')==now);close()
 scenario(0,'engineering',350);hold('e',1200)
 check('E récupère trois pièces une fois',state('.maintenance.parts')==3 and len(state('.maintenance.salvaged'))==1)
 shot('63_casier_ouvert.png','Fixture au casier des machines ; collecte par E. Le casier reste ouvert, sans disparition de son support.')
 hold('e',1400);check('Appui prolongé sans duplication du casier',state('.maintenance.parts')==3)
 # A complete gate with actual holds; state placement is the only fixture shortcut.
 page.evaluate('''()=>{const s=__OTH_QA.state;s.room='rec';s.player.x=925;s.player.y=88;if(!s.visited.includes('rec'))s.visited.push('rec');OTH_ENGINE.roomWorld(s);}''');page.wait_for_timeout(90)
 shot('64_traverse_fermee.png','Fixture au seuil sanitaire non réparé. Les trois étapes et les pièces ne sont pas prévalidées.')
 repair_step('repair-medical',1);check('Premier geste validé, aucune pièce débitée',state('.maintenance.repairs["repair-medical"]')==1 and state('.maintenance.parts')==3)
 # Keep the same second press long enough to complete replacement, but not testing.
 repair_step('repair-medical',2);check('Remplacement : trois pièces débitées exactement',state('.maintenance.parts')==0)
 shot('65_connecteurs_poses.png','Deux étapes accomplies au clavier : le capot et les connecteurs changent visuellement. Le passage est encore fermé.')
 page.keyboard.press('i');check('L’étape 2/3 apparaît dans le sac','2/3' in page.locator('dialog').inner_text())
 page.locator('[data-track="repair-medical"]').click();check('Chantier observé suivi dans le HUD',state('.maintenance.tracked')=='repair-medical');shot('66_sac_chantier.png','Le chantier découvert figure dans le sac ; repère facultatif activé par son bouton. La progression principale n’est pas remplacée.');close()
 # Backup and import while the repair is partially completed.
 page.keyboard.press('Escape')
 with page.expect_download() as dl:page.locator('[data-action="export-save"]').click()
 export=R/'qa/browser-export-v06.json';dl.value.save_as(export);old=json.loads(export.read_text())
 check('Export physique schéma 8, étape 2 et paiement conservés',old['schema']==10 and old['maintenance']['repairs']['repair-medical']==2 and old['maintenance']['parts']==0)
 page.locator('#oth-import').set_input_files(str(export));page.wait_for_timeout(100)
 check('Import restaure l’étape sans demander de nouvelles pièces',state('.maintenance.repairs["repair-medical"]')==2 and state('.maintenance.parts')==0)
 repair_step('repair-medical',3);check('Troisième geste ouvre la liaison',page.evaluate('OTH_ENGINE.activeEdges(__OTH_QA.state).some(e=>e.id==="service-medical")'))
 shot('67_traverse_retablie.png','Trois gestes terminés par E après réimport du carnet intermédiaire. Le même mécanisme ouvre les deux faces.')
 page.wait_for_timeout(900);hold('e',220);check('Franchissement par E vers l’infirmerie',state('.room')=='medical')
 page.keyboard.press('m');check('Le plan local contient les pieds et le passage visité',page.locator('.local-plan').is_visible() and 'VOUS' in page.locator('.local-plan').inner_text())
 check('Aucune balise ennemie dans le plan local',not page.evaluate('JSON.stringify(OTH_ENGINE.localChart(__OTH_QA.state)).includes("enemies")'))
 shot('68_plan_proximite.png','Plan ouvert après le franchissement réel. Le relevé utilise les coordonnées de la pièce et ne place aucun ennemi.');close()
 # Station recipes use physical proximity and the opened workbench panel.
 scenario(9,'workshop',930);stock();hold('e',800)
 check('E à l’établi ouvre trois recettes locales',page.locator('[data-craft]').count()==3 and state('.reading.kind')=='fabricator')
 for rid,key,value in [('decoy','decoys',9),('fuel','fuel',92),('kit','kits',4)]:
  page.locator('[data-craft="'+rid+'"]').click();check('Recette '+rid+' change réellement le stock',state('.player.'+key)==value)
 check('Coût total des trois recettes : neuf pièces',state('.maintenance.parts')==15)
 shot('69_etabli_reassort.png','Établi ouvert par E. Stock de composants préparé par collectes de fixture ; les trois recettes sont exécutées par leurs boutons et débitent neuf pièces au total.')
 page.locator('[data-craft="kit"]').click();parts=state('.maintenance.parts');check('Bouton de soin désactivé au plafond',page.locator('[data-craft="kit"]').is_disabled() and state('.player.kits')==5);check('Capacité refusée sans débit supplémentaire',state('.maintenance.parts')==parts)
 close();page.keyboard.press('i');check('Même inventaire, pas de recette loin du panneau',page.locator('[data-craft]').count()==0);close()
 # Cargo doorway retains its story chapter gate.
 scenario(0,'workshop',630);stock(1);hold('e',1500);check('Desserte du hangar refusée avant le chapitre requis',not state('.maintenance.repairs').get('repair-cargo') and state('.maintenance.parts')==3)
 scenario(9,'workshop',630);stock(1)
 for n in (1,2,3):repair_step('repair-cargo',n)
 shot('70_desserte_manutention.png','Chapitre autorisé préparé ; les trois gestes ouvrent la desserte de l’atelier. Aucun changement des objectifs de campagne.')
 # Mine transfer with identity preserved once the gate is repaired.
 scenario(27,'drain',395);stock(1)
 for n in (1,2,3):repair_step('repair-mine',n)
 page.evaluate('''()=>{const s=__OTH_QA.state;s.world.vein={spawned:true,cleared:false,eggs:{},visitTime:s.elapsed,enemies:[{id:'browser-v06-adult',type:'adult',x:520,y:88,home:520,state:'patrol',targetX:520,targetY:88,dir:1,stun:0,cool:0,search:0}]};}''')
 hold('f',100);check('Un bruit traverse la liaison minière rétablie',page.evaluate('__OTH_QA.state.world.vein.enemies[0]?.passage?.edge')=='service-mine')
 page.evaluate('__OTH_QA.state.player.x=900');page.evaluate('''()=>{for(let i=0;i<140;i++)__OTH_QA.step({},.05)}''');page.wait_for_timeout(70)
 check('Même adulte transféré une seule fois',page.evaluate('Object.entries(__OTH_QA.state.world).flatMap(([r,w])=>w.enemies.filter(e=>e.id==="browser-v06-adult").map(e=>r))')==['drain'])
 shot('71_contact_traverse.png','Traverse minière réparée au clavier. Un adulte préparé dans la pièce voisine entend F, puis franchit le seuil avec le même identifiant ; le joueur est placé plus loin pour observer.')
 # Work is cancellable before its next committed stage.
 scenario(0,'rec',925);stock(1);repair_step('repair-medical',1)
 page.keyboard.down('e');page.wait_for_timeout(700);page.keyboard.down('d');page.wait_for_timeout(150);page.keyboard.up('d');page.keyboard.up('e')
 check('Déplacement coupe le geste sans consommer',state('.maintenanceHold')==0 and state('.maintenance.parts')==3 and state('.maintenance.repairs["repair-medical"]')==1)
 # Pointer/mobile and dialog overflow, not only emulated keyboard.
 page.set_viewport_size({'width':390,'height':844});scenario(0,'refuge',710);stock();page.keyboard.press('Escape');page.locator('[data-panel="kit"]').click()
 check('Sac accessible depuis la pause au format tactile',page.locator('#parts-total').is_visible())
 check('Pas de dépassement horizontal sur mobile',page.evaluate('document.documentElement.scrollWidth<=innerWidth && document.querySelector("dialog").scrollWidth<=document.querySelector("dialog").clientWidth+1'))
 shot('72_mobile_sac.png','390 × 844 : sac ouvert depuis le menu pause, sans raccourci clavier réservé au bureau. Le contenu reste défilable dans la fenêtre.');close()
 page.keyboard.press('m');check('Plan local mobile à la largeur de sa fenêtre',page.locator('.local-plan svg').bounding_box()['width']<=366)
 shot('73_mobile_plan.png','390 × 844 : relevé de proximité et connexions accessibles dans la même fenêtre. Aucun voyage rapide.');close()
 for width,height in [(1280,720),(800,600),(844,390)]:
  page.set_viewport_size({'width':width,'height':height});scenario(0,'rec',925);page.keyboard.press('i')
  check('Dialogue maintenance '+str(width)+'×'+str(height),page.evaluate('document.documentElement.scrollWidth<=innerWidth && document.querySelector("dialog").getBoundingClientRect().height<=innerHeight'))
  close()
 page.set_viewport_size({'width':1600,'height':1000});scenario(0,'rec',925);page.keyboard.press('Escape')
 before=state('.maintenance');page.locator('#oth-import').set_input_files({'name':'bad.json','mimeType':'application/json','buffer':b'{not a save'});page.wait_for_timeout(100)
 check('Import invalide laisse les nouveaux champs intacts',state('.maintenance')==before);close()
 if not native:check('Une autre sauvegarde reste intacte',page.evaluate('__TEST_STORE.get("other-dlc")==="unchanged"'))
 check('Aucune exception JavaScript nouvelle',not errors,errors)
 b.close()
result={'version':'0.10.0','suite':'chromium-v06-maintenance','tests':len(checks),'passed':sum(c['ok'] for c in checks),'failed':sum(not c['ok'] for c in checks),'htmlSHA256':hashlib.sha256((R/'JOUER_HORS_DES_OMBRES.html').read_bytes()).hexdigest(),'nativeNavigation':native,'nativePersistenceCertified':False,'fallback':None if native else 'document injected; explicit in-memory localStorage test double','navigationAttempts':notes,'errors':errors,'checks':checks,'captures':shots}
(R/'qa/browser-results-v06.json').write_text(json.dumps(result,ensure_ascii=False,indent=2));print(json.dumps(result,ensure_ascii=False,indent=2))
if result['failed']:raise SystemExit(1)
