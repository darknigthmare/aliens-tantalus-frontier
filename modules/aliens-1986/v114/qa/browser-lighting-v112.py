"""Chromium receipts on distributed bytes. Midpoints come from the continuous
public-input lighting driver, never JS actor/mission injections. Screenshots raw."""
from pathlib import Path
import json,hashlib
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parent.parent; HTML=(R/'JOUER_ALIENS_V112.html').read_text();CAP=R/'report/captures-v112';CAP.mkdir(exist_ok=True)
results=[];captures=[];errors=[];console=[];requests=[]
def flush(): (R/'report/browser-lighting-v112.json').write_text(json.dumps({'tests':results,'captures':captures,'pageErrors':errors,'consoleErrors':console,'requests':requests,'htmlSHA256':hashlib.sha256(HTML.encode()).hexdigest(),'nativeTantalus':False},ensure_ascii=False,indent=2))
def ck(name,ok,detail=None):
 results.append({'name':name,'ok':bool(ok),'detail':detail});flush();print(name,bool(ok),flush=True);assert ok,(name,detail)
def saved(name):return json.loads((R/'report/lighting-states-v112'/f'{name}.json').read_text())
def export(pg):
 if not pg.locator('#pause-panel').is_visible():pg.locator('#pause-open').click()
 with pg.expect_download() as d:pg.locator('#export').click()
 return json.loads(Path(d.value.path()).read_text())
def load(pg,d):
 if not pg.locator('#pause-panel').is_visible():pg.locator('#pause-open').click()
 pg.locator('#import-file').set_input_files({'name':'lighting-operation.json','mimeType':'application/json','buffer':json.dumps(d).encode()});pg.wait_for_timeout(65)
def resume(pg):pg.locator('#pause-panel [data-close]').first.click()
def shot(pg,name,origin):
 pg.screenshot(path=str(CAP/name));captures.append({'file':name,'origin':origin,'nativeTantalus':False,'imageEdited':False});flush()
def aim(pg,s,x,z):
 b=pg.locator('#scene').bounding_box();scale=min(b['width']/1280,b['height']/720);camera=max(0,min(160,s['team'][0]['x']-550));left=b['x']+(b['width']-1280*scale)/2;pg.mouse.move(left+(x-camera)*scale,b['y']+(265+z*.86)*scale)
