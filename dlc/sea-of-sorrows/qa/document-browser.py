#!/usr/bin/env python3
"""Current document checks; HTML content loaded directly, not native navigation."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json,hashlib
P=Path(__file__).resolve().parents[1];out=P/'reports/document-captures';out.mkdir(exist_ok=True)
checks=[];errors=[];n=340

def ck(name,v):
 checks.append({'name':name,'pass':bool(v)});print(('PASS 'if v else'FAIL ')+name,flush=True)
with sync_playwright()as w:
 b=w.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage']);p=b.new_page(viewport={'width':1440,'height':960});p.on('pageerror',lambda e:errors.append(str(e)))
 p.set_content((P/'reports/RAPPORT_ILLUSTRE.html').read_text(),wait_until='load');p.evaluate("document.querySelectorAll('img').forEach(i=>i.loading='eager')");p.wait_for_function('Array.from(document.images).every(i=>i.complete&&i.naturalWidth>0)')
 ck('Huit captures réellement intégrées',p.locator('figure img').count()==8)
 ck('Rapport bureau sans débordement global',p.evaluate('document.documentElement.scrollWidth<=innerWidth+1'))
 text=p.locator('body').inner_text();ck('432 tests et 340 contrôles annoncés','432 / 432'in text and'340 / 340'in text)
 ck('Défaites et correctifs conservés','échoue encore en Latérale'in text and'répétition'in text and'caché'in text)
 ck('Native et matériel physique non certifiés','ERR_BLOCKED_BY_ADMINISTRATOR'in text and'matériel physique'in text)
 ck('Six parcours avec invariance',p.locator('#parcours tbody tr').count()==6 and'Contrôles d’invariance'in text)
 ck('Audio rendu et qualité humaine distingués','OfflineAudioContext'in text and'qualité artistique'in text)
 ck('Faute de stockage et copie non atomique déclarées','explicitement injectées'in text and'transaction atomique'in text)
 p.screenshot(path=str(out/'rapport-bureau.png'));p.locator('figure').nth(5).scroll_into_view_if_needed();p.screenshot(path=str(out/'rapport-seuil.png'))
 p.set_viewport_size({'width':390,'height':844});ck('Rapport 390 px sans débordement',p.evaluate('document.documentElement.scrollWidth<=innerWidth+1'));p.screenshot(path=str(out/'rapport-etroit.png'))
 p.set_viewport_size({'width':1440,'height':960});p.set_content((P/'CODEX_MER_DES_CHAGRINS.html').read_text(),wait_until='load');text=p.locator('body').inner_text()
 ck('50 plans de données',p.locator('.schematic').count()==50)
 ck('50 ancres de salles',p.locator('h3[id^=room-]').count()==50)
 ck('50 liens de salles valides',p.locator('.roomlinks a').count()==50 and p.evaluate("Array.from(document.querySelectorAll('.roomlinks a')).every(a=>document.getElementById(a.getAttribute('href').slice(1)))"))
 ck('120 dossiers complets',p.locator('#registre details').count()==120)
 ck('Dix casiers représentés',p.locator('.schematic [data-locker]').count()==10)
 ck('Casiers et surplus documentés','Les récompenses et stocks antérieurs'in text and'Stocks repérés'in text and'2,4 secondes'in text)
 ck('Dix éclairages dessinés',p.locator('.schematic [data-lux]').count()==10)
 ck('Huit cloisons et huit lectures',p.locator('.schematic svg text').all_text_contents().count('CLOISON')==8 and p.locator('.schematic svg text').all_text_contents().count('LECTURE')==8)
 ck('76 extrémités de poursuite',p.locator('.schematic circle[stroke="#e7ad6d"]').count()==76)
 ck('Commandes et absence de remappage manette explicités','31 actions au clavier'in text and'ne sont pas reconfigurés'in text)
 ck('Deux légendes et quatre volumes expliqués','au plus deux événements'in text and'Quatre volumes distincts'in text)
 ck('Copie valide et risques de stockage documentés','.last-valid'in text and'pas une transaction atomique'in text)
 ck('Schéma 8 conservé et autonomie explicite','schémas 1 à 7'in text and'schéma de jeu reste 8'in text and'aucun push GitHub'in text)
 ck('Codex bureau sans débordement',p.evaluate('document.documentElement.scrollWidth<=innerWidth+1'))
 p.locator('#room-s47').scroll_into_view_if_needed();p.screenshot(path=str(out/'codex-vestiaire.png'))
 p.set_viewport_size({'width':390,'height':844});ck('Codex 390 px sans débordement',p.evaluate('document.documentElement.scrollWidth<=innerWidth+1'));p.screenshot(path=str(out/'codex-etroit.png'))
 ck('Aucune exception JavaScript',not errors);b.close()
r={'scope':'Document-only review, not gameplay or native navigation','version':'0.9.0','checks':checks,'passed':sum(c['pass']for c in checks),'failed':sum(not c['pass']for c in checks),'errors':errors,'input_sha256':{f:hashlib.sha256((P/f).read_bytes()).hexdigest()for f in ['reports/RAPPORT_ILLUSTRE.html','CODEX_MER_DES_CHAGRINS.html']}}
(P/'reports/document-review.json').write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n');assert r['failed']==0
