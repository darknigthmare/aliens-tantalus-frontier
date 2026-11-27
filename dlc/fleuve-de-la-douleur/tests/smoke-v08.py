from pathlib import Path
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from functools import partial
import threading,shutil,json
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parents[1]
report={'agentBrowser':shutil.which('agent-browser'),'errors':[]}
server=ThreadingHTTPServer(('127.0.0.1',0),partial(SimpleHTTPRequestHandler,directory=str(R)))
th=threading.Thread(target=server.serve_forever,daemon=True);th.start()
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 q=b.new_page(viewport={'width':1600,'height':900});q.on('pageerror',lambda e:report['errors'].append(str(e)))
 try:q.goto(f'http://127.0.0.1:{server.server_port}/JOUER.html',timeout=8000);report['http']=True
 except Exception as e:report['http']=False;report['httpError']=str(e);q.set_content((R/'JOUER.html').read_text())
 q.wait_for_function('!!window.ROP_APP');report['title']=q.title();report['buttons']=q.get_by_role('button').all_text_contents()
 q.screenshot(path=str(R/'captures/00-title-v08.png'))
 q.locator('#import-file').set_input_files(str(R/'tests/fixtures/v08/parked.json'));q.get_by_role('button',name='CHARGER',exact=True).click();q.get_by_role('button',name='REPRENDRE LE PARCOURS',exact=True).click();q.keyboard.press('Digit5');q.wait_for_timeout(200)
 q.screenshot(path=str(R/'captures/00-cabin-smoke-v08.png'))
 q.locator('[data-rover-action="board"]').click();q.wait_for_function('ROP_APP.simulation.s.mobility.rover.driver!==null');q.wait_for_timeout(300)
 q.screenshot(path=str(R/'captures/00-driven-smoke-v08.png'))
 report['state']=q.evaluate('ROP_APP.simulation.s.mobility');report['loaded']=True;b.close()
server.shutdown();server.server_close();th.join(timeout=2)
(R/'docs/SMOKE_V08.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));print(json.dumps(report,ensure_ascii=False,indent=2))
