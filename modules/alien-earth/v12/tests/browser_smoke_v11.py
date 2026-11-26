from pathlib import Path
import json,hashlib,os,traceback
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parents[1]; CAP=R/'docs/v11/captures';CAP.mkdir(parents=True,exist_ok=True)
html=(R/'JOUER_ALIEN_EARTH_V11.html').read_text()
rep={'suite':'browser-smoke-v11','bundleSha256':hashlib.sha256(html.encode()).hexdigest(),'checks':[],'pageErrors':[],'captures':[]}
def ck(name,ok,detail=''):
 rep['checks'].append({'name':name,'pass':bool(ok),'detail':detail}); print(('PASS ' if ok else 'FAIL ')+name,flush=True)
 if not ok: raise AssertionError(name+' '+str(detail))
with sync_playwright() as p:
 b=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium'),headless=True,args=['--no-sandbox']);rep['browser']=b.version
 page=b.new_page(viewport={'width':1480,'height':1040},accept_downloads=True);page.on('pageerror',lambda e:rep['pageErrors'].append(str(e)))
 def ev(s): return page.evaluate(s)
 def click(s): page.locator('#panel '+s).first.click();page.wait_for_timeout(50)
 def load(r): ev(f"__EARTH_QA.loadRoom('{r}')");page.wait_for_timeout(20)
 try:
  page.set_content(html.replace('<html lang="fr">','<html lang="fr" data-earth-qa="1">'),wait_until='load');page.wait_for_timeout(120)
  ck('V11 title visible','11.0.0' in page.inner_text('#panel') and 'Le navire derrière les portes' in page.inner_text('#panel'))
  click('[data-act="new"]');click('[data-act="confirmNew"]');click('[data-act="start"]')
  ck('Campaign starts in R01',ev("__EARTH_QA.state().room==='R01'"))
  rooms=ev('__EARTH_QA.data.rooms.map(r=>r.id)')
  ck('Exactly 70 rooms are delivered',len(rooms)==70)
  for rid in rooms:
   load(rid); ev('__EARTH_QA.freeze()')
   ck(rid+' renders without page error',ev('__EARTH_QA.state().room')==rid and not rep['pageErrors'])
   ev('__EARTH_QA.resume()')
  expected={'R01':12,'R05':7,'R09':7,'R13':9,'R17':14,'R21':7,'R25':7,'R29':7}
  for rid,count in expected.items():
   load(rid);page.keyboard.press('Tab');page.wait_for_timeout(40);ck(rid+' map exposes complete local graph',page.locator('.map-room').count()==count);page.keyboard.press('Escape');page.wait_for_timeout(30)
  page.keyboard.press('Digit5');page.wait_for_timeout(40);ck('Reference registry opens',page.locator('.reference-tabs').count()==1);ck('Registry lists 70 locations',page.locator('.reference-places article').count()==70)
  click('[data-tab="cast"]');ck('25 cast silhouettes render',page.locator('[data-portrait]').count()==25)
  click('[data-tab="gear"]');ck('Five weapon silhouettes render',page.locator('[data-weapon]').count()==5)
  click('[data-tab="limits"]');ck('Six unresolved fidelity classes are disclosed',page.locator('.reference-missing').count()==6);ck('Reference tab exposes at least twenty cited production links',page.locator('a[href]').count()>=20)
  page.keyboard.press('Escape');load('R05');ck('Joe uses MCS-X by default',ev("__EARTH_QA.engine().weaponId==='mcsx'"));page.keyboard.press('Digit6');page.wait_for_timeout(30);ck('Joe can select Maxim 9',ev("__EARTH_QA.engine().weaponId==='maxim9'"));page.keyboard.press('Digit6');page.wait_for_timeout(30);ck('Joe can return to MCS-X',ev("__EARTH_QA.engine().weaponId==='mcsx'"))
  for rid,title in [('R63','Medbay One'),('R64','Salle des machines'),('R65','Chambre de confinement'),('R66','Lobby de Neverland'),('R67','Atrium de Neverland'),('R68','Talking Room'),('R69','Baie médicale'),('R70','Laboratoire sécurisé')]:
   load(rid);ck(rid+' uses its sourced location identity',title.lower() in ev('__EARTH_QA.engine().room.title.toLowerCase()'))
  # Save-file chooser roundtrip is exercised by browser_fidelity_v11.py.
  ck('No page errors in consolidated smoke',not rep['pageErrors'],rep['pageErrors'])
 except Exception:
  rep['exception']=traceback.format_exc();print(rep['exception']);page.screenshot(path=str(CAP/'v11-smoke-failure.png'))
 finally:
  rep['passed']=sum(x['pass'] for x in rep['checks']);rep['total']=len(rep['checks']);rep['ok']=not rep.get('exception') and not rep['pageErrors'] and rep['passed']==rep['total'];(R/'docs/v11/QA_BROWSER_SMOKE_V11.json').write_text(json.dumps(rep,ensure_ascii=False,indent=2));b.close()
if not rep['ok']: raise SystemExit(1)
print(f"SUCCESS {rep['passed']}/{rep['total']}")
