"""Real Chromium captures of the shipped offline HTML; no QA API in the build.
Only UI events, real exported files and full-operation driver snapshots are used.
The browser recipe is separate from the two full Node input-driven playthroughs.
"""
from pathlib import Path
import json,time
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parent.parent
HTML=(ROOT/'JOUER_ALIENS_V108.html').read_text()
CAP=ROOT/'report/captures-v108';CAP.mkdir(exist_ok=True,parents=True)
results=[];errors=[];console=[];captures=[]
def check(name,ok,detail=None):
 results.append({'name':name,'ok':bool(ok),'detail':detail});print(name,ok,flush=True);assert ok,(name,detail)
def export(pg):
 if not pg.locator('#pause-panel').is_visible():pg.locator('#pause-open').click()
 with pg.expect_download() as d:pg.locator('#export').click()
 return json.loads(Path(d.value.path()).read_text())
def resume(pg):pg.locator('#pause-panel [data-close]').first.click()
def load(pg,data):
 if not pg.locator('#pause-panel').is_visible():pg.locator('#pause-open').click()
 pg.locator('#import-file').set_input_files({'name':'point.json','mimeType':'application/json','buffer':json.dumps(data).encode()});pg.wait_for_timeout(80)
def snapshot(pg,name,origin):
 pg.screenshot(path=str(CAP/name));captures.append({'file':name,'origin':origin,'nativeTantalus':False,'imageEdited':False})
def start(pg,room=None):
 pg.goto('about:blank');pg.set_content(HTML);pg.locator('#start-operation').wait_for()
 if room:pg.locator('details.inspection summary').click();pg.locator('[data-sector='+room+']').click()
 else:pg.locator('#start-operation').click()
 pg.wait_for_timeout(100)
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 pg=browser.new_page(viewport={'width':1440,'height':900},accept_downloads=True,device_scale_factor=1)
 pg.on('pageerror',lambda e:errors.append(str(e)));pg.on('console',lambda m:console.append(m.text) if m.type=='error' else None)
 # Inspection is explicitly independent, to exercise sentry acquisition.
 start(pg,'v106-sentry');state=export(pg);check('Inspection sentinelle sans progression',state['mode']=='inspection' and state['step']==0)
 check('Sentinelle ne gaspille pas devant la porte',state['worlds']['v106-sentry']['actors'][0]['ammo']==120)
 resume(pg);pg.keyboard.down('d');pg.wait_for_timeout(2160);pg.keyboard.up('d');pg.keyboard.press('c');pg.keyboard.press('e');pg.wait_for_timeout(1190);snapshot(pg,'06_sentry_contact.png','Inspection isolée : déplacement, ordre couvrir et ouverture joués au clavier');state=export(pg)
 check('Sentinelle tire après ouverture',state['worlds']['v106-sentry']['actors'][0]['ammo']<120)
 # Return from complete operation shows all visited places, not enemies.
 data=json.loads((ROOT/'report/states-v108/06-defense.json').read_text());load(pg,data);resume(pg);pg.keyboard.press('m')
 check('Carte hors scène et HUD',pg.locator('#map-panel').is_visible() and not pg.locator('#hud').is_visible() and not pg.locator('#scene').is_visible())
 snapshot(pg,'07_carte_liaisons.png','Carte des lieux visités au point de défense du parcours complet')
 pg.locator('#map-panel [data-close]').click();pg.keyboard.press('Tab');check('Archives remplacent la scène',pg.locator('#codex-panel').is_visible() and not pg.locator('#play').is_visible());pg.locator('#codex-panel [data-close]').click()
 pg.evaluate("window.dispatchEvent(new Event('blur'))");check('Perte de focus met en pause',pg.locator('#pause-panel').is_visible())
 final=json.loads((ROOT/'report/states-v108/07-repli.json').read_text());load(pg,final);resume(pg);check('Bilan du parcours terminé',pg.locator('#complete-panel').is_visible() and pg.locator('#debrief .fact').first.inner_text().count('Newt')==1)
 snapshot(pg,'08_bilan_repli.png','État final non modifié du parcours complet automatisé ; import puis affichage du bilan')
 # Re-create a running room for responsive check, no localStorage dependencies.
 start(pg,'v107-service');pg.set_viewport_size({'width':844,'height':390});pg.wait_for_timeout(350)
 boxes={id:pg.locator('#'+id).bounding_box() for id in ['hud','scene','squadbar','footer']}
 check('HUD et ordres hors canvas 844×390',boxes['hud']['y']+boxes['hud']['height']<=boxes['scene']['y']+.2 and boxes['scene']['y']+boxes['scene']['height']<=boxes['squadbar']['y']+.2,boxes)
 check('Pas de débordement horizontal',pg.evaluate('document.documentElement.scrollWidth<=innerWidth'))
 snapshot(pg,'09_service_844x390.png','Viewport Chromium 844×390, inspection de la nouvelle maintenance')
 pg.locator('#pause-open').click();pg.locator('#reduced').check();pg.locator('#contrast').check();check('Options accessibilité activables',pg.locator('body').get_attribute('class')=='reduced-motion high-contrast');resume(pg)
 check('Aucune erreur JavaScript',not errors,errors)
 browser.close()
(ROOT/'report/browser-tail-v108.json').write_text(json.dumps({'browser':'Chromium through Python Playwright','transport':'distributed offline HTML via set_content; unchanged Blob module loader','nativeTantalus':False,'tests':results,'pageErrors':errors,'consoleErrors':console,'captures':captures},ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'passed':sum(x['ok'] for x in results),'total':len(results),'errors':errors,'captures':len(captures)}))
