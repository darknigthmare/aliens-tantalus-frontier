#!/usr/bin/env python3
"""Exact bundled HTML, real UI input, explicitly prepared validated fixtures. No policy changes."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json,os,traceback
ROOT=Path(__file__).resolve().parents[1]
REPORT={'version':'0.6.0-candidate.1','method':'Exact standalone set_content; keyboard, buttons, pointer and actual JSON downloads/imports. Late locations explicitly prepared through validated save fixtures.','nativeLocalStorage':'Unqualified: loopback ERR_BLOCKED_BY_ADMINISTRATOR, no policy/origin bypass. MemoryStorage tested separately.','cases':[],'captures':[],'errors':[]}
CURRENT='New game via normal menu; no prepared fixture'
def settle(page, milliseconds):
    """Wait for normal browser simulation time, not CPU-dependent wall-clock frame count.
    Menus remain paused. This function never advances or changes game state itself.
    """
    target=page.evaluate("ms=>window.ROP_APP?.started&&!ROP_APP.modal&&ROP_APP.simulation.s.status==='playing'?ROP_APP.simulation.s.elapsed+ms/1000:null", milliseconds)
    if target is None:page.wait_for_timeout(milliseconds)
    else:page.wait_for_function("t=>!!ROP_APP.modal||ROP_APP.simulation.s.status!=='playing'||ROP_APP.simulation.s.elapsed>=t",arg=target,timeout=max(12000,milliseconds*10))

def ok(name,**kw):
 REPORT['cases'].append({'name':name,'passed':True,**kw});print('PASS',name,flush=True)
def shot(q,file,description):
 q.screenshot(path=str(ROOT/'captures'/file),timeout=10000)
 REPORT['captures'].append({'file':'captures/'+file,'description':description,'setup':CURRENT,'state':q.evaluate('({room:ROP_APP.simulation.s.room,chapter:ROP_APP.simulation.s.chapter,character:ROP_APP.simulation.s.character,life:ROP_APP.simulation.s.life})')})
def load(q,text,label='Prepared validated fixture imported through ordinary file input'):
 global CURRENT
 CURRENT=label
 q.locator('#import-file').set_input_files({'name':'v05-fixture.json','mimeType':'application/json','buffer':text if isinstance(text,bytes) else text.encode()})
 q.get_by_role('button',name='CHARGER',exact=True).click();q.get_by_role('button',name='REPRENDRE LE PARCOURS',exact=True).click();settle(q,70)
def fixture(q,kind,id,ci=0,extra=None,mode='hybrid'):
 text=q.evaluate('''([kind,id,ci,extra,mode])=>{const s=ROP_CORE.createState('story',mode),ch=ROP_DATA.chapters[ci],c=ROP_DATA.characters[ch.character];Object.assign(s,{chapter:ci,character:ch.character,phase:ch.phase});Object.assign(s.player,{ammo:c.clip,reserve:c.reserve,medkits:c.medkits,flares:c.flares});let target;
 if(kind==='resident'){const d=ROP_LIFE.residents.get(id);target={room:d.room,...d.points[0]};}else if(kind==='container')target=ROP_LIFE.containers.get(id);else if(kind==='bench')target=ROP_LIFE.benches.get(id);else target={room:'road',x:1800,z:.7};
 s.room=target.room;s.visited=[s.room];s.player.x=target.x;s.player.z=mode==='classic'?.7:target.z;if(extra?.parts)Object.assign(s.life.pockets[s.character],extra.parts);if(extra?.battery!==undefined)s.systems.battery=extra.battery;if(extra?.hp!==undefined)s.player.hp=extra.hp;
 const sim=new ROP_CORE.Simulation(s);sim.ensureRoom().enemies=[];if(kind==='container'||kind==='bench'){for(const dx of [-70,70]){sim.s.player.x=target.x+dx;if(!ROP_CORE.obstacleAt(sim.room,sim.s.player.x,sim.s.player.z,20,mode)&&sim.candidates()[0]?.ref.id===id)break;sim.s.player.x=target.x;}}
 if(extra?.open){const def=ROP_LIFE.containers.get(id);sim.s.life.containers[id]={open:true,remaining:structuredClone(def.items)};}
 if(extra?.lure){sim.s.life.sequence=1;sim.s.life.devices=[{id:'sound-1',owner:s.character,room:s.room,x:330,z:.7,delay:0,life:12,pulse:0,buzz:0}];sim.ensureRoom().enemies=[{id:'browser-lure',x:520,z:.7,hp:72,kind:'adult',state:'patrol',facing:-1,notice:0,cooldown:0,windup:0,repath:0,path:[],timer:0,origin:{x:520,z:.7},memory:{x:520,z:.7,ttl:0}}];}
 return sim.save();}''',[kind,id,ci,extra,mode])
 load(q,text,f'Validated {kind} fixture {id}; chapter {ci+1}, {mode}; imported via file input, then ordinary public controls')
 return text
try:
 with sync_playwright() as p:
  browser=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium'),args=['--no-sandbox','--disable-dev-shm-usage'])
  q=browser.new_page(viewport={'width':1600,'height':900},device_scale_factor=1);q.set_default_timeout(10000);requests=[]
  q.on('pageerror',lambda e:REPORT['errors'].append(str(e)));q.on('request',lambda r:requests.append(r.url))
  q.set_content((ROOT/'JOUER.html').read_text(),wait_until='load')
  assert q.evaluate('ROP_DATA.manifest.version')==REPORT['version'];assert q.locator('#start').is_visible();ok('Version 0.6 et ses 17 modules chargés sans réseau')
  shot(q,'37-title-v05.png','Menu de la livraison cumulative 0.6, sans illustration substituée au moteur.')
  q.locator('#start').click();q.get_by_role('button',name='PRENDRE LE CONTRÔLE',exact=True).click();shot(q,'38-start-v05.png','Début de campagne lancé depuis le menu de la 0.6.')
  q.keyboard.press('KeyY');assert '0 / 12' in q.locator('.contact-stats').inner_text();before=q.evaluate('ROP_APP.simulation.s.elapsed');settle(q,180);assert q.evaluate('ROP_APP.simulation.s.elapsed')==before;ok('Registre Y : aucune rencontre inventée, lecture en pause');q.keyboard.press('Escape')
  fixture(q,'resident','kent');shot(q,'39-colonist-v05.png','Rosa Kent dans la coursive centrale ; résident de service original avec routine locale.')
  q.keyboard.press('KeyP');q.wait_for_function("ROP_APP.modal==='conversation'");assert q.locator('#dialog-title').inner_text()=='Rosa Kent';assert q.locator('[data-resident-topic]').count()==2;ok('P engage une conversation physique, sans passer la porte voisine')
  q.locator('[data-resident-topic="work"]').click();assert q.evaluate('ROP_APP.simulation.s.life.contacts.kent.topics.includes("work")');shot(q,'40-conversation-v05.png','Échange original avec Rosa Kent ; portrait dessiné avec la silhouette du jeu.')
  q.locator('[data-resident-topic="route"]').click();assert q.evaluate('ROP_APP.simulation.s.life.contacts.kent.topics.length')==2;assert q.evaluate('ROP_APP.simulation.s.objective')==0;ok('Deux thèmes réellement lus, conservés sans crédit d’objectif principal')
  q.keyboard.press('Escape');q.keyboard.press('KeyY');assert '1 / 12' in q.locator('.contact-stats').inner_text();q.locator('[data-contact="kent"]').click();assert q.locator('.codex-entry').count()==2;ok('Registre limité aux thèmes demandés ; relecture disponible');shot(q,'41-registre-v05.png','Registre de Rosa Kent : deux sujets conservés, sans suivi de position en direct.');q.keyboard.press('Escape')
  fixture(q,'container','supply-arrivals');q.keyboard.press('KeyE');assert q.evaluate('ROP_APP.modal')=='supply';assert q.locator('[data-search-method]').count()==2;shot(q,'42-fermoir-v05.png','Choix d’ouverture de la réserve : lente discrète ou rapide bruyante.')
  q.locator('[data-search-method="quiet"]').click();q.wait_for_function("ROP_APP.simulation.s.work?.kind==='life-search'");settle(q,350);assert not q.evaluate('ROP_LIFE.containerState(ROP_APP.simulation.s,ROP_LIFE.containers.get("supply-arrivals")).open');q.keyboard.down('KeyD');settle(q,180);q.keyboard.up('KeyD');assert q.evaluate('ROP_APP.simulation.s.work') is None;ok('Ouverture discrète en temps réel : déplacement annule avant l’ouverture')
  fixture(q,'container','supply-arrivals');q.keyboard.press('KeyE');q.locator('[data-search-method="fast"]').click();settle(q,200);assert q.evaluate('ROP_APP.simulation.s.player.noise')>.7;q.wait_for_function('ROP_APP.simulation.s.life.containers["supply-arrivals"]?.open');ok('Fermoir forcé : bruit élevé et ouverture après temporisation')
  q.keyboard.press('KeyE');q.locator('[data-supply-take="cell"]').click();assert q.evaluate('ROP_APP.simulation.s.life.pockets.brackett.cell')==2;assert q.locator('[data-supply-take="cell"]').is_disabled();assert q.evaluate('ROP_APP.simulation.s.life.containers["supply-arrivals"].remaining.wire')==1;ok('Prise finie : pile épuisée, fil laissé dans le coffre')
  q.keyboard.press('Escape');q.keyboard.press('Escape')
  with q.expect_download() as dl:q.get_by_role('button',name='EXPORTER',exact=True).click()
  exported=ROOT/'captures/browser-v05-open-container.json';dl.value.save_as(str(exported));env=json.loads(exported.read_text());assert env['state']['life']['containers']['supply-arrivals']['open'];ok('Vrai export téléchargé après ouverture et collecte partielle')
  load(q,exported.read_bytes(),'Actual current-version export after public UI opening and partial collection, reimported through ordinary file input');q.keyboard.press('KeyE');assert q.locator('[data-supply-take="cell"]').is_disabled();assert q.locator('[data-supply-take="wire"]').is_enabled();ok('Réimport : couvercle ouvert et surplus inchangés');shot(q,'43-reserve-v05.png','Réserve ouverte, pile récupérée et fil laissé en place après véritable export/import.');q.keyboard.press('Escape');shot(q,'44-coffre-ouvert-v05.png','Couvercle ouvert conservé dans le rendu du niveau.')
  fixture(q,'bench','bench-biomed',extra={'parts':{'cell':3,'wire':2,'casing':2},'battery':25});q.keyboard.press('KeyE');assert q.locator('[data-recipe]').count()==2;assert q.locator('[data-recipe="decoy"]').is_enabled();shot(q,'45-etabli-v05.png','Établi biomédical : composants portés, capacités et deux recettes physiques.')
  q.locator('[data-recipe="decoy"]').click();settle(q,300);q.keyboard.down('KeyA');settle(q,200);q.keyboard.up('KeyA');assert q.evaluate('ROP_APP.simulation.s.work') is None;assert q.evaluate('ROP_APP.simulation.s.life.pockets.brackett.cell')==3;ok('Assemblage interrompu : aucun composant consommé')
  fixture(q,'bench','bench-biomed',extra={'parts':{'cell':3,'wire':2,'casing':2},'battery':25});q.keyboard.press('KeyE');q.locator('[data-recipe="decoy"]').click();q.wait_for_function('ROP_APP.simulation.s.life.pockets.brackett.decoy===1');assert q.evaluate('ROP_APP.simulation.s.life.pockets.brackett.cell')==2;ok('Recette terminée : une balise contre pile, fil et boîtier')
  q.keyboard.press('KeyK');assert q.evaluate('ROP_APP.simulation.s.life.devices.length')==1;assert q.evaluate('ROP_APP.simulation.s.life.pockets.brackett.decoy')==0;q.keyboard.press('Escape');remaining=q.evaluate('ROP_APP.simulation.s.life.devices[0].delay');settle(q,200);assert q.evaluate('ROP_APP.simulation.s.life.devices[0].delay')==remaining;ok('K pose une balise ; Pause fige le délai d’armement')
  with q.expect_download() as dl:q.get_by_role('button',name='EXPORTER',exact=True).click()
  devicefile=ROOT/'captures/browser-v05-armed-device.json';dl.value.save_as(str(devicefile));load(q,devicefile.read_bytes(),'Actual export of a crafted and placed decoy, reimported during its arming delay');q.wait_for_function('ROP_APP.simulation.s.life.devices[0]?.delay===0');assert q.evaluate('ROP_APP.simulation.s.life.pockets.brackett.decoy')==0;ok('Export/import de balise : armement repris sans double objet');shot(q,'46-balise-v05.png','Balise assemblée puis posée par les commandes du jeu ; minuteur repris depuis un véritable export.')
  q.keyboard.press('KeyI');assert q.locator('[data-kit="decoy"]').is_disabled();assert q.locator('.parts-row').is_visible();ok('Équipement : poches de composants et balise consommée reflètent le modèle');q.keyboard.press('Escape')
  fixture(q,'bench','bench-biomed',extra={'parts':{'cell':1},'battery':20});q.keyboard.press('KeyE');q.locator('[data-recipe="charge"]').click();q.wait_for_function('ROP_APP.simulation.s.life.stats.crafted===1');assert q.evaluate('ROP_APP.simulation.s.systems.battery')>=65;assert q.evaluate('ROP_APP.simulation.s.life.pockets.brackett.cell')==0;ok('Recharge d’atelier : pile consommée et réserve lumineuse augmentée')
  fixture(q,'lure','road',7,{'lure':True});q.wait_for_function('ROP_APP.simulation.s.world.road.enemies[0].memory.x===330');ok('Pulsation : ennemi sans contact visuel recherche le point du bip');q.wait_for_function('ROP_APP.simulation.s.life.stats.destroyed===1');assert q.evaluate('ROP_APP.simulation.s.world.road.enemies[0].hp')==72;assert q.evaluate('ROP_APP.simulation.s.player.hp')==100;ok('Balise atteinte et détruite sans explosion ni dégâts de zone')
  fixture(q,'container','supply-garrison',6,{'open':True});q.keyboard.press('KeyE');assert q.locator('[data-supply-take="ammo"]').is_disabled();assert q.locator('[data-supply-take="wire"]').is_disabled();q.keyboard.press('Escape');q.keyboard.press('KeyI');assert q.locator('[data-kit="decoy"]').is_disabled();ok('Newt ne récupère ni munitions ni composants et ne pose pas de balise');q.keyboard.press('Escape')
  fixture(q,'container','supply-vent',6,{'open':True,'hp':61});q.keyboard.press('KeyE');q.locator('[data-supply-take="ration"]').click();assert q.evaluate('ROP_APP.simulation.s.player.hp')==86;ok('Newt peut utiliser une portion froide autorisée, sans inventaire militaire')
  old=(ROOT/'tests/fixtures/real-v04-save.json').read_bytes();oldstate=json.loads(old)['state'];load(q,old,'Actual v0.4 mid-transit export file from the original previous archive, not a renamed fixture')
  assert q.evaluate('Object.keys(ROP_APP.simulation.s.life.contacts).length')==0;assert q.evaluate('ROP_APP.simulation.s.life.stats.opened')==0;assert q.evaluate('ROP_APP.simulation.s.player.ammo')==oldstate['player']['ammo'];q.wait_for_function('ROP_APP.simulation.s.passages.transit===null');ok('Véritable export 0.4 : arrivée unique, progression héritée et registre neuf')
  fixture(q,'resident','kent');q.keyboard.press('KeyY');assert q.get_by_role('button',name='PARLER À ROSA KENT',exact=True).is_visible();q.get_by_role('button',name='PARLER À ROSA KENT',exact=True).click();q.wait_for_function("ROP_APP.modal==='conversation'");ok('Commande PARLER du registre : sélection de proximité accessible sans clavier');q.keyboard.press('Escape')
  q.keyboard.press('Tab');q.locator('[data-map-mode="local"]').click();assert 'C RÉSERVE' in q.locator('#dialog-content').inner_text();assert q.locator('#dialog-content svg').is_visible();shot(q,'47-plan-local-v05.png','Plan local avec réserve C, habitant présent et accès réels.');ok('Plan local : stations et habitants uniquement dans la pièce courante');q.keyboard.press('Escape')
  fixture(q,'bench','bench-biomed',extra={'parts':{'cell':3,'wire':2,'casing':2},'battery':25});q.keyboard.press('Escape');q.locator('#text-scale').select_option('1.3');q.locator('#high-contrast').check();q.keyboard.press('Escape')
  for w,h in [(1280,720),(844,390),(390,844)]:
   q.set_viewport_size({'width':w,'height':h});q.keyboard.press('KeyE');assert q.evaluate('document.documentElement.scrollWidth<=innerWidth+1');btn=q.locator('[data-recipe="decoy"]');btn.scroll_into_view_if_needed();assert btn.is_visible();ok(f'Établi : commandes accessibles à 130 % en {w}×{h}');
   if w==390:shot(q,'48-etabli-portrait-v05.png','Établi en portrait 390×844 avec lecture à 130 % et contraste renforcé ; panneau défilant.')
   q.keyboard.press('Escape')
  fixture(q,'container','supply-arrivals',extra={'open':True,'parts':{'cell':5}});q.keyboard.press('KeyE');assert q.locator('[data-supply-take="cell"]').inner_text()=='PRENDRE 1';q.locator('[data-supply-take="cell"]').click();assert q.evaluate('ROP_APP.simulation.s.life.containers["supply-arrivals"].remaining.cell')==1;assert q.locator('[data-supply-take="cell"]').is_disabled();ok('Portrait : prise partielle à capacité exacte, surplus conservé');shot(q,'49-reserve-portrait-v05.png','Réserve en portrait : capacité atteinte après une prise partielle, surplus laissé sur place.')
  assert not REPORT['errors'],REPORT['errors'];ok('Aucune erreur JavaScript dans la recette des fonctions 0.5 sur le runtime 0.6');assert not requests,requests;ok('Aucune requête réseau issue du HTML autonome')
  browser.close()
except Exception as exc:
 REPORT['cases'].append({'name':'Recette interrompue','passed':False,'error':str(exc)});traceback.print_exc()
finally:
 REPORT['passed']=bool(REPORT['cases']) and all(c['passed'] for c in REPORT['cases']) and not REPORT['errors']
 (ROOT/'docs/BROWSER_V05_TEST_RESULTS.json').write_text(json.dumps(REPORT,ensure_ascii=False,indent=2))
 print(json.dumps({'passed':REPORT['passed'],'cases':len(REPORT['cases']),'captures':len(REPORT['captures']),'errors':REPORT['errors']},ensure_ascii=False),flush=True)
 if not REPORT['passed']:raise SystemExit(1)
