"""Focused escort/contact UI QA. All fixtures and reached checkpoints are labelled.
Uses exact standalone with Page.set_content, not a browser policy override.
"""
from pathlib import Path
import json, hashlib
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parents[1];checks=[];shots=[];errors=[]
def check(name,ok):
 checks.append({'name':name,'ok':bool(ok)});print(('PASS ' if ok else 'FAIL ')+name,flush=True)
def js(p,code,arg=None):return p.evaluate(code,arg)
def snap(p,name,title,provenance):
 p.screenshot(path=str(R/'qa/captures'/name),timeout=15000);shots.append({'file':'captures/'+name,'title':title,'provenance':provenance,'viewport':p.viewport_size});print('CAPTURE '+name,flush=True)
fixture='SCÈNE PRÉPARÉE : position, menace et état réglés pour le contrôle ciblé ; les commandes testées sont celles du navigateur. Pas une preuve de parcours naturel.'
reached='État atteint lors du parcours Récit graine 42 : 52 objectifs, 32 tâches, 76 lieux et deux escortes, ennemis et dégâts actifs. Restauration puis pause pour l’inspection.'
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox']);p=b.new_page(viewport={'width':1440,'height':900});p.set_default_timeout(12000);p.on('pageerror',lambda e:errors.append(str(e)));p.on('dialog',lambda d:d.accept())
 p.set_content((R/'JOUER_ISOLATION.html').read_text(),wait_until='load');p.wait_for_selector('body[data-ready="true"]');p.select_option('#difficulty','recit');p.click('#newGame')
 active=json.loads((R/'qa/spatial-campaign-live-42.json').read_text());assert active['ok'] and len(active['rescued'])==2
 def load(text):
  check('Import du point de contrôle 0.6',js(p,"text=>{__isolation.closePanel();const e=__isolation.engine,r=e.load(text);e.paused=true;e.messages=[];__isolation.renderer.lastRoom=null;return r.ok;}",text));p.wait_for_timeout(140)
 def hold(key,condition,timeout=9000):
  p.keyboard.down(key)
  try:p.wait_for_function(condition,timeout=timeout)
  finally:p.keyboard.up(key)
 def contact_fixture():
  js(p,"()=>{__isolation.closePanel();const e=__isolation.engine;e.load(new(e.constructor)('recit').serialize());Object.assign(e.s,{room:'m_isolation',x:335,y:350,chapter:4,goal:13,flags:{morley:true,hunt:true},crouched:true});e.s.alien.active=false;e.s.enemies=[];e.requireRelease=false;e.cooldown=0;e.paused=false;__isolation.renderer.lastRoom=null;}");p.wait_for_timeout(120)
 # Four rooms reached by the actual driver, not spawned from an unfinished route.
 for num,oid,title in [(48,'O17','Préparation des soins · Le triage'),(49,'O18','Salle de repli · Un abri local'),(50,'O19','Vestiaire · Les équipes dispersées'),(51,'O20','Poste de relève · Le second refuge')]:
  ss=next(x for x in active['snapshots'] if x.get('optional')==oid);load(ss['save']);check('Tâche '+oid+' réellement restaurée',js(p,'id=>__isolation.engine.s.optional.includes(id)',oid));snap(p,f'{num}_{oid}.png',title,reached)
 load(next(x for x in active['snapshots'] if x.get('rescue')=='nora-rescued')['save'])
 check('Nora présente au refuge',js(p,"__isolation.engine.s.encounters.rescues[0].status==='rescued'&&__isolation.engine.s.encounters.rescues[0].room==='m_refuge'"))
 # Walk away by real inputs so the actor is not covered by Amanda on this capture.
 js(p,'__isolation.engine.paused=false');p.keyboard.down('a');p.wait_for_timeout(1200);p.keyboard.up('a');js(p,'__isolation.engine.paused=true');p.wait_for_timeout(160)
 snap(p,'52_nora_refuge.png','Nora · L’arrivée confirmée',reached+' Amanda effectue ensuite quelques pas au clavier dans le refuge ; aucun acteur n’est replacé artificiellement.')
 load(next(x for x in active['snapshots'] if x.get('rescue')=='elias-rescued')['save']);p.keyboard.press('j');p.wait_for_timeout(160)
 check('J ouvre les liaisons et affiche deux arrivées',p.locator('#modal').is_visible() and p.locator('.rescue-summary>span').inner_text()=='2 / 2')
 check('Deux contacts physiques, sans bouton de téléportation',p.locator('.rescue-card').count()==2 and p.locator('.rescue-card button').count()==0)
 check('Les deux arrivées sont identifiées comme refuges locaux','Un abri local' in p.locator('#modalBody').inner_text())
 snap(p,'53_liaisons.png','Liaisons · Deux personnes à l’abri',reached+' Journal ouvert avec J depuis le point d’arrivée d’Elias.')
 for w,h in [(1280,720),(1024,768),(800,700)]:
  p.set_viewport_size({'width':w,'height':h});p.wait_for_timeout(150);check(f'Journal sans débordement horizontal {w}×{h}',js(p,'document.documentElement.scrollWidth<=innerWidth'))
 p.set_viewport_size({'width':1440,'height':900});p.keyboard.press('Escape')
 # Recruitment through actual E, then wait/follow and U hiding.
 contact_fixture();hold('e',"__isolation.engine.s.encounters.rescues[0].status==='follow'")
 check('E recrute le contact et non un objectif principal',js(p,"__isolation.engine.s.goal===13&&__isolation.engine.s.encounters.stats.recruited===1"))
 p.wait_for_timeout(200);hold('e',"__isolation.engine.s.encounters.rescues[0].status==='wait'");check('E demande une attente sur place',js(p,"__isolation.engine.s.encounters.rescues[0].status==='wait'"))
 p.wait_for_timeout(180);hold('e',"__isolation.engine.s.encounters.rescues[0].status==='follow'")
 p.keyboard.press('u');check('U ordonne une marche vers le casier, sans entrée instantanée',js(p,"__isolation.engine.s.encounters.rescues[0].status==='seeking'"))
 p.wait_for_function("__isolation.engine.s.encounters.rescues[0].status==='hiding'",timeout=12000);js(p,'__isolation.engine.paused=true');p.wait_for_timeout(150)
 check('Le contact rejoint réellement son casier',js(p,"!!__isolation.engine.s.encounters.rescues[0].locker&&!__isolation.engine.s.encounters.rescues[0].exposed"));check('Le casier occupé est exclu des cibles d’Amanda',js(p,"!__isolation.engine.targets().some(t=>t.type==='hide'&&t.id===__isolation.engine.s.encounters.rescues[0].locker)"))
 snap(p,'54_casier_nora.png','Nora · Une cachette occupée',fixture+' Recrutement et ordre U réels ; la marche jusqu’au casier est simulée par le moteur.')
 saved=js(p,'__isolation.engine.serialize()');load(saved);check('Cachette et occupant conservés au chargement',js(p,"__isolation.engine.s.encounters.rescues[0].status==='hiding'"))
 # Injury deliberately created; UI timer and true medkit consumption tested.
 contact_fixture();hold('e',"__isolation.engine.s.encounters.rescues[0].status==='follow'")
 js(p,"()=>{const e=__isolation.engine;e.encounters.hurt(e.s.encounters.rescues[0],70,'fixture');}");p.keyboard.press('j');before=js(p,'__isolation.engine.s.encounters.rescues[0].bleed');p.wait_for_timeout(250)
 check('Liaisons suspend l’hémorragie',js(p,'__isolation.engine.s.encounters.rescues[0].bleed')==before)
 check('Journal expose le délai de blessure',p.locator('[data-rescue="nora"]').get_attribute('data-state')=='down');snap(p,'55_blessure.png','Liaisons · Un délai pour intervenir',fixture+' Blessure injectée pour vérifier le compte à rebours et sa suspension dans J.')
 p.keyboard.press('Escape');p.keyboard.press('i');before=js(p,'__isolation.engine.s.encounters.rescues[0].bleed');p.wait_for_timeout(300);check('Équipement ne suspend pas le délai de secours',js(p,'__isolation.engine.s.encounters.rescues[0].bleed')<before);p.keyboard.press('Escape')
 before=js(p,'__isolation.engine.s.inventory.medkit');hold('e',"__isolation.engine.s.encounters.rescues[0].status==='wait'",12000);js(p,'__isolation.engine.paused=true');p.wait_for_timeout(160)
 check('Stabilisation au clavier : 35 PV et une seule trousse consommée',js(p,'__isolation.engine.s.encounters.rescues[0].health===35') and js(p,'__isolation.engine.s.inventory.medkit')==before-1)
 snap(p,'56_stabilisation.png','Nora · Stabilisée, en attente',fixture+' Après la blessure préparée, maintien E réel pendant la procédure de 2,4 secondes.')
 # Alarm through physical interaction.
 contact_fixture();js(p,"()=>{const e=__isolation.engine;e.s.room='m_triage';e.s.x=365;e.s.y=350;e.requireRelease=false;e.cooldown=0;__isolation.renderer.lastRoom=null;}");p.wait_for_timeout(180)
 hold('e',"Object.values(__isolation.engine.s.encounters.alarms).some(a=>a.remaining>0)");js(p,'__isolation.engine.paused=true');p.wait_for_timeout(160)
 check('Sirène déclenchée pour dix-huit secondes au maximum',js(p,'Object.values(__isolation.engine.s.encounters.alarms)[0].remaining<=18'))
 snap(p,'57_sirene.png','Triage · Faire du bruit ailleurs',fixture+' Maintien E réel sur le poste de sirène ; sa minuterie appartient au moteur.')
 js(p,'__isolation.engine.paused=false');p.wait_for_timeout(180);hold('e','Object.values(__isolation.engine.s.encounters.alarms)[0].remaining===0');check('Second E coupe la sirène sans recharger son circuit',js(p,'Object.values(__isolation.engine.s.encounters.alarms)[0].cooldown>0'))
 # Guard fixture: exact line of sight, warning timing and no initial instant shot.
 contact_fixture();js(p,"()=>{const e=__isolation.engine;e.load(new(e.constructor)('recit').serialize());Object.assign(e.s,{room:'m_triage',x:1050,y:350,chapter:6,crouched:false,health:100});e.s.alien.active=false;const h=e.s.enemies.find(n=>n.kind==='human');Object.assign(h,{room:e.s.room,x:1200,y:350,min:0,hp:100,face:-1});e.s.enemies=[h];e.paused=false;__isolation.renderer.lastRoom=null;}")
 p.wait_for_function("__isolation.engine.s.enemies[0].disposition==='warning'",timeout=5000);js(p,'__isolation.engine.paused=true');p.wait_for_timeout(160)
 check('Avertissement humain visible avant les dégâts',js(p,'__isolation.engine.s.health===100'));snap(p,'58_avertissement.png','Survivant armé · Garder ses distances',fixture+' Le garde voit Amanda et entre en avertissement dans la vraie boucle d’IA ; pause avant l’hostilité.')
 # Predator fixture: player off-room so a human is eligible. Advance engine, not direct HP mutation.
 js(p,"()=>{const e=__isolation.engine;e.s.room='t_cryo';const h=e.s.enemies[0];Object.assign(h,{x:1080,y:350,hp:100,room:'m_triage',min:0});Object.assign(e.s.alien,{active:true,room:'m_triage',x:1050,y:350,face:1,mode:'patrol'});for(let i=0;i<20;i++)e.encounters.predation(.05,false);e.s.room='m_triage';e.s.x=650;e.s.y=370;e.paused=true;__isolation.renderer.lastRoom=null;}");p.wait_for_timeout(160)
 check('Prédation : humain tué par l’état de chasse',js(p,'__isolation.engine.s.enemies[0].hp===0&&__isolation.engine.s.encounters.stats.humanKills===1'))
 snap(p,'59_predation.png','Triage · La créature a une autre proie',fixture+' Une seconde de logique de prédation résout l’attaque ; Amanda est replacée pour voir son résultat. Pas un événement tiré d’un parcours naturel.')
 # Legacy import through real browser file input.
 p.keyboard.press('Escape');p.set_input_files('#importSave',str(R/'tests/fixtures/legacy-v04-save.json'));p.wait_for_timeout(180)
 old=json.loads((R/'tests/fixtures/legacy-v04-save.json').read_text())['state'];check('Import réel 0.4 conserve objectifs et ressources',js(p,'__isolation.engine.s.goal')==old['goal'] and js(p,'__isolation.engine.s.inventory')==old['inventory'])
 check('Import 0.4 initialise deux contacts non recrutés',js(p,"__isolation.engine.s.encounters.rescues.length===2&&__isolation.engine.s.encounters.rescues.every(n=>n.status==='sheltered')"))
 check('Pas de requête réseau externe',js(p,"performance.getEntriesByType('resource').filter(r=>/^https?:/.test(r.name)).length===0"));check('Aucune exception JavaScript 0.6',not errors);b.close()
out={'version':'0.8.0','checks':checks,'pass':sum(x['ok'] for x in checks),'fail':sum(not x['ok'] for x in checks),'captures':shots,'errors':errors,'loading':'Page.set_content; native file/HTTP blocked; no policy overrides.','htmlSha256':hashlib.sha256((R/'JOUER_ISOLATION.html').read_bytes()).hexdigest()}
(R/'qa/browser-v05-results.json').write_text(json.dumps(out,ensure_ascii=False,indent=2));print(json.dumps({k:v for k,v in out.items() if k not in ['checks','captures']},ensure_ascii=False));raise SystemExit(1 if out['fail'] else 0)
