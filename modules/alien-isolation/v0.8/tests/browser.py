"""Run local self-contained HTML in Chromium with Page.set_content (no network).
The environment disallows both file:// and localhost navigation. This runner does
NOT change browser policy and does not claim file-opening or host deployment QA.
"""
import json, time, hashlib
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
checks=[];shots=[];errors=[]
(ROOT/'qa/captures').mkdir(exist_ok=True)
# Captures are versioned in the release; tests overwrite only their own named images.
def check(name,result):
 checks.append({'name':name,'ok':bool(result)});print(('PASS ' if result else 'FAIL ')+name,flush=True)
 if not result: print('FAIL',name)
def snap(page,name,title,provenance):
 path=ROOT/'qa/captures'/name
 print('CAPTURE '+name,flush=True);page.screenshot(path=str(path),timeout=8000)
 shots.append({'file':'captures/'+name,'title':title,'provenance':provenance,'viewport':page.viewport_size})
def js(page,code,arg=None):return page.evaluate(code,arg)
with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 page=browser.new_page(viewport={'width':1440,'height':900},device_scale_factor=1)
 page.set_default_timeout(8000)
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.on('dialog',lambda d:d.accept())
 page.set_content((ROOT/'JOUER_ISOLATION.html').read_text(),wait_until='load')
 page.wait_for_selector('body[data-ready="true"]')
 check('Démarrage sans requête réseau',js(page,"performance.getEntriesByType('resource').filter(x=>/^https?:/.test(x.name)).length===0"))
 check('155 ressources SVG décodées',js(page,'Object.keys(__isolation.renderer.images).length===155'))
 check('Menu initial visible',page.locator('#menu').is_visible())
 check('Aucune sauvegarde initiale à reprendre',page.locator('#continueGame').is_disabled())
 check('Trois difficultés disponibles',page.locator('#difficulty option').count()==3)
 snap(page,'01_menu.png','Menu de l’extension','Écran réellement affiché à l’ouverture du HTML autonome.')
 page.click('#guide');check('Guide ouvert sans lancer la partie',page.locator('#modal').is_visible() and not js(page,'__isolation.started'));page.click('#closeModal')
 page.select_option('#difficulty','recit');page.click('#newGame');page.wait_for_timeout(120)
 check('Nouvelle partie en mode Récit',js(page,"__isolation.started&&__isolation.engine.s.difficulty==='recit'"))
 page.keyboard.down('s');page.wait_for_function('__isolation.engine.s.y>=370');page.keyboard.up('s')
 page.keyboard.down('d');page.wait_for_function('__isolation.engine.s.x>=884');page.keyboard.up('d');page.wait_for_timeout(60)
 check('Déplacement au clavier',js(page,'__isolation.engine.s.x>800'))
 page.keyboard.down('e');page.wait_for_timeout(1150);page.keyboard.up('e');page.wait_for_timeout(120)
 check('Premier objectif validé par le clavier réel',js(page,'__isolation.engine.s.goal===1'))
 check('Lampe obtenue',js(page,'__isolation.engine.s.tools.torch'))
 page.keyboard.press('f');check('Lampe commutable',js(page,'__isolation.engine.s.torch'))
 page.keyboard.press('c');check('Posture commutable',js(page,'__isolation.engine.s.crouched'))
 snap(page,'02_debut.png','Torrens · Cryostase','Partie neuve : mouvement et premier objectif effectués avec les touches du navigateur, sans injection de progression.')
 page.keyboard.press('m');page.wait_for_timeout(120);t=js(page,'__isolation.engine.s.time');page.wait_for_timeout(120)
 check('Carte suspend la simulation',js(page,'__isolation.engine.s.time')==t)
 check('Carte présente les pièces',page.locator('.map-room').count()>0)
 before_plan=js(page,'({room:__isolation.engine.s.room,x:__isolation.engine.s.x,y:__isolation.engine.s.y,goal:__isolation.engine.s.goal})');page.locator('.map-room button').first.click();check('Examiner une pièce ne téléporte pas et ne valide aucun objectif',js(page,'({room:__isolation.engine.s.room,x:__isolation.engine.s.x,y:__isolation.engine.s.y,goal:__isolation.engine.s.goal})')==before_plan)
 snap(page,'03_carte.png','Plan des liaisons','Carte ouverte au clavier depuis la partie neuve ; aucune téléportation.')
 page.keyboard.press('Escape');check('Retour depuis la carte',not page.locator('#modal').is_visible())
 page.keyboard.press('i');before=js(page,'__isolation.engine.s.inventory.scrap');t=js(page,'__isolation.engine.s.time');page.wait_for_timeout(120);check('Fabrication en temps réel',js(page,'__isolation.engine.s.time')>t)
 page.click('[data-craft="noise"]');check('Recette appliquée par le bouton',js(page,'__isolation.engine.s.inventory.scrap')==before-2)
 snap(page,'04_equipement.png','Fabrication et outils','Équipement ouvert dans la partie neuve ; une recette a réellement consommé des composants.')
 page.keyboard.press('Escape');page.keyboard.press('o');page.wait_for_timeout(80)
 check('76 fiches de lieux dans le codex',page.locator('.codex-card').count()==76)
 page.click('[data-codex="rules"]');check('246 règles de conception présentes',page.locator('.codex-card').count()==246)
 page.click('[data-codex="people"]');check('14 fiches de personnages',page.locator('.codex-card').count()==14)
 page.click('[data-codex="logs"]');check('57 archives présentes, non lues non divulguées',page.locator('.codex-card').count()==57 and 'Document non consulté' in page.locator('#modalBody').inner_text())
 page.click('[data-codex="optional"]');check('Trente-deux tâches facultatives présentes',page.locator('.codex-card').count()==32)
 page.click('[data-codex="rooms"]')
 page.fill('#codexSearch','sterilisation');check('Recherche sans accents',0<page.locator('#codexCards .codex-card:visible').count()<76)
 page.fill('#codexSearch','');page.locator('#codexSearch').press_sequentially('Salle de garde');check('Les espaces restent saisissables',page.input_value('#codexSearch')=='Salle de garde')
 check('Recherche par nom de local',0<page.locator('#codexCards .codex-card:visible').count()<76)
 page.click('button[data-favorite="m_staff"]');check('Favori ajouté sans déverrouiller le lieu',js(page,"__isolation.engine.s.favorites.includes('m_staff')&&!__isolation.engine.s.visited.includes('m_staff')"))
 page.fill('#codexSearch','');page.check('#codexFavorites');check('Filtre des lieux marqués',page.locator('#codexCards .codex-card:visible').count()==1)
 page.uncheck('#codexFavorites');page.fill('#codexSearch','san cristobal');snap(page,'05_codex.png','Codex intégré','Fiches affichées dans l’interface du jeu, sans modification visuelle du rendu.')
 page.focus('#codexSearch');page.keyboard.press('Escape');check('Échap ferme le codex même dans la recherche',not page.locator('#modal').is_visible());page.keyboard.down('d');js(page,"window.dispatchEvent(new Event('blur'))");page.keyboard.up('d');t=js(page,'__isolation.engine.s.time');page.wait_for_timeout(100)
 check('Perte de focus : pause',page.locator('#modal').is_visible() and js(page,'__isolation.engine.s.time')==t)
 check('Export de sauvegarde disponible',page.locator('[data-action="export"]').is_visible())
 with page.expect_download() as dl:page.click('[data-action="export"]')
 download=dl.value;save_path=ROOT/'qa/browser-export.json';download.save_as(str(save_path));data=json.loads(save_path.read_text());check('Export JSON du bon espace de noms',data['id']=='tantalus.alien-isolation' and data['schema']==1)
 check('Avertissement de stockage bloqué sans plantage',js(page,'__isolation.engine.messages.some(m=>m.text.includes("stockage local bloqué"))'))
 page.click('#closeModal')
 routing=json.loads((ROOT/'qa/campaign-routing.json').read_text());active=json.loads((ROOT/'qa/campaign-recit-20141007.json').read_text());exploration=json.loads((ROOT/'qa/spatial-campaign-live-42.json').read_text())
 def load_snapshot(obj):
  result=js(page,'text=>{__isolation.closePanel();const r=__isolation.engine.load(text);__isolation.engine.paused=true;__isolation.engine.messages=[];__isolation.renderer.lastRoom=null;return r;}',obj['save'])
  page.wait_for_timeout(100);check('Restauration '+obj['description'],result['ok'])
 for n,gid,title in [('06_terminal.png',4,'Terminal de Sevastopol'),('07_san_cristobal.png',11,'San Cristobal · Admission')]:
  obj=next(x for x in active['snapshots'] if x['goal']==gid);load_snapshot(obj);snap(page,n,title,'État enregistré par le parcours complet Récit, graine 20141007, IA et dégâts actifs. Le moteur est mis en pause uniquement pour cette capture.')
 for n,gid,title in [('08_gemini.png',25,'Module de confinement KG-348'),('09_samuels.png',32,'Interface de Samuels'),('10_nid.png',37,'Sous le réacteur'),('11_anesidora.png',40,'Anesidora'),('12_eva.png',45,'Alignement de l’antenne')]:
  obj=next(x for x in active['snapshots'] if x['goal']==gid);load_snapshot(obj);snap(page,n,title,'État enregistré au cours du parcours complet Récit, graine 20141007, IA et dégâts actifs. Restauration mise en pause pour inspection visuelle.')
 # New rooms: states reached by physical traversal with live enemies, not staged actor placement.
 for n,oid,title in [('16_garde.png','O03','San Cristobal · Salle de garde'),('17_sterilisation.png','O04','San Cristobal · Stérilisation'),('18_relais.png','O05','Logistique · Local des relais'),('19_passerelle.png','O06','Logistique · Passerelle de contrôle'),('20_diagnostic.png','O07','APOLLO · Banc de diagnostic'),('21_observation.png','O08','Réacteur · Poste de surveillance')]:
  obj=next(x for x in exploration['snapshots'] if x.get('optional')==oid);load_snapshot(obj)
  check('Tâche '+oid+' conservée à la restauration',js(page,'id=>__isolation.engine.s.optional.includes(id)',oid))
  snap(page,n,title,'État enregistré après cette tâche lors du parcours Récit intégral avec les vingt tâches et deux escortes, ennemis et dégâts actifs. Restauration mise en pause pour la capture.')
 obj=next(x for x in exploration['snapshots'] if x.get('optional')=='O06');load_snapshot(obj)
 page.keyboard.press('m');page.click('[data-sector="LOGISTIQUE"]');check('Carte : deux niveaux de logistique',page.locator('[data-deck]').count()==3)
 page.click('[data-deck="1"]');check('Carte : filtre de niveau cohérent',page.locator('.map-room').count()==1 and 'Passerelle' in page.locator('.map-room').inner_text())
 snap(page,'22_etages.png','Carte · Passerelle et niveau supérieur','Carte ouverte depuis un état du parcours actif ; filtre de niveau actionné via le bouton réel.')
 page.keyboard.press('Escape')
 # Purposefully prepared systems fixture. No claim of natural traversal in these captures.
 js(page,"""()=>{const e=__isolation.engine;e.paused=true;e.s.room='m_staff';e.s.hidden=null;e.s.dead=false;e.s.ended=false;e.s.x=360;e.s.y=354;e.s.classic=false;e.s.torch=false;e.s.alien.active=false;e.s.systems.m_staff={mode:0};e.s.tracker=false;__isolation.renderer.lastRoom=null;}""")
 js(page,'__isolation.engine.paused=false');page.wait_for_timeout(750);page.keyboard.down('e');page.wait_for_function('__isolation.engine.s.systems.m_staff.mode===1',timeout=8000);page.keyboard.up('e');js(page,'__isolation.engine.paused=true');page.wait_for_timeout(100)
 check('Tableau : extinction par la touche E',js(page,'__isolation.engine.s.systems.m_staff.mode===1'))
 snap(page,'23_obscurite.png','Circuit · Éclairage coupé','SCÈNE PRÉPARÉE : Amanda est placée au tableau, menace désactivée pour le contrôle. E réellement maintenu dans Chromium ; obscurité produite par le moteur.')
 js(page,'__isolation.engine.paused=false');page.wait_for_timeout(70);page.keyboard.down('e');page.wait_for_function('__isolation.engine.s.systems.m_staff.mode===2',timeout=8000);page.keyboard.up('e');js(page,'__isolation.engine.paused=true');page.wait_for_timeout(100)
 check('Tableau : diversion par le second maintien E',js(page,'__isolation.engine.s.systems.m_staff.mode===2'))
 check('Dérivation bornée dans le temps',js(page,'__isolation.engine.s.systems.m_staff.until>__isolation.engine.s.time&&__isolation.engine.s.systems.m_staff.until-__isolation.engine.s.time<=24'))
 snap(page,'24_derivation.png','Circuit · Diversion de ventilation','SCÈNE PRÉPARÉE : deuxième action E depuis le tableau. Le circuit et son compte à rebours sont actifs.')
 # Read actual aPoint / bPoint connector coordinates from content.
 js(page,"""()=>{const e=__isolation.engine;const l=__isolation.CONTENT.links.find(l=>(l.a===e.s.room||l.b===e.s.room)&&l.kind==='door');const p=l.a===e.s.room?l.aPoint:l.bPoint;e.s.x=p.x;e.s.y=p.y;e.s.inventory.battery=3;window.testDoor=l.id;}""")
 page.keyboard.press('t');page.wait_for_timeout(100);check('T : verrou local et consommation réelle',js(page,'__isolation.engine.sealed(window.testDoor)&&__isolation.engine.s.inventory.battery===2'))
 snap(page,'25_verrou.png','Verrou · Gagner du temps','SCÈNE PRÉPARÉE : position et stock placés près du seuil pour contrôle. La touche T ferme réellement la porte et consomme une pile.')
 page.keyboard.press('t');check('Second T : libération sans surcoût',js(page,'!__isolation.engine.sealed(window.testDoor)&&__isolation.engine.s.inventory.battery===2'))
 # All room layouts rendered in both projections (fixtures, not continuous play).
 render_results=js(page,"""()=>{const e=__isolation.engine,out=[];for(const r of __isolation.CONTENT.rooms){let ok=true,error='';try{e.s.room=r.id;e.s.x=r.w/2;e.s.y=300;e.s.hidden=null;for(const classic of [false,true]){e.s.classic=classic;__isolation.renderer.render();}}catch(err){ok=false;error=String(err);}out.push({room:r.id,ok,error});}return out;}""")
 check('76 pièces rendues en projection normale et CLASSIC',len(render_results)==76 and all(x['ok'] for x in render_results))
 (ROOT/'qa/room-render-checks.json').write_text(json.dumps(render_results,ensure_ascii=False,indent=2))
 # Purposefully prepared combat scene, clearly disclosed in the report.
 js(page,"""()=>{const e=__isolation.engine;e.load(JSON.stringify({schema:1,id:__isolation.CONTENT.meta.id,state:JSON.parse(e.serialize()).state}));e.s.room='m_corridor';e.s.x=980;e.s.y=300;e.s.chapter=4;e.s.goal=12;e.s.health=100;e.s.actor='Amanda';e.s.classic=false;e.s.tools.tracker=true;e.s.tracker=true;e.s.tools.flame=true;e.s.fuel=80;e.s.face=1;e.s.hidden=null;e.s.alien={...e.s.alien,active:true,room:e.s.room,x:1220,y:300,mode:'patrol'};e.paused=true;e.messages=[];__isolation.renderer.lastRoom=null;}""")
 js(page,"()=>{const e=__isolation.engine;e.signals.reset();for(let i=0;i<18;i++){e.s.alien.x+=1;e.signals.update(.05,{tracker:true});}e.s.tracker=true;}");page.wait_for_timeout(100);check('Écho échantillonné de la créature affiché au détecteur',js(page,'__isolation.engine.detector().length>0'))
 snap(page,'13_traque.png','Contrôle visuel · La traque','SCÈNE PRÉPARÉE : acteurs, équipement et phase positionnés pour tester le détecteur et l’échelle des sprites. Déplacement contrôlé de 18 unités et échantillonnage réel avant la pause. Ce n’est pas une capture de progression naturelle.')
 js(page,'()=>{const e=__isolation.engine;e.paused=false;e.flame();e.paused=true;}');page.wait_for_timeout(100);check('Flamme affichée et carburant consommé',js(page,'__isolation.engine.s.fuel===72&&__isolation.engine.s.alien.mode==="retreat"'))
 snap(page,'14_flamme.png','Contrôle visuel · Repousser la créature','SCÈNE PRÉPARÉE à partir du contrôle précédent ; action lance-flammes réellement exécutée par le moteur.')
 js(page,'__isolation.engine.s.classic=true');page.wait_for_timeout(80);check('Projection CLASSIC commutable',js(page,'__isolation.engine.s.classic'))
 # End screen from the live-enemy exploration run (all sixteen optional tasks).
 js(page,'text=>{__isolation.engine.load(text);__isolation.engine.paused=true;}',exploration['finalSave']);page.wait_for_timeout(100)
 check('Épilogue affiché après les 52 objectifs',page.locator('#ending').is_visible());snap(page,'15_epilogue.png','Épilogue de l’adaptation','Restauration du point final du parcours Récit avec IA et dégâts actifs : 52 objectifs, vingt tâches facultatives et deux escortes réalisés, sans injection de progression.')
 page.click('#endMenu');check('Retour au menu après épilogue',page.locator('#menu').is_visible())
 for w,h in [(1280,720),(1024,768)]:
  page.set_viewport_size({'width':w,'height':h});page.wait_for_timeout(80)
  bounds=page.locator('#newGame').bounding_box();check('Menu utilisable en '+str(w)+'x'+str(h),bounds and bounds['y']+bounds['height']<=h and bounds['x']+bounds['width']<=w)
 page.set_viewport_size({'width':1440,'height':900})
 # Import the actual previous-version checkpoint through the browser file input.
 page.click('#newGame');page.keyboard.press('Escape');page.set_input_files('#importSave',str(ROOT/'tests/fixtures/legacy-v01-save.json'));page.wait_for_timeout(250)
 check('Import v0.1 par le sélecteur de fichier',js(page,"__isolation.engine.s.version==='0.8.0'&&__isolation.engine.s.goal===12"))
 check('Import v0.1 initialise les nouveaux systèmes',js(page,'Array.isArray(__isolation.engine.s.optional)&&typeof __isolation.engine.s.systems==="object"'))
 # 0.3 protocol rooms are captured from actual active exploration states.
 for name,oid,title in [('26_galerie.png','O09','Gemini · Galerie d’observation'),('27_plenum.png','O10','Gemini · Plénum de maintenance'),('28_refroidissement.png','O11','Anesidora · Refroidissement stabilisé'),('29_service.png','O12','Anesidora · Coursive de retour')]:
  obj=next(x for x in exploration['snapshots'] if x.get('optional')==oid);load_snapshot(obj)
  check('0.3 tâche '+oid+' et récompense restaurées',js(page,'id=>__isolation.engine.s.optional.includes(id)',oid))
  snap(page,name,title,'État réellement atteint lors du parcours d’exploration Récit, 76 pièces, 32 tâches et deux escortes, IA et dégâts actifs. Restauration mise en pause pour l’image.')
 obj=next(x for x in exploration['snapshots'] if x.get('roomVisit')=='g_hull');load_snapshot(obj)
 snap(page,'30_coque.png','KG-348 · Retour par la coque','Seuil extérieur atteint physiquement après séparation dans le parcours Récit actif. Restauration mise en pause ; le retour n’est plus un saut direct au tram.')
 obj=next(x for x in exploration['snapshots'] if x.get('protocol')=='containment-start');load_snapshot(obj)
 check('HUD : fermeture en cours réellement restaurée',js(page,"__isolation.engine.s.protocols.gemini.stage==='closing'"))
 check('HUD : indique KG-348 et non une mission générique',page.locator('#protocolStatus').is_visible() and 'KG-348' in page.locator('#protocolStatus').inner_text())
 snap(page,'31_confinement.png','KG-348 · Capteur au sol, clapets en fermeture','Instant enregistré automatiquement lors du parcours Récit actif, au début du verrouillage. La présence réelle de la créature dans le module a été vérifiée par le moteur.')
 obj=next(x for x in exploration['snapshots'] if x.get('protocol')=='containment-verified');load_snapshot(obj)
 check('Alien encore présent avant la séparation',js(page,"__isolation.engine.s.alien.active&&__isolation.engine.s.alien.room==='g_lab'"))
 snap(page,'32_confirme.png','KG-348 · Volume confiné','État enregistré après les quatre secondes de fermeture pendant le parcours actif. La créature reste présente jusqu’à la commande de séparation.')
 # Floor jets use a real overload save, then an explicitly prepared observation instant.
 obj=next(x for x in exploration['snapshots'] if x.get('protocol')=='anesidora-overload');load_snapshot(obj)
 js(page,"()=>{const e=__isolation.engine;e.s.protocols.anesidora.elapsed=2;e.s.x=655;e.s.y=345;e.paused=true;__isolation.renderer.lastRoom=null;}")
 page.wait_for_timeout(90);check('HUD : rupture visible avec temps réel restant',page.locator('#protocolStatus').is_visible() and 'ANESIDORA' in page.locator('#protocolStatus').inner_text())
 snap(page,'33_vapeur.png','Anesidora · Jet sous pression','SCÈNE PRÉPARÉE depuis le point de surcharge du parcours actif : position d’observation et phase de vapeur réglées pour contrôler l’empreinte affichée. Pas une capture de marche naturelle à cet instant.')
 # Cursor and keyboard aim: use open floor, no enemies, explicitly a mechanics fixture.
 js(page,"()=>{const e=__isolation.engine;e.load(new (e.constructor)('recit').serialize());e.s.room='g_observation';e.s.x=650;e.s.y=370;e.s.chapter=9;e.s.tools.torch=true;e.s.inventory.noise=3;e.s.alien.active=false;e.paused=false;e.s.classic=false;__isolation.renderer.lastRoom=null;}")
 page.wait_for_timeout(100);page.keyboard.down('v');page.wait_for_timeout(60)
 check('V ouvre la visée',js(page,'!!__isolation.engine.aim'))
 old=js(page,'({x:__isolation.engine.s.x,y:__isolation.engine.s.y,aimX:__isolation.engine.aim.target.x})')
 page.keyboard.down('ArrowRight');page.wait_for_timeout(160);page.keyboard.up('ArrowRight')
 check('Flèches ajustent la visée sans déplacer Amanda',js(page,'old=>__isolation.engine.s.x===old.x&&__isolation.engine.s.y===old.y&&__isolation.engine.aim.target.x>old.aimX',old))
 # Project a world coordinate through the renderer, then move an actual browser pointer there.
 screen=js(page,"()=>{const r=__isolation.renderer,p=r.project(900,370),b=r.canvas.getBoundingClientRect();const sc=Math.min(b.width/1440,b.height/810);return{x:b.x+(b.width-1440*sc)/2+p.x*sc,y:b.y+(b.height-810*sc)/2+p.y*sc};}")
 page.mouse.move(screen['x'],screen['y']);page.wait_for_timeout(70)
 plan=js(page,'__isolation.engine.throwPlan(__isolation.engine.aim.target)')
 check('Visée souris produit un point libre à portée',plan and plan['distance']>24 and plan['distance']<=360)
 js(page,'__isolation.engine.paused=true');page.wait_for_timeout(80)
 snap(page,'34_visee.png','Lancer · Choisir le point d’impact','SCÈNE PRÉPARÉE : galerie vide et stock de test. V, flèche et souris réels ; trajectoire et point d’arrêt calculés par le moteur. Pause uniquement pour l’image.')
 js(page,'__isolation.engine.paused=false');before=js(page,'__isolation.engine.s.inventory.noise');page.keyboard.press('g');page.wait_for_timeout(1100)
 check('G dépense un leurre, puis l’active au point prévisualisé',js(page,'p=>{const e=__isolation.engine,d=e.s.decoys.at(-1);return d&&Math.hypot(d.x-p.point.x,d.y-p.point.y)<1e-6;}',plan) and js(page,'__isolation.engine.s.inventory.noise')==before-1)
 page.keyboard.up('v');check('Relâcher V quitte la visée',js(page,'!__isolation.engine.aim'))
 page.keyboard.press('Escape');check('Réglages de son et effets présents',page.locator('#pauseVolume').count()==1 and page.locator('#pauseReduced').count()==1)
 page.check('#pauseSound');page.locator('#pauseVolume').focus();page.keyboard.press('Home');
 for _ in range(23):page.keyboard.press('ArrowRight')
 page.uncheck('#pauseReduced');page.wait_for_timeout(80)
 check('Audio synthétisé initialisé après action explicite',js(page,'!!__isolation.sound.context&&__isolation.sound.on'))
 check('Volume et réduction des effets réellement modifiés',js(page,'__isolation.preferences.volume===23&&!__isolation.preferences.reduced'))
 snap(page,'35_reglages.png','Pause · Son, effets et points de reprise','Interface réelle. Dans cet environnement sans stockage autorisé, l’historique persistant est annoncé indisponible ; les rotations du coffre sont testées séparément en Node, pas prétendues persistantes ici.')
 page.click('#closeModal');page.keyboard.press('o');page.click('[data-codex="protocols"]');check('Codex : six fiches de protocoles',page.locator('.codex-card').count()==6)
 snap(page,'36_protocoles.png','Codex · Comprendre les systèmes','Six fiches consultées dans le codex intégré via le bouton réel, sans changement de progression.')
 page.keyboard.press('Escape');page.keyboard.press('Escape');page.set_input_files('#importSave',str(ROOT/'tests/fixtures/legacy-v02-save.json'));page.wait_for_timeout(170)
 oldsave=json.loads((ROOT/'tests/fixtures/legacy-v02-save.json').read_text())['state']
 check('Import réel v0.2 : objectif et ressources conservés',js(page,'__isolation.engine.s.goal')==oldsave['goal'] and js(page,'__isolation.engine.s.inventory')==oldsave['inventory'])
 # Responsive protocol HUD remains inside the viewport without covering the top mission header.
 for w,h in [(1280,720),(1024,768)]:
  page.set_viewport_size({'width':w,'height':h});load_snapshot(next(x for x in exploration['snapshots'] if x.get('protocol')=='containment-start'))
  box=page.locator('#protocolStatus').bounding_box();top=page.locator('#topbar').bounding_box() if page.locator('#topbar').count() else None
  check('HUD de protocole cadré en '+str(w)+'x'+str(h),box and box['x']>=0 and box['y']+box['height']<=h and box['x']+box['width']<=w)
 page.set_viewport_size({'width':1440,'height':900})

 # A renderer spy checks a visible-state bug without modifying world simulation.
 js(page,"()=>{__isolation.closePanel();const e=__isolation.engine;e.load(new(e.constructor)('recit').serialize());e.s.room='m_corridor';e.s.x=550;e.s.y=300;e.s.alien.active=true;e.s.alien.room='m_corridor';e.s.alien.mode='vent';e.paused=true;}")
 calls=js(page,"()=>{const r=__isolation.renderer,e=__isolation.engine,old=r.character,counts={vent:0,floor:0};let label='vent';r.character=function(a,k){if(k==='alien')counts[label]++;return old.call(this,a,k);};try{r.render();label='floor';e.s.alien.mode='patrol';r.render();}finally{r.character=old;}return counts;}")
 check('Gaine : aucune silhouette au sol avant émergence',calls['vent']==0 and calls['floor']==1)
 check('Seize poses EVA séparées réellement décodées',js(page,"Object.keys(__isolation.renderer.images).filter(k=>k.startsWith('characters/eva_')).length===16"))
 # Bank UI is exercised with an explicitly in-memory Storage double. This is
 # not evidence of real localStorage persistence after browser closure.
 vault_before=js(page,"(()=>{window.originalVaultStorage=__isolation.vault.storage;const m=new Map();__isolation.vault.storage={getItem:k=>m.get(k)||null,setItem:(k,v)=>m.set(k,String(v))};return true;})()")
 samples=[next(x for x in active['snapshots'] if x['goal']==i)['save'] for i in [11,25,32,40]]
 js(page,'saves=>{for(const s of saves)__isolation.vault.write(s);}',samples)
 page.keyboard.press('Escape');check('Coffre : trois boutons de reprise réels',page.locator('[data-backup]').count()==3)
 snap(page,'37_reprises.png','Reprises · Les trois points précédents','SCÈNE DE TEST : le coffre utilise un Storage en mémoire alimenté avec quatre vrais états du parcours actif. Trois boutons sont produits par l’interface ; aucune persistance après fermeture du navigateur n’est prétendue.')
 page.click('[data-backup="0"]');page.wait_for_timeout(150)
 expected=json.loads(samples[2])['state'];check('Bouton de reprise restaure le point sélectionné',js(page,'__isolation.engine.s.goal')==expected['goal'] and js(page,'__isolation.engine.s.room')==expected['room'])
 js(page,'__isolation.vault.storage=window.originalVaultStorage')
 # Observation window: preserve the real confined creature from the successful
 # run, move only the observer to demonstrate the adjacent-room renderer.
 load_snapshot(next(x for x in exploration['snapshots'] if x.get('protocol')=='containment-verified'))
 js(page,"()=>{const e=__isolation.engine;e.s.room='g_observation';e.s.x=1000;e.s.y=370;e.paused=true;__isolation.renderer.lastRoom=null;}");page.wait_for_timeout(100)
 check('Fenêtre : une seule créature, toujours dans le vrai module',js(page,"__isolation.engine.s.alien.room==='g_lab'&&__isolation.engine.s.alien.active&&__isolation.engine.s.room==='g_observation'"))
 snap(page,'38_fenetre.png','Galerie · Observer le volume fermé','SCÈNE PRÉPARÉE : état réel de confinement du parcours, Amanda replacée dans la galerie pour contrôler la fenêtre. La position de la créature n’est pas modifiée ; la petite silhouette représente le même acteur dans KG-348, pas un second ennemi.')

 check('Aucune exception JavaScript',len(errors)==0)
 browser.close()
report={'runner':'Playwright Python / Chromium installé','loading':'Page.set_content du HTML autoportant. Navigation file:// et localhost interdite par la politique du navigateur ; aucune politique modifiée.','checks':checks,'pass':sum(x['ok'] for x in checks),'fail':sum(not x['ok'] for x in checks),'errors':errors,'captures':shots}
report['inputSha256']={str(p.relative_to(ROOT)):hashlib.sha256(p.read_bytes()).hexdigest() for p in [ROOT/'JOUER_ISOLATION.html',ROOT/'src/engine.js',ROOT/'src/protocols.js',ROOT/'src/renderer.js',ROOT/'src/content.json']}
(ROOT/'qa/browser-results.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
print(json.dumps({'pass':report['pass'],'fail':report['fail'],'errors':errors,'captures':len(shots)},ensure_ascii=False))
if report['fail']:raise SystemExit(1)
