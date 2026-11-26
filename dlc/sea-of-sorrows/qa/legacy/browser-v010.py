#!/usr/bin/env python3
"""Render the exact standalone in Chromium. Runs offline, with an explicit storage fixture.
The fixture tests shell persistence contracts, not native file:// localStorage permission.
Screenshots after the introduction use prepared states, not a human full playthrough.
"""
from pathlib import Path
import json, argparse, shutil
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser();parser.add_argument('--chromium',default=shutil.which('chromium') or '/usr/bin/chromium');a=parser.parse_args()
CAP=ROOT/'reports/captures';CAP.mkdir(parents=True,exist_ok=True)
HTML=(ROOT/'MER_DES_CHAGRINS_JOUABLE.html').read_text()
results=[];errors=[];captures=[]
def check(name,value):
    results.append({'name':name,'pass':bool(value)})
    if not value:raise AssertionError(name)
def shot(page,name,description,setup=False):
    page.screenshot(path=str(CAP/name));captures.append({'file':name,'description':description,'prepared_state':setup})
def boot(browser,width=1440,height=900,seed=None):
    page=browser.new_page(viewport={'width':width,'height':height});page.set_default_timeout(5000)
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.evaluate('''(seed)=>{window.__SOS_QA__=true;window.__storageFixture=new Map(Object.entries(seed||{}));Object.defineProperty(window,'localStorage',{value:{getItem:k=>__storageFixture.has(k)?__storageFixture.get(k):null,setItem:(k,v)=>__storageFixture.set(String(k),String(v)),removeItem:k=>__storageFixture.delete(k),clear:()=>__storageFixture.clear()}});}''',seed)
    page.set_content(HTML,wait_until='load');page.wait_for_timeout(120);return page
