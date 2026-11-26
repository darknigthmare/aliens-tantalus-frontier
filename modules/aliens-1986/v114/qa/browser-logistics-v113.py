"""Actual Chromium UI, unmodified distributed Blob loader. Imported test points
are unedited exports from the public-input logistics playthrough. No engine hook."""
from pathlib import Path
import json,hashlib
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parent.parent;HTML=(R/'JOUER_ALIENS_V113.html').read_text();CAP=R/'report/captures-v113';results=[];captures=[];errors=[];console=[];requests=[]
def flush():
 (R/'report/browser-logistics-v113.json').write_text(json.dumps({'tests':results,'captures':captures,'pageErrors':errors,'consoleErrors':console,'requests':requests,'htmlSHA256':hashlib.sha256(HTML.encode()).hexdigest(),'nativeTantalus':False},ensure_ascii=False,indent=2))
def ck(name,ok,detail=None):
 results.append({'name':name,'ok':bool(ok),'detail':detail});flush();print(name,bool(ok),flush=True);assert ok,(name,detail)
def saved(name):return json.loads((R/'report/logistics-states-v113'/f'{name}.json').read_text())
def export(pg):
 if not pg.locator('#pause-panel').is_visible():pg.locator('#pause-open').click()
 with pg.expect_download() as d:pg.locator('#export').click()
 return json.loads(Path(d.value.path()).read_text())
def load(pg,d):
 if not pg.locator('#pause-panel').is_visible():pg.locator('#pause-open').click()
 pg.locator('#import-file').set_input_files({'name':'point.json','mimeType':'application/json','buffer':json.dumps(d).encode()});pg.wait_for_timeout(70)
def resume(pg):pg.locator('#pause-panel [data-close]').first.click()
def shot(pg,name,origin):
 # Toast is transient UI; waiting for it would advance combat. Leave it as rendered.
 pg.screenshot(path=str(CAP/name));captures.append({'file':name,'origin':origin,'htmlSHA256':hashlib.sha256(HTML.encode()).hexdigest(),'nativeTantalus':False,'imageEdited':False});flush()
