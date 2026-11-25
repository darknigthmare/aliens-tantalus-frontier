#!/usr/bin/env python3
"""Real HTML in Chromium. Explicit storage fixture when native local navigation is blocked.
Screenshots labelled as played, resumed or prepared; no simulated screenshot artwork."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json,sys,hashlib,threading,http.server,functools,time
ROOT=Path(__file__).resolve().parents[1];HTML=(ROOT/'MER_DES_CHAGRINS_JOUABLE.html').read_text()
CAP=ROOT/'reports/regression-captures';CAP.mkdir(exist_ok=True,parents=True)
results=[];captures=[];errors=[];navigation=[];network=[]
KEY='tantalus.dlc.sea-of-sorrows.v1'
def check(name,value):
    results.append({'name':name,'pass':bool(value)});print(time.strftime('%H:%M:%S')+' '+('PASS' if value else 'FAIL')+' '+name,flush=True)
def shot(p,name,description,prepared=False):
    print('CAPTURE '+name,flush=True);p.screenshot(path=str(CAP/name),timeout=10000);captures.append({'file':name,'description':description,'prepared_state':prepared})
def saved(n,mode='HYBRID'):
    return (ROOT/f'qa/fixtures/played-{mode}-{n:02}.json').read_text()
def boot(b,width=1440,height=900,seed=None):
    p=b.new_page(viewport={'width':width,'height':height},device_scale_factor=1);p.set_default_timeout(6000)
    p.on('pageerror',lambda e:errors.append(str(e)))
    p.on('request',lambda req:network.append(req.url))
    p.evaluate('''seed=>{window.__SOS_QA__=true;window.__storageFixture=new Map(Object.entries(seed||{}));Object.defineProperty(window,'localStorage',{value:{getItem:k=>__storageFixture.has(k)?__storageFixture.get(k):null,setItem:(k,v)=>__storageFixture.set(String(k),String(v)),removeItem:k=>__storageFixture.delete(k),clear:()=>__storageFixture.clear()}});}''',seed or {})
    p.set_content(HTML,wait_until='load');p.wait_for_timeout(120);return p
def prepare(p,n,room=None,x=None,checkpoint=False):
    p.evaluate('''({raw,room,x,checkpoint})=>{let q=__sos,g=q.game;g.importSave(raw);if(checkpoint)g.retry();if(room)g.enter(room);if(x!==null){g.p.x=x;g.p.z=.55;g.ensureSafePosition(g.p);g.state.companion.x=x-100;g.state.companion.z=.55;}g.p.invulnerable=20;q.closeAll();g.drainEvents();document.getElementById('roomArrival').textContent=g.room.name;q.updateHUD();q.renderer.lastRoom='';q.renderer.draw(0,.05);}''',{'raw':saved(n),'room':room,'x':x,'checkpoint':checkpoint})
    p.wait_for_timeout(90)
with sync_playwright() as pw:
    b=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
    # Probe supported native access without changing enterprise policy or bypass flags.
    srv=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(http.server.SimpleHTTPRequestHandler,directory=str(ROOT)))
    threading.Thread(target=srv.serve_forever,daemon=True).start()
    for kind,url in [('file',(ROOT/'MER_DES_CHAGRINS_JOUABLE.html').as_uri()),('http',f'http://127.0.0.1:{srv.server_port}/MER_DES_CHAGRINS_JOUABLE.html')]:
        p=b.new_page()
        try:p.goto(url,timeout=9000);navigation.append({'kind':kind,'allowed':True,'title':p.title()})
        except Exception as e:navigation.append({'kind':kind,'allowed':False,'error':str(e).split('Call log:')[0].strip()})
        p.close()
    srv.shutdown()
    p=boot(b)
    check('Le vrai HTML démarre : titre, boutons, aucune exception',p.locator('#newBtn').is_visible() and p.locator('#continueBtn').is_disabled() and not errors)
    shot(p,'01_menu.png','Écran titre v0.5 du véritable HTML autonome.')
    p.locator('#contrast').check();p.locator('#reduceMotion').check()
    check('Réduction du mouvement et contraste activés depuis les réglages',p.evaluate("document.body.classList.contains('contrast')&&__sos.renderer.reduced"))
    p.locator('#brightness').fill('1.2');p.locator('#brightness').dispatch_event('change')
    check('Le réglage de lumière atteint le moteur de rendu',p.evaluate('__sos.renderer.exposure')==1.2)
    p.locator('#contrast').uncheck();p.locator('#reduceMotion').uncheck();p.locator('#brightness').fill('1');p.locator('#brightness').dispatch_event('change')
    p.locator('#difficulty').select_option('exploration');p.click('#newBtn');p.click('#storyContinue');p.wait_for_timeout(100)
    check('Nouvelle partie lancée par les commandes visibles',p.evaluate('__sos.game.state.room==="s01"&&!__sos.isPaused()'))
    x=p.evaluate('__sos.game.p.x');p.keyboard.down('ArrowRight');p.wait_for_timeout(420);p.keyboard.up('ArrowRight')
    check('Déplacement clavier réel dans le moteur',p.evaluate('__sos.game.p.x')>x+30)
    shot(p,'02_depart.png','Début d’expédition après déplacement réel au clavier.')
    check('HUD et bandeau mission hors de la surface jouable',p.evaluate("()=>{const h=document.querySelector('#hud').getBoundingClientRect(),c=document.querySelector('#scene').getBoundingClientRect(),f=document.querySelector('#mission').getBoundingClientRect();return h.bottom<=c.top+1&&c.bottom<=f.top+1}"))
    p.evaluate('''()=>{const g=__sos.game,d=g.room.doors.find(d=>d.to==='s02');g.p.x=d.x-32;g.p.z=.55;g.cooldowns.interaction=0;}''')
    p.keyboard.press('KeyE');p.wait_for_timeout(150)
    check('Une porte change réellement de salle via E',p.evaluate('__sos.game.state.room==="s02"'))
    p.evaluate('''()=>{const g=__sos.game;g.p.x=g.current.x;g.p.z=.55;g.cooldowns.interaction=0;}''')
    p.keyboard.down('KeyE');p.wait_for_timeout(800);p.keyboard.up('KeyE');p.wait_for_timeout(80)
    check('E maintenu remplit le travail sans validation instantanée',p.evaluate('__sos.game.state.objectiveIndex===0&&__sos.game.rs.work[__sos.game.current.id]>.4') and p.locator('#operationProgress').is_visible())
    p.keyboard.press('Escape');t=p.evaluate('__sos.game.state.stats.time');p.wait_for_timeout(200)
    check('Le menu Pause stoppe effectivement le temps de simulation',p.evaluate('__sos.game.state.stats.time')==t)
    p.keyboard.press('Tab');check('Navigation clavier piégée dans le dialogue actif',p.evaluate("document.querySelector('#panel').contains(document.activeElement)"))
    p.click('#resumePlay');before=p.evaluate('__sos.game.rs.work[__sos.game.current.id]');p.wait_for_timeout(200)
    check('Reprendre ne conserve pas une touche E fantôme',p.evaluate('__sos.game.rs.work[__sos.game.current.id]')==before)
    p.keyboard.down('KeyE');p.wait_for_timeout(2850);p.keyboard.up('KeyE')
    check('Prélèvement accompli après la durée d’action',p.evaluate('__sos.game.state.objectiveIndex===1') and p.locator('#story.open').count()==1)
    t=p.evaluate('__sos.game.state.stats.time');p.wait_for_timeout(150);check('Le dialogue narratif interrompt lui aussi la simulation',p.evaluate('__sos.game.state.stats.time')==t)
    current=p.evaluate('localStorage.getItem(SoSData.meta.saveNamespace)');check('Autosauvegarde écrite dans la fixture explicite',json.loads(current)['state']['objectiveIndex']==1)
    p.click('#storyContinue');p.click('#mapBtn');check('Carte de secteur accessible',p.locator('.mapSvg').count()==1)
    p.click('#localMap');check('Plan local fondé sur les vraies emprises',p.locator('.roomPlan').count()==1 and 'Aucune position ennemie' in p.locator('#panelContent').inner_text())
    shot(p,'03_plan_local.png','Carte locale de la salle du carottier. Accès et emprises du moteur, aucun ennemi dévoilé.')
    p.click('#closePanel');p.click('#codexBtn');p.fill('#codexSearch','Decker');check('Recherche fonctionnelle dans les dossiers débloqués',p.locator('.dossier').count()>0)
    p.click('#closePanel');p.keyboard.press('F6');check('F6 change la présentation et conserve la progression',p.evaluate('__sos.game.state.presentation==="CLASSIC"&&__sos.game.state.objectiveIndex===1'))
    p2=boot(b,seed={KEY:current,'tantalus.main.sentinel':'KEEP'});p2.click('#continueBtn');p2.wait_for_timeout(100)
    check('Reprise depuis les données réellement sauvegardées',p2.evaluate('__sos.game.state.objectiveIndex===1&&__sos.game.state.room==="s02"'))
    check('Les données du jeu hôte ne sont pas modifiées',p2.evaluate("localStorage.getItem('tantalus.main.sentinel')")=='KEEP');p2.close()
    old=(ROOT/'qa/fixtures/legacy-v010-rescue.json').read_text();p3=boot(b,seed={KEY:old});p3.click('#continueBtn');p3.wait_for_timeout(100)
    check('Migration 0.1→0.5 via le bouton Reprendre',p3.evaluate('__sos.game.state.schema===8&&__sos.game.state.rescue.active&&__sos.game.state.objectiveIndex===26'))
    check('Copie de secours 0.1 conservée avant la nouvelle écriture',p3.evaluate('(k)=>localStorage.getItem(k)',KEY+'.backup-v1')==old);p3.close()
    p.bring_to_front();p.evaluate('__sos.closeAll()')
    prepare(p,7,room='s09',x=1200)
    p.evaluate('()=>{__sos.game.p.hp=60;__sos.game.p.filter=25;}');p.keyboard.press('KeyI')
    check('L’équipement possède des commandes utilisables',p.locator('#useKit').is_enabled() and p.locator('#useFilter').is_enabled())
    p.click('#useKit');p.click('#useFilter');check('Soigner et remplacer depuis le menu consomment les réserves',p.evaluate('__sos.game.p.hp===100&&__sos.game.p.filter===100&&__sos.game.p.medkits===1&&__sos.game.p.filters===1'))
    shot(p,'04_equipement.png','Équipement en jeu : utilisation des soins et d’une cartouche depuis les boutons. Santé et usure initiales préparées.',True)
    p.click('#closePanel');p.keyboard.press('KeyL');check('La lampe peut être éteinte au clavier',p.evaluate('__sos.game.p.lamp===false'))
    p.keyboard.press('KeyF');check('Un leurre lancé crée une source sonore et coûte une charge',p.evaluate('__sos.game.p.decoys===2&&__sos.game.rs.noises.some(n=>n.kind==="decoy")'))
    # Mouse combat: true sprite hit conversion, not a shot aimed at feet.
    prepare(p,7,room='s22',x=720)
    p.evaluate('''()=>{const g=__sos.game,e=g.rs.enemies[0];e.x=1000;e.z=.55;e.mode='patrol';e.homeX=e.x;g.state.companion.order='hold';g.state.companion.x=50;g.p.weapon='pistol';g.cooldowns.fire=0;}''')
    coords=p.evaluate('''()=>{const r=__sos.renderer,g=__sos.game,e=g.rs.enemies[0],q=r.pos(e.x,g.zFor(e)),b=r.canvas.getBoundingClientRect();return{x:b.left+q.x/r.W*b.width,y:b.top+(q.y-98*r.unit)/r.H*b.height,hp:e.hp};}''')
    p.mouse.move(coords['x'],coords['y']);p.wait_for_timeout(80);check('Le viseur reconnaît le corps du xénomorphe',p.evaluate('!!__sos.renderer.hoverTarget'))
    p.mouse.click(coords['x'],coords['y']);p.wait_for_timeout(100);check('Cliquer le corps produit un vrai dégât sur sa profondeur',p.evaluate('__sos.game.rs.enemies[0].hp')<coords['hp'])
    # All rooms are real render calls, not a drawing substitute. No progression assertion.
    smoke=[]
    for mode in ['HYBRID','CLASSIC']:
        for rid in ['s%02d'%i for i in range(1,51)]:
            p.evaluate('''({mode,id})=>{const q=__sos,g=q.game;g.newGame({presentation:mode});g.enter(id);g.step(.05);q.renderer.draw(0,.05);q.updateHUD();}''',{'mode':mode,'id':rid});smoke.append(mode+':'+rid)
    p.evaluate('__sos.closeAll()')
    check('Les 50 salles sont rendues dans les deux présentations',len(smoke)==100)
    prepare(p,12,room='s42',x=1200);shot(p,'05_pompes.png','Annexe des pompes : machines de fond, profondeur praticable et dispositif de réarmement. Salle préparée.',True)
    prepare(p,16,room='s27',x=1250);shot(p,'06_tubes.png','Nœud ambré : sol organique sans quadrillage métallique, silice et couverts de profondeur. Salle préparée.',True)
    prepare(p,24,checkpoint=True,x=1680);shot(p,'07_reine.png','Pondeuse : reprise du vrai point d’entrée du parcours enregistré ; caméra rapprochée pour examiner les attaches et la reine.',True)
    prepare(p,26,x=1640)
    # Real saved rescue state: no new flag staging. Waiting and resume order via keys.
    p.keyboard.press('KeyB');xs=p.evaluate('__sos.game.state.rescue.actors.map(a=>a.x)');p.wait_for_timeout(220)
    check('B immobilise les deux brancards',p.evaluate('__sos.game.state.rescue.actors.map(a=>a.x)')==xs)
    p.keyboard.press('KeyB');p.keyboard.down('ArrowRight');p.wait_for_timeout(620);p.keyboard.up('ArrowRight');p.wait_for_timeout(220)
    check('B relance un suivi physique mesurable',p.evaluate('__sos.game.state.rescue.actors.map(a=>a.x)')!=xs)
    shot(p,'08_convoi.png','Convoi chargé depuis la sauvegarde du parcours continu, puis halte et reprise au clavier. Position de Decker préparée pour le cadrage.',True)
    check('L’état des deux châssis est visible hors du terrain',p.locator('#convoyStatus').is_visible() and p.locator('#convoyStatus meter').count()==2)
    prepare(p,29,room='s37',x=720)
    p.evaluate('''()=>{const g=__sos.game;for(const [i,a]of g.state.rescue.actors.entries()){a.x=810+i*100;a.z=.55;}g.state.rescue.order='hold';const e=g.rs.enemies[0];e.x=2040;e.z=.55;e.homeX=e.x;e.path=[];g.cooldowns.interaction=0;}''')
    p.keyboard.down('KeyE');p.wait_for_timeout(3500);p.keyboard.up('KeyE')
    check('Arrimage réalisé par E maintenu dans la soute',p.evaluate('__sos.game.state.rescue.aboard===true&&!__sos.game.state.rescue.active'))
    # Target arrangement is declared prepared, but hits and validation use the real simulation.
    p.evaluate('''()=>{const g=__sos.game,o=g.current,e=g.rs.enemies[0];g.p.x=o.x+25;g.p.z=.55;e.x=o.x-145;e.z=.55;e.foam=0;g.p.weapon='foam';for(let i=0;i<3;i++){g.cooldowns.fire=0;g.shoot(e);}g.cooldowns.interaction=0;__sos.handleEvents();}''')
    p.keyboard.press('KeyE');p.wait_for_timeout(100);check('Capture après arrimage, mousse réelle et validation clavier',p.evaluate('__sos.game.state.flags.live_capture===true&&__sos.game.rs.enemies[0].mode==="captured"'))
    if p.locator('#story.open').count():p.click('#storyContinue')
    shot(p,'09_capture.png','Capture dans le vrai moteur après arrimage par touche maintenue et trois tirs de mousse. Placements rapprochés préparés.',True)
    # A deliberate failure of storage must never display a false success.
    p.click('#pauseBtn');p.evaluate("()=>{localStorage.setItem=()=>{throw new Error('QA storage blocked')};}");p.click('#saveNow');check('Erreur de stockage annoncée sans faux succès', 'indisponible' in p.locator('#toast').inner_text().lower())
    mobile=boot(b,390,844);check('Titre accessible en 390 × 844',mobile.locator('#newBtn').is_visible());mobile.click('#newBtn');mobile.click('#storyContinue');mobile.wait_for_timeout(100)
    check('Commandes tactiles de base présentes',mobile.locator('#touchControls').is_visible())
    check('Pas de débordement horizontal global en format étroit',mobile.evaluate('document.documentElement.scrollWidth<=innerWidth+1'))
    shot(mobile,'10_format_etroit.png','Mise en page 390 × 844 du jeu en fonctionnement. Les contrôles tactiles restent un sous-ensemble du clavier.')
    mobile.click('#inventoryBtn');check('Équipement accessible sur écran étroit',mobile.locator('.loadout').count()==3)
    shot(mobile,'11_equipement_etroit.png','Équipement de début de partie dans une fenêtre de 390 × 844 ; défilement du panneau, pas du terrain.')
    check('Aucune exception JavaScript pendant les contrôles',not errors)
    check('Le HTML autonome ne demande aucune ressource réseau',not network)
    b.close()
report={'version':'0.9.0','browser':'Chromium / Playwright','html_sha256':hashlib.sha256(HTML.encode()).hexdigest(),'native_navigation':navigation,'mode':'Exact standalone HTML loaded into browser DOM, without HTTP/file navigation bypass.','storage':'Explicit in-memory fixture, not native storage persistence.','human_playthrough':False,'checks':results,'passed':sum(x['pass']for x in results),'failed':sum(not x['pass']for x in results),'room_smoke_renders':len(smoke),'errors':errors,'network_requests':network,'captures':captures}
(ROOT/'reports/browser-regression.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));print('RESULT',report['passed'],report['failed'],flush=True)
sys.exit(bool(report['failed']))
