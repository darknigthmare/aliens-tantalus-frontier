"""V0.9 actual Chromium controls with clearly labelled prepared scenarios.
The HTTP/file navigation attempt is recorded. A memory double is used ONLY
when native navigations are blocked, exactly as the earlier test suites.
"""
from pathlib import Path
import json,hashlib,shutil,traceback
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parents[1];checks=[];errors=[];shots=[];notes=[]
def check(name,ok,detail=None):
 checks.append({'name':name,'ok':bool(ok),'detail':detail});print('CHECK',bool(ok),name,flush=True)
with sync_playwright() as p:
 b=p.chromium.launch(executable_path=shutil.which('chromium'),args=['--no-sandbox'])
 page=b.new_page(viewport={'width':1600,'height':1000});page.on('pageerror',lambda e:errors.append(str(e)));native=False
 for url in ['http://127.0.0.1:4188/?qa=1',(R/'JOUER_HORS_DES_OMBRES.html').as_uri()+'?qa=1']:
  try:page.goto(url,timeout=3500);native=True;break
  except Exception as e:notes.append(str(e).split('\n')[0])
 if not native:
  page.close();page=b.new_page(viewport={'width':1600,'height':1000});page.on('pageerror',lambda e:errors.append(str(e)))
  page.evaluate("()=>{window.__OTH_TEST_CONTEXT=true;window.__TEST_STORE=new Map([['other-dlc','preserved']]);Object.defineProperty(window,'localStorage',{value:{getItem:k=>__TEST_STORE.get(k)||null,setItem:(k,v)=>__TEST_STORE.set(k,String(v)),removeItem:k=>__TEST_STORE.delete(k)}});}")
  page.set_content((R/'JOUER_HORS_DES_OMBRES.html').read_text())
 page.set_default_timeout(7000)
 def ev(v):return page.evaluate(v)
 def state(v=''):return ev('__OTH_QA.state'+v)
 def screenshot(name,caption):
  page.screenshot(path=str(R/'captures'/name));shots.append({'file':name,'caption':caption,'method':'Actual Chromium rendering on V0.9; preparation and input specified in caption.'})
 def fixture(id='workshop-cart',side=-1):
  for key in ['x','d','q','z','s','v','f','c']:page.keyboard.up(key)
  page.evaluate("""([id,side])=>{const d=OTH_DATA.DATA.handling.carts.find(c=>c.id===id),s=OTH_ENGINE.createState();s.completed=OTH_DATA.DATA.chapters.flatMap(c=>c.objectives).slice(0,9).map(o=>o.id);s.chapter=3;s.goal=0;s.room=d.room;s.visited.push(d.room);s.player.x=d.x+side*(OTH_ENGINE.PROP[d.type].width/2+19);s.player.y=d.y;s.world[d.room]={spawned:true,cleared:true,enemies:[],eggs:{}};s.presentation.enabled=false;__OTH_QA.replace(s);} """,[id,side]);page.wait_for_timeout(70)
 def current(id='workshop-cart'):return page.evaluate('(id)=>OTH_ENGINE.cartPosition(__OTH_QA.state,id)',id)
 def pressMove(key='d',ms=260):page.keyboard.down('x');page.keyboard.down(key);page.wait_for_timeout(ms);page.keyboard.up(key)
 try:
  check('Titre et schéma V0.9 chargés',page.title().endswith('Le Marion, pièce par pièce') and state('.schema')==10)
  screenshot('104_titre_v09.png','Écran titre V0.9, sans préparation de progression. Le jeu précédent n’a pas été remplacé par une simple fiche de démonstration.')
  page.locator('[data-action="continue"]').click();page.wait_for_timeout(90);page.keyboard.press('n')
  check('N ouvre un relevé vide sans révéler les autres salles','Aucun matériel mobile observé' in page.locator('dialog').inner_text())
  check('Le relevé ne contient pas de commande de déplacement distante',page.locator('dialog [data-action="reset-cart"],dialog [data-action="move-cart"]').count()==0)
  fixture();old=current();px=state('.player.x');page.keyboard.down('x');page.wait_for_timeout(90)
  check('X prend la poignée sans téléporter le personnage',state('.handling.grip?.id')=='workshop-cart' and state('.player.x')==px and current()==old)
  beforefuel=state('.player.fuel');beforeparts=state('.maintenance.parts');page.keyboard.down('d');page.wait_for_timeout(360);page.keyboard.up('d')
  check('Direction droite déplace le chariot ET le personnage',current()['x']>old['x']+10 and abs(state('.player.x')-px-current()['x']+old['x'])<.01)
  check('Prise sans consommation de carburant ou de composants',state('.player.fuel')==beforefuel and state('.maintenance.parts')==beforeparts)
  check('Le HUD nomme les poignées tenues',page.locator('#oth-root').get_attribute('data-gripping')=='workshop-cart' and 'POIGNÉES EN MAIN' in page.locator('#oth-message').inner_text())
  screenshot('105_poignees_atelier.png','Scène préparée à l’atelier, sans ennemi. Prise avec X puis déplacement avec D. La pose des mains rejoint les poignées et les roues suivent la position du moteur.')
  at=current();page.keyboard.up('x');page.wait_for_timeout(200)
  check('Relâcher X serre les freins et conserve la position',state('.handling.grip') is None and current()==at)
  check('Après relâchement le texte ne prétend plus que les poignées sont tenues','Freins serrés' in page.locator('#oth-message').inner_text())
  screenshot('106_servante_freinee.png','Après le déplacement réel de la capture précédente, X est relâché. La servante conserve sa nouvelle position avec les freins serrés.')
  page.keyboard.press('n');page.wait_for_timeout(70);elapsed=state('.elapsed');page.wait_for_timeout(140)
  check('Le relevé montre le chariot observé et pas les cinq autres',page.locator('.handling-card').count()==1 and 'Servante de l’atelier' in page.locator('dialog').inner_text())
  check('La lecture met le monde en pause',state('.elapsed')==elapsed)
  screenshot('107_releve_manutention.png','Panneau N ouvert après une manipulation. Il indique le stationnement modifié, sans bouton de télécommande.')
  page.locator('dialog [data-panel="map"]').click();page.wait_for_timeout(80)
  cart=page.locator('svg .map-cart[data-cart="workshop-cart"]');check('Le plan représente un mobile identifié',cart.count()==1)
  actual=float(cart.get_attribute('x'));expected=34+(at['x']-32)/1960*626
  check('Position du plan dérivée du même état déplacé',abs(actual-expected)<.01)
  screenshot('108_plan_materiel.png','Le plan M représente la servante déplacée. Aucune position de créature n’est ajoutée au relevé.')
  page.keyboard.press('Escape');page.keyboard.press('Escape');page.wait_for_timeout(50)
  with page.expect_download() as dl:page.locator('dialog [data-action="export-save"]').click()
  save=R/'qa/CARNET_MANUTENTION_V09.json';dl.value.save_as(str(save));saved=json.loads(save.read_text())
  check('Export JSON contient le schéma 9 et la transformation',saved['schema']==10 and saved['handling']['positions']['workshop-cart']==at)
  page.locator('#oth-import').set_input_files(str(save));page.wait_for_timeout(100)
  check('Import réel reprend la position sans resaisie',current()==at and state('.handling.grip') is None)
  fixture();pressMove('z',300);check('Le déplacement en profondeur reste solidaire',current()['y']<142 and abs(state('.player.y')-current()['y'])<.01)
  page.keyboard.up('x');fixture('workshop-cart',1);pressMove('d',260)
  check('La poignée droite permet de tirer',current()['x']>1438 and state('.player.face')==-1);page.keyboard.up('x')
  for id,name,caption in [
    ('stores-cart','109_servante_reserves.png','Réserves : prise réelle du chariot à partir de son stationnement préparé, puis déplacement.'),
    ('haul-cart','110_benne_roulage.png','Galerie de roulage : benne chargée et aire balisée. Situation préparée sans ennemi, puis X et D.'),
    ('pump-cart','111_servante_pompage.png','Pompage : servante mobile placée dans le passage. Contrôle de déplacement à partir du stationnement initial.'),
    ('exchanger-cart','112_benne_echangeurs.png','Échangeurs : la benne avance plus lentement dans le caniveau encore en eau. Situation préparée, puis commandes normales.'),
    ('hold-cart','113_benne_quarantaine.png','Soute de quarantaine : maintien des poignées et mouvement avec la position persistante du moteur.')]:
   fixture(id);old=current(id);pressMove('d',280)
   check(id+' : contrôle clavier opérationnel',state('.handling.grip?.id')==id and current(id)['x']>old['x'])
   screenshot(name,caption);page.keyboard.up('x')
  fixture();ev("()=>{const s=__OTH_QA.state;s.world.workshop.enemies=[{id:'controlled-obstacle',type:'adult',x:1506,y:142,home:1506,targetX:1506,targetY:142,stun:100,cool:99,search:8,dir:-1}];}")
  pressMove('d',650);check('Le chariot bloque devant un acteur sans écrasement',state('.handling.blocked')=='actor' and state('.world.workshop.enemies.length')==1 and state('.world.workshop.enemies[0].x')==1506)
  screenshot('114_aucun_ecrasement.png','Test préparé : adulte immobilisé pour isoler la collision. Le chariot s’arrête avant le corps ; aucun déplacement forcé ni dégât d’écrasement.');page.keyboard.up('x')
  fixture();page.keyboard.down('x');page.wait_for_timeout(60);page.keyboard.press('n');page.wait_for_timeout(70)
  check('Ouvrir un menu libère immédiatement les poignées',state('.handling.grip') is None);page.keyboard.up('x');page.keyboard.press('Escape');start=current();page.wait_for_timeout(100)
  check('Fermer le menu ne reprend pas une touche tenue',state('.handling.grip') is None and current()==start)
  fixture();page.keyboard.down('x');page.wait_for_timeout(70);ev('window.dispatchEvent(new Event("blur"))');page.wait_for_timeout(70)
  check('Perte de focus : pause et freins serrés',page.locator('dialog[open]').count()==1 and state('.handling.grip') is None);page.keyboard.up('x')
  # A genuine chapter-entry recording from this prepared state, followed by a real session switch.
  fixture();ev('__OTH_QA.save()');page.keyboard.press('p');page.wait_for_timeout(90)
  btn=page.locator('button[data-chapter="3"]');check('L’entrée de chapitre préparée est enregistrée normalement',btn.count()==1 and btn.is_enabled())
  btn.click();page.wait_for_timeout(100);main=ev('localStorage.getItem(OTH_DATA.DATA.saveKey)')
  pressMove('d',280);page.keyboard.up('x');ev('__OTH_QA.save()')
  check('Manutention en répétition : campagne principale inchangée',ev('__OTH_QA.session')=='replay' and ev('localStorage.getItem(OTH_DATA.DATA.saveKey)')==main)
  screenshot('118_manutention_repetition.png','Répétition ouverte depuis l’entrée préparée du chapitre 4, puis chariot déplacé au clavier. Le carnet principal est comparé avant et après, sans modification.')
  ev('__OTH_QA.returnCampaign()');page.wait_for_timeout(80);check('Retour campagne restaure son propre stationnement',ev('__OTH_QA.session')=='campaign' and current()=={'x':1438,'y':142})
  # Native CDP touch events, not synthetic pointer dispatches that bypass capture.
  page.set_viewport_size({'width':390,'height':844});fixture();page.wait_for_timeout(100)
  x=page.locator('[data-touch="x"]');right=page.locator('[data-touch="d"]');xb=x.bounding_box();rb=right.bounding_box()
  check('Bouton X tactile visible et dans le cadre',x.is_visible() and xb['x']>=0 and xb['x']+xb['width']<=391 and xb['y']+xb['height']<=844)
  check('X ne recouvre ni la commande d’écoute ni un autre élément',page.evaluate('(r)=>document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.dataset.touch',xb)=='x')
  touch=page.context.new_cdp_session(page);xp={'x':xb['x']+xb['width']/2,'y':xb['y']+xb['height']/2,'id':1};rp={'x':rb['x']+rb['width']/2,'y':rb['y']+rb['height']/2,'id':2}
  touch.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[xp]});page.wait_for_timeout(80)
  check('Maintien tactile saisit réellement la poignée',state('.handling.grip?.id')=='workshop-cart')
  old=current();touch.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[xp,rp]});page.wait_for_timeout(320)
  check('Deux contacts tactiles déplacent le chariot',current()['x']>old['x']+5)
  screenshot('115_poignees_mobile.png','Écran 390 × 844. Deux contacts tactiles Chromium maintiennent X et la direction droite ; la servante se déplace réellement.')
  touch.send('Input.dispatchTouchEvent',{'type':'touchCancel','touchPoints':[]});page.wait_for_timeout(80);at=current()
  check('Annulation tactile relâche les deux actions',state('.handling.grip') is None);page.wait_for_timeout(120)
  check('Aucun déplacement résiduel après annulation tactile',current()==at)
  page.keyboard.press('n');page.wait_for_timeout(60);screenshot('116_releve_mobile.png','Relevé de manutention sur petit écran après annulation tactile. La lecture ne déplace pas le matériel.')
  check('Relevé mobile sans débordement horizontal',ev('document.documentElement.scrollWidth<=innerWidth'))
  page.keyboard.press('Escape');page.set_viewport_size({'width':844,'height':390});fixture();page.wait_for_timeout(120);screenshot('117_poignees_paysage.png','Écran paysage 844 × 390. Préparation au stationnement ; les commandes et le pied d’écran restent dans le cadre.')
  check('Petit paysage : pied d’écran dans la fenêtre',page.locator('.oth-foot').bounding_box()['y']+page.locator('.oth-foot').bounding_box()['height']<=391)
  for width,height in [(1280,720),(800,600)]:
   page.set_viewport_size({'width':width,'height':height});fixture();page.keyboard.press('n');page.wait_for_timeout(70)
   check(str(width)+'×'+str(height)+' : dialogue accessible sans débordement',page.locator('dialog').bounding_box()['x']>=0 and ev('document.documentElement.scrollWidth<=innerWidth'));page.keyboard.press('Escape')
  check('La clé d’un autre DLC reste intacte',native or ev('localStorage.getItem("other-dlc")')=='preserved')
 except Exception as e:
  checks.append({'name':'Completion of V0.9 browser scenarios','ok':False,'error':traceback.format_exc()});print(traceback.format_exc(),flush=True)
 finally:
  check('Aucune exception JavaScript pendant les contrôles',not errors,errors)
  result={'version':'0.10.0','suite':'browser-v09-handling','tests':len(checks),'passed':sum(c['ok'] for c in checks),'failed':sum(not c['ok'] for c in checks),'checks':checks,'consoleErrors':errors,'navigationAttempts':notes,'nativeNavigation':native,'nativeStoragePersistence':False,'storageMethod':'native for navigation if possible; otherwise explicit memory test double','htmlSHA256':hashlib.sha256((R/'JOUER_HORS_DES_OMBRES.html').read_bytes()).hexdigest(),'screenshots':shots}
  (R/'qa/browser-results-v09.json').write_text(json.dumps(result,ensure_ascii=False,indent=2));b.close()
if result['failed']:raise SystemExit(1)
