"""Exact distributed HTML, public UI and untouched exports from fidelity driver.
No session mutation hook or image postprocessing; prepared unit fixtures are separate."""
from pathlib import Path
import json,hashlib
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parent.parent;HTML=(R/'JOUER_ALIENS_V114.html').read_text();H=hashlib.sha256(HTML.encode()).hexdigest();CAP=R/'report/captures-v114';CAP.mkdir(exist_ok=True)
results=[];captures=[];errors=[];console=[];requests=[]
def flush(): (R/'report/browser-fidelity-v114.json').write_text(json.dumps({'tests':results,'captures':captures,'pageErrors':errors,'consoleErrors':console,'requests':requests,'htmlSHA256':H,'nativeTantalus':False},ensure_ascii=False,indent=2))
def ck(n,ok,detail=None):
 results.append({'name':n,'ok':bool(ok),'detail':detail});flush();print(n,bool(ok),flush=True);assert ok,(n,detail)
def state(n):return json.loads((R/'report/fidelity-states-v114'/f'{n}.json').read_text())
def export(p):
 if not p.locator('#pause-panel').is_visible():p.click('#pause-open')
 with p.expect_download() as d:p.click('#export')
 return json.loads(Path(d.value.path()).read_text())
def load(p,d):
 if not p.locator('#pause-panel').is_visible():p.click('#pause-open')
 p.locator('#import-file').set_input_files({'name':'public-export.json','mimeType':'application/json','buffer':json.dumps(d).encode()});p.wait_for_timeout(60)
def resume(p):p.locator('#pause-panel [data-close]').first.click()
def shot(p,n,origin):
 p.screenshot(path=str(CAP/n));captures.append({'file':n,'origin':origin,'htmlSHA256':H,'nativeTantalus':False,'imageEdited':False});flush()
