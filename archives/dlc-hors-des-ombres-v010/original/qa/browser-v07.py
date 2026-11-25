"""V0.8 actual UI controls on documented scene fixtures; no claim of manual playtest."""
from pathlib import Path
import json,hashlib,shutil
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parents[1];CAP=R/'captures';checks=[];errors=[];notes=[];shots=[]
def check(name,ok,detail=None):
 print('CHECK',bool(ok),name,flush=True);checks.append(dict(name=name,ok=bool(ok),detail=detail))
with sync_playwright() as p:
 b=p.chromium.launch(executable_path=shutil.which('chromium'),args=['--no-sandbox']);page=b.new_page(viewport={'width':1600,'height':1000});native=False
 page.on('pageerror',lambda e:errors.append(str(e)))
 for url in ['http://127.0.0.1:4173/?qa=1',(R/'JOUER_HORS_DES_OMBRES.html').as_uri()+'?qa=1']:
  try:page.goto(url,timeout=4500);native=True;break
  except Exception as e:notes.append(str(e).split('\n')[0])
 if not native:
  page.close();page=b.new_page(viewport={'width':1600,'height':1000});page.on('pageerror',lambda e:errors.append(str(e)))
  page.evaluate("()=>{window.__OTH_TEST_CONTEXT=true;window.__TEST_STORE=new Map([['other-dlc','preserved']]);Object.defineProperty(window,'localStorage',{value:{getItem:k=>__TEST_STORE.get(k)||null,setItem:(k,v)=>__TEST_STORE.set(k,String(v)),removeItem:k=>__TEST_STORE.delete(k)}});}")
  page.set_content((R/'JOUER_HORS_DES_OMBRES.html').read_text())
 # Regression scenes keep the optional V0.8 automatic presentation disabled.
 page.evaluate("()=>{const api=__OTH_QA,original=api.replace;api.replace=s=>{s.presentation.enabled=false;original(s);};api.state.presentation.enabled=false;}")
 page.set_default_timeout(6000)
 page.on('pageerror',lambda e:print('PAGE_ERROR',str(e),flush=True))
 page.wait_for_timeout(150)
 def state(expr):return page.evaluate('__OTH_QA.state'+expr)
 def shot(name,caption):
  page.screenshot(path=str(CAP/name));shots.append(dict(file=name,caption=caption,method='Chromium V0.8 ; scène préparée explicitement, puis commandes ordinaires et simulation.'))
 def hold(key,ms):page.keyboard.down(key);page.wait_for_timeout(ms);page.keyboard.up(key)
 def close():page.keyboard.press('Escape');page.wait_for_timeout(75)
 def place(room,x,y=88):
  page.evaluate("([room,x,y])=>{const s=__OTH_QA.state;s.room=room;s.player.x=x;s.player.y=y;s.player.hp=100;s.invuln=0;s.noticeTime=0;s.portalCooldown=0;if(!s.visited.includes(room))s.visited.push(room);OTH_ENGINE.roomWorld(s).enemies=[];}",[room,x,y]);page.wait_for_timeout(90)
 def new_side():
  page.evaluate("()=>{let s=OTH_ENGINE.createState('assisted');s.completed=OTH_DATA.DATA.chapters.flatMap(c=>c.objectives).slice(0,21).map(o=>o.id);s.room='return_gallery';s=OTH_ENGINE.restore(OTH_ENGINE.serialize(s));for(const r of OTH_DATA.DATA.excursion.rooms){s.world[r]={enemies:[],eggs:{},spawned:true,cleared:true,visitTime:0};}s.player.x=440;s.player.y=130;s.invuln=0;__OTH_QA.replace(s);}");page.wait_for_timeout(100)
 def operate(index):
  print('OPERATION',index,flush=True)
  op=page.evaluate('i=>OTH_DATA.DATA.excursion.ops[i]',index);place(op['room'],op['x'],op['y']);page.keyboard.up('e');page.wait_for_timeout(65);page.keyboard.down('e');page.wait_for_function('i=>__OTH_QA.state.excursion.done.length>i',arg=index,timeout=5500);page.keyboard.up('e');page.wait_for_timeout(90)
 check('HTML V0.8 et schéma 8 chargés',page.locator('meta[name="application-version"]').get_attribute('content')=='0.10.0' and state('.schema')==10)
 shot('74_menu_v07.png','Écran titre au chargement du document V0.8.')
 page.locator('[data-action="continue"]').click();page.keyboard.press('o')
 check('O initial ne révèle aucune annexe','Aucun relevé annexe découvert' in page.locator('dialog').inner_text());close()
 new_side();check('Entrée dans une annexe découvre le relevé',state('.excursion.discovered'))
 place('return_gallery',870,140);shot('75_caniveau.png','Fixture dans la galerie de retour. L’eau reste dans la bande avant ; la circulation arrière demeure sèche.')
 x=state('.player.x');hold('d',350);wet=state('.player.x')-x;place('return_gallery',870,70);x=state('.player.x');hold('d',350);dry=state('.player.x')-x
 check('Marcher dans l’eau ralentit réellement le personnage',wet<dry*.8,dict(wet=wet,dry=dry))
 place('return_gallery',440,130);page.keyboard.down('e');page.wait_for_timeout(350);check('Maintien incomplet : rien de validé',len(state('.excursion.done'))==0 and state('.excursionHold')>0)
 page.keyboard.press('o');check('O interrompt le geste sans le terminer',state('.excursionHold')==0 and len(state('.excursion.done'))==0);page.keyboard.up('e');close()
 operate(0);check('Volant fermé par E',state('.excursion.done')==['isolate']);hold('e',1100);check('Appui long ne duplique pas le premier geste',len(state('.excursion.done'))==1)
 operate(1);operate(2);check('Trois commandes physiques démarrent le cycle',len(state('.excursion.done'))==3 and state('.excursion.pumpElapsed')>0)
 place('exchanger',1200);shot('76_echangeurs.png','Vannes et démarreur actionnés par E. Les jauges et le temps restant lisent l’état du cycle, pas une animation indépendante.')
 page.keyboard.press('o');t=state('.excursion.pumpElapsed');page.wait_for_timeout(350)
 check('Le relevé suspend le temps des pompes',state('.excursion.pumpElapsed')==t)
 check('Liste de huit gestes sans bouton de validation distante',page.locator('.excursion-steps li').count()==8 and page.locator('[data-operation]').count()==0)
 shot('77_releve_pompage.png','Le relevé ouvert par O pendant le cycle. La simulation est arrêtée pendant sa lecture.')
 page.locator('[data-action="excursion-track"]').click();check('Le repère secondaire peut être masqué',state('.excursion.tracked')==False)
 print('MARK second tracking click',flush=True);page.locator('[data-action="excursion-track"]').click();print('MARK close',flush=True);close();print('MARK closed',flush=True)
 print('MARK placing survey',flush=True);place('survey',800);print('MARK placed survey',flush=True);t=state('.excursion.pumpElapsed');page.wait_for_timeout(450);check('Cycle conservé lors du changement de pièce',state('.excursion.pumpElapsed')>t)
 # A real export/import roundtrip while the cycle is incomplete.
 page.keyboard.press('Escape')
 with page.expect_download() as dl:page.locator('[data-action="export-save"]').click()
 save=R/'qa/browser-export-v07.json';dl.value.save_as(save);raw=json.loads(save.read_text())
 check('Export JSON réel du cycle intermédiaire',raw['schema']==10 and len(raw['excursion']['done'])==3 and 0<raw['excursion']['pumpElapsed']<18)
 page.locator('#oth-import').set_input_files(str(save));page.wait_for_timeout(120)
 check('Import conserve le cycle et la progression principale',len(state('.excursion.done'))==3 and len(state('.completed'))==21 and state('.excursion.pumpElapsed')>=raw['excursion']['pumpElapsed'])
 page.wait_for_function('__OTH_QA.state.excursion.pumpElapsed===18',timeout=25000)
 check('Le groupe atteint un niveau bas puis s’arrête',state('.excursion.pumpElapsed')==18)
 place('exchanger',1700);shot('78_traverse_ouverte.png','Après dix-huit secondes réelles de simulation cumulée, le caniveau est vidé et la traverse est libérée.')
 operate(3);place('specimen_store',480);shot('79_armoire.png','Armoire déverrouillée par E après baisse du niveau. Les prélèvements restent des carottes minérales, pas de nouveaux œufs.')
 operate(4);check('Récupération physique du boîtier',state('.excursion.recorder.carried'))
 place('specimen_store',1080);shot('80_enregistreur_porte.png','Enregistreur récupéré et représenté sur la sangle du personnage. Aucun transfert de dossier à distance.')
 hold('t',350);check('T pose un seul boîtier',state('.excursion.recorder.carried')==False)
 shot('81_enregistreur_pose.png','T a posé le boîtier à la position actuelle. Il demeure un objet local à reprendre.')
 pos=state('.excursion.recorder');page.keyboard.press('o');check('Le relevé indique la salle du boîtier posé','Réserve des prélèvements' in page.locator('dialog').inner_text());close()
 place('survey',570);hold('e',1400);check('Lecteur éloigné ne rappelle pas le boîtier',len(state('.excursion.done'))==5 and state('.excursion.recorder.carried')==False)
 place(pos['room'],pos['x'],pos['y']);hold('e',900);check('E reprend le même boîtier',state('.excursion.recorder.carried'))
 operate(5);place('survey',1030);shot('82_poste_releve.png','Boîtier branché au lecteur par E. Le poste de relevé possède une architecture d’écrans distincte des échangeurs.')
 operate(6);operate(7);check('Copie facultative achevée sans modifier la campagne',len(state('.excursion.done'))==8 and len(state('.completed'))==21 and state('.records').count('v07-pump-record')==1)
 page.keyboard.press('j');page.locator('#oth-search').fill('heures perdues');check('Le nouveau dossier est lisible dans le carnet',page.locator('[data-codex-id="v07-pump-record"]').count()==1);shot('83_copie.png','Carnet ouvert après les huit gestes. Le texte est original à cette adaptation ; il ne prétend pas être un extrait du roman.');check('Copie distinguée des vingt documents à retrouver','0 / 20 transcriptions' in page.locator('dialog').inner_text() and 'également été copié' in page.locator('dialog').inner_text());close();check('Échap ferme le carnet même depuis sa recherche',not page.locator('dialog').evaluate('(e)=>e.open'))
 place('return_gallery',1300,140);page.keyboard.press('m');check('Le plan local représente le caniveau',page.locator('.map-water').count()==1 and page.locator('.local-plan').is_visible());shot('84_plan_caniveau.png','Plan de la galerie après assèchement : empreinte du caniveau, mobilier, position du joueur et accès observés. Aucun ennemi affiché.');close()
 # New scenario for close-range damage cancellation; prepared hostile but actual attack timing.
 new_side();page.evaluate("()=>{const s=__OTH_QA.state;s.player.x=440;s.player.y=130;s.invuln=0;s.world.return_gallery.enemies=[{id:'v07-browser-threat',type:'adult',x:475,y:130,home:475,state:'windup',targetX:440,targetY:130,stun:0,cool:0,search:2,dir:-1,attack:.65}];}")
 page.keyboard.down('e');page.wait_for_timeout(250);shot('87_interruption_adulte.png','Rencontre explicitement préparée près de la vanne. La créature est dans sa phase d’appui pendant le maintien E, sans pause de lecture.');page.wait_for_timeout(650);page.keyboard.up('e')
 check('Attaque pendant une intervention : blessure sans validation du geste',state('.player.hp')<100 and len(state('.excursion.done'))==0)
 new_side();page.set_viewport_size({'width':390,'height':844});page.keyboard.press('o');shot('85_mobile_releve.png','Viewport 390 × 844 : lecture du relevé, défilement des étapes et accès au retour. Émulation de format, pas certification d’un téléphone physique.')
 check('Relevé mobile reste dans la largeur',page.evaluate('document.documentElement.scrollWidth<=innerWidth') and page.locator('.dialog-body').evaluate('(e)=>e.scrollWidth<=e.clientWidth+1'))
 close();place('return_gallery',440,130);shot('86_mobile_galerie.png','Viewport 390 × 844 : commande E et scène de galerie visibles. Les commandes tactiles existantes sont conservées.')
 check('E tactile accessible sur la nouvelle opération',page.locator('[data-touch="e"]').is_visible())
 for w,h in [(1280,720),(800,600),(844,390)]:
  page.set_viewport_size({'width':w,'height':h});page.wait_for_timeout(100)
  check(f'Cadre {w}x{h} sans dépassement horizontal',page.evaluate('document.documentElement.scrollWidth<=innerWidth'))
 page.set_viewport_size({'width':1600,'height':1000});page.keyboard.press('Escape');old=state('.excursion');page.locator('#oth-import').set_input_files({'name':'invalid.json','mimeType':'application/json','buffer':b'{broken'});page.wait_for_timeout(100)
 check('Import invalide ne détruit pas le relevé',state('.excursion')==old)
 if not native:check('Sauvegarde d’un autre DLC laissée intacte',page.evaluate('__TEST_STORE.get("other-dlc")==="preserved"'))
 check('Aucune exception JavaScript',not errors,errors)
 b.close()
result=dict(version='0.10.0',suite='chromium-v07-flooded-archives',tests=len(checks),passed=sum(c['ok'] for c in checks),failed=sum(not c['ok'] for c in checks),htmlSHA256=hashlib.sha256((R/'JOUER_HORS_DES_OMBRES.html').read_bytes()).hexdigest(),nativeNavigation=native,nativePersistenceCertified=False,navigationAttempts=notes,fallback=None if native else 'set_content + explicit in-memory localStorage test double',errors=errors,checks=checks,captures=shots)
(R/'qa/browser-results-v07.json').write_text(json.dumps(result,ensure_ascii=False,indent=2));print(json.dumps(result,ensure_ascii=False,indent=2))
if result['failed']:raise SystemExit(1)
