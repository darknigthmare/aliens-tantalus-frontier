#!/usr/bin/env python3
"""Tests the exact bundled source without network or browser-policy changes.
Later rooms use validated save fixtures via the ordinary import UI, not a claimed
manual campaign. Native localStorage remains unqualified (loopback blocked).
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json,os,traceback,time
ROOT=Path(__file__).resolve().parents[1]
REPORT={'version':'0.6.0-candidate.1','method':'Exact standalone via set_content. Public keyboard/pointer/buttons; prepared later-room save fixtures identified. No browser policy/origin modification.','nativeLocalStorage':'Not qualified: ERR_BLOCKED_BY_ADMINISTRATOR for loopback. SaveStore is tested separately with explicit MemoryStorage.','cases':[],'captures':[],'errors':[]}
def settle(page, milliseconds):
    """Wait for normal browser simulation time, not CPU-dependent wall-clock frame count.
    Menus remain paused. This function never advances or changes game state itself.
    """
    target=page.evaluate("ms=>window.ROP_APP?.started&&!ROP_APP.modal&&ROP_APP.simulation.s.status==='playing'?ROP_APP.simulation.s.elapsed+ms/1000:null", milliseconds)
    if target is None:page.wait_for_timeout(milliseconds)
    else:page.wait_for_function("t=>!!ROP_APP.modal||ROP_APP.simulation.s.status!=='playing'||ROP_APP.simulation.s.elapsed>=t",arg=target,timeout=max(12000,milliseconds*10))

def ok(name,**kw):
 print('PASS',name,flush=True);REPORT['cases'].append({'name':name,'passed':True,**kw})
def shot(q,file,description,setup='Validated later-room fixture loaded through ordinary import UI, then public controls'):
 q.screenshot(path=str(ROOT/'captures'/file),timeout=10000)
 state=q.evaluate('({room:ROP_APP.simulation.s.room,character:ROP_APP.simulation.s.character,chapter:ROP_APP.simulation.s.chapter,passages:ROP_APP.simulation.s.passages})')
 REPORT['captures'].append({'file':'captures/'+file,'description':description,'setup':setup,'state':state})
def load(q,text):
 q.locator('#import-file').set_input_files({'name':'validated-v04-fixture.json','mimeType':'application/json','buffer':text.encode() if isinstance(text,str) else text})
 q.get_by_role('button',name='CHARGER',exact=True).click();q.get_by_role('button',name='REPRENDRE LE PARCOURS',exact=True).click()
 settle(q,90)
def fixture(q,rid,to,chapter=0,mode='hybrid',remote=False,escort=False):
 text=q.evaluate('''([rid,to,ci,mode,remote,escort])=>{const s=ROP_CORE.createState('story',mode),c=ROP_DATA.chapters[ci],ch=ROP_DATA.characters[c.character],r=ROP_CORE.roomDef(rid),p=r.portals.find(p=>p.to===to);Object.assign(s,{room:rid,chapter:ci,character:c.character,phase:c.phase,visited:[rid]});Object.assign(s.player,{x:p.x,z:mode==='classic'?.7:p.z,ammo:ch.clip,reserve:ch.reserve,medkits:ch.medkits,flares:ch.flares});for(const j of ROP_DATA.jobs)s.exploration.jobs[j.id]=3;s.flags.scienceClearance=true;if(escort)s.escort={room:rid,x:p.x-55,z:s.player.z,goal:'med',name:'Luisa',hp:83,panic:0,order:'follow',hurt:0,path:[],walk:0};const sim=new ROP_CORE.Simulation(s);if(remote){const back=ROP_CORE.roomDef(to).portals.find(x=>x.to===rid);sim.primeThreshold(p);sim.s.world[to].enemies=[{id:'fixture-remote',x:back.x+230,z:back.z,hp:72,kind:'adult',state:'patrol',facing:1,notice:0,cooldown:0,windup:0,repath:0,path:[],timer:0,origin:{x:back.x+230,z:back.z},memory:{x:back.x+230,z:back.z,ttl:0}}];}return sim.save();}''',[rid,to,chapter,mode,remote,escort])
 load(q,text)
try:
 with sync_playwright() as p:
  b=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium'),args=['--no-sandbox','--disable-dev-shm-usage'])
  q=b.new_page(viewport={'width':1600,'height':900},device_scale_factor=1);q.set_default_timeout(10000);requests=[]
  q.on('pageerror',lambda e:REPORT['errors'].append(str(e)));q.on('request',lambda r:requests.append(r.url))
  q.set_content((ROOT/'JOUER.html').read_text(),wait_until='load')
  assert q.locator('#start').is_visible();assert q.evaluate('ROP_DATA.manifest.version')==REPORT['version'];ok('Menu 0.5 et modules effectivement chargés')
  q.locator('#start').click();q.get_by_role('button',name='PRENDRE LE CONTRÔLE').click()
  q.keyboard.press('KeyO');assert q.locator('#dialog-title').inner_text()=='De l’autre côté';before=q.evaluate('ROP_APP.simulation.s.elapsed');settle(q,200);assert q.evaluate('ROP_APP.simulation.s.elapsed')==before
  ok('Dossier SEUILS ouvert par O : lecture en pause sans renseignements inventés');q.keyboard.press('Escape')
  # Exact bytes produced by v03, not a lookalike legacy object.
  old=json.loads((ROOT/'tests/fixtures/real-v03-save.json').read_text());load(q,(ROOT/'tests/fixtures/real-v03-save.json').read_bytes())
  assert q.evaluate('ROP_APP.simulation.s.objective')==old['state']['objective'];assert q.evaluate('ROP_APP.simulation.s.player.ammo')==old['state']['player']['ammo'];assert q.evaluate('ROP_APP.simulation.s.passages.revision')==4
  ok('Véritable export 0.3 repris, progression et munitions conservées')
  fixture(q,'approach','lift');q.keyboard.press('KeyE');q.wait_for_function("ROP_APP.simulation.s.passages.transit?.stage==='boarding'")
  assert q.evaluate('ROP_APP.simulation.s.room')=='approach';ok('E engage le monte-charge sans arrivée instantanée')
  q.keyboard.down('KeyA');settle(q,90);q.keyboard.up('KeyA');assert q.evaluate('ROP_APP.simulation.s.passages.transit') is None;assert q.evaluate('ROP_APP.simulation.s.room')=='approach'
  ok('Annulation avant fermeture par déplacement réel')
  fixture(q,'approach','lift',escort=True);q.keyboard.press('KeyE');q.wait_for_function("ROP_APP.simulation.s.passages.transit?.stage==='travel'")
  q.locator('#hud').wait_for(state='hidden');assert q.locator('#hud').is_hidden();assert 'visible' not in (q.locator('#notice').get_attribute('class') or '');assert q.locator('#passage-readout').is_visible();ok('Cabine en mouvement : HUD de combat retiré et compagnon embarqué')
  shot(q,'27-montecharge-v04.png','Monte-charge : cabine, rails et compagnon pendant le trajet, sans superposition du HUD de combat.')
  q.keyboard.press('Escape');assert q.locator('#pause-view').is_disabled();start=q.evaluate('ROP_APP.simulation.s.passages.transit.timer');settle(q,220);assert q.evaluate('ROP_APP.simulation.s.passages.transit.timer')==start
  ok('Pause en plein trajet : temps arrêté et changement de projection bloqué')
  with q.expect_download() as dl:q.get_by_role('button',name='EXPORTER',exact=True).click()
  exported=ROOT/'captures/browser-v04-mid-transit.json';dl.value.save_as(str(exported));env=json.loads(exported.read_text());assert env['state']['passages']['transit']['stage']=='travel'
  ok('Export JSON réel au milieu du trajet')
  load(q,exported.read_bytes());q.wait_for_function("ROP_APP.simulation.s.room==='lift'")
  assert q.evaluate('ROP_APP.simulation.s.passages.counts.lift')==1;assert q.evaluate('ROP_APP.simulation.s.escort.hp')==83;assert q.locator('#hud').is_visible()
  ok('Réimport du trajet : une seule arrivée, compagnon à 83 %, HUD restauré')
  for rid,to,kind,file,title in [('concourse','ops','stairs','28-escalier-v04.png','Escalier : progression entre deux paliers annoncés.'),('coolant','power','ladder','29-echelle-v04.png','Échelle : arme abaissée pendant le franchissement.'),('airlock','pad','airlock','30-sas-v04.png','Sas : cycle fermé puis réouverture avant l’arrivée.')]:
   fixture(q,rid,to);q.keyboard.press('KeyE');q.wait_for_function("ROP_APP.simulation.s.passages.transit?.stage==='travel'");assert q.evaluate('ROP_APP.simulation.s.passages.transit.type')==kind
   shot(q,file,title);q.wait_for_function(f"ROP_APP.simulation.s.room==='{to}'");ok(f'Franchissement {kind} par E jusqu’à la destination')
  fixture(q,'approach','lift',chapter=7);q.keyboard.press('KeyE');q.wait_for_function("ROP_APP.simulation.s.passages.transit?.stage==='travel'");assert q.evaluate('ROP_APP.simulation.s.passages.transit.emergency') is True
  assert 'SECOURS' in q.locator('#passage-readout').inner_text();shot(q,'31-secours-v04.png','Sur un circuit coupé, l’entraînement de secours conserve le trajet, plus lentement.');q.wait_for_function("ROP_APP.simulation.s.room==='lift'")
  ok('Circuit coupé : mode secours signalé et passage achevé')
  fixture(q,'concourse','med',remote=True);q.keyboard.press('KeyN');assert q.evaluate('ROP_APP.simulation.s.passages.listening') is not None
  before=q.evaluate('ROP_APP.simulation.s.elapsed');settle(q,150);assert q.evaluate('ROP_APP.simulation.s.elapsed')>before
  ok('Écoute N en temps réel, sans pause ni révélation instantanée')
  q.keyboard.down('KeyA');settle(q,100);q.keyboard.up('KeyA');assert q.evaluate('ROP_APP.simulation.s.passages.listening') is None;assert q.evaluate('ROP_APP.simulation.s.passages.reports.length')==0
  ok('Déplacement au clavier : écoute interrompue avant tout relevé')
  fixture(q,'concourse','med',remote=True);q.locator('#listen-button').click();q.wait_for_function('ROP_APP.simulation.s.passages.counts.listens===1')
  assert q.evaluate('ROP_APP.simulation.s.passages.reports[0].level')=='movement';assert not q.evaluate('ROP_APP.simulation.s.visited.includes("med")')
  ok('Bouton ÉCOUTER : indice au-delà de la porte, sans marquer la pièce visitée')
  q.keyboard.press('KeyT');q.wait_for_function('ROP_APP.simulation.s.systems.tracker');settle(q,120)
  assert 'AU-DELÀ' in q.locator('#tracker-scope').inner_text();assert q.evaluate('ROP_APP.simulation.trackerContacts().some(c=>c.remote)') is True
  shot(q,'32-ecoute-detecteur-v04.png','Écoute et détecteur devant l’infirmerie : contact distant signalé au seuil, pas à sa position exacte.')
  ok('Détecteur T : écho distant explicitement distingué du contact local')
  q.keyboard.press('KeyO');assert q.locator('.threshold-note').count()==1;assert 'Quelque chose' in q.locator('.threshold-note').inner_text()
  shot(q,'33-dossier-seuils-v04.png','Historique des observations : origine, destination et ancienneté du renseignement.')
  ok('Dossier horodaté reflétant uniquement une écoute effectuée')
  q.keyboard.press('Escape');fixture(q,'vent_hab','jorden',chapter=6);q.keyboard.press('KeyN');q.wait_for_function('ROP_APP.simulation.s.passages.counts.listens===1');q.keyboard.press('KeyT');q.keyboard.press('KeyF')
  assert q.evaluate('ROP_APP.simulation.s.systems.tracker') is False;assert q.evaluate('ROP_APP.simulation.s.stats.shots')==0
  shot(q,'34-newt-ecoute-v04.png','Newt écoute depuis les conduits ; ni arme ni détecteur ne lui sont accordés.')
  ok('Newt : écoute des grilles autorisée, détecteur et tirs toujours interdits')
  q.keyboard.press('Escape');q.locator('#high-contrast').check();q.locator('#text-scale').select_option('1.3');q.locator('#reduced-motion').check()
  assert q.evaluate('document.documentElement.dataset.contrast')=='high';assert q.evaluate('ROP_APP.renderer.reduced') is True
  assert q.evaluate('document.documentElement.style.getPropertyValue("--reading-scale")')=='1.3';ok('Contraste, taille de lecture 130 % et animations atténuées appliqués')
  q.locator('#audio-enabled').check();q.locator('#audio-enabled').uncheck();ok('Activation et arrêt audio par choix explicite, sans erreur JavaScript')
  for width,height in [(1280,720),(844,390),(390,844)]:
   q.set_viewport_size({'width':width,'height':height});settle(q,100);assert q.evaluate('document.documentElement.scrollWidth<=innerWidth+1');ok(f'Options lisibles sans débordement horizontal {width} × {height}')
  shot(q,'35-options-portrait-v04.png','Options en portrait : contraste renforcé et texte agrandi. Émulation de viewport, pas test d’un téléphone physique.')
  q.keyboard.press('Escape');q.keyboard.press('KeyO');assert q.locator('.threshold-note').count()==1
  shot(q,'36-seuils-portrait-v04.png','Observations des conduits en portrait ; le dossier se parcourt sans élargir la page.')
  q.keyboard.press('Tab');assert q.evaluate('document.querySelector("#dialog").contains(document.activeElement)');ok('Focus clavier contenu dans le dossier des seuils')
  # Restore normal presentation and preserve exact standalone export for QA replay.
  q.keyboard.press('Escape');before=q.evaluate('ROP_APP.simulation.s.room');q.locator('#import-file').set_input_files({'name':'wrong.json','mimeType':'application/json','buffer':b'{"id":"other-game","schema":1}'})
  settle(q,80);assert q.evaluate('ROP_APP.simulation.s.room')==before;assert 'refusée' in q.locator('#notice').inner_text();ok('Import étranger refusé sans remplacement de la partie')
  assert not REPORT['errors'],REPORT['errors'];ok('Aucune erreur JavaScript pendant les nouveaux contrôles')
  assert not requests,requests;ok('Aucune requête réseau nécessaire au fichier autonome',requests=requests)
  b.close()
except Exception as e:
 REPORT['cases'].append({'name':'Recette 0.4 interrompue','passed':False,'error':str(e)});traceback.print_exc()
REPORT['passed']=bool(REPORT['cases']) and all(x['passed'] for x in REPORT['cases']) and not REPORT['errors']
(ROOT/'docs/BROWSER_V04_TEST_RESULTS.json').write_text(json.dumps(REPORT,ensure_ascii=False,indent=2))
print(json.dumps({'passed':REPORT['passed'],'cases':len(REPORT['cases']),'captures':len(REPORT['captures']),'errors':REPORT['errors']}),flush=True)
if not REPORT['passed']:raise SystemExit(1)