def p(s):return next(a for a in s['team'] if a['id']=='ripley')
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox']);pg=b.new_page(viewport={'width':1440,'height':980},accept_downloads=True);pg.set_default_timeout(8000)
 pg.on('pageerror',lambda e:errors.append(str(e)));pg.on('console',lambda e:console.append(e.text) if e.type=='error' else None);pg.on('request',lambda r:requests.append(r.url) if r.url.startswith(('https:','http:')) else None)
 pg.set_content(HTML);pg.locator('[data-sector]').first.wait_for(state='attached');ck('Dix inspections visibles dans le catalogue',pg.locator('[data-sector]').count()==10);pg.locator('#start-operation').click()
 d=saved('02-galerie-arrivee');load(pg,d);ck('Reprise exacte à la nouvelle galerie',export(pg)==d);resume(pg);pg.wait_for_timeout(70);shot(pg,'16_galerie_entree.png','Export intact 02-galerie-arrivee du parcours public V113, puis reprise dans Chromium')
 d=saved('04-stock-munitions');load(pg,d);resume(pg);pg.wait_for_timeout(80);shot(pg,'17_galerie_stock_ouvert.png','Export intact 04-stock-munitions : caisse ouverte et réserve déjà gagnée par le pilote')
 ck('Réserve affichée et HUD hors scène', '3 lots' in pg.locator('#stock-counts').inner_text() and pg.locator('#scene').bounding_box()['y']+pg.locator('#scene').bounding_box()['height']<=pg.locator('#logisticsbar').bounding_box()['y']+.5)
 # Reusing E on the same already-open crate cannot grant another supply.
 pg.keyboard.press('e');pg.wait_for_timeout(90);after=export(pg);ck('E sur caisse vide ne duplique pas les lots',after['logistics']['inventory']['ammo']==3 and after['logistics']['collected']==d['logistics']['collected'])
 load(pg,d);resume(pg);pg.keyboard.press('b');pg.wait_for_timeout(130);pending=export(pg);ck('B commence un vrai ravitaillement',pending['action'] is not None and pending['action']['kind']=='ammo');ck('Aucun lot déduit avant fin',pending['logistics']['inventory']['ammo']==3 and p(pending)['ammo']==p(d)['ammo'])
 pg.wait_for_timeout(250);ck('Pause conserve temps de travail et réserves',export(pg)==pending)
 resume(pg);pg.keyboard.down('a');pg.wait_for_timeout(100);pg.keyboard.up('a');cancel=export(pg);ck('Marche annule lot sans le dépenser',cancel['action'] is None and cancel['logistics']['inventory']['ammo']==3)
 load(pg,d);resume(pg);pg.locator('#field-ammo').click();pg.wait_for_timeout(1050);resup=export(pg);ck('Bouton ravitailler crédite exactement 18 cartouches',p(resup)['ammo']==p(d)['ammo']+18 and resup['logistics']['inventory']['ammo']==2)
 # Medical treatment starts from a genuine wound produced by an enemy in the driver.
 d=saved('06-secours-collectes');load(pg,d);ck('Blessure réelle et soins non consommés à la reprise',p(d)['hp']<100 and d['logistics']['inventory']['medical']==2);resume(pg);pg.locator('#field-medical').click();pg.wait_for_timeout(210);shot(pg,'18_soin_action_reelle.png','Export intact 06-secours-collectes (blessure réelle), puis clic Soigner dans Chromium');med=export(pg);ck('Soigner engage une action de 1,6 seconde',med['action']['kind']=='medical' and med['action']['duration']==1.6);ck('La vie ne remonte pas avant la fin',p(med)['hp']==p(d)['hp'])
 resume(pg);pg.keyboard.press('f');pg.wait_for_timeout(70);hit=export(pg);ck('Tirer interrompt le soin et garde la trousse',hit['action'] is None and hit['logistics']['inventory']['medical']==2 and p(hit)['hp']==p(d)['hp'])
 load(pg,med);ck('Import reprend le geste médical au même temps',export(pg)==med);resume(pg);pg.wait_for_timeout(1700);healed=export(pg);ck('Soin terminé plafonné à 100 et une trousse utilisée',p(healed)['hp']==min(100,p(d)['hp']+30) and healed['logistics']['inventory']['medical']==1);resume(pg);pg.wait_for_timeout(40);shot(pg,'19_reserve_apres_soin.png','Même traitement commencé par clic, import du point au milieu du geste puis fin réelle')
 # Strict import controls: use a known-good paused state for atomic equality.
 load(pg,healed)
 for title,mut in [('lot inventé',lambda r:r['logistics']['inventory'].__setitem__('ammo',9)),('alarme immortelle',lambda r:r['logistics']['alarms']['reserve-alarm'].__setitem__('remaining',99)),('stock inconnu',lambda r:r['logistics']['collected'].append('infinite')),('propriété de soin inconnue',lambda r:r['logistics'].__setitem__('godmode',True))]:
  bad=json.loads(json.dumps(healed));mut(bad);load(pg,bad);ck('Import refuse '+title+' sans mutation',export(pg)==healed)
 # The real alarm is started at the exact reachable position saved by public inputs.
 d=saved('09-diagnostic-actif');load(pg,d);ck('État sirène/recharge restauré exactement',export(pg)==d);resume(pg);pg.wait_for_timeout(160);shot(pg,'20_sirene_diagnostic.png','Export intact 09-diagnostic-actif, sirène poursuivie dans Chromium');pg.keyboard.press('e');pg.wait_for_timeout(60);blocked=export(pg);ck('E ne relance pas une sirène pendant recharge',blocked['logistics']['alarms']['reserve-alarm']['activations']==1)
 ck('Le bruit de diagnostic existe dans la simulation',any(n['kind']=='diagnostic' for n in blocked['contacts']['noises']))
 resume(pg);pg.wait_for_timeout(800);ticking=export(pg);ck('Durée alarme décroît réellement',ticking['logistics']['alarms']['reserve-alarm']['remaining']<blocked['logistics']['alarms']['reserve-alarm']['remaining'])
 ck('L’alarme n’a ajouté aucune identité ennemie',sum(len(w['actors']) for w in ticking['worlds'].values())==sum(len(w['actors']) for w in d['worlds'].values()))
 # Midway sentry treatment snapshot came from gameplay, then is continued by the UI.
 d=saved('13-cartouche-en-cours');load(pg,d);ck('Geste cartouche exact à la reprise',export(pg)==d);resume(pg);pg.wait_for_timeout(130);shot(pg,'21_sentinel_ravitaillement.png','Export intact 13-cartouche-en-cours puis animation et reprise dans Chromium');pg.wait_for_timeout(1250);ss=export(pg);sa=next(a for a in ss['worlds']['v106-sentry']['actors'] if a['id']=='sentry-a');old=next(a for a in d['worlds']['v106-sentry']['actors'] if a['id']=='sentry-a');ck('Cartouche crédite 40 au maximum 120, une seule fois',sa['ammo']==min(120,old['ammo']+40) and ss['logistics']['inventory']['sentry']==0)
 ck('Newt reste sans arme après la logistique',next(a for a in ss['team'] if a['id']=='newt')['ammo']==0)
 resume(pg);pg.locator('#field-target').select_option('newt');ck('Ravitaillement Newt désactivé dans l’interface',pg.locator('#field-ammo').is_disabled())
 # Map and finale really load generated operation snapshots.
 d=saved('12-newt-operations');load(pg,d);resume(pg);pg.keyboard.press('m');ck('Carte montre la boucle sans acteurs ennemis',pg.locator('#map-panel').is_visible() and 'logistics-pursuer' not in pg.locator('#map-panel').inner_text());shot(pg,'22_carte_boucle_service.png','Carte ouverte avec M après visite réelle des sept lieux dans le parcours public')
 pg.locator('#map-panel [data-close]').click();pg.keyboard.press('Tab');ck('Archives contiennent les règles logistiques', 'Voie logistique' in pg.locator('#codex-content').inner_text() and not pg.locator('#scene').is_visible());pg.locator('#codex-panel [data-close]').click()
 d=saved('15-repli-boucle');load(pg,d);resume(pg);ck('Opération complète affiche bilan logistique réel',pg.locator('#complete-panel').is_visible() and '3/3 stocks' in pg.locator('#debrief').inner_text());shot(pg,'23_bilan_logistique.png','État final intact du parcours public de la boucle avec les réserves restantes')
 # V108 migration via the actual file input, not a direct engine API.
 legacy=json.loads((R/'report/states-v108/04-newt.json').read_text());pg.set_content(HTML);pg.locator('#start-operation').click();load(pg,legacy);new=export(pg);ck('Migration V108 réelle sans soin ni munitions',new['schema']==113 and [(a['id'],a['hp'],a['ammo']) for a in new['team']]==[(a['id'],a['hp'],a['ammo']) for a in legacy['team']]);ck('Migration V108 ne donne aucun stock',new['logistics']['inventory']=={'ammo':0,'medical':0,'sentry':0})
 # Responsive visual and input accessibility; not a physical phone certificate.
 load(pg,saved('06-secours-collectes'));resume(pg);pg.set_viewport_size({'width':844,'height':390});pg.wait_for_timeout(180)
 boxes={id:pg.locator('#'+id).bounding_box() for id in ['hud','scene','contactbar','logisticsbar','squadbar','footer']}
 ck('Barre logistique hors terrain 844×390',boxes['scene']['y']+boxes['scene']['height']<=boxes['logisticsbar']['y']+.5 and boxes['scene']['height']>80,boxes);ck('Aucun débordement horizontal V113',pg.evaluate('document.documentElement.scrollWidth<=innerWidth'))
 shot(pg,'24_logistique_844x390.png','Viewport Chromium émulé 844×390, même document et état réel de réserve')
 pg.set_viewport_size({'width':390,'height':844});pg.wait_for_timeout(100);ck('Barre logistique reste visible en portrait',pg.locator('#field-medical').is_visible() and pg.locator('#scene').bounding_box()['height']>100);ck('Portrait sans débordement horizontal',pg.evaluate('document.documentElement.scrollWidth<=innerWidth'))
 ck('Aucune requête externe nécessaire',not requests,requests);ck('Aucune erreur JavaScript ou console',not errors and not console,{'page':errors,'console':console});b.close()
flush();print(json.dumps({'passed':len(results),'captures':len(captures)}))
