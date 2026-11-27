"""Chromium UI recipe for V109 contacts. States are unedited outputs of the
public-input driver. DOM evaluation only measures UI layout, never engine data."""
from pathlib import Path
import json
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parent.parent;HTML=(R/'JOUER_ALIENS_V109.html').read_text();CAP=R/'report/captures-v109'
results=[];captures=[];errors=[];console=[]
def flush():
 (R/'report/browser-contact-a-v109.json').write_text(json.dumps({'browser':'Chromium through Python Playwright','tests':results,'captures':captures,'pageErrors':errors,'consoleErrors':console,'nativeTantalus':False},ensure_ascii=False,indent=2))
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
 for label,name in [('03-relais','03_relais_retabli.png'),('04-newt','04_newt_recrutee.png'),('05-retour-operations','05_escorte_operations.png')]:
  d=json.loads((R/'report/states-v109'/f'{label}.json').read_text());load(pg,d);ck('Reprise du parcours V109 : '+label,export(pg)==d);resume(pg);pg.wait_for_timeout(160);shot(pg,name,'État non modifié du parcours complet V109 piloté par entrées publiques : '+label)
 # The enemies have not crossed yet: let the shipped simulation advance.
 d=saved('02-fuite-operations');load(pg,d);ck('Deux menaces restent dans Hadley après le départ',sum(a['alive'] for a in d['worlds']['v106-hadley']['actors'])==2 and d['contacts']['metrics']['transfers']==0)
 resume(pg);pg.keyboard.down('d');pg.wait_for_timeout(900);pg.keyboard.up('d');pg.keyboard.press('h');pg.wait_for_timeout(3900);after=export(pg)
 ck('Poursuite exécutée hors champ puis arrivée dans Operations',after['contacts']['metrics']['transfers']>=1 and any(a['id'].startswith('warrior') for a in after['worlds']['v107-operations']['actors']))
 ck('Une seule instance par menace après changement de pièce',len({a['id'] for w in after['worlds'].values() for a in w['actors']})==sum(len(w['actors']) for w in after['worlds'].values()))
 ck('Horloges des lieux hors champ avancées',after['worlds']['v106-hadley']['time']>d['worlds']['v106-hadley']['time']+1)
 resume(pg);pg.wait_for_timeout(100);shot(pg,'10_contact_poursuite.png','Reprise du point de fuite non modifié, marche au clavier puis poursuite exécutée en direct dans Chromium')
 # Actual pulse; actor locations aren't injected.
 load(pg,saved('04-avant-impulsion'));resume(pg);pg.wait_for_timeout(60);pg.keyboard.press('t');pg.wait_for_timeout(80);shot(pg,'11_detecteur_mesure.png','Point de poursuite non modifié puis vraie impulsion T dans le navigateur');pulse=export(pg)
 ck('Impulsion T produit une mesure de mouvement',pulse['contacts']['tracker']['pulses']>0 and len(pulse['contacts']['tracker']['samples'])>0,pulse['contacts']['tracker'])
 ck('Échos quantifiés sans identité, position précise ou PV',all(set(e)=={'bearing','range'} and e['range']%100==0 for e in pulse['contacts']['tracker']['samples']))
 resume(pg);pg.keyboard.press('t');pg.wait_for_timeout(40);blocked=export(pg);ck('Double impulsion refusée pendant recharge',blocked['contacts']['tracker']['pulses']==pulse['contacts']['tracker']['pulses'])
 resume(pg);pg.wait_for_timeout(2200);expired=export(pg);ck('Échos périmés après deux secondes',expired['contacts']['tracker']['samples']==[])
 # Native V109 import after migration of threats is exact.
 load(pg,pulse);ck('Reprise exacte de la mémoire, des mondes et de la recharge',export(pg)==pulse)
 bad=json.loads(json.dumps(pulse));bad['contacts']['brains']['warrior-a']['stealth']=True;load(pg,bad);ck('Champ de mémoire inconnu rejeté avant mutation',export(pg)==pulse)
 bad=json.loads(json.dumps(pulse));bad['worlds']['v107-operations']['actors'].append(json.loads(json.dumps(bad['worlds']['v107-operations']['actors'][0])));load(pg,bad);ck('Créature dupliquée refusée atomiquement',export(pg)==pulse)
 ck('Aucune erreur JavaScript contacts',not errors and not console,{'page':errors,'console':console});b.close()
flush()
print(json.dumps({'passed':sum(x['ok'] for x in results),'total':len(results),'captures':len(captures),'errors':errors}))
