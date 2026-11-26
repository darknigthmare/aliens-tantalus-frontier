"""Revision 0.7: real keyboard/pointer controls on explicit mechanics fixtures.
The self-contained HTML is executed using set_content, without overriding policies.
These fixtures do NOT count as naturally traversed campaigns or persistent storage tests.
"""
import json,hashlib
from pathlib import Path
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parents[1];checks=[];shots=[];errors=[]
F='SCÈNE PRÉPARÉE : placement, équipement et ressources de contrôle. Les commandes clavier/souris et les mécanismes du moteur sont exécutés ; ce n’est pas un parcours naturel.'
def check(name,value):
 checks.append({'name':name,'ok':bool(value)});print(('PASS ' if value else 'FAIL ')+name,flush=True)
def shot(p,name,title,why=F):
 p.wait_for_timeout(100);p.screenshot(path=str(R/'qa/captures'/name),timeout=10000)
 shots.append({'file':'captures/'+name,'title':title,'provenance':why,'viewport':p.viewport_size})
with sync_playwright() as w:
 b=w.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox']);p=b.new_page(viewport={'width':1440,'height':900});p.set_default_timeout(10000);p.on('pageerror',lambda e:errors.append(str(e)));p.on('dialog',lambda d:d.accept())
 p.set_content((R/'JOUER_ISOLATION.html').read_text(),wait_until='load');p.wait_for_selector('body[data-ready="true"]')
 def js(code,arg=None):return p.evaluate(code,arg)
 def hold(key,condition,timeout=10000):
  p.keyboard.down(key)
  try:p.wait_for_function(condition,timeout=timeout)
  finally:p.keyboard.up(key)
  p.wait_for_timeout(100)
 def stage(room='m_corridor',x=700,y=370):
  js("v=>{__isolation.closePanel();const e=__isolation.engine;e.load(new(e.constructor)('recit',42).serialize());Object.assign(e.s,{room:v.room,x:v.x,y:v.y,goal:12,chapter:4,crouched:true});e.s.tools.tracker=true;e.s.tools.flame=true;e.s.fuel=80;e.s.inventory={scrap:12,chemical:8,battery:5,noise:3,flare:3,emp:3,medkit:3};e.s.alien.active=false;e.s.enemies=[];e.paused=false;e.cooldown=0;e.requireRelease=false;__isolation.renderer.lastRoom=null;}",{'room':room,'x':x,'y':y});p.wait_for_timeout(90)
 p.click('#newGame');stage()
 check('Version courante 0.8.0',js("__isolation.CONTENT.meta.version==='0.8.0'"))
 check('155 SVG décodés avec les quatre icônes distinctes',js("Object.keys(__isolation.renderer.images).length===155&&['noise','flare','emp','medkit'].every(k=>__isolation.renderer.images['ui/'+k+'.svg'].naturalWidth>0)"))
 inv=js('__isolation.engine.s.inventory');pos=js('({x:__isolation.engine.s.x,y:__isolation.engine.s.y})');t=js('__isolation.engine.s.time')
 p.keyboard.press('Tab');p.wait_for_timeout(200)
 check('TAB ouvre quatre choix rapides',p.locator('#quickWheel').is_visible() and p.locator('[data-quick]').count()==4)
 check('La roue ne suspend pas le temps',js('__isolation.engine.s.time')>t and not js('__isolation.engine.paused'))
 p.keyboard.press('ArrowDown');check('Flèche basse prévisualise IEM',js("__isolation.quickControls.preview==='emp'"))
 check('Aperçu sans dépense ni changement validé',js('__isolation.engine.s.inventory')==inv and js("__isolation.engine.s.signals.selected==='noise'"))
 p.keyboard.press('g');p.keyboard.press('e');p.keyboard.press('d');check('Touches de choix ne fuient pas vers le monde',js('__isolation.engine.s.inventory')==inv and js('({x:__isolation.engine.s.x,y:__isolation.engine.s.y})')==pos)
 shot(p,'74_roue.png','Accès rapide · Préparer un lancer',F+' TAB ouvre la roue ; les flèches prévisualisent sans consommer. Le temps continue pendant cet écran.')
 p.keyboard.press('Enter');check('Entrée valide IEM et referme',not p.locator('#quickWheel').is_visible() and js("__isolation.engine.s.signals.selected==='emp'"))
 p.keyboard.press('Tab');p.keyboard.press('ArrowRight');p.keyboard.press('Escape');check('Échap annule l’aperçu sans pause',js("__isolation.engine.s.signals.selected==='emp'&&!__isolation.engine.paused"))
 p.keyboard.press('Tab');p.click('[data-quick="medkit"]');check('La souris valide une trousse sans la consommer',js("__isolation.engine.s.signals.selected==='medkit'&&__isolation.engine.s.inventory.medkit===3"))
 p.mouse.click(900,550,button='right');check('Santé pleine: clic droit ne dépense aucune trousse',js('__isolation.engine.s.inventory.medkit===3'))
 js('__isolation.engine.s.health=30');p.mouse.click(900,550,button='right');check('Clic droit utilise la sélection et soigne',js('__isolation.engine.s.health===85&&__isolation.engine.s.inventory.medkit===2'))
 p.keyboard.press('Tab');p.keyboard.press('3');p.keyboard.press('Enter');p.keyboard.down('v');p.wait_for_timeout(100);check('V prépare le type sélectionné',js("__isolation.engine.aim?.kind==='emp'"));p.keyboard.up('v')
 p.mouse.click(900,550,button='right');check('IEM rapide consomme et démarre un vrai projectile',js('__isolation.engine.s.inventory.emp===2&&__isolation.engine.s.projectiles.length===1'))
 p.wait_for_timeout(1500);check('Le projectile termine son vol',js('__isolation.engine.s.projectiles.length===0'))
 p.keyboard.press('i');check('Équipement: quatre cartes illustrées et coûts visibles',p.locator('.equipment-item').count()==4 and p.locator('.item-recipe').count()==4)
 check('Équipement: sélection et fabrication distinctes',p.locator('[data-select-item]').count()==4 and p.locator('[data-craft]').count()==4)
 shot(p,'75_equipement.png','Équipement · Choisir ou fabriquer',F+' Sélection et utilisation effectuées au clavier et à la souris ; aucun collage ne remplace l’interface.')
 p.click('[data-select-item="flare"]');check('Sélection dans équipement ne fabrique rien',js("__isolation.engine.s.signals.selected==='flare'&&__isolation.engine.s.inventory.flare===3"))
 before=js('__isolation.engine.s.inventory.scrap');p.click('[data-craft="flare"]');check('Fabrication retire exactement les composants',js('__isolation.engine.s.inventory.scrap')==before-1 and js('__isolation.engine.s.inventory.flare===4'))
 js("window.dispatchEvent(new Event('blur'))");p.wait_for_timeout(120);t=js('__isolation.engine.s.time');p.wait_for_timeout(120)
 check('Perte de focus pendant équipement ouvre la pause',p.locator('#pauseCaptions').count()==1 and js('__isolation.engine.paused'))
 check('La simulation cesse effectivement sur perte de focus',js('__isolation.engine.s.time')==t)
 check('Préférence indépendante des sons perçus',p.locator('#pauseCaptions').is_checked());p.uncheck('#pauseCaptions');check('Désactiver les sous-titres modifie la préférence',not js('__isolation.preferences.captions'));p.check('#pauseCaptions');p.click('#closeModal')
 stage();p.keyboard.down('r');p.wait_for_timeout(1000)
 check('R: charge consommée sans cible fictive',js('__isolation.engine.s.signals.charge<100&&__isolation.engine.detector().length===0'))
 p.keyboard.up('r');p.wait_for_timeout(100);charge=js('__isolation.engine.s.signals.charge');p.wait_for_timeout(200)
 check('R relâché: charge conservée',js('__isolation.engine.s.signals.charge')==charge)
 # A finite moving guard follows the actual AI. The player stays crouched behind him.
 js("()=>{const e=__isolation.engine,base=new(e.constructor)('recit').s.enemies.find(n=>n.kind==='human');Object.assign(base,{room:e.s.room,x:900,y:370,min:0,hp:100,face:1,stun:0,patrol:[700,1200]});e.s.enemies=[base];}")
 p.keyboard.down('r');p.wait_for_function('__isolation.engine.detector().length>0');
 check('Un acteur en mouvement produit une mesure',js('__isolation.engine.detector().length>0'))
 check('Lecture sans identité, espèce ni coordonnées absolues',js("Object.keys(__isolation.engine.detector()[0]).every(k=>['dx','dy','distance','ttl'].includes(k))"))
 check('Bips physiques actifs même audio de restitution coupé',js('__isolation.engine.s.signals.stats.pings>0&&__isolation.engine.s.stats.noises>0') and not js('__isolation.preferences.audio'))
 js('__isolation.engine.paused=true');shot(p,'76_detecteur.png','Détecteur · Une position mesurée, pas une certitude',F+' Un garde a marché avec sa vraie IA pendant le maintien de R. La mesure a été figée en pause pour l’inspection.')
 # Check the DOM readout does not cover the rendered sensor screen.
 geom=js("()=>{const c=__isolation.renderer.canvas.getBoundingClientRect(),sc=Math.min(c.width/1440,c.height/810),top=c.y+(c.height-810*sc)/2+607*sc,b=document.getElementById('signalReadout').getBoundingClientRect();return{bottom:b.bottom,top};}")
 check('Panneau de charge au-dessus de l’écran du détecteur',geom['bottom']<=geom['top']+2)
 js('__isolation.engine.paused=false');p.keyboard.press('k');before=js('__isolation.engine.s.signals.stats.pings');p.wait_for_timeout(900)
 check('K coupe le haut-parleur, sans couper les scans',js('__isolation.engine.s.signals.silent') and js('__isolation.engine.s.signals.stats.pings')==before)
 js('__isolation.engine.s.enemies[0].stun=20');p.wait_for_timeout(2400);check('Un acteur devenu immobile disparaît du détecteur',js('__isolation.engine.detector().length===0'));p.keyboard.up('r')
 stage();js('__isolation.engine.s.signals.charge=10');n=js('__isolation.engine.s.inventory.battery')
 p.keyboard.down('y');p.wait_for_timeout(450);p.keyboard.up('y');p.wait_for_timeout(100);check('Y interrompu: aucune pile dépensée',js('__isolation.engine.s.inventory.battery')==n and js('__isolation.engine.s.signals.charge===10'))
 p.keyboard.down('y');p.wait_for_timeout(450);js('__isolation.engine.paused=true');shot(p,'77_remplacement.png','Détecteur · Remplacer sans bouger',F+' Maintien réel de Y interrompu par une pause de contrôle avant la fin de l’opération.')
 js('__isolation.engine.paused=false');p.wait_for_function('__isolation.engine.s.signals.stats.swaps===1');p.wait_for_timeout(220);p.keyboard.up('y')
 check('Y complet: une pile pour 70 points de charge',js('__isolation.engine.s.inventory.battery')==n-1 and js('__isolation.engine.s.signals.charge===80'))
 check('Le maintien prolongé ne dépense pas une seconde pile',js('__isolation.engine.s.signals.stats.swaps===1'))
 js('__isolation.engine.s.signals.charge=.1');hold('r','__isolation.engine.s.signals.charge===0')
 check('Pile vide: aucune mort ni objectif offert',js('__isolation.engine.s.health===100&&!__isolation.engine.s.dead&&__isolation.engine.s.goal===12&&!__isolation.engine.s.tracker'))
 shot(p,'78_pile_vide.png','Détecteur · Continuer sans mesure',F+' La charge s’est épuisée dans la vraie simulation ; santé et objectif ne sont pas modifiés.')
 spec=js('__isolation.CONTENT.signals.stations.find(s=>s.room==="m_staff")');stage(spec['room'],spec['x'],spec['y']);js('__isolation.engine.s.signals.charge=5');inv=js('__isolation.engine.s.inventory');hold('e','__isolation.engine.s.signals.stats.dockCharges===1')
 check('Banc par E: recharge à 100 sans coût de pile',js('__isolation.engine.s.signals.charge===100') and js('__isolation.engine.s.inventory')==inv)
 js('__isolation.engine.paused=true');shot(p,'79_banc_medical.png','Salle de garde · Recharger au poste',F+' E maintenu pendant 2,4 secondes a rechargé le détecteur à partir de cinq points. Pause après réussite.')
 stage(spec['room'],spec['x'],spec['y']);js("__isolation.engine.s.signals.charge=5;__isolation.engine.s.systems.m_staff={mode:1}")
 hold('e',"__isolation.engine.messages.some(m=>m.text.includes('hors tension'))")
 check('Banc refusé lorsque son circuit est éteint',js('__isolation.engine.s.signals.charge===5&&__isolation.engine.s.signals.stats.dockCharges===0'))
 stage();js("()=>{const e=__isolation.engine;e.signals.hear({room:e.s.room,x:e.s.x+80,y:e.s.y},.7,'Pas lourds');}");p.wait_for_timeout(100)
 check('Son proche: sous-titre directionnel sans nom de créature',p.locator('#soundCaptions').is_visible() and 'PAS LOURDS' in p.locator('#soundCaptions').inner_text() and 'À DROITE' in p.locator('#soundCaptions').inner_text())
 js('__isolation.engine.paused=true');shot(p,'80_sons_percus.png','Sous-titres · Écouter sans coordonnées',F+' Source sonore de contrôle soumise au calcul réel d’atténuation et de portée ; indication qualitative seulement.')
 js('__isolation.engine.paused=false');p.wait_for_timeout(3100);check('Sous-titres expirent au fil de la simulation',p.locator('#soundCaptions div').count()==0)
 for room in js('__isolation.CONTENT.signals.interferenceRooms'):
  stage(room);check('Interférences locales '+room,js('__isolation.engine.signals.range===450'))
 stage('a_core');p.keyboard.down('r');p.wait_for_timeout(900);js('__isolation.engine.paused=true');shot(p,'81_interferences.png','APOLLO · Portée instrumentale réduite',F+' Maintien de R dans APOLLO. Portée réduite à 450 unités sans présence artificielle.');p.keyboard.up('r')
 # Finite fixture values saved, then a real file download/upload; no native storage claim.
 stage();js("()=>{const e=__isolation.engine;e.s.signals.charge=31.5;e.signals.select('emp');e.signals.toggleSilent();e.save();}");p.keyboard.press('Escape')
 with p.expect_download() as d:p.click('[data-action="export"]')
 out=R/'qa/browser-v07-export.json';d.value.save_as(out);export=json.loads(out.read_text())
 check('Export contient la charge, le mode et le choix enregistrés',export['state']['signals']['charge']==31.5 and export['state']['signals']['silent'] and export['state']['signals']['selected']=='emp')
 p.set_input_files('#importSave',str(out));p.wait_for_timeout(160)
 check('Import du fichier exporté restaure les trois réglages',js("__isolation.engine.s.signals.charge===31.5&&__isolation.engine.s.signals.silent&&__isolation.engine.s.signals.selected==='emp'"))
 p.keyboard.press('Escape');p.set_input_files('#importSave',str(R/'tests/fixtures/legacy-v06-save.json'));p.wait_for_timeout(180);old=json.loads((R/'tests/fixtures/legacy-v06-save.json').read_text())['state']
 check('Import réel 0.6 garde la progression et ses stocks',js('__isolation.engine.s.goal')==old['goal'] and js('__isolation.engine.s.inventory')==old['inventory'])
 check('Import 0.6 initialise le détecteur sans donner de pile de sac',js("__isolation.engine.s.signals.charge===100&&!__isolation.engine.s.signals.silent"))
 # Reached scanner-on campaign: no state injection besides pause on restore.
 active=json.loads((R/'qa/signals-audible-42.json').read_text());obj=next(x for x in active['snapshots'] if x.get('protocol')=='scanner-reload')
 js("text=>{__isolation.closePanel();const e=__isolation.engine;e.load(text);e.paused=true;__isolation.renderer.lastRoom=null;}",obj['save']);shot(p,'82_parcours_signal.png','Campagne · Une pile réellement remplacée','PARCOURS ACTIF : état atteint dans la campagne Récit graine 42, détecteur levé et haut-parleur actif, ressources finies et dégâts actifs. Restauration puis pause. Le pilote connaît l’état interne ; aucune jauge ni ressource n’a été corrigée après restauration.')
 stage()
 for width,height in [(1440,900),(1280,720),(1024,768),(800,700)]:
  p.set_viewport_size({'width':width,'height':height});p.keyboard.press('Tab');p.wait_for_timeout(80);box=p.locator('.wheel-shell').bounding_box()
  check(f'Roue intégralement cadrée {width}×{height}',box and box['x']>=0 and box['y']>=0 and box['x']+box['width']<=width+1 and box['y']+box['height']<=height+1)
  check(f'Quatre choix accessibles {width}×{height}',all(p.locator('[data-quick]').nth(i).is_visible() for i in range(4)))
  p.keyboard.press('Escape');p.keyboard.press('i');check(f'Équipement sans débordement horizontal {width}×{height}',js("document.getElementById('modalBody').scrollWidth<=document.getElementById('modalBody').clientWidth+1"));p.keyboard.press('Escape')
 p.set_viewport_size({'width':1440,'height':900});stage();p.keyboard.press('Tab');js('__isolation.engine.damage(999,"Contrôle de décès")');p.wait_for_timeout(150)
 check('Décès: roue fermée et écran de reprise visible',not p.locator('#quickWheel').is_visible() and p.locator('#death').is_visible())
 stage();p.keyboard.press('i');js('__isolation.engine.damage(999,"Contrôle de décès")');p.wait_for_timeout(150)
 check('Décès: équipement ne masque pas la reprise',not p.locator('#modal').is_visible() and p.locator('#death').is_visible())
 stage();js("__isolation.engine.pendingHack={sequence:[0,1],index:0,wrong:0,goalId:'fixture',hold:0}");p.keyboard.press('Tab');check('Piratage: la roue ne s’ouvre pas par-dessus',not p.locator('#quickWheel').is_visible());js('__isolation.engine.pendingHack=null')
 check('Aucune requête externe',js("performance.getEntriesByType('resource').filter(e=>/^https?:/.test(e.name)).length===0"));check('Aucune exception JavaScript',not errors);b.close()
result={'version':'0.8.0','pass':sum(c['ok'] for c in checks),'fail':sum(not c['ok'] for c in checks),'checks':checks,'captures':shots,'errors':errors,'htmlSha256':hashlib.sha256((R/'JOUER_ISOLATION.html').read_bytes()).hexdigest(),'loading':'Page.set_content, politiques inchangées. Fixtures explicitement préparées, export/import réel, pas de stockage persistant certifié.'}
(R/'qa/browser-v07-results.json').write_text(json.dumps(result,ensure_ascii=False,indent=2));print(json.dumps({k:result[k] for k in ['version','pass','fail','errors']},ensure_ascii=False));raise SystemExit(bool(result['fail']))
