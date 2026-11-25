"""Real Chromium receipts for V112 engineering. Later points are unedited
exports from drive-breach-v112.mjs (public inputs only). No page mutation hook."""
from pathlib import Path
import json,hashlib
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parent.parent; HTML=(R/'JOUER_ALIENS_V112.html').read_text();CAP=R/'report/captures-v112';CAP.mkdir(exist_ok=True)
results=[];captures=[];errors=[];console=[];requests=[]
def flush():
 (R/'report/browser-engineering-v112.json').write_text(json.dumps({'tests':results,'captures':captures,'pageErrors':errors,'consoleErrors':console,'requests':requests,'htmlSHA256':hashlib.sha256(HTML.encode()).hexdigest(),'nativeTantalus':False},ensure_ascii=False,indent=2))
def ck(name,ok,detail=None):
 results.append({'name':name,'ok':bool(ok),'detail':detail});flush();print(name,bool(ok),flush=True);assert ok,(name,detail)
def saved(name):return json.loads((R/'report/breach-states-v112'/f'{name}.json').read_text())
def export(pg):
 if not pg.locator('#pause-panel').is_visible():pg.locator('#pause-open').click()
 with pg.expect_download() as d:pg.locator('#export').click()
 return json.loads(Path(d.value.path()).read_text())
def load(pg,d):
 if not pg.locator('#pause-panel').is_visible():pg.locator('#pause-open').click()
 pg.locator('#import-file').set_input_files({'name':'operation-110.json','mimeType':'application/json','buffer':json.dumps(d).encode()});pg.wait_for_timeout(65)
def resume(pg):pg.locator('#pause-panel [data-close]').first.click()
def shot(pg,name,origin):
 pg.screenshot(path=str(CAP/name));captures.append({'file':name,'origin':origin,'nativeTantalus':False,'imageEdited':False});flush()
