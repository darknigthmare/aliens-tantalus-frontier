import hashlib
from pathlib import Path
import json
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parent.parent;HTML=(R/'JOUER_ALIENS_V110.html').read_text();results=[];errors=[];captures=[];requests=[]
def ck(n,ok,d=None):
 results.append({'name':n,'ok':bool(ok),'detail':d});print(n,ok,flush=True);assert ok,(n,d)
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox']);context=b.new_context(viewport={'width':844,'height':390},has_touch=True,is_mobile=True,accept_downloads=True);page=context.new_page();page.on('pageerror',lambda e:errors.append(str(e)));page.on('request',lambda r:requests.append(r.url));page.set_content((R/'JOUER_ALIENS_V110.html').read_text());page.locator('#start-operation').click();page.wait_for_timeout(150)
 boxes={id:page.locator('#'+id).bounding_box() for id in ['hud','scene','contactbar','squadbar','footer','touch']}
 ck('Commandes tactiles visibles dans le flux de jeu',page.locator('#touch').is_visible() and page.locator('#play #touch').count()==1)
 ck('Détecteur et commandes tactiles hors canvas en 844×390',boxes['scene']['y']+boxes['scene']['height']<=boxes['contactbar']['y']+.2 and boxes['contactbar']['y']+boxes['contactbar']['height']<=boxes['squadbar']['y']+.2 and boxes['squadbar']['y']+boxes['squadbar']['height']<=boxes['touch']['y']+.2,boxes)
 ck('Canvas visible en paysage tactile',boxes['scene']['height']>130)
 ck('Aucun débordement paysage',page.evaluate('document.documentElement.scrollWidth <= innerWidth'))
 page.locator('#pace').click();ck('Bouton prudence accessible au tactile',page.locator('#pace').get_attribute('aria-pressed')=='true');page.screenshot(path=str(R/'report/captures-v110/15_tactile_844.png'));captures.append({'file':'15_tactile_844.png','origin':'Viewport 844×390 avec has_touch/is_mobile, commande prudente cliquée; pas de téléphone physique','htmlSHA256':hashlib.sha256(HTML.encode()).hexdigest(),'nativeTantalus':False,'imageEdited':False})
 page.set_viewport_size({'width':390,'height':844});page.wait_for_timeout(150);ck('Aucun débordement portrait 390×844',page.evaluate('document.documentElement.scrollWidth <= innerWidth'));ck('Détecteur et pause accessibles en portrait',page.locator('#pulse').is_visible() and page.locator('#pause-open').is_visible());page.locator('#pause-open').click();page.locator('#reduced').check();page.locator('#contrast').check();ck('Options en pause tactile',page.locator('#reduced').is_checked() and page.locator('#contrast').is_checked());ck('Aucune requête réseau externe',not [u for u in requests if u.startswith('http')],requests);ck('Aucune erreur UI tactile',not errors,errors);b.close()
(R/'report/browser-touch-v110.json').write_text(json.dumps({'htmlSHA256':hashlib.sha256(HTML.encode()).hexdigest(),'tests':results,'captures':captures,'pageErrors':errors,'consoleErrors':[],'physicalPhoneTested':False},ensure_ascii=False,indent=2))
