"""Actual Chromium interactions on explicit scene fixtures. Native navigation not assumed."""
from pathlib import Path
import json,hashlib,shutil,traceback
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parents[1];checks=[];shots=[];errors=[];native=False;attempts=[]
def check(name,ok,detail=None):
 checks.append(dict(name=name,ok=bool(ok),detail=detail));print('CHECK',bool(ok),name,flush=True)
with sync_playwright() as p:
 b=p.chromium.launch(executable_path=shutil.which('chromium'),args=['--no-sandbox']);page=b.new_page(viewport={'width':1600,'height':1000},accept_downloads=True)
 for url in ['http://127.0.0.1:4188/?qa=1',(R/'JOUER_HORS_DES_OMBRES.html').as_uri()+'?qa=1']:
  try:page.goto(url,timeout=4500);native=True;break
  except Exception as e:attempts.append(str(e).split('\n')[0])
 if not native:
  page.close();page=b.new_page(viewport={'width':1600,'height':1000},accept_downloads=True)
  page.evaluate("()=>{window.__OTH_TEST_CONTEXT=true;window.__TEST_STORE=new Map([['other-dlc','preserved']]);Object.defineProperty(window,'localStorage',{value:{getItem:k=>__TEST_STORE.get(k)||null,setItem:(k,v)=>__TEST_STORE.set(k,String(v)),removeItem:k=>__TEST_STORE.delete(k)}});}")
  page.set_content((R/'JOUER_HORS_DES_OMBRES.html').read_text())
 page.on('pageerror',lambda e:errors.append(str(e)));page.set_default_timeout(6500)
 page.evaluate("()=>{const old=__OTH_QA.replace;__OTH_QA.replace=s=>{s.presentation.enabled=false;old(s)};__OTH_QA.state.presentation.enabled=false;}")
 def ev(q,arg=None):return page.evaluate(q,arg)
 def state(q):return ev('__OTH_QA.state'+q)
 def shot(name,caption):
  page.screenshot(path=str(R/'captures'/name));shots.append(dict(file=name,caption=caption,method='Chromium V0.10 — état de scène préparé explicitement ; commandes et simulation réelles.'))
 def close():
  if page.locator('dialog').evaluate('(d)=>d.open'):page.keyboard.press('Escape')
  page.wait_for_timeout(65)
 def hold(key,ms=850):page.keyboard.down(key);page.wait_for_timeout(ms);page.keyboard.up(key);page.wait_for_timeout(50)
 def scenario(count,room,x=700,y=88):
  close();ev("([count,room,x,y])=>{let s=OTH_ENGINE.createState();s.completed=OTH_DATA.DATA.chapters.flatMap(c=>c.objectives).slice(0,count).map(o=>o.id);s.room=room;s=OTH_ENGINE.restore(OTH_ENGINE.serialize(s));s.player.x=x;s.player.y=y;s.invuln=0;s.world[room]={enemies:[],eggs:{},spawned:true,cleared:true};__OTH_QA.replace(s)}",[count,room,x,y]);page.wait_for_timeout(100)
 def place(room,x,y=88):
  close();ev("([room,x,y])=>{let s=__OTH_QA.state;s.room=room;s.player.x=x;s.player.y=y;s.player.face=1;s.portalCooldown=0;s.world[room]={enemies:[],eggs:{},spawned:true,cleared:true};if(!s.visited.includes(room))s.visited.push(room)}",[room,x,y]);page.wait_for_timeout(100)
 def threat(x=880,type='adult'):
  ev("([x,type])=>{let s=__OTH_QA.state;s.world[s.room].enemies=[{id:'v10-browser-'+type,type,hp:type==='adult'?120:30,netted:0,x,y:s.player.y,home:x,state:'patrol',targetX:x,targetY:s.player.y,stun:0,cool:999,search:0,dir:-1}];s.weaponCooldown=0;s.torchCooldown=0;s.weaponPressDone=false;s.player.hp=100;s.invuln=0}",[x,type])
 try:
  check('V0.10 et intitulé courant dans le document',page.locator('meta[name="application-version"]').get_attribute('content')=='0.10.0' and 'LE MARION, PIÈCE PAR PIÈCE' in page.locator('.version-mark').inner_text())
  shot('119_titre_v010.png','Écran titre de la V0.10, document effectivement exécuté. Le module reste autonome et le rendu provisoire.')
  page.locator('[data-action="continue"]').click();page.keyboard.press('u')
  check('U ouvre cinq outils sans déverrouillage gratuit',page.locator('.equipment-card').count()==5 and page.locator('[data-equip]:not([disabled])').count()==0)
  check('Le projecteur est annoncé comme attestation secondaire','SECONDAIRE' in page.locator('.equipment-card').last.inner_text())
  close();scenario(9,'hangar',1000)
  # Entry fixture positioned at a real portal; each transition uses the actual E command.
  for room,target,name in [('hangar','boarding','120_vestibule.png'),('boarding','docking_airlock','121_sas.png'),('docking_airlock','docking_arm','122_bras.png'),('docking_arm','samson','123_samson.png')]:
   portal=ev('([room,target])=>OTH_ENGINE.ROOM[room].portals.find(p=>p.target===target)',[room,target]);place(room,portal['x'],portal['y']);hold('e',1250)
   check(room+' vers '+target+' : seuil E réellement franchi',state('.room')==target)
   if target=='boarding':place(target,780)
   elif target=='docking_arm':place(target,780)
   else:place(target,650)
   shot(name,'Préparation au seuil de '+room+', puis passage E vers '+target+'. Cadrage repositionné pour inspecter l’architecture ; plan reconstruit, pas plan officiel.')
  for room,target in [('samson','docking_arm'),('docking_arm','docking_airlock'),('docking_airlock','boarding'),('boarding','hangar')]:
   portal=ev('([room,target])=>OTH_ENGINE.ROOM[room].portals.find(p=>p.target===target)',[room,target]);place(room,portal['x'],portal['y']);hold('e',1200);check(room+' vers '+target+' : retour E réciproque',state('.room')==target)
  scenario(24,'boarding',440);hold('e',900);check('Râtelier récupéré sur place par E',state('.gear.collected').count('v10-rack')==1 and state('.gear.charges')==6 and state('.gear.nets')==2)
  shot('124_ratelier_vide.png','Maintien E sur le râtelier : outils retirés et rack vide persistant. Fixture au chapitre 9, aucune dotation injectée.')
  page.keyboard.press('u');check('Pic, thumper et filet deviennent disponibles',page.locator('[data-equip]:not([disabled])').count()==4)
  shot('125_equipement.png','Panneau U après acquisition réelle du râtelier. Les valeurs sont un équilibrage original ; le filet individuel est une simplification explicitement signalée.')
  page.locator('[data-equip="pick"]').click();check('Sélection de l’outil dans le panneau',state('.gear.selected')=='pick');close();place('stores',1380);hold('e',900)
  check('Projecteur acquis dans le second casier',state('.gear.acid')==3 and 'v10-acid-rack' in state('.gear.collected'))
  place('docking_arm',700);page.keyboard.press('4');threat(880);hold('f',90)
  check('Filet utilisé avec F : charge et immobilisation réelles',state('.gear.nets')==1 and state('.world.docking_arm.enemies[0].netted')>0)
  shot('126_filet.png','Adulte de test explicitement placé dans le bras, puis immobilisé avec 4 et F. Ce lieu ne génère pas cette rencontre dans la campagne normale.')
  x=state('.world.docking_arm.enemies[0].x');page.wait_for_timeout(250);check('Cible maintenue au même endroit pendant le filet',abs(state('.world.docking_arm.enemies[0].x')-x)<.01)
  place('docking_arm',700);page.keyboard.press('3');threat(980);before=state('.gear.charges');hold('f',120)
  check('Thumper : impact et charge retirée',state('.gear.charges')==before-1 and state('.world.docking_arm.enemies[0].hp')==72)
  shot('127_thumper.png','Cible de contrôle préparée ; premier impact réel du thumper. Les dégâts et la portée ne sont pas des spécifications canoniques.')
  page.wait_for_timeout(1100);before=state('.gear.charges');hold('f',1600);check('Maintien F ne vide pas le thumper',state('.gear.charges')==before-1)
  page.keyboard.up('f');page.wait_for_timeout(1100);hold('f',100);check('Troisième impact : cadavre sans clone',len(state('.world.docking_arm.enemies'))==0 and len(state('.world.docking_arm.corpses'))==1)
  shot('128_cadavre_acide.png','Troisième impact dans une rencontre de contrôle : corps conservé et flaques corrosives temporaires, pas une mort scénarisée de personnage.')
  place('docking_arm',700);page.keyboard.press('2');threat(785);hold('f',90);check('Pic sélectionné au clavier et dommage de proximité',state('.gear.selected')=='pick' and state('.world.docking_arm.enemies[0].hp')==82)
  shot('129_pic.png','Pic à sable équipé et frappe de proximité exécutée. L’ennemi est une fixture de test ; forme et animation restent provisoires.')
  place('docking_arm',700);page.keyboard.press('5');threat(840);hold('f',90);check('Projecteur : réserve finie et impact',state('.gear.acid')==2 and state('.world.docking_arm.enemies[0].hp')==60)
  shot('130_projecteur.png','Jet du projecteur contre la cible préparée. Présence du matériel attestée seulement par une source secondaire ; modèle original.')
  # Same geometrical obstruction for movement and shots.
  place('boarding',120,25);page.keyboard.press('3');threat(200);page.wait_for_timeout(1150);hold('f',90)
  check('Cloison : une cible derrière reste indemne',state('.world.boarding.enemies[0].hp')==120)
  scenario(12,'boarding',1450);page.locator('button[data-panel="crew"]').click()
  check('Dix portraits civils réellement dessinés',page.locator('.crew-portrait').count()==10 and ev("Array.from(document.querySelectorAll('.crew-portrait')).every(c=>c.toDataURL().length>1000)"))
  check('Les portraits ne sont pas présentés comme officiels','provisoires' in page.locator('dialog').inner_text())
  shot('131_equipage.png','Tableau de l’équipage : chaque vignette appelle le même dessin de personnage que le terrain. Visages, couleurs et tailles sont provisoires, non certifiés 1:1.')
  close();shot('132_personnel_vestibule.png','Présences préparées au chapitre 5 dans le vestibule ; rôles civils et coiffures différenciées. Ce n’est pas une chorégraphie complète du passage romanesque.')
  for room,name in [('rec','137_seuil_service.png'),('boarding','138_seuil_vestibule.png'),('vestibule','139_seuil_organique.png')]:
   portal=ev('room=>{const r=OTH_ENGINE.ROOM[room];return r.portals.find(p=>p.mount.type==="service-vestibule")||r.portals[0]}',room)
   scenario(24,room,min(portal['x']+160,ev('room=>OTH_ENGINE.ROOM[room].width-100',room)),88)
   shot(name,'Vue préparée au droit du seuil '+portal['id']+'. Retours architecturaux reliés au mur arrière et circulation laissée au premier plan ; géométrie de reconstruction, non plan officiel.')
  scenario(30,'medical',900);shot('133_blessures.png','État de campagne préparé après l’événement de blessure. Les profils conservent leurs vêtements et changent leur marque de blessure ; pas une procédure médicale réelle.')
  page.keyboard.press('Escape');page.locator('button[data-panel="fidelity"]').click()
  check('Fidélité expose limites et éléments à vérifier','Aucune certification 1:1' in page.locator('dialog').inner_text() and page.locator('.fidelity-grid article').count()==6)
  shot('134_fidelite.png','Panneau de production ouvert depuis la pause : écarts au 1:1 explicitement répertoriés, sans effets sur la progression.')
  close();scenario(24,'boarding',440);hold('e',900);page.keyboard.press('3');place('docking_arm',700);threat(980);hold('f',100);page.keyboard.press('Escape')
  with page.expect_download() as d:page.locator('[data-action="export-save"]').click()
  path=R/'qa/browser-export-v010.json';d.value.save_as(path);raw=json.loads(path.read_text());check('Fichier exporté réellement au schéma 10',raw['schema']==10 and raw['gear']['charges']==5)
  page.locator('#oth-import').set_input_files(str(path));page.wait_for_timeout(200);check('Import rétablit sélection et réserve sans maintenir le tir',state('.gear.selected')=='thumper' and state('.gear.charges')==5 and state('.weaponPressDone')==False)
  place('docking_arm',700);page.keyboard.press('m');check('Plan local contient les nouveaux retours de cloison',ev('OTH_ENGINE.localChart(__OTH_QA.state).walls.length')==4)
  shot('135_plan_bras.png','Plan de proximité : retours de cloison et extrémités du bras sont issus de la même géométrie que le terrain, sans ennemis sur la carte.')
  close();page.set_viewport_size({'width':390,'height':844});page.locator('#oth-equipped').click()
  check('U tactile visible et panneau sans dépassement',page.locator('.equipment-card').count()==5 and ev('document.documentElement.scrollWidth<=innerWidth') and page.locator('.dialog-body').evaluate('(e)=>e.scrollWidth<=e.clientWidth+1'))
  shot('136_mobile_equipement.png','Émulation 390 × 844 : accès U depuis le HUD et cartes d’outils défilables. Ce test n’est pas une certification de téléphone physique.')
  for w,h in [(844,390),(800,600),(1280,720)]:
   page.set_viewport_size({'width':w,'height':h});page.wait_for_timeout(80);check(f'Panneau équipement {w}×{h} sans largeur perdue',ev('document.documentElement.scrollWidth<=innerWidth') and page.locator('.dialog-body').evaluate('(e)=>e.scrollWidth<=e.clientWidth+1'))
  close();page.set_viewport_size({'width':1600,'height':1000})
  if not native:check('Aucune écriture dans un autre DLC',ev('__TEST_STORE.get("other-dlc")==="preserved"'))
  check('Aucune exception JavaScript observée',not errors,errors)
 except Exception:
  check('Suite V0.10 terminée',False,traceback.format_exc());print(traceback.format_exc());page.screenshot(path='/mnt/data/oth10_work/browser-v010-failure.png')
 b.close()
result=dict(version='0.10.0',suite='chromium-v010-fidelity-tools-topology',tests=len(checks),passed=sum(c['ok'] for c in checks),failed=sum(not c['ok'] for c in checks),checks=checks,errors=errors,captures=shots,htmlSHA256=hashlib.sha256((R/'JOUER_HORS_DES_OMBRES.html').read_bytes()).hexdigest(),nativeNavigation=native,nativePersistenceCertified=False,navigationAttempts=attempts,fallback=None if native else 'set_content + explicit Map-backed storage')
(R/'qa/browser-results-v010.json').write_text(json.dumps(result,ensure_ascii=False,indent=2));print(json.dumps(result,ensure_ascii=False,indent=2))
if result['failed']:raise SystemExit(1)
