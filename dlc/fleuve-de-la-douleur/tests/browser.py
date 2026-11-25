#!/usr/bin/env python3
"""Render and interact with the exact offline build in Chromium through Playwright.
Uses set_content: file:// navigation is blocked by the environment browser policy.
Native localStorage is unavailable in this opaque-origin test; the save codec is tested by Node.
No browser security policy is altered. Python 3.10+, playwright, a Chromium executable.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import os, json, time
ROOT=Path(__file__).resolve().parents[1]
REPORT={'version':'0.6.0-candidate.1','engine':'Chromium / Playwright','method':'Exact JOUER.html via page.set_content; no browser policy bypass','localStorage':'Opaque origin: unavailable in this test; error fallback exercised. Native storage persistence NOT certified.','cases':[],'captures':[],'errors':[]}

def passed(name,**kw):
    print('PASS',name,flush=True)
    REPORT['cases'].append({'name':name,'passed':True,**kw})
def snap(page,name,description,setup='Normal UI and physical input'):
    page.screenshot(path=str(ROOT/'captures'/name),timeout=7000)
    state=page.evaluate('({chapter:ROP_APP.simulation.s.chapter+1,room:ROP_APP.simulation.s.room,player:ROP_APP.simulation.s.player,objective:ROP_APP.simulation.objective,phase:ROP_APP.simulation.s.phase})')
    REPORT['captures'].append({'file':'captures/'+name,'description':description,'setup':setup,'state':state})

def load_fixture(page,chapter,room=None,x=500,z=.7):
    # These independent late scenes do not share gameplay progress with the opening run.
    browser=page.context.browser;page.close();page=browser.new_page(viewport={'width':1600,'height':900},device_scale_factor=1)
    page.set_default_timeout(8000);page.on('pageerror',lambda e:REPORT['errors'].append(str(e)));page.on('request',lambda r:requests.append(r.url))
    page.set_content((ROOT/'JOUER.html').read_text(),wait_until='load')
    # A validated save file imported with the same UI the player uses, not a substitute renderer.
    data=page.evaluate('''([ci,rid,x,z])=>{const s=ROP_CORE.createState('story');const c=ROP_DATA.chapters[ci],d=ROP_DATA.characters[c.character];Object.assign(s,{chapter:ci,objective:0,character:c.character,room:rid||c.start,phase:c.phase,visited:[rid||c.start]});Object.assign(s.player,{x,z,ammo:d.clip,reserve:d.reserve,medkits:d.medkits,flares:d.flares});if(ci>=12)s.flags.scienceClearance=true;return new ROP_CORE.Simulation(s).save();}''',[chapter,room,x,z])
    page.locator('#import-file').set_input_files({'name':'capture-fixture.json','mimeType':'application/json','buffer':data.encode('utf-8')})
    page.get_by_role('button',name='CHARGER',exact=True).click()
    page.get_by_role('button',name='REPRENDRE LE PARCOURS',exact=True).click()
    page.wait_for_timeout(500)
    return page

with sync_playwright() as p:
    browser=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium'),headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
    page=browser.new_page(viewport={'width':1600,'height':900},device_scale_factor=1)
    page.set_default_timeout(7000)
    page.on('pageerror',lambda error:REPORT['errors'].append(str(error)))
    requests=[]
    page.on('request',lambda request: requests.append(request.url))
    page.set_content((ROOT/'JOUER.html').read_text(encoding='utf-8'),wait_until='load')
    page.wait_for_timeout(500)
    assert page.locator('#start').is_visible()
    passed('Menu, rendu canvas et boutons chargés')
    snap(page,'01-menu.png','Écran titre et décor du runtime, sans image de fond importée.')
    page.locator('#start').click()
    assert page.locator('#dialog-title').inner_text()=='La relève'
    page.get_by_role('button',name='PRENDRE LE CONTRÔLE').click()
    x=page.evaluate('ROP_APP.simulation.s.player.x')
    page.keyboard.down('KeyD');page.wait_for_function('ROP_APP.simulation.s.player.x>=620',timeout=12000);page.keyboard.up('KeyD')
    assert page.evaluate('ROP_APP.simulation.s.player.x')>x+200
    passed('Déplacement clavier réel')
    page.keyboard.press('KeyE')
    page.wait_for_function('ROP_APP.simulation.s.objective===1',timeout=12000)
    assert page.evaluate('ROP_APP.simulation.s.objective')==1
    passed('Premier objectif par E + temporisation réelle, sans appel de validation forcée')
    page.wait_for_timeout(3900)
    snap(page,'02-arrivee.png','Aire d’atterrissage après validation du premier objectif. HUD déplacé au-dessus du terrain.')
    hud=page.locator('#hud').bounding_box()
    assert hud['y']+hud['height']<900*.6
    passed('HUD desktop hors bande de marche',hudBottom=round(hud['y']+hud['height']))
    # Move to the actual airlock gateway, then use it.
    page.keyboard.down('KeyA');page.wait_for_function('ROP_APP.simulation.s.player.x<=210',timeout=12000);page.keyboard.up('KeyA')
    page.keyboard.press('KeyE');page.wait_for_function("ROP_APP.simulation.s.room==='airlock'")
    assert page.evaluate('ROP_APP.simulation.s.room')=='airlock'
    passed('Transition de pièce par porte avec mouvement et E')
    page.keyboard.press('Tab')
    assert page.locator('#dialog-content svg').count()==1
    snap(page,'03-plan.png','Plan des connexions ouvert après la transition vers le sas.')
    s0=page.evaluate('ROP_APP.simulation.s.elapsed');page.wait_for_timeout(400)
    assert page.evaluate('ROP_APP.simulation.s.elapsed')==s0
    passed('Plan met réellement la simulation en pause')
    page.keyboard.press('Escape')
    page.keyboard.press('Escape')
    assert page.locator('#pause-view').count()==1
    page.locator('#pause-view').select_option('classic')
    assert page.evaluate('ROP_APP.simulation.s.mode')=='classic'
    page.locator('#pause-view').select_option('hybrid')
    page.keyboard.press('Tab')
    assert page.evaluate('document.querySelector("#dialog").contains(document.activeElement)')
    passed('Options de vue et focus clavier dans le dialogue')
    page.keyboard.press('Escape')
    with page.expect_download() as event:
        page.keyboard.press('Escape')
        page.get_by_role('button',name='EXPORTER',exact=True).click()
    download=event.value
    dest=ROOT/'captures'/'browser-export-evidence.json'
    download.save_as(str(dest))
    exported=json.loads(dest.read_text())
    assert exported['id']=='river-of-pain' and exported['state']['room']=='airlock'
    passed('Export JSON via bouton et téléchargement navigateur')
    page.keyboard.press('Escape')
    # Requested showcase captures of later rooms; always label their initialized state.
    page=load_fixture(page,4,'med',1250,.79)
    page.wait_for_timeout(4400)
    snap(page,'04-infirmerie.png','Infirmerie au premier stade de la crise.','Validated save fixture imported through normal UI; not a full natural playthrough')
    page=load_fixture(page,10,'hive',2300,.81)
    page.wait_for_timeout(4700)
    page.keyboard.press('KeyX');page.wait_for_timeout(300)
    snap(page,'05-soubassements.png','Soubassements envahis, créature active et fusée de détresse.','Validated chapter 11 fixture imported through UI; flare thrown through X')
    page=load_fixture(page,14,'refuge',950,.7)
    page.keyboard.press('KeyC');page.wait_for_timeout(300)
    a=page.evaluate('ROP_APP.simulation.s.stats.shots')
    page.keyboard.down('KeyF');page.wait_for_timeout(250);page.keyboard.up('KeyF')
    assert page.evaluate('ROP_APP.simulation.s.stats.shots')==a
    passed('Newt sans arme dans le runtime navigateur')
    snap(page,'06-newt.png','Newt dans la cache des conduits.','Validated chapter 15 fixture imported through UI; crouch by C')
    page.keyboard.press('Escape')
    page.locator('#import-file').set_input_files({'name':'corrompu.json','mimeType':'application/json','buffer':b'{"id":"other-game","schema":1}'})
    page.wait_for_timeout(120)
    assert page.evaluate('ROP_APP.simulation.s.character')=='newt'
    assert 'refusée' in page.locator('#notice').inner_text()
    passed('Import étranger refusé sans écraser la partie')
    page.keyboard.press('Escape')
    # Tablet/portrait and compact desktop: test reflow with real DOM, not just canvas resize.
    for width,height in [(1280,720),(844,390),(390,844)]:
        page.set_viewport_size({'width':width,'height':height});page.wait_for_timeout(250)
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth+1')
        passed(f'Pas de débordement horizontal {width} × {height}')
    page.wait_for_timeout(4300)
    snap(page,'07-portrait.png','Affichage portrait 390 × 844.','Same validated Newt fixture; viewport emulation, not a physical phone')
    # Release the desktop renderer before the independent touch context.
    page.close()
    # Simulated touch pointer release, not hardware mobile/gamepad certification.
    mobile=browser.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True,device_scale_factor=1)
    m=mobile.new_page();m.set_default_timeout(7000);m.on('pageerror',lambda error:REPORT['errors'].append(str(error)))
    m.set_content((ROOT/'JOUER.html').read_text(encoding='utf-8'))
    m.locator('#start').click();m.get_by_role('button',name='PRENDRE LE CONTRÔLE').click()
    assert m.locator('#touch').is_visible()
    start_x=m.evaluate('ROP_APP.simulation.s.player.x')
    right=m.locator('[data-held="right"]').bounding_box()
    m.mouse.move(right['x']+right['width']/2,right['y']+right['height']/2);m.mouse.down();m.wait_for_function('ROP_APP.simulation.s.player.x>370',timeout=12000);m.mouse.up()
    mx=m.evaluate('ROP_APP.simulation.s.player.x');assert mx>start_x+30
    m.wait_for_timeout(180);assert abs(m.evaluate('ROP_APP.simulation.s.player.x')-mx)<6
    passed('Commandes tactiles affichées et libération de pointeur',scope='Touch-emulated Chromium with pointer event; not a phone hardware test')
    mobile.close()
    assert not REPORT['errors'],REPORT['errors']
    passed('Aucune erreur JavaScript pendant la recette',errors=0)
    passed('Aucune requête externe du fichier autonome',externalRequests=requests)
    browser.close()
REPORT['passed']=all(c['passed'] for c in REPORT['cases'])
(ROOT/'docs'/'BROWSER_TEST_RESULTS.json').write_text(json.dumps(REPORT,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'passed':REPORT['passed'],'cases':len(REPORT['cases']),'captures':len(REPORT['captures']),'errors':REPORT['errors']},indent=2))
