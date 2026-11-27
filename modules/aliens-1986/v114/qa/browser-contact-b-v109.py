"""Chromium UI recipe for V108 contacts. States are unedited outputs of the
public-input driver. DOM evaluation only measures UI layout, never engine data."""
from pathlib import Path
import json
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parent.parent;HTML=(R/'JOUER_ALIENS_V109.html').read_text();CAP=R/'report/captures-v109'
results=[];captures=[];errors=[];console=[]
def flush():
 (R/'report/browser-contact-b-v109.json').write_text(json.dumps({'browser':'Chromium through Python Playwright','tests':results,'captures':captures,'pageErrors':errors,'consoleErrors':console,'nativeTantalus':False},ensure_ascii=False,indent=2))
def ck(name,ok,detail=None):
 results.append({'name':name,'ok':bool(ok),'detail':detail});flush();print(name,ok,flush=True);assert ok,(name,detail)
def export(pg):
 if not pg.locator('#pause-panel').is_visible():pg.locator('#pause-open').click()
 with pg.expect_download() as d:pg.locator('#export').click()
 return json.loads(Path(d.value.path()).read_text())
def load(pg,data):
 if not pg.locator('#pause-panel').is_visible():pg.locator('#pause-open').click()
 pg.locator('#import-file').set_input_files({'name':'point.json','mimeType':'application/json','buffer':json.dumps(data).encode()});pg.wait_for_timeout(60)
def resume(pg):pg.locator('#pause-panel [data-close]').first.click()
def shot(pg,name,origin):
 pg.screenshot(path=str(CAP/name),timeout=5000);captures.append({'file':name,'origin':origin,'nativeTantalus':False,'imageEdited':False});flush()
def saved(name):return json.loads((R/'report/pursuit-states-v109'/f'{name}.json').read_text())
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox']);pg=b.new_page(viewport={'width':1440,'height':900},accept_downloads=True);pg.set_default_timeout(7000);pg.on('pageerror',lambda e:errors.append(str(e)));pg.on('console',lambda e:console.append(e.text) if e.type=='error' else None)
 pg.set_content(HTML);pg.locator('#start-operation').click()
 # Sealed state comes from the legitimate driver. R opens, walking cancels.
 d=saved('06-liaison-isolee');load(pg,d);resume(pg);pg.wait_for_timeout(90);shot(pg,'12_sas_isole.png','État d’isolement obtenu par le pilote avec R, sans modification du fichier')
 pg.keyboard.press('r');pg.wait_for_timeout(160);shot(pg,'13_reouverture_sas.png','Commande R réelle sur la liaison fermée');opening=export(pg)
 ck('R lance une ouverture temporisée réelle',opening['action'] is not None and opening['action']['kind']=='link-open' and not opening['contacts']['links']['residential-ops']['open'])
 pg.wait_for_timeout(200);ck('Pause fige le sas et toutes les mémoires',export(pg)==opening)
 load(pg,d);resume(pg);pg.keyboard.press('r');pg.keyboard.down('d');pg.wait_for_timeout(100);pg.keyboard.up('d');cancelled=export(pg);ck('Marche annule la réouverture sans libérer la liaison',cancelled['action'] is None and not cancelled['contacts']['links']['residential-ops']['open'])
 load(pg,d);resume(pg);pg.keyboard.press('r');pg.wait_for_timeout(1150);opened=export(pg);ck('Réouverture à terme modifie le seul état partagé',opened['contacts']['links']['residential-ops']['open'] and opened['action'] is None)
 load(pg,d);resume(pg);pg.keyboard.press('m');ck('Carte reste sans liste de menaces',pg.locator('#map-panel').is_visible() and 'warrior-a' not in pg.locator('#map-panel').inner_text());shot(pg,'14_carte_isolement.png','Carte relevée affichée par M sur le même état d’isolement, sans contacts radar')
 pg.locator('#map-panel [data-close]').click();pg.keyboard.press('v');pg.wait_for_timeout(60);careful=export(pg);ck('V active la prudence dans la simulation',careful['contacts']['pace']=='careful');resume(pg);ck('L’interface reflète la prudence',pg.locator('#pace').get_attribute('aria-pressed')=='true')
 legacy=json.loads((R/'report/states/04-newt.json').read_text());load(pg,legacy);migrated=export(pg);ck('Import V107 préserve les ressources et le jalon',migrated['schema']==109 and migrated['step']==legacy['step'] and [(a['hp'],a['ammo']) for a in migrated['team']]==[(a['hp'],a['ammo']) for a in legacy['team']]);ck('Aucune poursuite inventée à la migration',all(v['stimulus'] is None for v in migrated['contacts']['brains'].values()))
 pg.locator('#audio-on').check();pg.wait_for_timeout(180);ck('Audio local activable sans média externe',pg.locator('#audio-on').is_checked());pg.locator('#audio-on').uncheck()
 ck('Aucune erreur JavaScript contacts',not errors and not console,{'page':errors,'console':console});b.close()
flush()
print(json.dumps({'passed':sum(x['ok'] for x in results),'total':len(results),'captures':len(captures),'errors':errors}))
