"""V113 tactical browser receipt, exact distribution. Real UI inputs/imports/downloads.
No session hook, no injected actor changes, no screenshot reconstruction."""
from pathlib import Path
import json,hashlib,math
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parent.parent;HTML=(R/'JOUER_ALIENS_V113.html').read_text();CAP=R/'report/captures-v113';CAP.mkdir(exist_ok=True)
results=[];captures=[];errors=[];console=[];requests=[]
def flush():
 (R/'report/browser-tactics-v113.json').write_text(json.dumps({'tests':results,'captures':captures,'pageErrors':errors,'consoleErrors':console,'requests':requests,'htmlSHA256':hashlib.sha256(HTML.encode()).hexdigest(),'nativeTantalus':False},ensure_ascii=False,indent=2))
def ck(name,ok,detail=None):
 results.append({'name':name,'ok':bool(ok),'detail':detail});flush();print(name,bool(ok),flush=True);assert ok,(name,detail)
def state(name):return json.loads((R/'report/tactics-states-v113'/f'{name}.json').read_text())
def export(pg):
 if not pg.locator('#pause-panel').is_visible():pg.locator('#pause-open').click()
 with pg.expect_download() as d:pg.locator('#export').click()
 return json.loads(Path(d.value.path()).read_text())
def load(pg,d):
 if not pg.locator('#pause-panel').is_visible():pg.locator('#pause-open').click()
 pg.locator('#import-file').set_input_files({'name':'aliens113-tactical.json','mimeType':'application/json','buffer':json.dumps(d).encode()});pg.wait_for_timeout(55)
def resume(pg):pg.locator('#pause-panel [data-close]').first.click()
def shot(pg,name,origin):
 pg.screenshot(path=str(CAP/name));captures.append({'file':name,'origin':origin,'nativeTantalus':False,'imageEdited':False});flush()
def ground(pg,d,x,z,click=True):
 box=pg.locator('#scene').bounding_box();scale=min(box['width']/1280,box['height']/720);camera=max(0,min(160,d['team'][0]['x']-550));left=box['x']+(box['width']-1280*scale)/2
 pos=(left+(x-camera)*scale,box['y']+(265+z*.86)*scale);pg.mouse.move(*pos)
 if click:pg.mouse.click(*pos)
