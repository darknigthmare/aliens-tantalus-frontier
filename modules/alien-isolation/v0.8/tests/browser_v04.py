"""Focused 0.4 fixture/render/input QA. Uses set_content because local navigation is prohibited.
States marked campaign are actual completed active traversal checkpoints. All other
states below are deliberate fixtures; no claim of native browser persistence.
"""
from pathlib import Path
import json,hashlib
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parents[1];checks=[];shots=[];errors=[]
def check(name,ok):
 checks.append({'name':name,'ok':bool(ok)});print(('PASS ' if ok else 'FAIL ')+name,flush=True)
def js(p,code,arg=None):return p.evaluate(code,arg)
def snap(p,name,title,provenance):
 path=R/'qa/captures'/name;p.screenshot(path=str(path),timeout=10000);shots.append({'file':'captures/'+name,'title':title,'provenance':provenance,'viewport':p.viewport_size});print('CAPTURE '+name,flush=True)
fixture='SCÈNE PRÉPARÉE pour vérifier le système : position, phase et réserves réglées explicitement. Ce n’est pas une preuve de parcours naturel.'
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox']);p=b.new_page(viewport={'width':1440,'height':900});p.set_default_timeout(8000);p.on('pageerror',lambda e:errors.append(str(e)));p.on('dialog',lambda d:d.accept())
 p.set_content((R/'JOUER_ISOLATION.html').read_text(),wait_until='load');p.wait_for_selector('body[data-ready="true"]');p.select_option('#difficulty','recit');p.click('#newGame')
 def load(text):
  check('État de contrôle 0.6 restauré',js(p,"text=>{__isolation.closePanel();const e=__isolation.engine,r=e.load(text);e.paused=true;e.messages=[];__isolation.renderer.lastRoom=null;return r.ok;}",text));p.wait_for_timeout(180)
 active=json.loads((R/'qa/spatial-campaign-live-42.json').read_text());assert active['ok'] and active['seed']==42
 for num,oid,title in [(39,'O13','San Cristobal · Archives du personnel'),(40,'O14','San Cristobal · Chambre d’isolement'),(41,'O15','Sevastopol · Atelier des combinaisons'),(42,'O16','Sevastopol · Pont de maintenance')]:
  ss=next(x for x in active['snapshots'] if x.get('optional')==oid);load(ss['save']);check('Tâche '+oid+' validée dans le parcours',js(p,'id=>__isolation.engine.s.optional.includes(id)',oid));snap(p,f'{num}_{oid}.png',title,'État atteint par déplacement et interaction lors de l’exploration Récit graine 42 : 76 lieux, 32 tâches et deux escortes, IA et dégâts actifs. Restauration puis pause pour l’image.')
 ss=next(x for x in active['snapshots'] if x.get('optional')=='O16');load(ss['save'])
 js(p,"()=>{const e=__isolation.engine;e.s.x=795;e.s.y=300;e.s.lifeSupport.oxygen=12;e.s.lifeSupport.used=[];e.s.health=100;e.s.dead=false;e.requireRelease=false;e.cooldown=0;e.paused=false;}")
 p.wait_for_timeout(160);check('O₂ faible visible dans le HUD',p.locator('#protocolStatus').is_visible() and 'O₂' in p.locator('#protocolStatus').inner_text());check('O₂ continue de baisser',js(p,'__isolation.engine.s.lifeSupport.oxygen<12'))
 js(p,'__isolation.engine.paused=true');p.wait_for_timeout(100);snap(p,'43_oxygen_low.png','Combinaison · Une marge de retour',fixture)
 js(p,'__isolation.engine.paused=false');p.keyboard.down('e');p.wait_for_timeout(1700);p.keyboard.up('e');check('Bouteille raccordée par E maintenu',js(p,'__isolation.engine.s.lifeSupport.used.length===1&&__isolation.engine.s.lifeSupport.oxygen>70'))
 js(p,'__isolation.engine.paused=true');p.wait_for_timeout(100);snap(p,'44_bottle_empty.png','Oxygène · Bouteille consommée',fixture+' Le maintien E a réellement ajouté l’oxygène et vidé ce poste.')
 saved=js(p,'__isolation.engine.serialize()');load(saved);check('O₂ et bouteille vide conservés par l’import',js(p,'__isolation.engine.s.lifeSupport.used.length===1&&__isolation.engine.s.lifeSupport.oxygen>70'))
 load(next(x for x in active['snapshots'] if x.get('optional')=='O15')['save'])
 js(p,"()=>{const e=__isolation.engine,l=__isolation.CONTENT.links.find(l=>l.a==='e_lockers'&&l.b==='e_catwalk');e.s.x=l.aPoint.x;e.s.y=l.aPoint.y;e.cooldown=0;e.requireRelease=false;e.s.lifeSupport.airlock=null;e.paused=false;}")
 p.keyboard.down('e');p.wait_for_timeout(450);p.keyboard.up('e');check('Sas enclenché au clavier, Amanda reste dans l’atelier',js(p,"__isolation.engine.s.room==='e_lockers'&&__isolation.engine.s.lifeSupport.airlock?.stage==='cycling'"))
 js(p,'__isolation.engine.paused=true');p.wait_for_timeout(140);check('HUD sas affiché',p.locator('#protocolStatus').is_visible() and 'ÉGALISATION' in p.locator('#protocolStatus').inner_text());snap(p,'45_airlock_cycle.png','Sas · Égalisation avant la sortie',fixture+' La première action E déclenche la temporisation, sans changement de pièce.')
 timeleft=js(p,'__isolation.engine.s.lifeSupport.airlock.remaining');p.wait_for_timeout(220);check('Pause fige le cycle affiché',js(p,'__isolation.engine.s.lifeSupport.airlock.remaining')==timeleft)
 js(p,'__isolation.engine.paused=false');p.wait_for_timeout(3300);check('Sas prêt après son délai',js(p,"__isolation.engine.s.lifeSupport.airlock?.stage==='ready'"));p.keyboard.down('e');p.wait_for_timeout(400);p.keyboard.up('e');check('Seconde action E traverse vers la coque',js(p,"__isolation.engine.s.room==='e_catwalk'&&!__isolation.engine.s.lifeSupport.airlock"))
 # Stable state export/checkpoint semantics, no localStorage fake counted as persistence.
 p.keyboard.press('Escape');check('État du stockage visible dans Pause',p.locator('#storage-state').is_visible());check('Refus du stockage décrit explicitement',p.locator('#storage-state').get_attribute('data-storage-state')=='limited');snap(p,'46_storage_status.png','Pause · Stockage et copie de secours','Interface réelle dans le navigateur de test dont le stockage est refusé. L’indication ne prétend pas certifier une persistance native.')
 p.click('#closeModal')
 # Freeze with a prepared projectile at mid flight to inspect the genuine renderer.
 js(p,"()=>{const e=__isolation.engine;e.load(new(e.constructor)('recit').serialize());e.s.room='g_observation';e.s.x=650;e.s.y=370;e.s.goal=25;e.s.chapter=9;e.s.inventory.noise=3;e.paused=false;e.beginAim();e.setAim({x:990,y:370});}")
 p.keyboard.press('g');js(p,"()=>{const e=__isolation.engine;e.paused=true;const q=e.s.projectiles[0];if(q){q.elapsed=q.duration/2;q.x=(q.fromX+q.toX)/2;q.y=(q.fromY+q.toY)/2;}__isolation.renderer.lastRoom=null;}");p.wait_for_timeout(140)
 check('Objet lancé au clavier est encore en vol',js(p,"__isolation.engine.s.projectiles[0]?.stage==='flight'&&__isolation.engine.s.decoys.length===0"));snap(p,'47_projectile_flight.png','Lancer · Le leurre n’est pas encore actif',fixture+' L’objet est lancé avec G puis son temps de vol est réglé à mi-parcours pour la capture ; l’effet n’est pas encore appliqué.')
 saved=js(p,'__isolation.engine.serialize()');load(saved);check('Objet en vol conservé au chargement',js(p,'__isolation.engine.s.projectiles.length===1&&__isolation.engine.s.decoys.length===0'))
 js(p,'__isolation.engine.paused=false');p.wait_for_timeout(1100);check('Objet activé seulement après la fin du vol et du délai',js(p,'__isolation.engine.s.projectiles.length===0&&__isolation.engine.s.decoys.length===1'))
 # Current import 0.3 through the actual file chooser.
 p.keyboard.press('Escape');p.set_input_files('#importSave',str(R/'tests/fixtures/legacy-v03-save.json'));p.wait_for_timeout(150)
 old=json.loads((R/'tests/fixtures/legacy-v03-save.json').read_text())['state'];check('Import v0.3 par fichier : progression et stocks conservés',js(p,'__isolation.engine.s.goal')==old['goal'] and js(p,'__isolation.engine.s.inventory')==old['inventory']);check('Import v0.3 initialise l’oxygène',js(p,'__isolation.engine.s.lifeSupport.oxygen===100'))
 for w,h in [(1280,720),(1024,768)]:
  p.set_viewport_size({'width':w,'height':h});load(ss['save']);p.wait_for_timeout(140);box=p.locator('#protocolStatus').bounding_box();check(f'Oxygène cadré en {w}×{h}',box and box['x']>=0 and box['x']+box['width']<=w and box['y']+box['height']<=h)
 check('Aucune exception JavaScript 0.4',not errors);b.close()
result={'version':'0.8.0','pass':sum(c['ok'] for c in checks),'fail':sum(not c['ok'] for c in checks),'checks':checks,'captures':shots,'errors':errors,'htmlSha256':hashlib.sha256((R/'JOUER_ISOLATION.html').read_bytes()).hexdigest(),'loading':'Page.set_content; native file:// and HTTP navigation blocked by policy; no browser policy override.'}
(R/'qa/browser-v04-results.json').write_text(json.dumps(result,ensure_ascii=False,indent=2));print(json.dumps({k:v for k,v in result.items() if k not in ['checks','captures']},ensure_ascii=False));raise SystemExit(1 if result['fail'] else 0)