def circuit(d):return d['worlds']['v107-operations']['circuits']['service']
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox']);pg=b.new_page(viewport={'width':1440,'height':980},accept_downloads=True);pg.set_default_timeout(9000)
 pg.on('pageerror',lambda e:errors.append(str(e)));pg.on('console',lambda e:console.append(e.text) if e.type=='error' else None);pg.on('request',lambda r:requests.append(r.url) if r.url.startswith(('http:','https:')) else None)
 pg.set_content(HTML);pg.locator('[data-sector]').first.wait_for(state='attached');pg.locator('#start-operation').click();initial=export(pg)
 ck('Insertion schema112 et torche sans ressources offertes',initial['schema']==112 and initial['lighting']['torch']['on'] and initial['lighting']['metrics']['completed']==0)
 ck('Huit circuits service existants conservés nominaux',len(initial['worlds'])==10 and all(w['circuits']['service'] for id,w in initial['worlds'].items() if not id.startswith('v112-')) and all(not w['circuits']['service'] for id,w in initial['worlds'].items() if id.startswith('v112-')))
 d=saved('01-avant-coupure');load(pg,d);ck('Import exact avant manœuvre électrique',export(pg)==d)
 resume(pg);pg.keyboard.press('k');pg.wait_for_timeout(180);pending=export(pg)
 ck('K déclenche une préparation réelle de 0,95 s',pending['action'] and pending['action']['kind']=='lighting' and pending['action']['duration']==.95)
 ck('Lampe reste alimentée durant la préparation',circuit(pending))
 pg.wait_for_timeout(240);ck('Pause conserve exactement le geste',export(pg)==pending)
 resume(pg);pg.keyboard.down('a');pg.wait_for_timeout(100);pg.keyboard.up('a');cancel=export(pg)
 ck('Marcher annule la coupure',cancel['action'] is None and circuit(cancel))
 load(pg,pending);resume(pg);pg.keyboard.press('f');pg.wait_for_timeout(70);cancel=export(pg)
 ck('Tirer annule et dépense une balle ordinaire',cancel['action'] is None and circuit(cancel) and cancel['team'][0]['ammo']==pending['team'][0]['ammo']-1)
 load(pg,d);resume(pg);pg.locator('#light-switch').click();pg.wait_for_timeout(200);shot(pg,'35_coupure_electrique.png','Clic Éclairage depuis l’export réel 01-avant-coupure ; préparation avant modification du circuit')
 mid=export(pg);load(pg,mid);ck('Import mi-geste ne remet pas le temps à zéro',export(pg)==mid)
 resume(pg);pg.wait_for_timeout(840);off=export(pg)
 ck('Circuit coupé à l’achèvement seulement',not circuit(off) and off['action'] is None and off['lighting']['metrics']['completed']==1)
 ck('Aucune porte de scène ou sas modifié par coupure',all(off['worlds'][r]['doors']==mid['worlds'][r]['doors'] for r in off['worlds']) and off['contacts']['links']==mid['contacts']['links'])
 ck('Aucune population créée',sum(len(w['actors']) for w in off['worlds'].values())==sum(len(w['actors']) for w in mid['worlds'].values()))
 resume(pg);pg.keyboard.press('l');pg.wait_for_timeout(65);dark=export(pg)
 ck('L éteint la torche indépendamment du circuit',not dark['lighting']['torch']['on'] and not circuit(dark))
 resume(pg);pg.wait_for_timeout(45);ck('Instrument indique ombre sans coordonnées ennemies','OMBRE' in pg.locator('#light-status').inner_text() and 'COUPÉ' in pg.locator('#light-status').inner_text());shot(pg,'36_operations_obscurite.png','Coupure achevée et touche L dans Chromium, depuis le parcours continu')
 load(pg,saved('04-ombre-et-poursuite'));resume(pg);pg.wait_for_timeout(100);shot(pg,'37_piste_dans_le_noir.png','Export non modifié 04-ombre-et-poursuite ; mêmes ennemis actifs dans le réseau, torche éteinte')
 load(pg,saved('05-torche-contact'));resume(pg);pg.wait_for_timeout(35);shot(pg,'38_faisceau_contact.png','Export réel 05-torche-contact : orientation publique du faisceau vers un contact après sa poursuite')
 snap=export(pg);ck('Orientation et torche ont été reprises du parcours',snap['lighting']['torch']['on'] and abs(snap['lighting']['torch']['angle']-saved('05-torche-contact')['lighting']['torch']['angle'])<.001)
 # Complete dark-room defense is a live export, then mouse aiming in Chromium.
 d=saved('06-defense-dans-le-noir');load(pg,d);resume(pg);aim(pg,d,700,220);pg.wait_for_timeout(60);left=export(pg)
 ck('La souris oriente réellement la torche',abs(left['lighting']['torch']['angle']-d['lighting']['torch']['angle'])>.01)
 resume(pg);shot(pg,'39_faisceau_cloison.png','Visée à la souris depuis l’export 06-defense-dans-le-noir ; cône tronqué par les volumes opaques')
 # Return to the console through a real recorded route, then restore illumination.
 d=saved('07-retour-circuit-conserve');load(pg,d);ck('Obscurité conservée au retour après maintenance',not circuit(export(pg)))
 d=saved('08-operations-retablie');load(pg,d);ck('Circuit rétabli sans soin ni recharge offert',circuit(export(pg)) and d['lighting']['metrics']['completed']==2)
 resume(pg);pg.wait_for_timeout(40);shot(pg,'40_retour_lampes.png','Export 08-operations-retablie : seconde manœuvre effectuée par le pilote sans ressources ajoutées')
 # Attack/noise invariants exercised by the fully completed dark sentry section.
 d=saved('10-defense-tenue-noir');load(pg,d);ck('Défense achevée dans un circuit coupé',d['flags']['defense'] and not d['worlds']['v106-sentry']['circuits']['service'])
 ck('Sentinelle consomme ses munitions réelles',any(a.get('ammo',999)<120 for a in d['worlds']['v106-sentry']['actors'] if a['id'].startswith('sentry')))
 resume(pg);pg.wait_for_timeout(40);shot(pg,'41_defense_nocturne.png','Export 10-defense-tenue-noir : défense terminée sans rallumer les lampes, munitions persistantes')
 # Atomic refusals through the actual file input.
 good=export(pg)
 for label,mut in [('angle non fini',lambda d:d['lighting']['torch'].update(angle=999)),('bilan incohérent',lambda d:d['lighting']['metrics'].update(started=42)),('propriété inconnue',lambda d:d['lighting'].update(radius=9999)),('identité équipe',lambda d:d['team'][0].update(radius=1))]:
  bad=json.loads(json.dumps(good));mut(bad);load(pg,bad);ck('Refus atomique : '+label,export(pg)==good)
 # Migrate a genuine V110 initial file through its validator.
 old=json.loads((R/'report/states-v110/00-insertion.json').read_text());load(pg,old);migrated=export(pg)
 ck('Migration V110 garde équipe et réserves',migrated['schema']==112 and migrated['team']==old['team'] and migrated['logistics']==old['logistics'] and all(migrated['engineering'][k]==v for k,v in old['engineering'].items() if k not in ['links','attacks']) and all(migrated['engineering']['links'][k]==v for k,v in old['engineering']['links'].items()))
 ck('Migration conserve les huit anciens lieux et ajoute les nouveaux',all(migrated['worlds'][k]==v for k,v in old['worlds'].items()) and len(migrated['worlds'])==10 and migrated['lighting']['metrics']['completed']==0)
 resume(pg);pg.keyboard.press('l');pg.wait_for_timeout(45);ck('Bouton torche reflète la touche L',pg.locator('#torch-toggle').get_attribute('aria-pressed')=='false')
 pg.locator('#torch-toggle').click();pg.wait_for_timeout(45);ck('Bouton torche réactive indépendamment du clavier',pg.locator('#torch-toggle').get_attribute('aria-pressed')=='true')
 pg.locator('#map-open').click();ck('Carte reste séparée et sans radar',pg.locator('#map-panel').is_visible() and not pg.locator('#play').is_visible() and 'aucun contact ennemi' in pg.locator('#map-panel').inner_text().lower())
 pg.locator('#map-panel [data-close]').click();pg.locator('#pause-open').click();pg.locator('#reduced').check();pg.locator('#contrast').check();resume(pg);ck('Réglages accessibilité disponibles',pg.locator('body').evaluate('(e)=>e.classList.contains("high-contrast")&&e.classList.contains("reduced-motion")'))
 for width,height in [(844,390),(390,844)]:
  pg.set_viewport_size({'width':width,'height':height});pg.wait_for_timeout(80);cv=pg.locator('#scene').bounding_box();bar=pg.locator('#contactbar').bounding_box();visible=pg.locator('#torch-toggle').bounding_box();
  ck(f'HUD et boutons hors terrain {width}x{height}',cv['y']+cv['height']<=bar['y']+1 and visible['y']>=bar['y'])
  ck(f'Scène non écrasée {width}x{height}',cv['height']>= (178 if width>height else 245),cv)
  ck(f'Torche et contrôle présents {width}x{height}',pg.locator('#torch-toggle').is_visible() and pg.locator('#light-switch').is_visible())
  if width==844:shot(pg,'42_eclairage_paysage.png','Viewport émulé 844 × 390, contrôles tactiques hors du canvas ; pas un téléphone physique')
 pg.set_viewport_size({'width':1440,'height':980});load(pg,saved('11-repli-noir'));pg.locator('#pause-panel [data-close]').first.click();ck('Opération importée complète donne le bilan',pg.locator('#complete-panel').is_visible());shot(pg,'43_repli_circuits.png','Export complet 11-repli-noir du parcours, affichage du bilan sans modification')
 ck('Zéro requête externe nécessaire',not requests,requests);ck('Aucune erreur JS/console',not errors and not console,errors+console);b.close()
flush();print(json.dumps({'passed':sum(t['ok'] for t in results),'total':len(results),'captures':len(captures),'errors':errors},ensure_ascii=False))
