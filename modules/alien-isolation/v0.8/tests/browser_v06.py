"""0.6 browser QA: real controls on clearly labelled fixtures and reached checkpoints.
No browser policy changes. Persistent local storage remains unverified.
"""
from pathlib import Path
import json,hashlib
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parents[1];checks=[];shots=[];errors=[]
F='SCÈNE PRÉPARÉE : position, ressources et conditions de test configurées. Les interactions décrites utilisent ensuite les touches réelles du navigateur, sans valider artificiellement leur résultat.'
N='PARCOURS ACTIF : état réellement atteint depuis une partie neuve Récit, graine 42, avec menaces, dégâts, ressources finies, deux escortes et deux projets. Restauration puis pause pour inspection ; le pilote lit les états internes pour planifier.'
def check(name,result):
 checks.append({'name':name,'ok':bool(result)});print(('PASS ' if result else 'FAIL ')+name,flush=True)
def shot(p,file,title,provenance):
 p.wait_for_timeout(120);p.screenshot(path=str(R/'qa/captures'/file),timeout=15000);shots.append({'file':'captures/'+file,'title':title,'provenance':provenance,'viewport':p.viewport_size});print('CAPTURE '+file,flush=True)
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox']);p=b.new_page(viewport={'width':1440,'height':900});p.set_default_timeout(10000);p.on('pageerror',lambda e:errors.append(str(e)));p.on('dialog',lambda d:d.accept())
 p.set_content((R/'JOUER_ISOLATION.html').read_text(),wait_until='load');p.wait_for_selector('body[data-ready="true"]');p.select_option('#difficulty','recit');p.click('#newGame')
 js=lambda code,arg=None:p.evaluate(code,arg)
 def load(text):
  check('Chargement de point de contrôle',js("t=>{__isolation.closePanel();const e=__isolation.engine,r=e.load(t);e.paused=true;e.messages=[];__isolation.renderer.lastRoom=null;return r.ok;}",text));p.wait_for_timeout(160)
 def hold(key,expression,timeout=12000):
  p.keyboard.down(key)
  try:p.wait_for_function(expression,timeout=timeout)
  finally:p.keyboard.up(key)
  p.wait_for_timeout(160)
 def fixture(id='medical',arrived=True):
  js("args=>{__isolation.closePanel();const e=__isolation.engine;e.load(new(e.constructor)('recit').serialize());const spec=e.refuges.spec(args.id),n=e.s.encounters.rescues.find(n=>n.id===spec.npc);Object.assign(e.s,{room:spec.room,x:365,y:350,chapter:8,goal:20,flags:{morley:true,hunt:true},health:40});Object.assign(e.s.inventory,{scrap:30,chemical:30,battery:30});Object.assign(n,{room:args.arrived?spec.room:n.room,status:args.arrived?'rescued':'sheltered',x:1150,y:350});e.s.alien.active=false;e.cooldown=0;e.requireRelease=false;e.paused=false;__isolation.renderer.lastRoom=null;}",{'id':id,'arrived':arrived});p.wait_for_timeout(150)
 def position(room,x,y):
  js("v=>{__isolation.closePanel();const e=__isolation.engine;Object.assign(e.s,{room:v.room,x:v.x,y:v.y});e.cooldown=0;e.requireRelease=false;e.paused=false;__isolation.renderer.lastRoom=null;}",{'room':room,'x':x,'y':y});p.wait_for_timeout(160)
 active=json.loads((R/'qa/spatial-campaign-live-42.json').read_text());assert active['ok']
 check('Deux projets installés dans le parcours enregistré',sum(s['installed'] for s in active['refuges']['stations'].values())==2)
 check('155 images SVG décodées dans le navigateur',js('Object.keys(__isolation.renderer.images).length===155'))
 for id,num in [('medical',60),('technical',62)]:
  load(next(s['save'] for s in active['snapshots'] if s.get('project')==id))
  check('Projet '+id+' conservé à la reprise',js('id=>__isolation.engine.refuges.upgraded(id)',id))
  check('Les colis installés ne restent pas dans le sac',js('id=>__isolation.engine.refuges.spec(id).parts.every(p=>!__isolation.engine.s.refuges.parts.includes(p.id))',id))
  shot(p,f'{num}_projet_{id}.png','Nora · Le protocole prêt' if id=='medical' else 'Elias · Le régulateur installé',N)
  p.keyboard.press('j');p.wait_for_timeout(160)
  check('J détaille les deux postes sans action distante',p.locator('.refuge-card').count()==2 and p.locator('.refuge-card button').count()==0)
  check('Le projet installé a un état DOM distinct',p.locator(f'[data-refuge="{id}"]').get_attribute('data-installed')=='true')
  shot(p,f'{num+1}_journal_{id}.png','Liaisons · Services et projets',N+' Journal ouvert avec J.');p.keyboard.press('Escape')
 for part,num in [('med_protocol',64),('eva_filter',65)]:
  load(next(s['save'] for s in active['snapshots'] if s.get('part')==part))
  check('Colis '+part+' ouvert et enregistré',js('id=>__isolation.engine.s.opened.includes("supply."+id)&&__isolation.engine.refuges.collected(id)',part))
  shot(p,f'{num}_colis_{part}.png','Archives · Le dossier récupéré' if part.startswith('med') else 'Passerelle · Le filtre récupéré',N)
 # Incomplete holds may not spend resources. Completed controls commit atomically.
 fixture('medical',False);hold('e','__isolation.engine.messages.some(m=>m.text.includes("Ramenez d’abord"))')
 check('Refuge non recruté: vrai E refusé, pas de dépense',js('!__isolation.engine.refuges.station("medical").powered&&__isolation.engine.s.inventory.scrap===30'))
 fixture('medical');p.keyboard.down('e');p.wait_for_timeout(650);p.keyboard.up('e');p.wait_for_timeout(180)
 check('Relâcher E annule le relais sans payer',js('!__isolation.engine.refuges.station("medical").powered&&__isolation.engine.s.inventory.battery===30'))
 hold('e','__isolation.engine.refuges.station("medical").powered')
 check('Relais: E consomme exactement 2 pièces et 1 pile',js('__isolation.engine.s.inventory.scrap===28&&__isolation.engine.s.inventory.battery===29'))
 position('m_refuge',950,350);health=js('__isolation.engine.s.health');hold('e','__isolation.engine.refuges.station("medical").uses===1')
 check('Service de Nora: E soigne 40 PV, coûte un produit',js('__isolation.engine.s.health')==min(100,health+40) and js('__isolation.engine.s.inventory.chemical===29'))
 js('__isolation.engine.paused=true');shot(p,'66_soins_nora.png','Salle de repli · Une intervention consommée',F+' Relais et soin déclenchés avec E. Un des trois lots est consommé.')
 # Real pickup inputs and three-second project installation.
 fixture('medical');hold('e','__isolation.engine.refuges.station("medical").powered')
 for room,x,y,part in [('m_records',650,350,'med_protocol'),('m_sterile',525,350,'med_injector')]:
  position(room,x,y);hold('e',f'__isolation.engine.refuges.collected("{part}")')
  check('Ramassage par E : '+part,js('id=>__isolation.engine.s.refuges.parts.includes(id)',part))
 position('m_refuge',650,350);p.keyboard.down('e');p.wait_for_timeout(950);p.keyboard.up('e');p.wait_for_timeout(150)
 check('Projet: maintien interrompu conserve les colis',js('!__isolation.engine.refuges.upgraded("medical")&&__isolation.engine.s.refuges.parts.length===2'))
 hold('e','__isolation.engine.refuges.upgraded("medical")')
 check('Projet: vrai maintien consomme deux colis',js('__isolation.engine.s.refuges.parts.length===0&&__isolation.engine.s.refuges.consumed.length===2'))
 js('__isolation.engine.paused=true');shot(p,'67_installation.png','Nora · Une procédure de terrain',F+' Deux ramassages par E et installation de trois secondes effectivement réalisés.')
 # Guarded request: no charges spent when already at full health.
 position('m_refuge',950,350);js('__isolation.engine.s.health=100');before=js('__isolation.engine.s.inventory.chemical');hold('e','__isolation.engine.messages.some(m=>m.text.includes("Santé complète"))')
 check('Santé complète: charge et produit conservés',js('__isolation.engine.s.inventory.chemical')==before and js('__isolation.engine.refuges.station("medical").uses===0'))
 # Distinct escort model and N input. Spawn coincidence is a fixture, separation is real.
 fixture('medical');js("()=>{const e=__isolation.engine,n=e.s.encounters.rescues[0];Object.assign(e.s,{room:'m_isolation',x:1010,y:350,goal:13,chapter:4});Object.assign(n,{status:'wait',room:e.s.room,x:1010,y:350});e.paused=false;__isolation.renderer.lastRoom=null;}")
 p.wait_for_timeout(850);check('Écartement réel d’au moins 43 unités',js('Math.hypot(__isolation.engine.s.x-__isolation.engine.s.encounters.rescues[0].x,__isolation.engine.s.y-__isolation.engine.s.encounters.rescues[0].y)>=43'))
 check('Écartement ne déplace pas Amanda',js('__isolation.engine.s.x===1010&&__isolation.engine.s.y===350'))
 p.keyboard.press('n');check('N au clavier donne l’ordre prudent',js('__isolation.engine.s.encounters.rescues[0].careful'))
 js('__isolation.engine.paused=true');shot(p,'68_nora_prudente.png','Nora · Garder une distance lisible',F+' Positions initialement identiques ; la vraie simulation écarte Nora, puis N change sa posture.')
 p.keyboard.press('j');check('Journal affiche la posture prudente', 'Déplacement prudent' in p.locator('#modalBody').inner_text());shot(p,'69_liaisons_prudentes.png','Liaisons · Personnes et projets',F+' Consultation avec J après le véritable ordre N.')
 for w,h in [(1280,720),(1024,768),(800,700)]:
  p.set_viewport_size({'width':w,'height':h});p.wait_for_timeout(200)
  check(f'Liaisons sans débordement horizontal à {w}×{h}',js('document.documentElement.scrollWidth<=innerWidth'))
  check(f'Portraits chargés à {w}×{h}',p.locator('.contact-portrait').evaluate_all('(xs)=>xs.every(i=>i.complete&&i.naturalWidth>0)'))
  if w==800:shot(p,'70_journal_800.png','Liaisons · Présentation étroite',F+' Vue 800×700, contenus défilants.')
 p.set_viewport_size({'width':1440,'height':900});p.keyboard.press('Escape')
 # Higher medical timer is preserved by import, HUD chooses an injured second contact first.
 load(next(s['save'] for s in active['snapshots'] if s.get('project')=='medical'))
 js("()=>{const e=__isolation.engine,n=e.s.encounters.rescues[1];Object.assign(e.s,{room:'d_changing',x:800,y:350,chapter:8});Object.assign(n,{room:e.s.room,status:'follow',x:825,y:350,health:70,hitCooldown:0});e.encounters.hurt(n,70,'fixture médicale');e.paused=true;__isolation.renderer.lastRoom=null;}")
 check('Blessure améliorée ouvre 35 secondes',js('__isolation.engine.s.encounters.rescues[1].bleed===35'))
 p.keyboard.press('j');check('Délai amélioré visible dans J','35 s' in p.locator('[data-rescue="elias"]').inner_text());shot(p,'71_protocole_secours.png','Protocole · Trente-cinq secondes',F+' Blessure injectée après un vrai projet atteint ; résultat de la mécanique médicale testé, pas un combat naturel.')
 # Legacy import through actual file picker.
 p.keyboard.press('Escape');p.keyboard.press('Escape');p.set_input_files('#importSave',str(R/'tests/fixtures/legacy-v05-save.json'));p.wait_for_timeout(250)
 old=json.loads((R/'tests/fixtures/legacy-v05-save.json').read_text())['state']
 check('Import 0.5 depuis le sélecteur: progression conservée',js('__isolation.engine.s.goal')==old['goal'])
 check('Import 0.5: aucun projet offert',js('Object.values(__isolation.engine.s.refuges.stations).every(v=>!v.powered&&!v.installed)'))
 # Current-file JSON export includes installed projects, not a fabricated new checkpoint.
 load(next(s['save'] for s in active['snapshots'] if s.get('project')=='technical'))
 js('__isolation.engine.save()');p.keyboard.press('Escape')
 with p.expect_download() as d:p.click('[data-action="export"]')
 download=d.value;out=R/'qa/browser-v06-export.json';download.save_as(out);export=json.loads(out.read_text());check('Export JSON: régulateur et colis installés inclus',export['state']['refuges']['stations']['technical']['installed'] and len(export['state']['refuges']['consumed'])==4)
 # Inspect the lower, scrollable project cards as well as the contact portraits.
 load(next(s['save'] for s in active['snapshots'] if s.get('project')=='technical'))
 p.keyboard.press('j');p.locator('.refuge-card').first.scroll_into_view_if_needed();p.wait_for_timeout(180)
 check('Cartes des projets visibles après défilement',p.locator('.refuge-card').first.is_visible() and p.locator('.refuge-card button').count()==0)
 shot(p,'73_services_et_colis.png','Liaisons · Les installations opérationnelles',N+' Journal ouvert avec J puis défilement vers les postes ; aucune action distante.')
 # Report primary extraction scenario: final stats and all 64 locations, no replay state injection.
 load(active['finalSave']);shot(p,'72_epilogue.png','Dernière transmission · Deux projets achevés',N+' Épilogue du même parcours enregistré.')
 check('Épilogue comprend les deux projets', '2/2 projets installés' in p.locator('#endStats').inner_text())
 check('Aucune ressource HTTP externe',js("performance.getEntriesByType('resource').filter(r=>/^https?:/.test(r.name)).length===0"))
 check('Aucune exception JavaScript',not errors);b.close()
result={'version':'0.8.0','pass':sum(c['ok'] for c in checks),'fail':sum(not c['ok'] for c in checks),'checks':checks,'captures':shots,'errors':errors,'htmlSha256':hashlib.sha256((R/'JOUER_ISOLATION.html').read_bytes()).hexdigest(),'loading':'Page.set_content; file:// and localhost blocked by policy; no policy override.'}
(R/'qa/browser-v06-results.json').write_text(json.dumps(result,ensure_ascii=False,indent=2));print(json.dumps({k:result[k] for k in ['version','pass','fail','errors']},ensure_ascii=False));raise SystemExit(bool(result['fail']))
