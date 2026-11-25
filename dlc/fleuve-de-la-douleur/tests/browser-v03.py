#!/usr/bin/env python3
"""Public-interface checks of the exact 0.3 standalone. Later scenes are validated
save fixtures loaded by the ordinary import UI, not full manual playthroughs.
No origin/security-policy changes; localStorage is not qualified by set_content.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json,os,traceback
ROOT=Path(__file__).resolve().parents[1]
REPORT={'version':'0.6.0-candidate.1','method':'Exact offline HTML via set_content; ordinary UI and keyboard/pointer input. Later scenes initialized by validated saves.','localStorage':'Opaque origin; not qualified. JSON exports/imports verified.','cases':[],'captures':[],'errors':[]}
def settle(page, milliseconds):
    """Wait for normal browser simulation time, not CPU-dependent wall-clock frame count.
    Menus remain paused. This function never advances or changes game state itself.
    """
    target=page.evaluate("ms=>window.ROP_APP?.started&&!ROP_APP.modal&&ROP_APP.simulation.s.status==='playing'?ROP_APP.simulation.s.elapsed+ms/1000:null", milliseconds)
    if target is None:page.wait_for_timeout(milliseconds)
    else:page.wait_for_function("t=>!!ROP_APP.modal||ROP_APP.simulation.s.status!=='playing'||ROP_APP.simulation.s.elapsed>=t",arg=target,timeout=max(12000,milliseconds*10))

def ok(name,**kw):
 print('PASS',name,flush=True);REPORT['cases'].append({'name':name,'passed':True,**kw})
def shot(q,name,description,setup):
 q.screenshot(path=str(ROOT/'captures'/name),timeout=7000)
 state=q.evaluate('({chapter:ROP_APP.simulation.s.chapter+1,room:ROP_APP.simulation.s.room,player:ROP_APP.simulation.s.player,phase:ROP_APP.simulation.s.phase,exploration:ROP_APP.simulation.s.exploration})')
 REPORT['captures'].append({'file':'captures/'+name,'description':description,'setup':setup,'state':state})
def load(q,b):
 q.locator('#import-file').set_input_files({'name':'validated-v03-fixture.json','mimeType':'application/json','buffer':b if isinstance(b,bytes) else b.encode()})
 q.get_by_role('button',name='CHARGER',exact=True).click();q.get_by_role('button',name='REPRENDRE LE PARCOURS',exact=True).click();settle(q,120)
def fixture(q,room,chapter=0,x=700,z=.81,mode='hybrid',jobs=None,target=None):
 args=[room,chapter,x,z,mode,jobs or {},target]
 text=q.evaluate('''([rid,ci,x,z,mode,jobs,target])=>{const s=ROP_CORE.createState('story',mode),c=ROP_DATA.chapters[ci],ch=ROP_DATA.characters[c.character],r=ROP_CORE.roomDef(rid);Object.assign(s,{room:rid,chapter:ci,character:c.character,phase:c.phase,visited:[rid]});Object.assign(s.player,{x,z,ammo:ch.clip,reserve:ch.reserve,medkits:ch.medkits,flares:ch.flares});s.exploration.jobs=jobs;if(target){const o=r.objects.find(o=>o.id===target);Object.assign(s.player,{x:o.x,z:mode==='classic'?.7:o.z});}return new ROP_CORE.Simulation(s).save();}''',args)
 load(q,text)
try:
 with sync_playwright() as p:
  b=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium'),args=['--no-sandbox','--disable-dev-shm-usage'])
  q=b.new_page(viewport={'width':1600,'height':900},device_scale_factor=1);q.set_default_timeout(7000)
  q.on('pageerror',lambda e:REPORT['errors'].append(str(e)));requests=[];q.on('request',lambda r:requests.append(r.url))
  q.set_content((ROOT/'JOUER.html').read_text(),wait_until='load');q.locator('#start').click();q.get_by_role('button',name='PRENDRE LE CONTRÔLE').click()
  assert q.evaluate('ROP_DATA.manifest.version')==REPORT['version'];ok('Le fichier livré exécute les modules 0.5 (régression 0.3)')
  q.keyboard.press('KeyU');assert q.locator('.detour-card').count()==6
  before=q.evaluate('ROP_APP.simulation.s.elapsed');settle(q,150);assert q.evaluate('ROP_APP.simulation.s.elapsed')==before
  ok('Six détours lisibles ; temps suspendu pendant leur consultation')
  q.locator('[data-track-job="pantry"]').click();assert q.evaluate('ROP_APP.simulation.s.exploration.trackedJob')=='pantry'
  assert q.evaluate('Object.keys(ROP_APP.simulation.s.exploration.jobs).length')==0;ok('Suivre un détour ne réalise pas son intervention')
  shot(q,'15-detours.png','Les six interventions facultatives possèdent leurs propres étapes et restrictions.','Nouvelle partie, U puis suivi par clic ; aucun état de mission injecté')
  q.locator('#dialog-actions').get_by_role('button',name='PLAN',exact=True).click();assert q.locator('[data-map-room]').count()==42
  assert q.locator('.colony-plan>line').count()==57;ok('Le plan colonial représente 42 lieux et 57 connexions uniques')
  pos=q.evaluate('({room:ROP_APP.simulation.s.room,x:ROP_APP.simulation.s.player.x,z:ROP_APP.simulation.s.player.z})')
  q.locator('[data-map-room="drain"]').click();assert q.locator('#map-destination').input_value()=='drain'
  assert q.evaluate('({room:ROP_APP.simulation.s.room,x:ROP_APP.simulation.s.player.x,z:ROP_APP.simulation.s.player.z})')==pos
  ok('Sélection de destination : itinéraire seulement, aucune téléportation')
  q.locator('#map-level').select_option('-2');assert q.locator('[data-map-room="drain"]').get_attribute('opacity')=='1';assert q.locator('[data-map-room="pad"]').get_attribute('opacity')=='0.23'
  ok('Filtre de niveau : les sous-sols sont mis en évidence')
  q.locator('#map-level').select_option('all');q.locator('#map-side').click();assert q.locator('#map-destination').input_value()=='pantry'
  ok('Le bouton DÉTOUR SUIVI utilise la véritable prochaine pièce')
  shot(q,'16-plan-colonial.png','Carte des 42 pièces ; l’itinéraire rejoint l’office de la cuisine.','Nouvelle partie ; destination et filtre changés par interface')
  q.keyboard.press('Escape')
  # Exact 0.2 save bytes, not a recreated lookalike.
  old=json.loads((ROOT/'tests/fixtures/real-v02-save.json').read_text());load(q,(ROOT/'tests/fixtures/real-v02-save.json').read_bytes())
  assert q.evaluate('ROP_APP.simulation.s.objective')==old['state']['objective'];assert q.evaluate('ROP_APP.simulation.s.room')==old['state']['room'];assert q.evaluate('ROP_APP.simulation.s.player.ammo')==old['state']['player']['ammo']
  assert q.evaluate('ROP_APP.simulation.s.version')==REPORT['version'];ok('Véritable export 0.2 importé : progression et munitions conservées')
  fixture(q,'pantry',target='job-pantry-inspect');q.keyboard.press('KeyE')
  q.wait_for_function('ROP_APP.simulation.s.exploration.jobs.pantry===1');assert q.evaluate('ROP_APP.simulation.s.objective')==0
  ok('Examen de la porte par E : étape 1 obtenue sans avancer la campagne')
  q.keyboard.press('Escape')
  with q.expect_download() as event:q.get_by_role('button',name='EXPORTER',exact=True).click()
  dest=ROOT/'captures/browser-v03-partial-export.json';event.value.save_as(str(dest));load(q,dest.read_bytes())
  assert q.evaluate('ROP_APP.simulation.s.exploration.jobs.pantry')==1;assert q.evaluate('ROP_APP.simulation.s.exploration.trackedJob')=='pantry'
  ok('Détour partiel exporté et rechargé par les boutons publics')
  fixture(q,'mess',jobs={'pantry':1},target='job-pantry-part');q.keyboard.press('KeyE');q.wait_for_function('ROP_APP.simulation.s.exploration.jobs.pantry===2')
  q.keyboard.press('KeyU');assert 'EMPORTÉ · Poignée de service' in q.locator('#dialog-content').inner_text();ok('Pièce récupérée avec E, affichée comme emportée dans le carnet de détours')
  shot(q,'17-piece-emportee.png','La poignée a été ramassée ; l’intervention suivante ramène à l’office.','Sauvegarde de test au point de récupération ; E réellement exécuté')
  fixture(q,'pantry',jobs={'pantry':2},target='job-pantry-release');hp=q.evaluate('ROP_APP.simulation.s.player.medkits');q.keyboard.press('KeyE');q.wait_for_function('ROP_APP.simulation.s.exploration.jobs.pantry===3')
  assert q.evaluate('ROP_APP.simulation.s.flags["service-pantry"]') is True;assert q.evaluate('ROP_APP.simulation.s.archives.includes("a25")') is True;assert q.evaluate('ROP_APP.simulation.s.player.medkits')==hp+1
  ok('Pose de poignée : passage réel ouvert, note et unique trousse attribuées')
  q.keyboard.press('Tab');q.get_by_role('button',name='PIÈCE ACTUELLE',exact=True).click();assert q.locator('.local-points li').count()==2
  assert 'Verrouillé' not in q.locator('.local-points').inner_text();ok('Le plan local reflète le nouveau déverrouillage')
  shot(q,'18-plan-local-office.png','Plan de l’office : emprises de mobilier, cachette et deux accès désormais utilisables.','Même état joué après pose de la poignée ; plan public en pause')
  q.keyboard.press('Escape');q.keyboard.down('KeyD');settle(q,1000);q.keyboard.up('KeyD');q.keyboard.press('KeyE');settle(q,250)
  q.wait_for_function("ROP_APP.simulation.s.room==='hab'");assert q.evaluate('ROP_APP.simulation.s.room')=='hab';ok('Raccourci franchi par marche et E, pas par sélection sur le plan')
  # Directional aiming with actual key and pointer events.
  fixture(q,'pad',x=1000,z=.57);before=q.evaluate('({x:ROP_APP.simulation.s.player.x,z:ROP_APP.simulation.s.player.z})')
  q.keyboard.down('Space');q.keyboard.down('KeyD');q.keyboard.down('KeyZ');settle(q,150)
  assert q.evaluate('ROP_APP.simulation.s.exploration.aim.z')<-.6
  assert q.evaluate('({x:ROP_APP.simulation.s.player.x,z:ROP_APP.simulation.s.player.z})')==before
  q.keyboard.down('KeyF');settle(q,170);q.keyboard.up('KeyF');assert q.evaluate('ROP_APP.simulation.s.stats.shots')>0
  ok('ESPACE + diagonale : visée fixe et tir réel sans déplacement')
  shot(q,'19-visee.png','Visée fixe diagonale : l’orientation de l’arme et le réticule suivent la commande.','Sauvegarde de test au pad ; touches ESPACE, D, Z et F utilisées')
  q.keyboard.up('KeyZ');q.keyboard.up('KeyD');q.keyboard.up('Space');settle(q,100)
  before=q.evaluate('ROP_APP.simulation.s.stats.shots');pt=q.evaluate('(()=>{const r=ROP_APP.renderer,p=ROP_APP.simulation.s.player;const v=r.project(p.x-140,p.z+.12);return {x:v.x,y:v.y-43*r.scale};})()')
  q.mouse.move(pt['x'],pt['y']);q.mouse.down();settle(q,240)
  assert q.evaluate('ROP_APP.simulation.s.exploration.aim.x')<0;assert q.evaluate('ROP_APP.simulation.s.stats.shots')>before
  q.mouse.up();settle(q,150);stopped=q.evaluate('ROP_APP.simulation.s.stats.shots');settle(q,200);assert q.evaluate('ROP_APP.simulation.s.stats.shots')==stopped
  ok('Visée souris quantifiée ; relâcher arrête le tir')
  fixture(q,'biomed',x=850,z=.81);settle(q,4700)
  shot(q,'20-atelier-biomedical.png','Atelier biomédical : postes de réparation, réserve technique et îlots de circulation.','Sauvegarde de test avant crise ; décor original exécuté par le renderer')
  q.keyboard.press('Tab');q.get_by_role('button',name='PIÈCE ACTUELLE',exact=True).click();assert q.locator('.local-plan rect title').count()==q.evaluate('ROP_APP.simulation.room.cover.length')
  ok('Les obstacles du plan local sont ceux du moteur, en nombre exact')
  q.keyboard.press('Escape')
  fixture(q,'workshop',chapter=7,x=2100,z=.81);q.wait_for_function('ROP_APP.simulation.s.exploration.encounters["workshop-hatch"]?.stage==="warning"')
  assert not q.evaluate('ROP_APP.simulation.ensureRoom().enemies.some(e=>e.id==="workshop-hatch")')
  shot(q,'21-palan-alerte.png','Une vibration à l’atelier annonce la grille avant l’intrusion ; elle n’est pas un ennemi apparu sans préavis.','Sauvegarde de test au seuil de déclenchement du chapitre 8 ; minuterie normale')
  q.wait_for_function('ROP_APP.simulation.s.exploration.encounters["workshop-hatch"].stage==="done"')
  assert q.evaluate('ROP_APP.simulation.ensureRoom().enemies.filter(e=>e.id==="workshop-hatch").length')==1
  ok('Intrusion de l’atelier : avertissement visible, puis un seul adversaire')
  fixture(q,'aerial',x=1470,z=.81);settle(q,750)
  shot(q,'22-antennes.png','Terrasse des antennes : haubans, relief extérieur et accès de service vers le contrôle.','Sauvegarde de test ; aucune transmission de secours canonique ajoutée')
  fixture(q,'drain',chapter=7,x=1600,z=.81);q.keyboard.press('KeyL');settle(q,500)
  shot(q,'23-eaux-grises.png','Dérivation des eaux grises : réseaux suspendus et voie sèche de maintenance.','Sauvegarde de test au chapitre 8 ; lampe activée au clavier')
  fixture(q,'nest',chapter=6,x=1040,z=.7);q.wait_for_function('ROP_APP.simulation.s.exploration.encounters["nest-shadow"]?.stage==="warning"')
  q.keyboard.press('KeyF');assert q.evaluate('ROP_APP.simulation.s.stats.shots')==0
  shot(q,'24-renfoncement-newt.png','Newt dans le renfoncement des câbles ; une ombre passe derrière une grille infranchissable.','Sauvegarde de test au déclencheur ; ombre décorative sans collision ni dégâts')
  settle(q,4400);assert not q.evaluate('ROP_APP.simulation.ensureRoom().enemies.some(e=>e.id==="nest-shadow")')
  ok('Ombre du conduit : aucun adversaire ni arme donnés à Newt')
  q.keyboard.press('KeyU');assert 'INTERVENTION ADULTE' in q.locator('.detour-card').first.inner_text();ok('Restrictions de personnage lisibles dans le carnet de détours')
  for w,h in [(1280,720),(844,390),(390,844)]:
   q.set_viewport_size({'width':w,'height':h});settle(q,130);assert q.evaluate('document.documentElement.scrollWidth<=innerWidth+1');ok(f'Détours sans débordement horizontal {w} × {h}')
  shot(q,'25-detours-portrait.png','Carnet des détours en portrait, cartes lisibles dans un panneau défilant.','Émulation 390 × 844 ; pas de test sur téléphone matériel')
  q.locator('#dialog-actions').get_by_role('button',name='PLAN',exact=True).click();q.locator('[data-map-mode="colony"]').click();assert q.locator('#map-destination').is_visible();assert q.evaluate('document.documentElement.scrollWidth<=innerWidth+1');ok('Plan et choix de destination accessibles en portrait')
  # The CSS/DOM outline is a real view of the collision layer, not an exported image.
  fixture(q,'med',x=940,z=.7,mode='classic');q.set_viewport_size({'width':1600,'height':900});settle(q,550)
  assert q.evaluate('ROP_APP.renderer.classic') is True;assert q.evaluate('ROP_APP.renderer.project(800,.48).y !== ROP_APP.renderer.project(800,.7).y') is True
  shot(q,'26-medical-classique.png','Vue latérale : les décors de fond restent au fond, sans faux obstacle projeté sur le personnage.','Sauvegarde de test en mode classique ; déplacement limité à z = 0,7')
  ok('Vue classique : décor conserve sa profondeur, interactions restent sur la bande de jeu')
  assert not REPORT['errors'],REPORT['errors'];ok('Aucune erreur JavaScript pendant la recette héritée 0.3 sous 0.5')
  assert not requests,requests;ok('Le standalone fonctionne sans requête réseau')
  b.close()
except Exception as e:
 REPORT['cases'].append({'name':'Recette 0.3 interrompue','passed':False,'error':str(e)});traceback.print_exc()
finally:
 REPORT['passed']=bool(REPORT['cases']) and all(c['passed'] for c in REPORT['cases']) and not REPORT['errors']
 (ROOT/'docs/BROWSER_V03_TEST_RESULTS.json').write_text(json.dumps(REPORT,ensure_ascii=False,indent=2))
 print(json.dumps({'passed':REPORT['passed'],'cases':len(REPORT['cases']),'captures':len(REPORT['captures']),'errors':REPORT['errors']}),flush=True)
 if not REPORT['passed']:raise SystemExit(1)