def aim(p,s,x,z):
 b=p.locator('#scene').bounding_box();sc=min(b['width']/1280,b['height']/720);camera=max(0,min(160,s['team'][0]['x']-550));left=b['x']+(b['width']-1280*sc)/2;p.mouse.move(left+(x-camera)*sc,b['y']+(265+z*.86)*sc)
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox']);p=b.new_page(viewport={'width':1440,'height':980},accept_downloads=True);p.set_default_timeout(10000);p.on('dialog',lambda d:d.accept())
 p.on('pageerror',lambda e:errors.append(str(e)));p.on('console',lambda e:console.append(e.text) if e.type=='error' else None);p.on('request',lambda r:requests.append(r.url) if r.url.startswith(('http:','https:')) else None)
 p.set_content(HTML);p.locator('[data-sector]').first.wait_for(state='attached');ids=p.locator('[data-sector]').evaluate_all('(a)=>a.map(x=>x.dataset.sector)')
 ck('25 lieux inspectables chargés',len(ids)==25)
 p.click('#atlas-menu');ck('28 repères du film et huit manques explicites',p.locator('.atlas-card').count()==28 and p.locator('.atlas-card').filter(has_text='ABSENT').count()==8)
 shot(p,'64_atlas_et_manques.png','Atlas consulté depuis le menu : liste de référence, pas preuve de scènes jouées.')
 p.click('[data-atlas="cast"]');ck('16 profils de personnage distincts',p.locator('.atlas-card').count()==16)
 p.click('[data-atlas="equipment"]');ck('24 équipements avec statuts non confondus',p.locator('.atlas-card').count()==24 and 'fiche seulement' in p.locator('#atlas-content').inner_text())
 p.locator('#atlas-search').fill('P-5000');ck('Recherche montre la limite du loader',p.locator('.atlas-card').count()==1 and 'décor protégé' in p.locator('#atlas-content').inner_text());p.locator('#atlas-search').fill('')
 p.click('[data-atlas="continuity"]');ck('Quatre contraintes de continuité visibles',p.locator('.atlas-card').count()==4);p.locator('#atlas-panel [data-close]').click()
 # Every inspector actually starts its room. Renderer and importer see exact current objects.
 for id in ids:
  if p.locator('details.inspection').get_attribute('open') is None:p.click('details.inspection summary')
  p.click('[data-sector="'+id+'"]');p.wait_for_timeout(55);d=export(p)
  ck('Inspection et état réel : '+id,d['roomId']==id and d['mode']=='inspection' and d['schema']==114)
  if id.startswith('v114-gateway'):
   before=d['team'][0]['ammo'];resume(p);ck('Affichage civil sans arme : '+id,'CIVIL' in p.locator('#ammo').inner_text());p.keyboard.press('f');p.wait_for_timeout(50);ck('Gateway désarmée : '+id,export(p)['team'][0]['ammo']==before)
  p.click('#back-menu')
 p.click('details.inspection summary') if p.locator('details.inspection').get_attribute('open') is None else None
 p.click('[data-sector="v114-sulaco-armory"]');p.wait_for_timeout(50)
 load(p,state('03_armory_retrieve_pending'));d=export(p);ck('Reprise réelle de la collecte d’armurerie',d['action']['kind']=='arsenal-retrieve' and not d['arsenal']['collected']);p.wait_for_timeout(160);ck('Pause conserve collecte et réserves',export(p)==d)
 resume(p);p.keyboard.down('a');p.wait_for_timeout(90);p.keyboard.up('a');cancel=export(p);ck('Déplacement interrompt sans donner les armes',cancel['action'] is None and not cancel['arsenal']['collected'])
 load(p,d);resume(p);p.wait_for_timeout(850);ready=export(p);ck('Râtelier attribue les réserves une fois à la fin',ready['arsenal']['collected']==['sulaco-test-rack'] and ready['arsenal']['remaining']['ripley']['fuel']==80)
 load(p,state('04_armory_ready'));resume(p);p.keyboard.press('F2');ck('F2 affiche l’armement hors terrain sans pause',p.locator('#arsenalbar').is_visible() and not p.locator('#pause-panel').is_visible())
 ck('Les huit profils sont sélectionnables après la collecte',p.locator('#weapon-select option').count()==8)
 shot(p,'65_armurerie_ripley.png','Reprise de 04_armory_ready, export non modifié du pilote, puis F2 dans l’interface.')
 pulse=state('04_armory_ready')['team'][0]['ammo'];counts={}
 for id,res in [('shotgun','shells'),('flame','fuel'),('smartgun','belt'),('pistol','pistol'),('launcher','rounds'),('grenade','grenades'),('knife',None),('pulse','pulse')]:
  # Untouched safe armory position at the beginning of every actual UI test.
  load(p,state('04_armory_ready'));resume(p)
  if not p.locator('#arsenalbar').is_visible():p.keyboard.press('F2')
  p.locator('#weapon-member').select_option('ripley');p.locator('#weapon-select').select_option(id);p.wait_for_timeout(390);before=export(p);ck('Arme tenue sélectionnée : '+id,before['arsenal']['selected']['ripley']==id)
  resume(p);aim(p,before,670,63);p.keyboard.press('f');p.wait_for_timeout(50);fired=export(p)
  old=before['team'][0]['ammo'] if res=='pulse' else before['arsenal']['remaining']['ripley'].get(res,0);now=fired['team'][0]['ammo'] if res=='pulse' else fired['arsenal']['remaining']['ripley'].get(res,0)
  ck('Tir effectif et réserve indépendante : '+id,fired['arsenal']['metrics']['shots']==before['arsenal']['metrics']['shots']+1 and (res is None or now==old-1),{'before':old,'after':now});counts[id]=[old,now]
  if res and res!='pulse':ck('Réserve M41A non consommée par '+id,fired['team'][0]['ammo']==pulse)
  if id in ['launcher','grenade']:
   ck('Projectile explosif encore en trajet : '+id,len(fired['arsenal']['flights'])==1);load(p,fired);ck('Reprise en pause à mi-vol : '+id,export(p)==fired);resume(p);p.wait_for_timeout(1150);ck('Résolution après temps de vol : '+id,len(export(p)['arsenal']['flights'])==0)
  if id=='flame':resume(p);aim(p,fired,700,140);p.keyboard.press('f');p.screenshot(path=str(CAP/'66_m240_essai.png'));captures.append({'file':'66_m240_essai.png','origin':'Armurerie : choix M240 et pressions F réelles ; banc d’essai hors chronologie, pas un combat de campagne.','htmlSHA256':H,'nativeTantalus':False,'imageEdited':False});export(p)
 load(p,state('06_armory_cast'));resume(p);shot(p,'67_vasquez_drake_dietrich.png','Export 06_armory_cast non modifié : NPC de briefing, armes décoratives distinctes, pas renforts dans l’opération.')
 p.keyboard.press('F2') if not p.locator('#arsenalbar').is_visible() else None;p.locator('#weapon-member').select_option('hicks');ck('Shotgun de Hicks et dotation finie',p.locator('#weapon-select option[value="shotgun"]').count()==1);p.locator('#weapon-select').select_option('shotgun');p.wait_for_timeout(390);h=export(p);ck('Choix du shotgun conserve la réserve pulse de Hicks',h['arsenal']['selected']['hicks']=='shotgun' and h['arsenal']['remaining']['hicks']['shells']==6)
 for name,file in [('02_sulaco_briefing','68_bishop_apone_gorman.png'),('07_clean_cargo','69_hangar_preparation.png'),('09_gateway_inquiry','70_gateway_burke.png'),('10_processor_gallery','71_processeur_galeries.png'),('12_queen_nursery','72_nurserie_inspection.png'),('16_colony_mess','73_mess_colonial.png'),('17_drain_escorte','74_drain_newt.png')]:
  load(p,state(name));resume(p);p.wait_for_timeout(70);shot(p,file,'Export non modifié '+name+' du pilote à entrées publiques. Inspection adaptée, pas séquence filmique complète.')
 load(p,state('18_sentry_m240_avant'));d=export(p);ck('M240 obtenu par le vrai parcours depuis l’insertion',d['mode']=='operation' and 'service-incinerator' in d['arsenal']['collected'] and d['arsenal']['selected']['ripley']=='flame')
 load(p,state('14_medlab_m240'));resume(p);p.keyboard.press('F2') if not p.locator('#arsenalbar').is_visible() else None;ck('Newt absente du sélecteur d’arme',p.locator('#weapon-member option[value="newt"]').count()==0)
 for w,h in [(844,390),(390,844)]:
  p.set_viewport_size({'width':w,'height':h});p.wait_for_timeout(80);sc=p.locator('#scene').bounding_box();bar=p.locator('#arsenalbar').bounding_box();ck(f'Arsenal et HUD hors terrain {w}x{h}',bar['y']>=sc['y']+sc['height']-.5 and p.locator('#hud').bounding_box()['y']+p.locator('#hud').bounding_box()['height']<=sc['y']+.5)
  ck(f'Pas de débordement horizontal {w}x{h}',p.evaluate('document.documentElement.scrollWidth<=innerWidth'))
  if w==844:shot(p,'75_armement_paysage.png','Viewport émulé 844×390 ; véritable interface après import non modifié. Aucun téléphone physique testé.')
 p.set_viewport_size({'width':1440,'height':980});good=export(p)
 for name,mut in [('fuel inventé',lambda d:d['arsenal']['remaining']['ripley'].__setitem__('fuel',999)),('arme de Newt',lambda d:d['arsenal']['selected'].__setitem__('newt','flame')),('coffret inconnu',lambda d:d['arsenal']['collected'].append('infinite-case')),('origine modifiée',lambda d:d['arsenal'].__setitem__('origin','cheat'))]:
  bad=json.loads(json.dumps(good));mut(bad);load(p,bad);ck('Import atomique : '+name,export(p)==good)
 old=json.loads((R/'report/tactics-states-v113/01-operations-arrivee.json').read_text()) if (R/'report/tactics-states-v113/01-operations-arrivee.json').exists() else json.loads(next((R/'report/tactics-states-v113').glob('*.json')).read_text());load(p,old);m=export(p);ck('Migration V113 conserve équipe et anciennes ressources',m['schema']==114 and m['team']==old['team'] and m['logistics']==old['logistics']);ck('Migration n’offre aucune réserve secondaire',all(v==0 for row in m['arsenal']['remaining'].values() for v in row.values()))
 load(p,state('15_repli_armement'));resume(p);ck('Nouveau parcours arrive au bilan',p.locator('#complete-panel').is_visible());shot(p,'76_repli_m240.png','Export final inchangé du parcours avec mess, canalisation et M240 ; pas de progression injectée.')
 ck('Aucune requête externe nécessaire',not requests,requests);ck('Aucune erreur JavaScript ou console',not errors and not console,{'page':errors,'console':console});b.close()
flush();print(json.dumps({'passed':len(results),'captures':len(captures),'errors':errors}))