def team(d,id):return next(a for a in d['team'] if a['id']==id)
def sentry(d):return next(a for a in d['worlds']['v106-sentry']['actors'] if a['id']=='sentry-a')
def select(pg,id):pg.locator('#order-target').select_option(id);pg.locator('#scene').focus()
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox']);pg=b.new_page(viewport={'width':1440,'height':980},accept_downloads=True);pg.set_default_timeout(9000)
 pg.on('pageerror',lambda e:errors.append(str(e)));pg.on('console',lambda e:console.append(e.text) if e.type=='error' else None);pg.on('request',lambda r:requests.append(r.url) if r.url.startswith(('http:','https:')) else None)
 pg.set_content(HTML);pg.locator('[data-sector]').first.wait_for(state='attached');pg.locator('#start-operation').click();initial=export(pg)
 ck('Schéma113, catalogue conservé et aucun poste offert',initial['schema']==113 and len(initial['worlds'])==10 and all(x is None for x in initial['tactics']['posts'].values()))
 ck('Pas de ressource ni chargeur offert par les ordres',initial['tactics']['metrics']['postOrders']==0 and initial['beacons']['charges']==0 and initial['engineering']['plates']==0)
 d=state('01-operations-avant-ordres');load(pg,d);ck('Reprise exacte avant les commandes',export(pg)==d);resume(pg);select(pg,'hicks');pg.keyboard.press('x')
 ck('X ouvre un mode de désignation sans pause',pg.locator('#post-order').get_attribute('aria-pressed')=='true' and not pg.locator('#pause-panel').is_visible())
 ground(pg,d,500,140);pg.wait_for_timeout(60);ck('Un clic sur la table refuse le poste et garde la désignation',pg.locator('#post-order').get_attribute('aria-pressed')=='true')
 pg.keyboard.press('Escape');ck('Échap annule la désignation sans ouvrir la pause',pg.locator('#post-order').get_attribute('aria-pressed')=='false' and not pg.locator('#pause-panel').is_visible())
 bad=export(pg);ck('Refus sans munition ni ordre transmis',bad['tactics']['posts']['hicks'] is None and bad['team']==d['team'] and bad['stats']['orders']==d['stats']['orders'])
 load(pg,d);resume(pg);select(pg,'hicks');pg.locator('#post-order').click();ground(pg,d,600,230);pg.wait_for_timeout(140);moving=export(pg)
 ck('Le clic envoie seulement Hicks au poste',moving['tactics']['posts']['hicks'] is not None and moving['tactics']['posts']['hudson'] is None)
 ck('Le déplacement est réel, sans téléportation au clic',237<team(moving,'hicks')['x']<550 and not moving['tactics']['posts']['hicks']['arrived'])
 ck('Les chargeurs et objectifs ne changent pas au clic de poste',[(a['hp'],a['ammo'])for a in moving['team']]==[(a['hp'],a['ammo'])for a in d['team']] and moving['flags']==d['flags'])
 pg.wait_for_timeout(180);ck('Pause fige exactement le déplacement ordonné',export(pg)==moving);load(pg,moving);ck('Reprise à mi-chemin conserve le poste et la position',export(pg)==moving)
 resume(pg);pg.wait_for_timeout(3800);arrived=export(pg)
 ck('Hicks contourne la table et atteint son poste',arrived['tactics']['posts']['hicks']['arrived'] and math.hypot(team(arrived,'hicks')['x']-600,team(arrived,'hicks')['z']-230)<=7)
 resume(pg);select(pg,'hicks');shot(pg,'54_poste_rejoint.png','Depuis 01-operations-avant-ordres, X/clic au sol, export/import pendant la marche puis attente réelle ; Hicks rejoint le poste sans téléportation')
 pg.keyboard.press('n');ground(pg,arrived,960,200);pg.wait_for_timeout(70);angled=export(pg)
 ck('N fixe un secteur de couverture de Hicks',team(angled,'hicks')['order']=='cover' and angled['tactics']['posts']['hicks']['angle'] is not None)
 resume(pg);ground(pg,angled,180,320,False);pg.wait_for_timeout(70);stable=export(pg)
 ck('Déplacer la visée ne fait pas tourner le secteur engagé',stable['tactics']['posts']['hicks']['angle']==angled['tactics']['posts']['hicks']['angle'])
 resume(pg);select(pg,'hicks');pg.keyboard.press('2');held=export(pg)
 ck('2 retient le feu individuel sans effacer son poste',held['tactics']['discipline']['hicks']=='hold' and held['tactics']['discipline']['hudson']=='free' and held['tactics']['posts']['hicks']==stable['tactics']['posts']['hicks'])
 resume(pg);pg.locator('#fire-discipline').click();freed=export(pg);ck('Bouton Autoriser libère le même secteur',freed['tactics']['discipline']['hicks']=='free' and freed['tactics']['posts']['hicks']['angle']==angled['tactics']['posts']['hicks']['angle'])
 load(pg,state('03-angles-operations'));resume(pg);select(pg,'all');shot(pg,'55_secteurs_operations.png','Export non modifié 03-angles-operations du parcours complet : deux secteurs engagés et feu retenu, seuls les plans alliés sont annotés')
 select(pg,'hicks');pg.keyboard.press('h');old=export(pg);ck('H supprime le poste explicite du seul membre choisi',old['tactics']['posts']['hicks'] is None and old['tactics']['posts']['hudson'] is not None)
 resume(pg);select(pg,'all');pg.keyboard.press('g');rallied=export(pg);ck('G rallie et supprime les réservations locales',all(v is None for v in rallied['tactics']['posts'].values()))
 # Newt is an actual separately addressable noncombatant.
 load(pg,state('04-newt-au-poste'));resume(pg);select(pg,'newt')
 ck('Newt a un poste mais aucun bouton de feu ou secteur',not pg.locator('#post-order').is_disabled() and pg.locator('#sector-order').is_disabled() and pg.locator('#fire-discipline').is_disabled())
 pg.keyboard.press('n');ground(pg,state('04-newt-au-poste'),950,200);pg.keyboard.press('Escape');nn=export(pg);ck('N au clavier ne transforme pas Newt en combattante',team(nn,'newt')['ammo']==0 and nn['tactics']['posts']['newt']['angle'] is None)
 resume(pg);pg.keyboard.press('x');ground(pg,nn,700,235);pg.wait_for_timeout(1300);npost=export(pg);ck('Newt rejoint elle-même son nouveau poste',npost['tactics']['posts']['newt']['arrived'] and team(npost,'newt')['ammo']==0)
 resume(pg);shot(pg,'56_newt_au_poste.png','Depuis 04-newt-au-poste, sélection Newt, X et clic à un nouveau poste ; marche effective puis attente non armée')
 # Sentry orientation is a timed local gesture, not an instantaneous remote turn.
 d=state('05-affut-avant-rotation');load(pg,d);resume(pg);select(pg,'sentry-a');ck('Sentinelle fixe : déplacer désactivé, orienter disponible',pg.locator('#post-order').is_disabled() and not pg.locator('#sector-order').is_disabled())
 pg.keyboard.press('n');ground(pg,d,1000,198);pg.wait_for_timeout(170);turn=export(pg)
 ck('Rotation préparée pendant 1,15 seconde',turn['action'] and turn['action']['kind']=='sentry-orient' and turn['action']['duration']==1.15)
 ck('Angle final et munitions inchangés avant la fin',turn['tactics']['sentries']['sentry-a']['angle'] is None and sentry(turn)['ammo']==120)
 pg.wait_for_timeout(150);ck('Pause conserve la rotation à mi-geste',export(pg)==turn)
 resume(pg);pg.keyboard.down('a');pg.wait_for_timeout(100);pg.keyboard.up('a');cancel=export(pg);ck('La marche annule la rotation',cancel['action'] is None and cancel['tactics']['metrics']['turnsInterrupted']==1 and cancel['tactics']['sentries']['sentry-a']['angle'] is None)
 load(pg,turn);resume(pg);pg.keyboard.press('f');pg.wait_for_timeout(60);cancel=export(pg);ck('Tirer annule aussi l’orientation sans tourner l’affût',cancel['action'] is None and cancel['tactics']['sentries']['sentry-a']['angle'] is None and team(cancel,'ripley')['ammo']==team(turn,'ripley')['ammo']-1)
 load(pg,turn);ck('Export/import rétablit exactement la rotation restante',export(pg)==turn);resume(pg);pg.wait_for_timeout(110);shot(pg,'57_rotation_affut.png','Clic de direction réalisé dans Chromium depuis 05-affut-avant-rotation, export/import à mi-geste puis reprise : rotation réellement en cours')
 pg.wait_for_timeout(1400);turned=export(pg);ck('Fin de rotation : angle engagé et réserve préservée',abs(turned['tactics']['sentries']['sentry-a']['angle'])<.01 and turned['tactics']['metrics']['turnsCompleted']==1 and sentry(turned)['ammo']==120)
 resume(pg);pg.keyboard.down('a');pg.wait_for_timeout(650);pg.keyboard.up('a');far=export(pg);resume(pg);select(pg,'sentry-a');pg.keyboard.press('n');ground(pg,far,1000,198);pg.keyboard.press('Escape');rf=export(pg)
 ck('Orienter de loin est refusé sans nouveau geste',rf['action'] is None and rf['tactics']['metrics']['turnsStarted']==turned['tactics']['metrics']['turnsStarted'])
 # Real line-safety UI exercise: Ripley deliberately remains in front of sentry.
 d=state('07-ligne-en-place');load(pg,d);resume(pg);select(pg,'sentry-a');pg.keyboard.press('2');pg.keyboard.down('d');pg.wait_for_timeout(925);pg.keyboard.up('d');pg.keyboard.down('w');pg.wait_for_timeout(220);pg.keyboard.up('w');pg.keyboard.press('e');pg.wait_for_timeout(1100);blocked=export(pg)
 ck('Porte ouverte sans donner d’ennemi ou de munition',blocked['worlds']['v106-sentry']['doors']['defense-gate']['open'] and sentry(blocked)['ammo']==120)
 ck('Sentinelle retient son tir devant un allié vivant',blocked['tactics']['metrics']['safetyHolds']>0,blocked['tactics']['metrics'])
 resume(pg);shot(pg,'58_axe_occupe.png','Depuis 07-ligne-en-place : sentinelle autorisée, déplacement devant son axe et E pour ouvrir ; elle retient le tir tant que Ripley masque les contacts')
 pg.keyboard.down('s');pg.wait_for_timeout(310);pg.keyboard.up('s');pg.wait_for_timeout(1500);clear=export(pg)
 ck('Dégager l’axe libère un tir et consomme des munitions',sentry(clear)['ammo']<120 and team(clear,'ripley')['ammo']==team(blocked,'ripley')['ammo'])
 resume(pg);shot(pg,'59_axe_degage.png','Suite du même essai : déplacement vers le bas au clavier, puis attente ; la sentinelle tire sans que Ripley ouvre le feu')
 load(pg,state('08-axes-libres'));resume(pg);pg.wait_for_timeout(13000);defended=export(pg)
 ck('La ligne ordonnée tient la défense sans tir du joueur',defended['flags']['defense'] and team(defended,'ripley')['ammo']==team(state('08-axes-libres'),'ripley')['ammo'] and sentry(defended)['ammo']<120)
 ck('Newt reste au poste, non armée et vivante',team(defended,'newt')['alive'] and team(defended,'newt')['ammo']==0 and defended['tactics']['posts']['newt']['arrived'])
 resume(pg);shot(pg,'60_defense_positions.png','Export intact 08-axes-libres repris, puis treize secondes de simulation navigateur sans tir manuel jusqu’à la défense tenue')
 # Strict atomic import, valid own saves and real migration from supplied V112.
 good=export(pg)
 for label,mut in [('angle hors bornes',lambda d:d['tactics']['sentries']['sentry-a'].__setitem__('angle',9)),('munition tactique inventée',lambda d:d['tactics'].__setitem__('ammoBonus',100)),('Newt armée',lambda d:d['tactics']['discipline'].__setitem__('newt','free')),('poste à travers table',lambda d:d['tactics']['posts']['hicks'].__setitem__('x',-100)),('bilan rotation incohérent',lambda d:d['tactics']['metrics'].__setitem__('turnsStarted',900))]:
  bad=json.loads(json.dumps(good));mut(bad);load(pg,bad);ck('Import refuse '+label+' sans mutation',export(pg)==good)
 legacy=json.loads((R/'report/beacon-states-v112/07-atelier-balise.json').read_text());load(pg,legacy);m=export(pg)
 ck('Migration véritable V112 conserve équipe, stocks et sources',m['schema']==113 and m['team']==legacy['team'] and m['beacons']==legacy['beacons'] and m['logistics']==legacy['logistics'] and m['lighting']==legacy['lighting'])
 ck('Migration ne crée ni ordre tactique ni rotation gratuite',all(p is None for p in m['tactics']['posts'].values()) and m['tactics']['sentries']['sentry-a']['angle'] is None and all(v==0 for v in m['tactics']['metrics'].values()))
 load(pg,state('07-ligne-en-place'));resume(pg);pg.keyboard.press('m');ck('Carte sans état interne ennemi et hors scène',not pg.locator('#scene').is_visible() and 'rush-a' not in pg.locator('#map-panel').inner_text());pg.locator('#map-panel [data-close]').click();pg.keyboard.press('Tab')
 ck('Archives documentent les secteurs et sécurité', '100°' in pg.locator('#codex-content').inner_text() and 'Newt' in pg.locator('#codex-content').inner_text());pg.locator('#codex-panel [data-close]').click()
 # Size/accessibility checks are viewport emulations, not physical phone claims.
 for width,height,minh,file in [(844,390,178,'61_tactique_paysage.png'),(390,844,245,'62_tactique_portrait.png')]:
  pg.set_viewport_size({'width':width,'height':height});load(pg,state('07-ligne-en-place'));resume(pg);select(pg,'hicks');pg.wait_for_timeout(80);scene=pg.locator('#scene').bounding_box();buttons={id:pg.locator('#'+id).bounding_box() for id in ['post-order','sector-order','fire-discipline']}
  ck(f'Commandes tactiques hors canvas {width}×{height}',all(box and box['y']>=scene['y']+scene['height']-.5 for box in buttons.values()),buttons)
  ck(f'Terrain conserve son minimum {width}×{height}',scene['height']>=minh,scene)
  ck(f'Aucun débordement horizontal {width}×{height}',pg.evaluate('document.documentElement.scrollWidth<=innerWidth'))
  shot(pg,file,f'Viewport émulé {width}×{height}, état réel 07-ligne-en-place ; trois commandes tactiques hors terrain, pas un téléphone physique')
 export(pg);pg.locator('#reduced').check();pg.locator('#contrast').check();ck('Options visuelles ne changent pas les positions et stocks',export(pg)['tactics']==state('07-ligne-en-place')['tactics'])
 pg.set_viewport_size({'width':1440,'height':980});load(pg,state('10-repli-angles'));resume(pg)
 ck('Parcours tactique terminé et bilan des ordres visibles',pg.locator('#complete-panel').is_visible() and 'secteur' in pg.locator('#debrief').inner_text().lower())
 shot(pg,'63_repli_angles.png','Export final non modifié du huitième parcours complet V113 ; ressources finales et métriques d’ordres, pas d’état de victoire fabriqué')
 ck('Aucune requête externe nécessaire',not requests,requests);ck('Aucune erreur JavaScript ou console',not errors and not console,{'page':errors,'console':console});b.close()
flush();print(json.dumps({'passed':len(results),'captures':len(captures),'errors':errors}))