def hp(s):return s['engineering']['links']['residential-ops']
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox']);pg=b.new_page(viewport={'width':1440,'height':980},accept_downloads=True);pg.set_default_timeout(9000)
 pg.on('pageerror',lambda e:errors.append(str(e)));pg.on('console',lambda e:console.append(e.text) if e.type=='error' else None);pg.on('request',lambda r:requests.append(r.url) if r.url.startswith(('http:','https:')) else None)
 pg.set_content(HTML);pg.locator('[data-sector]').first.wait_for(state='attached');pg.locator('#start-operation').click();initial=export(pg)
 ck('Insertion V112 sans plaque offerte',initial['schema']==112 and initial['engineering']['plates']==0 and not initial['engineering']['collected'])
 ck('Onze battants réciproques intacts à l’insertion',len(initial['engineering']['links'])==11 and all(h['hp']==100 and h['brace']==0 and not h['breached'] for h in initial['engineering']['links'].values()))
 # A real saved pursuit: hits proceed while the local team remains behind the panel.
 d=saved('02-premier-impact');load(pg,d);ck('Import exact après le premier choc réel',export(pg)==d)
 pg.wait_for_timeout(240);ck('La pause suspend également la pression hors champ',export(pg)==d)
 resume(pg);pg.wait_for_timeout(140);shot(pg,'25_battant_endommage.png','Export intact 02-premier-impact du parcours de brèche V112, puis reprise brève dans Chromium')
 d=saved('03-pression-engagee');load(pg,d);ck('Préparation ennemie restaurée sans la remettre à zéro',export(pg)==d and any(a and a['phase']=='windup' for a in d['engineering']['attacks'].values()))
 resume(pg);pg.wait_for_timeout(5200);broken=export(pg)
 ck('La pression exécute réellement les impacts restants',hp(broken)['hits']>=4 and hp(broken)['hp']==0)
 ck('Le même sas est désormais traversable et bréché',hp(broken)['breached'] and broken['contacts']['links']['residential-ops']['open'])
 ck('Aucune identité ennemie créée par la brèche',sum(len(w['actors']) for w in broken['worlds'].values())==sum(len(w['actors']) for w in d['worlds'].values()))
 resume(pg);pg.wait_for_timeout(50);shot(pg,'26_breche_sous_pression.png','Export réel de préparation, puis plus de cinq secondes de simulation dans Chromium jusqu’à rupture du battant')
 # Obtain the three plates using the actual crate, no grant through the test.
 d=saved('06a-avant-les-plaques');load(pg,d);resume(pg);pg.keyboard.press('e');pg.wait_for_timeout(240);pending=export(pg)
 ck('E commence le déverrouillage de la caisse de maintenance',pending['action'] and pending['action']['kind']=='engineering-stock' and pending['action']['duration']==1.1)
 ck('Avant fin, aucune plaque créditée',pending['engineering']['plates']==0 and not pending['engineering']['collected'])
 resume(pg);pg.wait_for_timeout(1000);kit=export(pg)
 ck('Collecte terminée : exactement trois plaques',kit['engineering']['plates']==3 and kit['engineering']['collected'] and kit['engineering']['metrics']['stocks']==1)
 resume(pg);pg.keyboard.press('e');pg.wait_for_timeout(70);same=export(pg);ck('La caisse ne recharge pas la réserve une seconde fois',same['engineering']['plates']==3 and same['engineering']['metrics']['stocks']==1)
 resume(pg);pg.wait_for_timeout(60);shot(pg,'27_plaques_recuperees.png','Caisse ouverte par E et attente réelle dans Chromium depuis l’export non modifié 06a-avant-les-plaques')
 # Repair from a paused midpoint that the continuous driver genuinely reached.
 d=saved('07-refection-en-cours');load(pg,d);ck('Réfection exacte à mi-geste et stock non débité',export(pg)==d and d['engineering']['plates']==3)
 resume(pg);pg.wait_for_timeout(150);shot(pg,'28_refection_en_cours.png','Export intact 07-refection-en-cours, geste J poursuivi dans Chromium')
 pg.wait_for_timeout(1720);repaired=export(pg)
 ck('J restaure 100 points et ferme les deux faces',hp(repaired)['hp']==100 and not hp(repaired)['breached'] and not repaired['contacts']['links']['residential-ops']['open'])
 ck('Réfection consomme une seule plaque à la fin',repaired['engineering']['plates']==2 and repaired['engineering']['spent']==1 and repaired['engineering']['metrics']['repaired']==1)
 # Actual O input, paused progress, cancellation by movement and by a shot.
 d=saved('08-refection-terminee');load(pg,d);resume(pg);pg.keyboard.press('o');pg.wait_for_timeout(200);weld=export(pg)
 ck('O engage une soudure réelle de 1,8 seconde',weld['action'] and weld['action']['kind']=='brace' and weld['action']['duration']==1.8)
 ck('Soudure en préparation : plaque toujours disponible',weld['engineering']['plates']==2 and hp(weld)['brace']==0)
 pg.wait_for_timeout(240);ck('Pause garde exactement l’avancement du chalumeau',export(pg)==weld)
 resume(pg);pg.keyboard.down('d');pg.wait_for_timeout(120);pg.keyboard.up('d');cancel=export(pg)
 ck('Marche interrompt la soudure sans dépenser la plaque',cancel['action'] is None and cancel['engineering']['plates']==2 and hp(cancel)['brace']==0)
 load(pg,weld);resume(pg);pg.keyboard.press('f');pg.wait_for_timeout(70);cancel=export(pg)
 ck('Tirer interrompt aussi la soudure',cancel['action'] is None and cancel['engineering']['plates']==2)
 # Button path independent of keyboard path; exact user export resumes.
 load(pg,d);resume(pg);pg.locator('#brace-hatch').click();pg.wait_for_timeout(180);shot(pg,'29_soudure_chalumeau.png','Clic Renforcer depuis le point réel après réfection ; travail visible, avant consommation de la plaque')
 mid=export(pg);load(pg,mid);ck('Export/import réel ne remet pas le geste à zéro',export(pg)==mid)
 resume(pg);pg.wait_for_timeout(1930);welded=export(pg)
 ck('Soudure finie : 72 de renfort et une plaque dépensée',hp(welded)['brace']==72 and welded['engineering']['plates']==1 and welded['engineering']['spent']==2)
 resume(pg);pg.keyboard.press('r');pg.wait_for_timeout(60);refused=export(pg)
 ck('R ne traverse pas le renfort soudé',not refused['contacts']['links']['residential-ops']['open'] and refused['action'] is None and hp(refused)['brace']==72)
 resume(pg);pg.wait_for_timeout(60);shot(pg,'30_sas_soude.png','Soudure terminée dans Chromium ; tentative R refusée, battant fermé et plaque visible')
 ck('Renforcer déjà renforcé est désactivé',pg.locator('#brace-hatch').is_disabled())
 pg.keyboard.press('u');pg.wait_for_timeout(160);cut=export(pg)
 ck('U démarre une découpe de 1,4 seconde',cut['action'] and cut['action']['kind']=='cut-brace' and cut['action']['duration']==1.4)
 ck('Découpe en cours ne libère pas encore le passage',not cut['contacts']['links']['residential-ops']['open'] and hp(cut)['brace']==72)
 resume(pg);pg.wait_for_timeout(180);shot(pg,'31_decoupe_en_cours.png','Découpe déclenchée par U dans Chromium depuis la soudure achevée')
 pg.wait_for_timeout(1380);opened=export(pg)
 ck('Découpe finie : sas ouvert sans plaque rendue',opened['contacts']['links']['residential-ops']['open'] and hp(opened)['brace']==0 and opened['engineering']['plates']==1 and opened['engineering']['metrics']['cut']==1)
 # Bad input files cannot partially overwrite valid operation state.
 load(pg,opened)
 for title,mut in [('plaque inventée',lambda d:d['engineering'].__setitem__('plates',99)),('renfort au-delà de sa capacité',lambda d:d['engineering']['links']['residential-ops'].__setitem__('brace',900)),('battant indestructible',lambda d:d['engineering']['links']['residential-ops'].__setitem__('hp',101)),('champ génie inconnu',lambda d:d['engineering'].__setitem__('unlimited',True)),('pression avec acteur inconnu',lambda d:d['engineering']['attacks'].__setitem__('fake-contact',None))]:
  bad=json.loads(json.dumps(opened));mut(bad);load(pg,bad);ck('Import refuse '+title+' sans mutation',export(pg)==opened)
 # Exact valid V109 source migration uses the real file input.
 legacy=json.loads((R/'report/logistics-states/04-stock-munitions.json').read_text());load(pg,legacy);m=export(pg)
 ck('V109 migre vers V112 en gardant équipe et ressources',m['schema']==112 and [(a['id'],a['hp'],a['ammo']) for a in m['team']]==[(a['id'],a['hp'],a['ammo']) for a in legacy['team']] and m['logistics']==legacy['logistics'])
 ck('La migration ne donne aucune plaque et aucune réparation gratuite',m['engineering']['plates']==0 and not m['engineering']['collected'] and all(h['hp']==100 and h['brace']==0 for h in m['engineering']['links'].values()))
 # No radar is exposed by maps/codex.
 load(pg,saved('10-renfort-soude'));resume(pg);pg.keyboard.press('m');mt=pg.locator('#map-panel').inner_text()
 ck('Carte de liaisons sans identités ou attaques ennemies',pg.locator('#map-panel').is_visible() and 'warrior-a' not in mt and 'remaining' not in mt)
 pg.locator('#map-panel [data-close]').click();pg.keyboard.press('Tab');ct=pg.locator('#codex-content').inner_text()
 ck('Archives décrivent les nouvelles règles sans recouvrir le terrain','Tenir les accès' in ct and 'trois plaques' in ct and not pg.locator('#scene').is_visible())
 pg.locator('#codex-panel [data-close]').click()
 load(pg,saved('13-repli-apres-breche'));resume(pg)
 ck('Repli terminé inclut la dépense réelle des plaques',pg.locator('#complete-panel').is_visible() and ('plaque' in pg.locator('#debrief').inner_text().lower()))
 shot(pg,'32_repli_genie.png','Export final intact 13-repli-apres-breche du parcours continu, bilan rendu dans Chromium')
 # Mobile CSS shares an instrument slot rather than stealing terrain height.
 pg.set_content(HTML);pg.locator('[data-sector]').first.wait_for(state='attached');pg.locator('#start-operation').click();pg.set_viewport_size({'width':844,'height':390});load(pg,saved('08-refection-terminee'));resume(pg);pg.wait_for_timeout(130)
 pg.locator('#show-engineering').click();pg.wait_for_timeout(80);scene=pg.locator('#scene').bounding_box();bar=pg.locator('#engineeringbar').bounding_box()
 ck('Onglet Génie tactile hors terrain en paysage',scene['height']>130 and scene['y']+scene['height']<=bar['y']+.5,{'scene':scene,'bar':bar})
 ck('Le volet génie remplace les stocks en écran court',pg.locator('#engineeringbar').is_visible() and not pg.locator('#logisticsbar').is_visible())
 shot(pg,'33_genie_844x390.png','Même document, viewport émulé 844×390 ; commutation Réserves → Génie par bouton réel')
 pg.locator('#show-logistics').click();ck('Retour aux réserves sans fermer le jeu',pg.locator('#logisticsbar').is_visible() and not pg.locator('#engineeringbar').is_visible())
 pg.keyboard.press('o');pg.wait_for_timeout(50);ck('Raccourci O expose le bon volet sur écran court',pg.locator('#engineeringbar').is_visible())
 pg.set_viewport_size({'width':390,'height':844});pg.wait_for_timeout(100)
 ck('Portrait sans débordement horizontal',pg.evaluate('document.documentElement.scrollWidth<=innerWidth'))
 ck('Les deux instruments restent disponibles en portrait',pg.locator('#engineeringbar').is_visible() and pg.locator('#logisticsbar').is_visible())
 ck('Aucun téléchargement externe nécessaire',not requests,requests)
 ck('Aucune erreur JavaScript ou console',not errors and not console,{'page':errors,'console':console})
 b.close()
flush();print(json.dumps({'passed':len(results),'captures':len(captures)},indent=2))
