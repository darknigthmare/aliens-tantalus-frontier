"""V0.8 UI/replay/portable-memory validation. Prepared scenarios are labelled.
No implicit or generated progression is presented as a human playthrough.
"""
from pathlib import Path
import json,hashlib,shutil,traceback
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parents[1];CAP=R/'captures';checks=[];errors=[];shots=[];notes=[]
def check(name,ok,detail=None):
 checks.append(dict(name=name,ok=bool(ok),detail=detail));print('CHECK',bool(ok),name,flush=True)
with sync_playwright() as p:
 b=p.chromium.launch(executable_path=shutil.which('chromium'),args=['--no-sandbox']);page=b.new_page(viewport={'width':1600,'height':1000});native=False
 page.on('pageerror',lambda e:errors.append(str(e)))
 for url in ['http://127.0.0.1:4188/?qa=1',(R/'JOUER_HORS_DES_OMBRES.html').as_uri()+'?qa=1']:
  try:page.goto(url,timeout=3500);native=True;break
  except Exception as e:notes.append(str(e).split('\n')[0])
 if not native:
  page.close();page=b.new_page(viewport={'width':1600,'height':1000});page.on('pageerror',lambda e:errors.append(str(e)))
  page.evaluate("()=>{window.__OTH_TEST_CONTEXT=true;window.__TEST_STORE=new Map([['other-dlc','preserved']]);Object.defineProperty(window,'localStorage',{value:{getItem:k=>__TEST_STORE.get(k)||null,setItem:(k,v)=>__TEST_STORE.set(k,String(v)),removeItem:k=>__TEST_STORE.delete(k)}});}")
  page.set_content((R/'JOUER_HORS_DES_OMBRES.html').read_text())
 page.set_default_timeout(7000)
 def ev(expr):return page.evaluate(expr)
 def state(expr=''):return ev('__OTH_QA.state'+expr)
 def shot(name,caption):
  page.screenshot(path=str(CAP/name));shots.append(dict(file=name,caption=caption,method='V0.8 Chromium actual rendering; source / preparation stated in caption.'))
 def close():page.keyboard.press('Escape');page.wait_for_timeout(40)
 def library():
  if page.locator('dialog[open]').count():page.locator('dialog button[data-close]').first.click() if page.locator('dialog button[data-close]').count() else ev('__OTH_QA.close()')
  page.keyboard.press('p');page.wait_for_timeout(60)
 try:
  check('Document V0.8 et schéma 8 chargés',page.title().endswith('Le Marion, pièce par pièce') and state('.schema')==10)
  shot('88_menu_memoires.png','Écran titre V0.8 sans préparation de progression. Le nouveau carnet des chapitres est accessible depuis le menu.')
  page.locator('[data-action="continue"]').click();page.wait_for_timeout(150);page.keyboard.press('p')
  check('Une vraie entrée créée au début du jeu, quinze non enregistrées',page.locator('button[data-chapter]:enabled').count()==1 and page.locator('button[data-chapter]:disabled').count()==15)
  check('Le premier instantané contient une vignette de rendu local',page.locator('.chapter-card img').count()==1 and page.locator('.chapter-card img').get_attribute('src').startswith('data:image/webp;base64,'))
  check('Les scènes futures restent anonymes',page.locator('button[data-sequence]:disabled').count()==11 and 'La Delilah' not in page.locator('dialog').inner_text())
  shot('89_premiere_entree.png','Début d’une nouvelle partie : seule la première entrée est enregistrée. Sa vignette provient du moteur ; aucun ancien chapitre n’est reconstruit.')
  before=dict(completed=state('.completed'),room=state('.room'),player=state('.player'),elapsed=state('.elapsed'))
  page.locator('button[data-sequence="marion"]').click();page.wait_for_timeout(300)
  check('Ouverture du prologue depuis la galerie',ev('__OTH_QA.scene')=='marion' and page.locator('.sequence-caption').is_visible())
  check('La simulation est gelée pendant la séquence',state('.elapsed')==before['elapsed'])
  shot('90_marion_orbite.png','Premier tableau du prologue, ouvert depuis la galerie. Vue extérieure mise en scène avec le code du jeu, pas une zone pilotable ni une image officielle.')
  page.keyboard.press('Enter');check('Entrée passe au contrechamp', '2 / 3' in page.locator('.sequence-shot').inner_text())
  page.keyboard.press('ArrowLeft');check('La touche gauche revient au tableau précédent','1 / 3' in page.locator('.sequence-shot').inner_text())
  page.keyboard.press(' ');page.keyboard.press(' ');check('Espace avance sans agir sur le terrain','3 / 3' in page.locator('.sequence-shot').inner_text())
  page.keyboard.press('Escape');check('Échap retourne à la galerie',page.locator('.chapter-library').is_visible() and ev('__OTH_QA.scene') is None)
  check('La galerie ne donne ni objectifs, ni ressource, ni déplacement',state('.completed')==before['completed'] and state('.room')==before['room'] and state('.player')==before['player'])
  if not native:
   oldplayer=state('.player')
   ev("()=>{window.__goodSet=localStorage.setItem;localStorage.setItem=()=>{throw new Error('Quota test');};}")
   page.locator('button[data-chapter="0"]').click();page.wait_for_timeout(60)
   check('Échec de sauvegarde principale : pas de bascule ni perte de position',ev('__OTH_QA.session')=='campaign' and state('.player')==oldplayer and 'non ouverte' in page.locator('dialog').inner_text())
   ev('__OTH_QA.state.player.fuel=37')
   with page.expect_download() as recovery:page.locator('dialog [data-action="export-memories"]').click()
   recovery_path=R/'qa/MEMOIRES_QUOTA_RECOVERY_V08.json';recovery.value.save_as(str(recovery_path))
   recovery_bundle=json.loads(recovery_path.read_text())
   check('Export complet malgré quota : ressources actuelles, pas un ancien carnet',json.loads(recovery_bundle['campaign'])['player']['fuel']==37)
   ev('()=>{localStorage.setItem=__goodSet;}')
  # Isolated replay: one naturally-recorded entry, then normal controls and export.
  page.locator('button[data-chapter="0"]').click();page.wait_for_timeout(100)
  main=ev('localStorage.getItem(OTH_DATA.DATA.saveKey)');cp=ev('localStorage.getItem(OTH_DATA.DATA.saveKey+":checkpoint-v2")')
  check('Rejouer bascule dans une session indépendante',ev('__OTH_QA.session')=='replay')
  page.keyboard.down('d');page.wait_for_timeout(280);page.keyboard.up('d');ev('__OTH_QA.save()')
  check('Déplacement de répétition sans écriture du carnet principal',ev('localStorage.getItem(OTH_DATA.DATA.saveKey)')==main)
  check('Point de reprise principal inchangé en répétition',ev('localStorage.getItem(OTH_DATA.DATA.saveKey+":checkpoint-v2")')==cp)
  check('Le créneau de répétition reçoit son propre état',ev('!!localStorage.getItem(OTH_DATA.DATA.saveKey+":replay-v8")'))
  shot('91_repetition_separee.png','Répétition réellement ouverte depuis l’entrée enregistrée du chapitre 1, puis déplacement au clavier. Le HUD nomme la session séparée.')
  page.keyboard.press('Escape')
  with page.expect_download() as dl:page.locator('dialog [data-action="export-save"]').click()
  dest=R/'qa/REPETITION_EXPORT_V08.json';dl.value.save_as(str(dest));check('Export de répétition nommé et sérialisé séparément',dl.value.suggested_filename=='REPETITION_MARION.json' and json.loads(dest.read_text())['schema']==10)
  # Import and retry remain scoped to the replay, even with a later-chapter test save.
  replay_save=ev("(()=>{const s=OTH_ENGINE.createState();s.completed=OTH_DATA.DATA.chapters.flatMap(c=>c.objectives).slice(0,6).map(o=>o.id);return OTH_ENGINE.serialize(OTH_ENGINE.restore(OTH_ENGINE.serialize(s)));})()")
  page.locator('#oth-import').set_input_files({'name':'later-replay.json','mimeType':'application/json','buffer':replay_save.encode()});page.wait_for_timeout(140)
  check('Importer un carnet dans la répétition ne remplace pas la campagne',len(state('.completed'))==6 and ev('localStorage.getItem(OTH_DATA.DATA.saveKey)')==main)
  ev('__OTH_QA.state.dead=true');page.wait_for_timeout(90);page.locator('dialog [data-action="retry"]').click();page.wait_for_timeout(90)
  check('Échec et reprise restent dans le point de contrôle de répétition',ev('__OTH_QA.session')=='replay' and len(state('.completed'))==6 and ev('localStorage.getItem(OTH_DATA.DATA.saveKey)')==main)
  page.keyboard.press('Escape');page.locator('dialog [data-action="return-campaign"]').click();page.wait_for_timeout(60)
  check('Retour au carnet principal à sa vraie progression',ev('__OTH_QA.session')=='campaign' and state('.completed')==json.loads(main)['completed'] and state('.player.x')==json.loads(main)['player']['x'])
  # Automatic sequence is triggered by an actual held interaction, after explicit fixture placement.
  ev("()=>{let s=OTH_ENGINE.createState();s.completed=OTH_DATA.DATA.chapters.flatMap(c=>c.objectives).slice(0,4).map(o=>o.id);s.room='breach';s=OTH_ENGINE.restore(OTH_ENGINE.serialize(s));const o=OTH_ENGINE.currentObjective(s),node=OTH_ENGINE.ROOM.breach.nodes.find(n=>n.id===o.node);s.player.x=node.x;s.player.y=node.y;__OTH_QA.replace(s);}")
  page.wait_for_timeout(180);page.keyboard.down('e');page.wait_for_function('__OTH_QA.scene==="delilah"');page.keyboard.up('e')
  check('Cinquième objectif validé par E puis séquence automatique',len(state('.completed'))==5 and ev('__OTH_QA.scene')=='delilah')
  shot('92_impact_delilah.png','État préparé juste avant le cinquième objectif. E maintenu termine la cloison ; la scène de la Delilah s’ouvre ensuite automatiquement.')
  frozen=state('.elapsed');page.wait_for_timeout(450);check('La scène automatique ne laisse pas tourner les menaces',state('.elapsed')==frozen)
  page.keyboard.press('Escape');page.wait_for_timeout(120);check('Passer une scène ne termine pas l’objectif suivant',len(state('.completed'))==5 and ev('__OTH_QA.scene') is None)
  page.keyboard.press('Escape');page.locator('#oth-sequences').uncheck();page.locator('#oth-caption-scale').select_option('1.4');page.locator('#oth-motion').check()
  check('Préférences de séquences, texte et mouvement accessibles',not state('.presentation.enabled') and state('.presentation.captionScale')==1.4 and state('.reducedMotion'))
  close()
  # Gallery fixture assembled ONLY from snapshots actually produced by the simulated campaign.
  trace=json.loads((R/'qa/playthrough-normal.json').read_text());final=trace['captures']['final'];final['presentation']['enabled']=False;final['presentation']['pending']=[]
  page.evaluate('(s)=>__OTH_QA.replace(OTH_ENGINE.restore(JSON.stringify(s)))',final);ev('__OTH_QA.pause()');page.locator('dialog [data-panel="chronicle"]').click()
  # We inject recorded entries for the gallery rendering test; this is not claimed as UI-played progression.
  for i in range(16):
   page.evaluate("([raw,i])=>{const s=OTH_ENGINE.restore(JSON.stringify(raw)),e=OTH_ENGINE.chapterEntry(s);if(!e)throw new Error('missing start');localStorage.setItem(OTH_DATA.DATA.saveKey+':chapter-v8:'+String(i).padStart(2,'0'),JSON.stringify(e));}",[trace['captures']['chapter-'+str(i)],i])
  page.locator('dialog [data-panel="summary"]').click();page.locator('dialog [data-panel="chronicle"]').click()
  check('Seize entrées issues du parcours moteur sont proposées',page.locator('button[data-chapter]:enabled').count()==16)
  check('Douze séquences déverrouillées après la vraie fin du parcours moteur',page.locator('button[data-sequence]:enabled').count()==12)
  check('Avertissement de quota effacé après une reprise réussie',page.locator('dialog .save-alert').count()==0)
  shot('93_bibliotheque_complete.png','Bibliothèque préparée avec les seize instantanés du parcours moteur complet. Ce n’est pas une progression effectuée manuellement dans cette fenêtre.')
  ids=ev('OTH_DATA.DATA.sequences.map(s=>s.id)');names={'ripley':'94_ripley.png','cage':'95_cage.png','medical':'96_unite_medicale.png','ash':'97_purge.png','release':'98_narcissus.png','signal':'99_silence.png'}
  for id in ids:
   page.locator(f'button[data-sequence="{id}"]').click();page.wait_for_timeout(70)
   ok=ev('__OTH_QA.scene')==id
   if id in names:shot(names[id],f'Séquence {id} ouverte depuis la galerie d’un carnet terminé. Tableau mis en scène avec une copie détachée ; aucune progression jouable n’est modifiée.')
   for shotno in range(3):
    check(f'{id} · tableau {shotno+1} dessiné et texte lisible',ok and page.locator('.sequence-canvas').evaluate('(e)=>e.width>0&&e.height>0') and len(page.locator('.sequence-caption p').inner_text())>20)
    page.keyboard.press('Enter');page.wait_for_timeout(60)
   check(f'{id} · retour correct après les trois tableaux',ev('__OTH_QA.scene') is None and page.locator('.chapter-library').is_visible())
  ev('__OTH_QA.pause()');page.locator('#oth-sequence-auto').check();page.locator('dialog [data-panel="chronicle"]').click();page.locator('button[data-sequence="marion"]').click()
  page.wait_for_function("document.querySelector('.sequence-shot')?.textContent.includes('2 / 3')",timeout=11000)
  check('Lecture automatique respecte le délai avant le second tableau',ev('__OTH_QA.scene')=='marion')
  page.keyboard.press('Escape');ev('__OTH_QA.pause()');page.locator('#oth-sequence-auto').uncheck();page.locator('dialog [data-panel="chronicle"]').click()
  if not native:
   ev("()=>{window.__checkpointBase=localStorage.setItem;window.__checkpointWrites=0;localStorage.setItem=(k,v)=>{if(k===OTH_DATA.DATA.saveKey+':checkpoint-v2')__checkpointWrites++;__checkpointBase(k,v);};}")
   page.wait_for_timeout(220)
   check('La fin de campagne ne réécrit pas le point de reprise à chaque image',ev('__checkpointWrites')==0)
   ev("()=>{localStorage.setItem=__checkpointBase;}")
  # Export of all local memories, followed by validation/confirmation and rollback on write failure.
  with page.expect_download() as dl:page.locator('dialog [data-action="export-memories"]').click()
  bundlepath=R/'qa/MEMOIRES_EXPORT_V08.json';dl.value.save_as(str(bundlepath));bundle=json.loads(bundlepath.read_text())
  check('Export portable avec les seize vrais instantanés et le carnet',bundle['format']=='atf-marion-memories' and len(bundle['entries'])==16 and len(json.loads(bundle['campaign'])['completed'])==48)
  page.locator('#oth-import-memories').set_input_files(str(bundlepath));page.wait_for_timeout(100)
  check('Import portable attend une confirmation explicite',page.locator('dialog [data-action="apply-memories"]').is_visible())
  shot('100_confirmation_memoires.png','Fichier des mémoires exporté par le navigateur puis sélectionné pour import. Aucune écriture du paquet avant la confirmation affichée.')
  if not native:
   beforestore=ev('Object.fromEntries(__TEST_STORE)')
   ev("()=>{window.__originalSet=localStorage.setItem;window.__writeFailureHit=false;localStorage.setItem=(k,v)=>{if(k===OTH_DATA.DATA.saveKey+':checkpoint-v2'&&!window.__writeFailureHit){window.__writeFailureHit=true;throw new Error('Quota fixture on import checkpoint');}__originalSet(k,v);};}")
   page.locator('dialog [data-action="apply-memories"]').click();page.wait_for_timeout(80)
   check('Échec de stockage : import annulé et ancienne collection restaurée',ev('__writeFailureHit') and ev('Object.fromEntries(__TEST_STORE)')==beforestore and 'remises en place' in page.locator('dialog').inner_text())
   ev('()=>{localStorage.setItem=__originalSet;}')
  page.locator('#oth-import-memories').set_input_files({'name':'bad.json','mimeType':'application/json','buffer':b'{broken'});page.wait_for_timeout(80)
  check('Un paquet invalide est refusé sans écran de confirmation',not page.locator('dialog [data-action="apply-memories"]').count() and 'Import refusé' in page.locator('dialog').inner_text())
  page.locator('#oth-import-memories').set_input_files(str(bundlepath));page.wait_for_timeout(80);page.locator('dialog [data-action="apply-memories"]').click();page.wait_for_timeout(80)
  check('Import confirmé restaure la campagne et ses mémoires',ev('__OTH_QA.session')=='campaign' and len(state('.completed'))==48)
  ev('__OTH_QA.pause()');page.locator('dialog [data-panel="summary"]').click();check('Bilan principal avec six métriques séparées',page.locator('.journey-metrics article').count()==6);shot('101_bilan.png','Bilan du carnet produit par le parcours moteur complet. Le temps affiché reste un temps de simulation, pas une mesure de durée humaine.')
  page.locator('dialog [data-panel="chronicle"]').click();page.set_viewport_size({'width':390,'height':844});page.wait_for_timeout(80)
  check('Bibliothèque mobile sans dépassement horizontal',ev('document.documentElement.scrollWidth<=innerWidth') and page.locator('.dialog-body').evaluate('(e)=>e.scrollWidth<=e.clientWidth+1'))
  shot('102_memoires_mobile.png','Émulation 390 × 844 : bibliothèque scrollable et boutons de répétition. Pas une certification sur téléphone physique.')
  page.locator('button[data-sequence="medical"]').click();page.wait_for_timeout(100)
  check('Séquence mobile : texte et boutons accessibles par défilement',page.locator('.sequence-caption').is_visible() and ev('document.documentElement.scrollWidth<=innerWidth'))
  shot('103_sequence_mobile.png','Émulation mobile : séquence en lecture manuelle, sous-titres en DOM et commandes défilables.')
  page.keyboard.press('Escape')
  for w,h in [(844,390),(800,600),(1280,720)]:
   page.set_viewport_size({'width':w,'height':h});page.locator('button[data-sequence="release"]').click();page.wait_for_timeout(60)
   check(f'Séquence {w}×{h} ne déborde pas horizontalement',ev('document.documentElement.scrollWidth<=innerWidth') and page.locator('.dialog-body').evaluate('(e)=>e.scrollWidth<=e.clientWidth+1'));page.keyboard.press('Escape')
  if not native:check('Aucune écriture dans la sauvegarde d’un autre DLC',ev('__TEST_STORE.get("other-dlc")==="preserved"'))
  if not native:
   migration_page=b.new_page()
   legacy_raw=(R/'qa/fixtures/legacy-schema-7-chapter-8.json').read_text();legacy=json.loads(legacy_raw)
   migration_page.evaluate("([raw,key])=>{window.__OTH_TEST_CONTEXT=true;window.__MS=new Map([[key,raw]]);Object.defineProperty(window,'localStorage',{value:{getItem:k=>__MS.get(k)||null,setItem:(k,v)=>{if(k.endsWith(':backup-before-v10'))throw new Error('quota backup only');__MS.set(k,String(v));},removeItem:k=>__MS.delete(k)}});}",[legacy_raw,'atf:mire:out-of-shadows:v1'])
   migration_page.set_content((R/'JOUER_HORS_DES_OMBRES.html').read_text());migration_page.wait_for_timeout(120)
   check('Copie de migration refusée : ancien carnet toujours chargé',migration_page.evaluate('__OTH_QA.state.completed')==legacy['completed'] and migration_page.evaluate('__OTH_QA.state.room')==legacy['room'])
   migration_page.locator('button[data-panel="chronicle"]').first.click()
   check('Échec de copie préalable signalé sans annoncer une sauvegarde réussie','copie préalable' in migration_page.locator('dialog').inner_text())
   migration_page.close()
  check('Aucune exception JavaScript',len(errors)==0,errors)
 except Exception as e:
  check('Suite navigateur terminée sans interruption',False,traceback.format_exc());print(traceback.format_exc());page.screenshot(path='/mnt/data/oth08-work/ui-failure.png')
 b.close()
result=dict(version='0.10.0',suite='chromium-v08-memories',tests=len(checks),passed=sum(c['ok'] for c in checks),failed=sum(not c['ok'] for c in checks),htmlSHA256=hashlib.sha256((R/'JOUER_HORS_DES_OMBRES.html').read_bytes()).hexdigest(),nativeNavigation=native,nativePersistenceCertified=False,navigationAttempts=notes,fallback=None if native else 'set_content + explicit in-memory localStorage test double',errors=errors,checks=checks,captures=shots)
(R/'qa/browser-results-v08.json').write_text(json.dumps(result,ensure_ascii=False,indent=2));print(json.dumps(result,ensure_ascii=False,indent=2));
if result['failed']:raise SystemExit(1)
