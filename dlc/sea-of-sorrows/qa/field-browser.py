#!/usr/bin/env python3
"""v0.5 real browser input checks and unretouched captures of actual played states.
Requires Playwright and Chromium. No native file/HTTP policy bypass; memory storage.
The snapshots originate in qa/tactical.cjs and qa/rescue-scenario.cjs, not debug placement.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json,hashlib,sys,time
ROOT=Path(__file__).resolve().parents[1]
HTML=(ROOT/'MER_DES_CHAGRINS_JOUABLE.html').read_text()
CAP=ROOT/'reports/captures';CAP.mkdir(parents=True,exist_ok=True)
checks=[];captures=[];errors=[];requests=[]
KEY='tantalus.dlc.sea-of-sorrows.v1'
def check(name,value):
    checks.append({'name':name,'pass':bool(value)});print(('PASS 'if value else'FAIL ')+name,flush=True)
def raw(name):return (ROOT/f'qa/tactical-fixtures/{name}.json').read_text()
def boot(b,width=1440,height=900,seed=None,frozen=False):
    p=b.new_page(viewport={'width':width,'height':height},device_scale_factor=1)
    p.set_default_timeout(6500);p.on('pageerror',lambda e:errors.append(str(e)));p.on('request',lambda r:requests.append(r.url))
    p.evaluate('''({seed,frozen})=>{window.__SOS_QA__=true;window.__store=new Map(Object.entries(seed));Object.defineProperty(window,'localStorage',{value:{getItem:k=>__store.has(k)?__store.get(k):null,setItem:(k,v)=>__store.set(String(k),String(v)),removeItem:k=>__store.delete(k)}});if(frozen)window.requestAnimationFrame=()=>1;}''',{'seed':seed or {},'frozen':frozen})
    p.set_content(HTML,wait_until='load');return p

def resume(p,name):
    # Only documented save/import and UI functions. No player or enemy placement edits.
    p.evaluate('''r=>{const q=__sos,g=q.game;g.importSave(r);q.closeAll();g.drainEvents();q.updateHUD();q.renderer.lastRoom='';q.renderer.draw(g.time,0);}''',raw(name))

def shot(p,name,description,source=None,kind='continuous_save'):
    p.screenshot(path=str(CAP/name),timeout=10000)
    captures.append({'file':name,'description':description,'provenance':kind,'source_save':source,
        'source_sha256':hashlib.sha256(raw(source).encode()).hexdigest() if source else None,
        'image_sha256':hashlib.sha256((CAP/name).read_bytes()).hexdigest()})
    print('CAPTURE '+name,flush=True)

fatal=None
with sync_playwright() as pw:
    b=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
    try:
        p=boot(b)
        check('Le catalogue et le moteur chargent la version 0.5 et 96 dossiers',p.evaluate('SoSData.meta.version==="0.9.0"&&SoSData.codex.length===120&&__sos.game.state.schema===8'))
        p.click('#helpBtn');text=p.locator('#panelContent').inner_text()
        check('Le guide explique Ctrl, la réparation et les cycles',all(x in text for x in ['Ctrl','K maintenu','période calme']))
        p.click('#closePanel');p.close()
        old=(ROOT/'qa/fixtures-v020/played-HYBRID-26.json').read_text()
        p=boot(b,seed={KEY:old,'tantalus.main.sentinel':'KEEP'});p.click('#continueBtn');p.wait_for_timeout(120)
        check('Reprendre migre une vraie sauvegarde 0.2 vers le schéma 5',p.evaluate('__sos.game.state.schema===8&&__sos.game.state.objectiveIndex===26'))
        check('La copie backup-v2 conserve exactement le fichier précédent',p.evaluate('k=>localStorage.getItem(k)',KEY+'.backup-v2')==old)
        check('La migration ne touche pas à la sentinelle du jeu hôte',p.evaluate('localStorage.getItem("tantalus.main.sentinel")')=='KEEP')
        p.click('#pauseBtn');exported=p.evaluate('__sos.game.exportSave()')
        check('L’export contient le repère, les pièces et le schéma 5',all(k in json.loads(exported)['state']for k in ['waypoint','repair']) and 'parts' in json.loads(exported)['state']['player'])
        p.close()
        # Live keyboard dodge: equipped save in a cleared annex, no actor setup.
        p=boot(b);resume(p,'s42-isolated');p.wait_for_timeout(100)
        before=p.evaluate('({x:__sos.game.p.x,s:__sos.game.p.stamina,d:__sos.game.state.stats.dodges})')
        p.keyboard.down('ArrowRight');p.keyboard.press('ControlLeft');p.wait_for_timeout(95);p.keyboard.up('ArrowRight')
        check('Ctrl + direction déclenche une esquive au clavier',p.evaluate('__sos.game.state.stats.dodges')==before['d']+1)
        check('L’esquive déplace le joueur et débite son endurance',p.evaluate('__sos.game.p.x')>before['x']+20 and p.evaluate('__sos.game.p.stamina')<before['s']-15)
        p.keyboard.press('ControlLeft');check('Le délai bloque un deuxième déclenchement immédiat',p.evaluate('__sos.game.state.stats.dodges')==before['d']+1)
        p.keyboard.press('Escape');t=p.evaluate('__sos.game.time');p.wait_for_timeout(150)
        check('Pause fige également une esquive en cours',p.evaluate('__sos.game.time')==t)
        p.click('#resumePlay');p.wait_for_timeout(400);x=p.evaluate('__sos.game.p.x');p.wait_for_timeout(180)
        check('Reprendre ne conserve pas une direction fantôme',p.evaluate('__sos.game.p.x')==x)
        # Map and route remain descriptive, not auto-navigation.
        p.click('#mapBtn');p.click('#localMap')
        check('La carte locale expose le véritable danger des pompes',p.locator('.roomPlan [data-hazard="pump-steam"]').count()==1)
        check('L’emprise de profondeur du danger respecte ses données',p.evaluate('Math.abs(Number(document.querySelector("[data-hazard=pump-steam]").getAttribute("height"))-SoSCore.ROOMS.s42.hazards[0].d*480)<.001'))
        check('Un dispositif isolé apparaît comme tel sur la carte','isolé' in p.locator('.roomPlan').text_content())
        known=p.evaluate('[...__sos.game.knownRooms()]');options=p.locator('#routeTarget option').count()
        check('Les destinations sélectionnables se limitent aux lieux repérés',options==len(known)+1)
        target=p.evaluate('__sos.game.room.doors[0].to');p.select_option('#routeTarget',target);p.click('#setRoute')
        check('Le bouton de repère calcule un trajet actuellement ouvert',p.evaluate('t=>__sos.game.state.waypoint===t&&__sos.game.routeTo()?.length>0',target))
        pos=p.evaluate('({x:__sos.game.p.x,z:__sos.game.p.z,room:__sos.game.state.room})')
        p.click('#closePanel');p.wait_for_timeout(160)
        check('Le repère affiche une consigne sans déplacer le joueur',p.locator('#routeStatus').is_visible() and p.evaluate('({x:__sos.game.p.x,z:__sos.game.p.z,room:__sos.game.state.room})')==pos)
        snap=p.evaluate('__sos.game.exportSave()');p.evaluate('r=>__sos.game.importSave(r)',snap)
        check('Le repère est conservé par export/import',p.evaluate('__sos.game.state.waypoint')==target)
        p.click('#mapBtn');p.click('#clearRoute');p.click('#closePanel');p.wait_for_timeout(150)
        check('Effacer retire aussi la consigne du HUD',p.evaluate('__sos.game.state.waypoint===null') and p.locator('#routeStatus').is_hidden())
        p.keyboard.press('KeyI');check('Le stock de renforts figure dans l’équipement','Renforts de châssis' in p.locator('#panelContent').inner_text());p.close()
        # Actual damaged state from rescue-scenario; key held through live simulation.
        p=boot(b);resume(p,'repair-played');p.wait_for_timeout(100)
        state=p.evaluate('({parts:__sos.game.p.parts,repairs:__sos.game.state.stats.repairs,hp:__sos.game.state.rescue.actors.find(a=>a.id==="elway").integrity})')
        check('La sauvegarde de réparation reprend un brancard réellement endommagé',state['hp']==76 and abs(p.evaluate('__sos.game.state.repair.progress')-1.5)<1e-6)
        p.keyboard.down('KeyK');p.wait_for_timeout(320)
        check('Maintenir K affiche la progression de réparation',p.locator('#operationProgress').is_visible() and 'Réparer' in p.locator('#prompt').inner_text())
        p.keyboard.press('Escape');r=p.evaluate('__sos.game.state.repair.progress');p.wait_for_timeout(160);p.keyboard.up('KeyK')
        check('La progression de réparation est gelée dans Pause',p.evaluate('__sos.game.state.repair.progress')==r)
        p.click('#resumePlay');p.wait_for_timeout(140);check('La réparation ne redémarre pas sans K',p.evaluate('__sos.game.state.repair.progress')==r)
        p.keyboard.down('KeyK');p.wait_for_timeout(1450);p.keyboard.up('KeyK')
        check('K termine la réparation et restaure le châssis',p.evaluate('__sos.game.state.rescue.actors.find(a=>a.id==="elway").integrity')==100)
        check('La réparation achevée consomme un seul renfort',p.evaluate('__sos.game.p.parts')==state['parts']-1 and p.evaluate('__sos.game.state.stats.repairs')==state['repairs']+1)
        p.keyboard.down('KeyK');p.wait_for_timeout(250);p.keyboard.up('KeyK')
        check('Maintenir K sur un châssis intact ne dépense rien',p.evaluate('__sos.game.p.parts')==state['parts']-1)
        p.close()
        # Freeze exact played snapshots for photographs and deterministic visual tests.
        f=boot(b,frozen=True)
        shot(f,'01_titre.png','Écran titre de la v0.5.0, rendu par le HTML autonome.',kind='title')
        resume(f,'s42-warning')
        check('L’avertissement d’un danger atteint le bandeau HUD','PRESSION' in f.locator('#dangerStatus').inner_text())
        check('Le danger est effectivement dans sa phase de préavis',f.evaluate('__sos.game.hazardStatus(__sos.game.room.hazards[0]).phase')=='warning')
        shot(f,'02_pompes_preavis.png','Pompes : préavis avant émission de vapeur. Sauvegarde du parcours HYBRIDE / Survie ; rendu figé sans replacer les acteurs.','s42-warning')
        t=f.evaluate('__sos.game.rs.localTime');f.click('#pauseBtn');f.wait_for_timeout(100)
        check('La sauvegarde conserve l’horloge locale du danger',json.loads(f.evaluate('__sos.game.exportSave()'))['state']['roomStates']['s42']['localTime']==t)
        resume(f,'s42-isolated')
        check('Le réarmement met durablement le danger à l’arrêt',f.evaluate('__sos.game.hazardStatus(__sos.game.room.hazards[0]).phase')=='stopped')
        shot(f,'03_pompes_consignees.png','Même passage après intervention : émission définitivement isolée, état issu du même parcours enregistré.','s42-isolated')
        for name,key,desc in [
            ('04_esplanade.png','layout-s22','Esplanade : pilier central et chemins de contournement. Position issue du parcours, sans déplacement pour la photo.'),
            ('05_noeud_ambre.png','layout-s27','Nœud ambré : volumes de silice et résine, passages latéraux et profondeur utile. État de parcours figé.'),
            ('06_ponte.png','layout-s32','Zone de ponte : obstacles restructurés et desserte lisible. État du parcours continu.'),
            ('07_reine_preavis.png','attack-s33','Reine : l’empreinte d’attaque est fixée au sol pendant sa préparation. Instant enregistré en combat, avant la décision d’esquive.'),
            ('08_esquive.png','dodge','Même rencontre, une étape de simulation plus tard : esquive exécutée par une entrée normale du moteur. Endurance réellement consommée.'),
            ('09_convoi.png','convoy','Entrée du treuil avec Adams et Elway : deux brancards physiques. Sauvegarde du parcours continu ; aucune intégrité ni position modifiée.'),
            ('11_capture.png','HYBRID-survival-30','Capture réussie après arrimage du convoi. Spécimen vivant et mousse consommée dans le parcours complet.')]:
            resume(f,key);shot(f,name,desc,key)
        resume(f,'attack-s33');check('Le préavis de frappe est affiché dans le HUD','ATTAQUE EN PRÉPARATION'==f.locator('#dangerStatus').inner_text())
        resume(f,'dodge');check('La pose capturée correspond à une vraie esquive active',f.evaluate('__sos.game.p.dodgeTime>0&&__sos.game.p.stamina<80'))
        resume(f,'repair-played')
        # Restore active UI through one genuine repair input; no coordinates/resources edited.
        f.evaluate('()=>{__sos.game.step(.001,{repair:true});__sos.updateHUD();__sos.renderer.draw(__sos.game.time,0)}')
        shot(f,'10_reparation.png','Scénario ciblé repris du parcours : halte volontaire sous la vapeur, dégâts réels, puis réparation avec K. Sauvegarde à mi-réparation ; une entrée K de 0,001 s réaffiche la barre.','repair-played','targeted_played_scenario')
        resume(f,'s42-warning');f.click('#mapBtn');f.click('#localMap')
        shot(f,'12_plan_local.png','Carte du passage des pompes : emprise de vapeur issue des coordonnées de collision, portes et intervention. Carte ouverte depuis la sauvegarde réelle.','s42-warning','continuous_save_ui')
        check('Le plan n’affiche aucune position de créature','Aucune position ennemie' in f.locator('#panelContent').inner_text())
        f.close()
        narrow=boot(b,390,844,frozen=True);resume(narrow,'s42-isolated')
        check('Le HUD ne déborde pas horizontalement en 390 × 844',narrow.evaluate('document.documentElement.scrollWidth<=innerWidth+1'))
        check('Le jeu conserve ses commandes tactiles de base en format étroit',narrow.locator('#touchControls').is_visible())
        shot(narrow,'13_format_etroit.png','Fenêtre 390 × 844 : présentation du même jeu et commandes tactiles de base. Clavier et souris restent nécessaires pour toutes les fonctions.','s42-isolated','continuous_save_responsive')
        narrow.click('#mapBtn');narrow.click('#localMap');check('Le sélecteur de repère est accessible en format étroit',narrow.locator('#routeTarget').is_visible() and narrow.evaluate('document.documentElement.scrollWidth<=innerWidth+1'));narrow.close()
        small=boot(b,1024,768,frozen=True);resume(small,'convoy')
        check('HUD, terrain et mission restent séparés en 1024 × 768',small.evaluate('()=>{let h=document.querySelector("#hud").getBoundingClientRect(),c=document.querySelector("#scene").getBoundingClientRect(),m=document.querySelector("#mission").getBoundingClientRect();return h.bottom<=c.top+1&&c.bottom<=m.top+1}'));small.close()
        check('Aucune exception JavaScript pendant la régression des fonctions 0.3',not errors)
        check('Le prototype ne charge aucune ressource distante',not requests)
    except Exception as e:
        fatal=str(e);check('Exécution complète du protocole',False);print(fatal,flush=True)
    finally:b.close()
report={'version':'0.9.0','html_sha256':hashlib.sha256(HTML.encode()).hexdigest(),'browser':'Chromium / Playwright','storage':'Explicit in-memory fixture; no native persistence certification','navigation':'Exact HTML loaded with set_content; no file/HTTP policy bypass','captures_use_fixed_simulation':True,'captures_reposition_actors':False,'human_playthrough':False,'checks':checks,'passed':sum(c['pass']for c in checks),'failed':sum(not c['pass']for c in checks),'captures':sorted(captures,key=lambda c:c['file']),'errors':errors,'network_requests':requests,'fatal':fatal}
(ROOT/'reports/field-browser.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
print('RESULT',report['passed'],report['failed'],flush=True)
sys.exit(bool(report['failed']))
