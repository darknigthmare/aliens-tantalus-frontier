
import sys
sys.path.extend(['/opt/pyvenv/lib/python3.13/site-packages'])
from pathlib import Path
from playwright.sync_api import sync_playwright
import json,hashlib,threading,http.server,functools,traceback
R=Path(__file__).resolve().parents[1]
log={'errors':[],'captures':[],'http':None,'hash':hashlib.sha256((R/'JOUER.html').read_bytes()).hexdigest()}
handler=functools.partial(http.server.SimpleHTTPRequestHandler,directory=str(R))
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),handler);thread=threading.Thread(target=server.serve_forever,daemon=True);thread.start()
def load(q,name):
 q.locator('#import-file').set_input_files(str(R/'tests/fixtures/v09'/f'{name}.json'))
 q.get_by_role('button',name='CHARGER',exact=True).click()
 q.get_by_role('button',name='REPRENDRE LE PARCOURS',exact=True).click()
 q.wait_for_function('!!ROP_APP.started&&!ROP_APP.modal')
def snap(q,name):
 q.wait_for_timeout(500)
 file=R/'qa-v09'/f'preview-{name}.png';q.screenshot(path=str(file))
 log['captures'].append(str(file))
try:
 with sync_playwright() as p:
  b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
  q=b.new_page(viewport={'width':1440,'height':900},device_scale_factor=1)
  q.on('pageerror',lambda e:log['errors'].append(str(getattr(e,'stack',e))))
  try:q.goto(f'http://127.0.0.1:{server.server_address[1]}/JOUER.html',timeout=10000);log['http']='loaded'
  except Exception as e:log['http']=str(e);q.close();q=b.new_page(viewport={'width':1440,'height':900});q.on('pageerror',lambda e:log['errors'].append(str(getattr(e,'stack',e))))
  q.set_content((R/'JOUER.html').read_text(),wait_until='load');q.wait_for_function('!!window.ROP_APP')
  snap(q,'title')
  for fixture in ['medical','family','greenhouse','pilot','vault','armory','road','stairs']:
   load(q,fixture);snap(q,fixture)
  load(q,'armory');q.keyboard.press('Digit6');snap(q,'arsenal')
  q.keyboard.press('Escape');q.keyboard.press('Digit7');q.locator('[data-fidelity-cat="personnage"]').click();snap(q,'profiles')
  log['state']=q.evaluate('({version:ROP_DATA.manifest.version,rooms:ROP_DATA.rooms.length,modal:ROP_APP.modal})')
  b.close()
except Exception as e:
 log['failure']=str(e);log['trace']=traceback.format_exc()
finally:
 server.shutdown();(R/'qa-v09/preview.json').write_text(json.dumps(log,indent=2))
