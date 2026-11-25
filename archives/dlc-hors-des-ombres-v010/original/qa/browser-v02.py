"""Chromium rendering + real DOM controls. Scenario placement is explicit; not a human full playthrough.
Browser navigation is attempted; fallback is set_content + a declared in-memory storage double.
"""
from pathlib import Path
import json,time,subprocess,os,shutil
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parents[1];HTML=(R/'JOUER_HORS_DES_OMBRES.html').read_text();CAP=R/'captures';CAP.mkdir(exist_ok=True)
checks=[];errors=[];notes=[]
def check(name,ok,details=None):checks.append(dict(name=name,ok=bool(ok),details=details))
with sync_playwright() as p:
 binary=os.environ.get('CHROMIUM_PATH') or shutil.which('chromium') or shutil.which('chromium-browser')
 options={'args':['--no-sandbox']}
 if binary:options['executable_path']=binary
 b=p.chromium.launch(**options);page=b.new_page(viewport={'width':1600,'height':1000},device_scale_factor=1);page.on('pageerror',lambda e:errors.append(str(e)))
 try:page.goto('http://127.0.0.1:4173/?qa=1',timeout=4000);native=True
 except Exception as e:notes.append(str(e).split('\n')[0]);native=False
 if not native:
  try:page.goto((R/'JOUER_HORS_DES_OMBRES.html').as_uri()+'?qa=1',timeout=4000);native=True
  except Exception as e:notes.append(str(e).split('\n')[0])
 if not native:
  page.close();page=b.new_page(viewport={'width':1600,'height':1000},device_scale_factor=1);page.on('pageerror',lambda e:errors.append(str(e)))
  page.evaluate('''()=>{window.__OTH_TEST_CONTEXT=true;const store=new Map([['frontier:save','untouched'],['mire:alien-original','untouched']]);window.__OTH_TEST_STORE=store;Object.defineProperty(window,'localStorage',{value:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)}});}''')
  page.set_content(HTML,wait_until='load')
 page.wait_for_timeout(100)
 # V0.8 auto-scenes disabled for these dedicated legacy-control fixtures only.
 page.evaluate("()=>{const api=__OTH_QA,original=api.replace;api.replace=s=>{s.presentation.enabled=false;original(s);};api.state.presentation.enabled=false;}")

 def shot(name):page.screenshot(path=str(CAP/name))
 def scenario(n=0,room='bridge',x=170,y=88):
  page.evaluate('''([n,room,x,y])=>{const s=OTH_ENGINE.createState('assisted');s.completed=OTH_DATA.DATA.chapters.flatMap(c=>c.objectives).slice(0,n).map(o=>o.id);s.room=room;const r=OTH_ENGINE.restore(OTH_ENGINE.serialize(s));r.player.x=x;r.player.y=y;r.invuln=2;__OTH_QA.replace(r);}''',[n,room,x,y]);page.wait_for_timeout(60)
 def close():page.keyboard.press('Escape');page.wait_for_timeout(20)
 check('Menu chargé',page.locator('.oth-title').is_visible());shot('01_menu.png');page.locator('[data-action="continue"]').click()
 x=page.evaluate('__OTH_QA.state.player.x');page.keyboard.down('d');page.wait_for_timeout(220);page.keyboard.up('d');check('Déplacement clavier',page.evaluate('__OTH_QA.state.player.x')>x+10)
 page.keyboard.down('z');page.wait_for_timeout(180);page.keyboard.up('z');check('Déplacement profondeur',page.evaluate('__OTH_QA.state.player.y')<88)
 scenario(0,'bridge',700);shot('02_jordan_passerelle.png')
 scenario(0,'bridge',820,105);page.keyboard.down('e');page.wait_for_timeout(580);page.keyboard.up('e');check('Parler à Jordan par maintien réel',page.locator('dialog').is_visible() and page.evaluate('__OTH_QA.state.conversations.length')==1);shot('03_dialogue.png');close()
 scenario(0,'rec',930);shot('04_beebees.png')
 scenario(0,'rec',600);page.keyboard.down('e');page.wait_for_timeout(900);page.keyboard.up('e');check('Transcription récupérée par touche E',page.evaluate('__OTH_QA.state.records.includes("marion-note-01")'));check('Document physique affiché',page.locator('.record-body').is_visible());shot('05_transcription.png');close()
 page.keyboard.press('j');page.locator('#oth-category').select_option('Traces');check('Carnet masque les transcriptions non trouvées',page.evaluate('''()=>{const shown=[...document.querySelectorAll('.oth-codex-card')].map(n=>n.dataset.codexId),notes=OTH_DATA.DATA.codex.filter(e=>e.unlockRecord);return notes.every(e=>shown.includes(e.id)===__OTH_QA.state.records.includes(e.unlockRecord));}'''));shot('06_carnet.png');page.locator('#oth-search').fill('absentXYZ');check('Recherche sans résultat gérée',page.locator('.oth-codex-card').count()==0);close()
 scenario(1,'comms',924);page.keyboard.down('e');page.wait_for_function('Boolean(__OTH_QA.state.puzzle)',timeout=8000);page.keyboard.up('e');check('Dérivation électrique ouverte par interaction',page.locator('.work-routing').is_visible());shot('07_derivation.png')
 before=page.evaluate('__OTH_QA.state.elapsed');page.wait_for_timeout(180);check('Maintenance en pause sans pénalité',before==page.evaluate('__OTH_QA.state.elapsed'))
 page.locator('[data-choice="rotate:0"]').click();close();check('Annuler ne valide pas la commande',page.evaluate('__OTH_QA.state.completed.length')==1)
 page.keyboard.down('e');page.wait_for_function('Boolean(__OTH_QA.state.puzzle)',timeout=8000);page.keyboard.up('e');check('Réglage conservé après fermeture',page.evaluate('__OTH_QA.state.puzzle.progress.values[0]')==1)
 for _ in range(20):
  action=page.evaluate('OTH_ENGINE.solveWorkAction(__OTH_QA.state)')
  if not action:break
  page.locator('[data-choice="'+action+'"]').click()
 check('Commutateurs et contacteur valident un seul objectif',page.evaluate('__OTH_QA.state.completed.length')==2 and not page.locator('dialog').is_visible())
 scenario(3,'maintenance',840);page.evaluate('__OTH_QA.state.elapsed=0');page.wait_for_timeout(60);shot('08_auxiliaires.png')
 scenario(3,'maintenance',760);page.keyboard.down('e');page.wait_for_timeout(1350);page.keyboard.up('e');check('Vanne coupe physiquement la dérivation',page.evaluate('__OTH_QA.state.disabledHazards.includes("aux-steam")'))
 scenario(21,'pump',581);page.keyboard.down('e');page.wait_for_timeout(1490);page.keyboard.up('e');check('Purge utilise une jauge distincte',page.locator('.work-gauge').is_visible());shot('09_pression.png')
 while page.evaluate('__OTH_QA.state.puzzle!==null'):
  action=page.evaluate('OTH_ENGINE.solveWorkAction(__OTH_QA.state)');page.locator('[data-choice="'+action+'"]').click()
 check('Pression réglée et verrouillée',page.evaluate('__OTH_QA.state.completed.length')==22)
 scenario(21,'drain',1120);shot('10_decantation.png')
 scenario(27,'alcove',980);shot('11_alcove.png')
 scenario(39,'medical',1360);shot('12_infirmerie.png');page.locator('[data-panel="crew"]').click();check('Registre équipage distingue les contacts perdus',page.locator('.crew-card.lost').count()==7);shot('13_equipage.png');close()
 scenario(40,'medical',1837);page.keyboard.down('e');page.wait_for_timeout(950);page.keyboard.up('e');check('Programme médical en quatre étapes',page.locator('.work-sequence li').count()==4);shot('14_programme_medical.png');close()
 scenario(42,'dock',1320);check('Ripley portée après incident médical',page.evaluate('__OTH_QA.state.flags.carryRipley'));shot('15_evacuation.png')
 fuel=page.evaluate('__OTH_QA.state.player.fuel');page.keyboard.press('f');page.wait_for_timeout(40);check('Flamme interdite pendant le portage',page.evaluate('__OTH_QA.state.player.fuel')==fuel)
 scenario(46,'dock',1150);shot('16_quai_libere.png')
 scenario(47,'cockpit',1279);page.keyboard.down('e');page.wait_for_timeout(1460);page.keyboard.up('e');check('Transmission possède un accord de porteuse',page.locator('.work-gauge').is_visible());shot('17_transmission.png')
 while page.evaluate('__OTH_QA.state.puzzle!==null'):
  action=page.evaluate('OTH_ENGINE.solveWorkAction(__OTH_QA.state)');page.locator('[data-choice="'+action+'"]').click()
 page.wait_for_timeout(120);check('Dernière transmission clôt la campagne',page.locator('#oth-dialog-title').inner_text()=='Dernière transmission');shot('18_conclusion.png')
 # Actual export, import and checkpoint from controls.
 scenario(10,'workshop',700);page.keyboard.press('Escape');page.locator('#oth-difficulty').select_option('normal');check('Difficulté réglable',page.evaluate('__OTH_QA.state.difficulty')=='normal')
 with page.expect_download() as dl:page.locator('[data-action="export-save"]').click()
 exported=R/'qa/browser-export-v02.json';dl.value.save_as(str(exported));check('Export schema 3 avec progression',json.loads(exported.read_text())['schema']==10 and len(json.loads(exported.read_text())['completed'])==10)
 page.locator('#oth-import').set_input_files(str(exported));page.wait_for_timeout(70);check('Import reprend le carnet',page.evaluate('__OTH_QA.state.completed.length')==10)
 if not native:check('Autres sauvegardes préservées',page.evaluate("__OTH_TEST_STORE.get('frontier:save')==='untouched' && __OTH_TEST_STORE.get('mire:alien-original')==='untouched'"))
 page.evaluate('__OTH_QA.state.dead=true');page.wait_for_timeout(80);page.locator('[data-action="retry"]').click();check('Reprise au checkpoint conserve progression',page.evaluate('__OTH_QA.state.completed.length')==10 and not page.evaluate('__OTH_QA.state.dead'))
 page.keyboard.press('m');now=page.evaluate('__OTH_QA.state.elapsed');page.wait_for_timeout(100);check('Plan en pause',page.evaluate('__OTH_QA.state.elapsed')==now);shot('19_plan.png');close()
 for width,height in [(1280,720),(800,600),(390,844)]:
  page.set_viewport_size({'width':width,'height':height});scenario(0,'rec',800);page.wait_for_timeout(100)
  dim=page.evaluate('''()=>({scroll:document.documentElement.scrollWidth,w:innerWidth,h:innerHeight,canvas:document.querySelector('canvas').getBoundingClientRect().toJSON()})''');check(f'Mise en page {width}×{height}',dim['scroll']<=width and dim['canvas']['width']<=width,dim)
  if width==390:
   shot('20_mobile.png');check('Commandes tactiles visibles',page.locator('.oth-touch').is_visible());start=page.evaluate('__OTH_QA.state.player.x');button=page.locator('[data-touch="d"]');box=button.bounding_box();page.mouse.move(box['x']+8,box['y']+8);page.mouse.down();page.wait_for_timeout(220);page.mouse.up();check('Commande pointer maintenue déplace le personnage',page.evaluate('__OTH_QA.state.player.x')>start+5)
 page.set_viewport_size({'width':1600,'height':1000});scenario(12,'boarding',1100);page.evaluate('''()=>{const s=__OTH_QA.state;s.flags.torchReady=true;const w=OTH_ENGINE.roomWorld(s);w.enemies[0].x=1230;w.enemies[0].y=88;}''');page.keyboard.down('f');page.wait_for_timeout(100);shot('21_contact.png');page.keyboard.up('f');check('Flamme et contact présents',page.evaluate('__OTH_QA.state.player.fuel')<65)
 check('Aucune exception JavaScript',not errors,errors)
 # Render median frame gap as a measured sample, not a guarantee of player-machine performance.
 sample=page.evaluate('''()=>new Promise(resolve=>{const xs=[];let last=performance.now();function f(t){xs.push(t-last);last=t;if(xs.length<80)requestAnimationFrame(f);else resolve(xs.slice(1).sort((a,b)=>a-b)[39]);}requestAnimationFrame(f)})''');notes.append('Intervalle médian sur 79 frames en contexte test : '+str(round(sample,2))+' ms')
 b.close()
result={'suite':'chromium-v0.2-regression-on-v0.3','method':'native-navigation' if native else 'set_content + explicit in-memory localStorage double','nativeBrowserNavigation':native,'notes':notes,'tests':len(checks),'passed':sum(x['ok'] for x in checks),'failed':sum(not x['ok'] for x in checks),'checks':checks}
(R/'qa/browser-results-v02.json').write_text(json.dumps(result,indent=2,ensure_ascii=False));print(json.dumps(result,indent=2,ensure_ascii=False));
if result['failed']:raise SystemExit(1)