PREP="""({id,mode='HYBRID'})=>{const q=__sos,g=q.game,D=SoSData,order=SoSCore.objectiveOrder,O=SoSCore.OBJECTIVES;g.newGame({difficulty:'exploration',presentation:mode});const next=order.findIndex(k=>O[k].room===id);let index=next>=0?next:order.findIndex(k=>Number(O[k].room.slice(1))>Number(id.slice(1)));if(index<0)index=0;for(let i=0;i<index;i++){g.state.flags[O[order[i]].flag]=true;g.state.completed.push(order[i]);}g.state.objectiveIndex=index;g.state.inventory={pistol:true,foam:true,flame:true,tracker:true};g.enter(id);g.p.x=id==='s33'?1670:id==='s37'?1800:Math.round(g.room.width*.42);g.p.z=.55;g.p.invulnerable=1000;g.state.companion.x=g.p.x-105;g.state.companion.z=.55;g.state.visited=SoSData.rooms.filter(r=>Number(r.id.slice(1))<=Number(id.slice(1))).map(r=>r.id);g.unlockDossiers();q.closeAll();q.handleEvents();q.updateHUD();q.renderer.draw(0,.05);}"""
with sync_playwright() as w:
    browser=w.chromium.launch(executable_path=a.chromium,args=['--no-sandbox'])
    p=boot(browser)
    check('Écran titre et commandes présents',p.locator('#newBtn').is_visible() and p.locator('#continueBtn').is_disabled())
    shot(p,'01_ecran_titre.png','Écran titre rendu par le HTML livré.')
    p.click('#newBtn');p.click('#storyContinue');p.wait_for_timeout(120)
    check('Nouvelle partie via les boutons',p.evaluate('__sos.game.state.room==="s01"&&!__sos.isPaused()'))
    x=p.evaluate('__sos.game.p.x');p.keyboard.down('ArrowRight');p.wait_for_timeout(400);p.keyboard.up('ArrowRight')
    check('Déplacement clavier réel',p.evaluate('__sos.game.p.x')>x+20)
    shot(p,'02_surface.png','Début d’expédition, après déplacement au clavier.')
    p.evaluate("()=>{const g=__sos.game,d=g.room.doors[0];g.p.x=d.x-40;g.p.z=.55;g.cooldowns.interaction=0;}")
    p.keyboard.press('KeyE');p.wait_for_timeout(120)
    check('Porte activée par la touche E',p.evaluate('__sos.game.state.room==="s02"'))
    p.evaluate("()=>{const g=__sos.game;g.p.x=g.current.x;g.p.z=.55;g.cooldowns.interaction=0;}");p.keyboard.press('KeyE');p.wait_for_timeout(100)
    check('Objectif validé depuis le clavier',p.evaluate('__sos.game.state.objectiveIndex===1') and p.locator('#story.open').count()==1)
    t=p.evaluate('__sos.game.state.stats.time');p.wait_for_timeout(150)
    check('Le récit met la simulation en pause',p.evaluate('__sos.game.state.stats.time')==t)
    saved=p.evaluate('localStorage.getItem(SoSData.meta.saveNamespace)');key=p.evaluate('SoSData.meta.saveNamespace')
    check('Sauvegarde automatique écrite dans la fixture isolée',json.loads(saved)['state']['objectiveIndex']==1)
    p.click('#storyContinue');p.click('#mapBtn');p.wait_for_timeout(80)
    check('Carte des lieux visités',p.locator('.mapSvg').count()==1)
    shot(p,'03_carte.png','Carte de début de partie : seuls les lieux relevés et leurs voisins sont connus.')
    p.click('#closePanel');p.click('#codexBtn');p.fill('#codexSearch','Decker')
    check('Recherche dans les dossiers',p.locator('.dossier').count()>=1)
    p.click('#closePanel');p.click('#pauseBtn');t=p.evaluate('__sos.game.state.stats.time');p.wait_for_timeout(150)
    check('Pause et reprise explicites',p.evaluate('__sos.game.state.stats.time')==t and p.locator('#resumePlay').is_visible())
    p.click('#resumePlay');p.keyboard.press('F6');check('Bascule de présentation par F6',p.evaluate('__sos.game.state.presentation==="CLASSIC"'))
    check('HUD extérieur au champ de jeu',p.evaluate("()=>{const h=document.querySelector('#hud').getBoundingClientRect(),c=document.querySelector('canvas').getBoundingClientRect(),f=document.querySelector('#mission').getBoundingClientRect();return h.bottom<=c.top+1&&c.bottom<=f.top+1;}"))
    p2=boot(browser,seed={key:saved,'tantalus.main.sentinel':'KEEP'})
    check('Le titre ne remplace pas une sauvegarde existante',p2.evaluate('(k)=>localStorage.getItem(k)',key)==saved)
    p2.click('#continueBtn');p2.wait_for_timeout(100)
    check('Reprise par bouton depuis une fixture sauvegardée',p2.evaluate('__sos.game.state.objectiveIndex===1&&__sos.game.state.room==="s02"'))
    check('Autres campagnes non modifiées',p2.evaluate("localStorage.getItem('tantalus.main.sentinel')")=='KEEP')
    p2.close()
    p.bring_to_front();p.evaluate('__sos.closeAll()')
    # Smoke-render every room in both modes using only this prototype's own engine.
    smoke=p.evaluate("""()=>{const q=__sos,g=q.game,out=[];for(const mode of ['HYBRID','CLASSIC']){for(const room of SoSData.rooms){g.newGame({presentation:mode});g.enter(room.id);g.state.flags.equipped=true;g.p.invulnerable=100;g.step(.05,{});q.renderer.draw(0,.05);q.updateHUD();out.push(mode+':'+room.id);}}return out;}""")
    check('Rendu des 40 salles dans les deux présentations',len(smoke)==80)
    for id,name,desc in [('s19','04_carene.png','Carène enfouie : état préparé de la salle s19.'),('s26','05_tubes.png','Tubes de silice : état préparé de la salle s26.'),('s33','06_pondeuse.png','Reine et attaches : état préparé de la salle s33.'),('s37','07_capture.png','Soute et caisson de capture : état préparé de la salle s37.')]:
        p.evaluate(PREP,{'id':id});p.wait_for_timeout(220);shot(p,name,desc,True)
    # Actual combat projection in a prepared capture scenario, no flag forcing.
    p.evaluate("""()=>{const g=__sos.game,o=g.current,e=g.rs.enemies[0];e.x=o.x-120;e.z=.55;g.p.x=o.x;g.p.z=.55;g.p.weapon='foam';g.p.invulnerable=100;for(let i=0;i<3;i++){g.cooldowns.fire=0;g.shoot(e);}g.cooldowns.interaction=0;__sos.handleEvents();}""")
    p.keyboard.press('KeyE');p.wait_for_timeout(80)
    check('Capture réellement validée dans le moteur du navigateur',p.evaluate('__sos.game.state.flags.live_capture===true&&__sos.game.rs.enemies[0].mode==="captured"'))
    p.click('#storyContinue');shot(p,'08_capture_verrouillee.png','Adulte immobilisé par trois tirs de mousse, puis caisson activé au clavier. Mise en situation préparée.',True)
    mobile=boot(browser,390,844)
    check('Écran titre accessible en format étroit',mobile.locator('#newBtn').is_visible())
    mobile.click('#newBtn');mobile.click('#storyContinue');mobile.wait_for_timeout(100)
    check('Commandes tactiles de base visibles',mobile.locator('#touchControls').is_visible())
    check('Interface étroite sans défilement horizontal de page',mobile.evaluate('document.documentElement.scrollWidth<=innerWidth+1'))
    shot(mobile,'09_format_etroit.png','Vérification de mise en page 390 × 844. Commandes tactiles de base, pas un audit mobile complet.')
    mobile.click('#codexBtn');check('Dossiers accessibles en format étroit',mobile.locator('#codexSearch').is_visible())
    check('Aucune exception JavaScript durant ces vérifications',not errors)
    browser.close()
report={'browser':'Chromium / Playwright','mode':'DOM local hors réseau, HTML autonome exact','native_http_file_navigation':'Bloquée par la politique du navigateur de cet environnement ; non validée.','storage':'Fixture en mémoire explicite. Export/import du vrai moteur testés séparément ; persistance native file:// non certifiée.','full_human_playthrough':False,'checks':results,'passed':sum(r['pass'] for r in results),'failed':sum(not r['pass'] for r in results),'room_smoke_renders':80,'errors':errors,'captures':captures}
(ROOT/'reports/browser-tests.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));print(json.dumps(report,ensure_ascii=False,indent=2))
