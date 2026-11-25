#!/usr/bin/env python3
"""Browser-facing v02 controls; screenshots use the unmodified standalone renderer.
Later scenes are validated save fixtures imported via the ordinary load UI.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json, os, traceback
ROOT=Path(__file__).resolve().parents[1]
REPORT={'version':'0.6.0-candidate.1','method':'Exact JOUER.html via set_content in Chromium; no browser policy bypass','localStorage':'Not qualified. Loopback navigation was blocked with ERR_BLOCKED_BY_ADMINISTRATOR; opaque-origin fallback and JSON imports tested.','cases':[],'captures':[],'errors':[]}
def settle(page, milliseconds):
    """Wait for normal browser simulation time, not CPU-dependent wall-clock frame count.
    Menus remain paused. This function never advances or changes game state itself.
    """
    target=page.evaluate("ms=>window.ROP_APP?.started&&!ROP_APP.modal&&ROP_APP.simulation.s.status==='playing'?ROP_APP.simulation.s.elapsed+ms/1000:null", milliseconds)
    if target is None:page.wait_for_timeout(milliseconds)
    else:page.wait_for_function("t=>!!ROP_APP.modal||ROP_APP.simulation.s.status!=='playing'||ROP_APP.simulation.s.elapsed>=t",arg=target,timeout=max(12000,milliseconds*10))

def ok(name,**kw):
    print('PASS',name,flush=True);REPORT['cases'].append({'name':name,'passed':True,**kw})
def shot(page,name,description,setup):
    page.screenshot(path=str(ROOT/'captures'/name),timeout=7000)
    state=page.evaluate('({chapter:ROP_APP.simulation.s.chapter+1,room:ROP_APP.simulation.s.room,objective:ROP_APP.simulation.s.objective,phase:ROP_APP.simulation.s.phase,systems:ROP_APP.simulation.s.systems,escort:ROP_APP.simulation.s.escort})')
    REPORT['captures'].append({'file':'captures/'+name,'description':description,'setup':setup,'state':state})
def fixture(page,ci,rid,objective=0,target=None,x=700,z=.7):
    data=page.evaluate('''([ci,rid,oi,target,x,z])=>{const s=ROP_CORE.createState('story'),c=ROP_DATA.chapters[ci],d=ROP_DATA.characters[c.character],r=ROP_CORE.roomDef(rid);Object.assign(s,{chapter:ci,objective:oi,character:c.character,phase:c.phase,room:rid,visited:[rid]});Object.assign(s.player,{x,z,ammo:d.clip,reserve:d.reserve,medkits:d.medkits,flares:d.flares});if(target){const o=target==='hide'?r.objects.find(v=>v.kind==='hide'):r.objects.find(v=>v.id===target);Object.assign(s.player,{x:o.x,z:o.z});}if(ci>=12)s.flags.scienceClearance=true;return new ROP_CORE.Simulation(s).save();}''',[ci,rid,objective,target,x,z])
    load(page,data.encode())
def load(page,data):
    page.locator('#import-file').set_input_files({'name':'validated-test-save.json','mimeType':'application/json','buffer':data})
    page.get_by_role('button',name='CHARGER',exact=True).click()
    page.get_by_role('button',name='REPRENDRE LE PARCOURS',exact=True).click()
    settle(page,100)
try:
 with sync_playwright() as p:
    browser=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium'),args=['--no-sandbox','--disable-dev-shm-usage'])
    page=browser.new_page(viewport={'width':1600,'height':900},device_scale_factor=1);page.set_default_timeout(7000)
    page.on('pageerror',lambda e:REPORT['errors'].append(str(e)))
    requests=[];page.on('request',lambda req:requests.append(req.url))
    page.set_content((ROOT/'JOUER.html').read_text(),wait_until='load')
    assert page.locator('#start').is_visible();ok('Chargement du standalone 0.6 / régression des systèmes 0.2, sans CDN')
    page.locator('#start').click();page.get_by_role('button',name='PRENDRE LE CONTRÔLE').click()
    page.keyboard.press('KeyI');assert page.locator('.kit-grid button').count()==7
    before=page.evaluate('ROP_APP.simulation.s.elapsed');settle(page,150);assert page.evaluate('ROP_APP.simulation.s.elapsed')==before
    ok('Équipement ouvert avec I, sept actions et simulation suspendue')
    shot(page,'08-equipement.png','Sept équipements accessibles sans couvrir le terrain pendant les déplacements.','Fresh game; menu opened through I')
    page.keyboard.press('Escape');page.keyboard.press('KeyM');assert page.evaluate('ROP_APP.simulation.s.systems.markers.length')==1
    page.keyboard.press('Tab');assert 'REPÈRES DE REPLI' in page.locator('#dialog-content').inner_text();assert page.locator('#dialog-content svg .map-beacon').count()==1
    ok('Repère posé avec M et restitué sur le plan');page.keyboard.press('Escape')
    fixture(page,1,'power',2,'grid');page.keyboard.press('KeyE')
    assert page.locator('[data-board-index]').count()==3
    oi=page.evaluate('ROP_APP.simulation.s.objective');page.get_by_role('button',name='RÉARMER LE CIRCUIT',exact=True).click();assert page.evaluate('ROP_APP.simulation.s.objective')==oi
    ok('Mauvaise combinaison refusée depuis le tableau interactif')
    page.locator('[data-board-index="0"]').click();page.locator('[data-board-index="1"]').click()
    page.get_by_role('button',name='RÉARMER LE CIRCUIT',exact=True).click();assert 'Surcharge' in page.locator('#board-feedback').inner_text()
    ok('Surcharge électrique indiquée, aucun objectif validé')
    page.locator('[data-board-index="2"]').click();assert page.locator('#board-load').inner_text()=='4 / 4'
    shot(page,'09-repartiteur.png','Répartiteur habitat réglé sur chauffage + éclairage ; buanderie délestée.','Chapter 2 / grid fixture imported via UI; toggles operated by clicks')
    before=page.evaluate('ROP_APP.simulation.s.elapsed');settle(page,150);assert page.evaluate('ROP_APP.simulation.s.elapsed')==before
    page.get_by_role('button',name='RÉARMER LE CIRCUIT',exact=True).click();settle(page,1800)
    assert page.evaluate('ROP_APP.simulation.s.flags.grid') is True;assert page.evaluate('ROP_APP.simulation.s.objective')==3
    ok('Réarmement terminé dans le monde après fermeture du tableau')
    fixture(page,1,'jorden',0,None,750,.75);settle(page,4600)
    shot(page,'10-logement.png','Logement habité : rangements, photos, vêtements, éclairage domestique et accès aux conduits.','Chapter 2 domestic-room fixture imported via ordinary UI; not a natural full campaign')
    fixture(page,9,'power',2,'emergency');assert page.evaluate('ROP_COLONY.isPowered(ROP_APP.simulation.s,ROP_APP.simulation.room)') is False
    page.keyboard.press('KeyL');settle(page,250);assert page.evaluate('ROP_APP.simulation.s.systems.flashlight') is True;assert page.evaluate('ROP_APP.simulation.s.systems.battery')<100
    ok('Lampe commandée au clavier : éclairage et batterie active sur secteur coupé')
    settle(page,4400);shot(page,'11-coupure.png','Distribution électrique en régime de secours, avant réarmement.','Chapter 10 power-room fixture; lamp activated with L')
    fixture(page,7,'service',0,None,700,.7);page.keyboard.press('KeyT');settle(page,100)
    assert page.evaluate('ROP_APP.simulation.s.systems.tracker') is True;page.locator('#tracker-readout').wait_for(state='visible',timeout=10000)
    ok('Détecteur des Marines affiché et lié aux contacts du modèle')
    fixture(page,8,'mess',1,'civilian');page.keyboard.press('KeyE');assert page.evaluate('!!ROP_APP.simulation.s.escort') is True
    page.keyboard.press('KeyI');page.locator('[data-order="wait"]').click();assert page.evaluate('ROP_APP.simulation.s.escort.order')=='wait'
    page.locator('[data-order="follow"]').click();assert page.evaluate('ROP_APP.simulation.s.escort.order')=='follow'
    ok('Escorte recrutée par E ; attendre/suivre via équipement')
    shot(page,'12-escorte.png','Commandes du compagnon : attendre, suivre, rassurer et partager les soins.','Chapter 9 escort-start fixture; recruited and ordered through normal UI')
    fixture(page,14,'refuge',0,'hide');page.keyboard.press('KeyG');assert page.evaluate('!!ROP_APP.simulation.s.systems.hiding') is True
    page.keyboard.press('KeyF');page.keyboard.press('KeyT');assert page.evaluate('ROP_APP.simulation.s.stats.shots')==0;assert page.evaluate('ROP_APP.simulation.s.systems.tracker') is False
    settle(page,4600)
    shot(page,'13-cachette.png','Newt abritée dans une cachette utilisable ; aucune arme ni détecteur de Marine.','Chapter 15 refuge fixture; hide command G, no combat animation substituted')
    page.keyboard.press('KeyE');assert page.evaluate('ROP_APP.simulation.s.systems.hiding') is None
    ok('Cachette : G pour entrer, E pour sortir, Newt reste désarmée')
    load(page,(ROOT/'tests/fixtures/real-v01-save.json').read_bytes())
    assert page.evaluate('ROP_APP.simulation.s.room')=='airlock';assert page.evaluate('ROP_APP.simulation.s.version')==REPORT['version']
    ok('Import navigateur du véritable export JSON v01 livré précédemment')
    for w,h in [(1280,720),(844,390),(390,844)]:
      page.set_viewport_size({'width':w,'height':h});settle(page,150)
      assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
      ok(f'Interface v02 sans débordement horizontal {w} × {h}')
    page.keyboard.press('KeyI');assert page.locator('.kit-grid').is_visible()
    shot(page,'14-equipement-portrait.png','Équipement en portrait 390 × 844 ; panneau défilant.','Desktop Chromium viewport emulation, not a hardware phone')
    page.keyboard.press('Escape')
    fixture(page,1,'power',2,'grid');page.keyboard.press('KeyE')
    assert page.locator('.board-console').bounding_box()['width']<391
    ok('Tableau électrique accessible en portrait sans débordement')
    assert not REPORT['errors'],REPORT['errors'];ok('Aucune erreur JavaScript pendant la recette v02',errors=0)
    assert not requests,requests;ok('Aucune requête réseau issue du standalone',requests=requests)
    browser.close()
except Exception as exc:
 REPORT['cases'].append({'name':'Recette interrompue','passed':False,'error':str(exc)});traceback.print_exc()
finally:
 REPORT['passed']=bool(REPORT['cases']) and all(c['passed'] for c in REPORT['cases']) and not REPORT['errors']
 (ROOT/'docs/BROWSER_V02_TEST_RESULTS.json').write_text(json.dumps(REPORT,ensure_ascii=False,indent=2))
 print(json.dumps({'passed':REPORT['passed'],'cases':len(REPORT['cases']),'captures':len(REPORT['captures']),'errors':REPORT['errors']},ensure_ascii=False),flush=True)
 if not REPORT['passed']:raise SystemExit(1)
