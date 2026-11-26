#!/usr/bin/env python3
"""Actual Chromium / actual standalone. Native local navigation is probed in the
baseline browser suite; this suite explicitly uses DOM load + memory storage.
Frozen photographs use earned save states; isolated breach scenario labelled.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json,hashlib,time,sys
ROOT=Path(__file__).resolve().parents[1];HTML=(ROOT/'MER_DES_CHAGRINS_JOUABLE.html').read_text();KEY='tantalus.dlc.sea-of-sorrows.v1'
CAP=ROOT/'reports/captures-v040';CAP.mkdir(exist_ok=True);ST=ROOT/'reports/capture-states';ST.mkdir(exist_ok=True)
checks=[];captures=[];errors=[];requests=[]
def check(name,ok):
 checks.append({'name':name,'pass':bool(ok)});print(('PASS 'if ok else'FAIL ')+name,flush=True)
def raw(name):return (ROOT/f'qa/rearguard-fixtures/{name}.json').read_text()
def boot(b,seed=None,frozen=False,width=1440,height=900):
 p=b.new_page(viewport={'width':width,'height':height},device_scale_factor=1);p.set_default_timeout(8000)
 p.on('pageerror',lambda e:errors.append(str(e)));p.on('request',lambda r:requests.append(r.url))
 p.evaluate('''({seed,frozen})=>{window.__SOS_QA__=true;window.__storage=new Map(Object.entries(seed));Object.defineProperty(window,'localStorage',{value:{getItem:k=>__storage.has(k)?__storage.get(k):null,setItem:(k,v)=>__storage.set(k,String(v)),removeItem:k=>__storage.delete(k)}});if(frozen)window.requestAnimationFrame=()=>1;}''',{'seed':seed or {},'frozen':frozen})
 p.set_content(HTML,wait_until='load');return p
def resume(p,name):
 p.evaluate('''r=>{const q=__sos,g=q.game;g.importSave(r);q.closeAll();g.drainEvents();q.updateHUD();q.renderer.lastRoom='';q.renderer.draw(g.time,0);}''',raw(name))
def shot(p,name,description,source=None,provenance='continuous_save'):
 p.screenshot(path=str(CAP/name),timeout=15000)
 state=p.evaluate('__sos.game.exportSave()');(ST/(name+'.json')).write_text(state)
 captures.append({'file':name,'description':description,'provenance':provenance,'source_save':source,'source_sha256':hashlib.sha256(raw(source).encode()).hexdigest()if source else None,'image_sha256':hashlib.sha256((CAP/name).read_bytes()).hexdigest(),'state_sha256':hashlib.sha256(state.encode()).hexdigest()})
 print('CAPTURE '+name,flush=True)
def client(p,x,z):
 return p.evaluate('''({x,z})=>{const r=__sos.renderer,b=document.getElementById('scene').getBoundingClientRect(),q=r.pos(x,z);return {x:b.left+q.x/r.W*b.width,y:b.top+q.y/r.H*b.height};}''',{'x':x,'z':z})
fatal=None
with sync_playwright() as w:
 b=w.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 try:
  p=boot(b,frozen=True);check('HTML v0.5, schéma 8 et 120 dossiers chargés',p.evaluate('SoSData.meta.version==="0.9.0"&&__sos.game.state.schema===8&&SoSData.codex.length===120'))
  shot(p,'01_titre.png','Écran titre réel de la version 0.5.0.',provenance='title')
  p.click('#helpBtn');text=p.locator('#panelContent').inner_text();check('Guide : cloisons, position de Manning et lectures expliqués',all(s.casefold() in text.casefold() for s in ['G maintenu','Clic droit','trois secondes','28 de pression']))
  p.close()
  old=(ROOT/'qa/fixtures-v030/played-HYBRID-07.json').read_text();p=boot(b,seed={KEY:old,'tantalus.main.sentinel':'KEEP'})
  p.click('#continueBtn');p.wait_for_timeout(100)
  check('Migration 0.3→0.5 par Reprendre sans changer les objectifs',p.evaluate('__sos.game.state.schema===8&&__sos.game.state.objectiveIndex===7'))
  check('Copie originale backup-v3 conservée exactement',p.evaluate('k=>localStorage.getItem(k)',KEY+'.backup-v3')==old)
  check('Les sauvegardes du jeu hôte ne sont pas écrasées',p.evaluate("localStorage.getItem('tantalus.main.sentinel')")=='KEEP');p.close()
  p=boot(b);resume(p,'closed-gate-s17');p.wait_for_timeout(100)
  cycles=p.evaluate('__sos.game.state.stats.shutterCycles')
  p.keyboard.down('KeyG');p.wait_for_timeout(650);p.keyboard.up('KeyG');partial=p.evaluate('__sos.game.rs.shutters["gate-s17"].progress')
  check('G maintenu progresse sans ouverture instantanée',.35<partial<1.5 and p.evaluate('__sos.game.rs.shutters["gate-s17"].status')=='closed')
  shot(p,'03_manoeuvre.png','Pupitre de l’atelier : réouverture commencée au clavier G depuis la sauvegarde du parcours. Le travail partiel est affiché.','closed-gate-s17','live_input_from_continuous_save')
  p.keyboard.press('Escape');t=p.evaluate('__sos.game.state.stats.time');p.wait_for_timeout(200)
  check('Pause fige aussi une manœuvre de cloison',p.evaluate('__sos.game.state.stats.time')==t)
  p.click('#resumePlay');p.wait_for_timeout(140);check('Reprendre ne garde pas la touche G enfoncée',p.evaluate('__sos.game.rs.shutters["gate-s17"].progress')==partial)
  p.keyboard.down('KeyG');p.wait_for_timeout(1200);p.keyboard.up('KeyG')
  check('La réouverture au clavier libère effectivement la collision',p.evaluate('__sos.game.rs.shutters["gate-s17"].status==="open"&&!__sos.game.blocked(830,.55)'))
  check('Une manœuvre terminée augmente le compteur une seule fois',p.evaluate('__sos.game.state.stats.shutterCycles')==cycles+1)
  target=client(p,1110,.55);before=p.evaluate('({x:__sos.game.state.companion.x,shots:__sos.game.state.stats.shots})')
  p.mouse.click(target['x'],target['y'],button='right');p.wait_for_timeout(160)
  check('Clic droit : ordre de position sans tir parasite',p.evaluate('__sos.game.state.companion.rally?.x')is not None and p.evaluate('__sos.game.state.stats.shots')==before['shots'])
  x=p.evaluate('__sos.game.state.companion.x');check('Manning marche vers le point sans téléportation',before['x']<x<before['x']+80)
  p.wait_for_timeout(2250);check('Manning atteint le point et le tient',p.evaluate('__sos.game.distance(__sos.game.state.companion,__sos.game.state.companion.rally)<16&&__sos.game.state.companion.order==="hold"'))
  shot(p,'08_manning.png','Manning rejoint puis tient une position indiquée au clic droit dans l’atelier ouvert. Déplacement joué dans le navigateur.','closed-gate-s17','live_input_from_continuous_save')
  p.keyboard.press('KeyV');check('V rappelle Manning et annule le point',p.evaluate('__sos.game.state.companion.rally===null&&__sos.game.state.companion.order==="follow"'))
  p.click('#mapBtn');p.click('#localMap');check('La carte utilise l’état réel de la cloison',p.locator('[data-shutter="gate-s17"]').count()==1 and 'OUVERTE' in p.locator('.roomPlan').text_content())
  xy=p.evaluate('''()=>{const s=document.querySelector('.roomPlan'),p=s.createSVGPoint();p.x=620;p.y=80+.55*480;const q=p.matrixTransform(s.getScreenCTM());return {x:q.x,y:q.y};}''');p.mouse.click(xy['x'],xy['y'])
  check('Un clic sur le plan local donne aussi une position praticable',p.evaluate('(()=>{const q=__sos.game.state.companion.rally,s=document.querySelector(".roomPlan"),tol=s.viewBox.baseVal.width/s.getBoundingClientRect().width*1.5;return q&&Math.abs(q.x-620)<tol&&Math.abs(q.z-.55)<.012;})()'))
  check('Le plan ne contient aucune balise de position ennemie',p.locator('.roomPlan [data-enemy]').count()==0)
  p.close()
  p=boot(b);resume(p,'reading-echo-s23');p.wait_for_timeout(50);n=p.evaluate('__sos.game.state.stats.readings');oi=p.evaluate('__sos.game.state.objectiveIndex');p.keyboard.down('Space');p.wait_for_timeout(600)
  check('Espace révèle la lecture et sa progression à l’écran',p.evaluate('__sos.bindings.primary("focus")').lower() in p.locator('#prompt').inner_text().lower() and p.locator('#operationProgress').is_visible())
  shot(p,'06_perception.png','Lecture empathique dans la salle des restes : Espace maintenu depuis une sauvegarde du parcours, sans déplacement ou modification des acteurs.','reading-echo-s23','live_input_from_continuous_save')
  p.wait_for_timeout(1450);p.keyboard.up('Space');check('La lecture consigne un seul nouveau dossier',p.evaluate('__sos.game.state.stats.readings')==n+1 and p.evaluate('__sos.game.state.archives.includes("dossier-echo-s23")'))
  check('La lecture facultative ne valide pas un objectif principal',p.evaluate('__sos.game.state.objectiveIndex')==oi)
  p.keyboard.press('KeyJ');p.fill('#codexSearch','Les restes muets');check('La perception se relit dans les dossiers débloqués',p.locator('.dossier').count()==1 and 'PERCEPTION' in p.locator('.dossier').inner_text());p.close()
  # Photographs: positions/state untouched; simulation frozen only for exposure.
  for key,name,desc,kind in [
   ('closed-gate-s17','02_cloison.png','Cloison de l’atelier fermée et point de couverture de Manning. Sauvegarde du parcours complet en Hybride / Survie.','continuous_save'),
   ('scenario-impact','04_impact.png','Frappe annoncée contre la grille de machinerie. Scénario isolé : entrée directe dans s30 depuis une sauvegarde équipée, puis déplacements et dégâts simulés sans repositionner les acteurs.','isolated_simulation'),
   ('scenario-broken','05_rupture.png','La même grille après sa rupture par les créatures. Les dégâts et la perte d’intégrité proviennent du scénario simulé.','isolated_simulation'),
   ('closed-gate-s35','09_convoi.png','Les brancards rassemblés du même côté de la cloison des paliers. Sauvegarde du parcours complet, sans correction des positions.','continuous_save'),
   ('read-echo-s32','10_ponte.png','Chambre des œufs après la lecture facultative. État conservé du parcours Hybride / Survie.','continuous_save')]:
   p=boot(b,frozen=True);resume(p,key);shot(p,name,desc,key,kind);p.close()
  p=boot(b,frozen=True);resume(p,'closed-gate-s17');p.evaluate("__sos.game.setWaypoint(__sos.game.room.doors.find(d=>d.x>__sos.game.room.shutters[0].x).to);__sos.updateHUD()");check('Le HUD signale une cloison fermée sur le prochain passage', 'REPÈRE BLOQUÉ' in p.locator('#routeStatus').inner_text());p.click('#mapBtn');p.click('#localMap');check('Le plan précise quelle cloison locale doit être ouverte', 'À ouvrir dans cette salle' in p.locator('.routeText').inner_text());shot(p,'07_plan.png','Plan local : empreinte réelle de la cloison fermée et point donné à Manning, sans position ennemie.','closed-gate-s17','ui_from_continuous_save');p.close()
  p=boot(b,seed={KEY:raw('HYBRID-survival-33')},frozen=True);p.click('#continueBtn');check('Bilan final : 8 lectures et 16 manœuvres conservées',p.evaluate('__sos.game.state.finished&&__sos.game.state.stats.readings===8&&__sos.game.state.stats.shutterCycles===16') and 'Perceptions consignées : 8 / 8' in p.locator('#panelContent').inner_text())
  shot(p,'11_bilan.png','Bilan réel du parcours Hybride / Survie : campagne terminée, huit lectures et seize manœuvres.','HYBRID-survival-33','ui_from_continuous_save');p.close()
  p=boot(b,frozen=True,width=960,height=720);resume(p,'closed-gate-s35');check('Format 960 × 720 sans débordement horizontal de la page',p.evaluate('document.documentElement.scrollWidth<=innerWidth'))
  shot(p,'12_format_960.png','Même convoi, format 960 × 720. Contrôle de disposition ; ce n’est pas une certification mobile complète.','closed-gate-s35','responsive_from_continuous_save');p.close()
  # Static render audit: every shutter in open/closed/broken, both views.
  p=boot(b,frozen=True);p.evaluate('''raw=>{const q=__sos,g=q.game;g.importSave(raw);let count=0;for(const mode of ['HYBRID','CLASSIC']){g.setPresentation(mode);for(const r of SoSData.rooms.filter(r=>r.shutters.length)){g.enter(r.id);for(const status of ['open','closed','broken']){for(const s of r.shutters)Object.assign(g.rs.shutters[s.id],{status,integrity:status==='broken'?0:100,progress:0});q.renderer.lastRoom='';q.renderer.draw(g.time,0);count++;}}}window.__renderCount=count;}''',raw('HYBRID-survival-10'))
  check('48 rendus ciblés : 8 cloisons × 3 états × 2 présentations',p.evaluate('__renderCount')==48);p.close()
  check('Aucune erreur JavaScript dans cette suite',not errors);check('Aucune dépendance réseau du HTML autonome',not requests)
 except Exception as e:
  fatal=str(e);print('FATAL',fatal,flush=True);errors.append(fatal)
 finally:b.close()
result={'version':'0.9.0','html_sha256':hashlib.sha256(HTML.encode()).hexdigest(),'checks':checks,'passed':sum(c['pass']for c in checks),'failed':sum(not c['pass']for c in checks)+(1 if fatal else 0),'captures':captures,'errors':errors,'requests':requests,'rendered_shutter_states':48 if not fatal else None,'storage':'explicit memory fixture; not native persistence'}
(ROOT/'reports/rearguard-browser.json').write_text(json.dumps(result,ensure_ascii=False,indent=2));print('RESULT',result['passed'],result['failed'],flush=True)
sys.exit(1 if result['failed'] else 0)
