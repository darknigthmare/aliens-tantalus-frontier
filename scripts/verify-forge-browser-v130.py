"""Focused DOM/Canvas integration QA, not the full campaign. Requires Playwright + Chromium.
Run: python scripts/verify-forge-browser-v130.py --output /tmp/forge-qa
No remote services, credentials or campaign saves are used.
"""
import argparse
import functools
import http.server
import json
import os
from pathlib import Path
import threading
from playwright.sync_api import sync_playwright

parser=argparse.ArgumentParser()
parser.add_argument('--output',default='/tmp/atf-forge-v130-qa')
parser.add_argument('--offline',action='store_true',help='Inline modules; explicit in-memory Storage adapter, no network navigation')
args=parser.parse_args()
root=Path(__file__).resolve().parents[1]
out=Path(args.output);out.mkdir(parents=True,exist_ok=True)
class Handler(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*_): pass
server=None;url=''
if not args.offline:
    server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Handler,directory=str(root)))
    thread=threading.Thread(target=server.serve_forever,daemon=True);thread.start()
    url=f'http://127.0.0.1:{server.server_port}/scripts/fixtures/forge-v130.html'
results=[]
if args.offline:
    from importlib.util import spec_from_file_location,module_from_spec
    spec=spec_from_file_location('offline',root/'scripts/forge-offline-harness-v130.py');offline=module_from_spec(spec);spec.loader.exec_module(offline)
    offline_html=offline.build_offline_html(root)
def load_page(page,records=None):
    if args.offline: offline.prepare_offline_page(page,offline_html,records)
    else: page.goto(url)
def check(name,condition):
    if not condition: raise AssertionError(name)
    results.append({'name':name,'passed':True})
try:
    with sync_playwright() as p:
        browser=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium'),headless=True,args=['--no-sandbox'])
        page=browser.new_page(viewport={'width':1600,'height':1050},accept_downloads=True)
        errors=[];page.on('pageerror',lambda error:errors.append(str(error)));page.on('dialog',lambda dialog:dialog.accept())
        load_page(page);page.wait_for_function('!!window.forgeEditor');page.locator('[data-forge-field="room"]').wait_for()
        check('legacy palette mounted with 13 native types',page.locator('[data-editor-tool]').count()==13)
        page.evaluate("localStorage.setItem('atf-v47-profile-1',JSON.stringify({proof:'unchanged',xp:99}))")
        campaign=page.evaluate("localStorage.getItem('atf-v47-profile-1')")
        page.click('[data-forge-action="template"]')
        check('template validates and persists',page.evaluate('forgeEditor.validate().ok && forgeStore.lastWriteV130.persisted'))
        check('save status reports confirmed persistence','enregistré' in page.locator('.forge-save-v130').inner_text())
        def pt(x,y):
            box=page.locator('#editor-canvas').bounding_box();m=page.evaluate('forgeEditor.matrix()')
            return (box['x']+(m['x']+(x+.5)*m['scale'])/1280*box['width'],box['y']+(m['y']+(y+.5)*m['scale'])/720*box['height'])
        page.click('[data-editor-tool="wall"]');before=page.evaluate('forgeEditor.history.length');count=page.evaluate('getChangeCount()')
        page.mouse.move(*pt(5,7));page.mouse.down();page.mouse.move(*pt(12,7),steps=15);page.mouse.up()
        check('mouse stroke grouped in history',page.evaluate('forgeEditor.history.length')==before+1)
        check('mouse stroke writes once',page.evaluate('getChangeCount()')==count+1)
        check('interpolation paints every traversed cell',page.evaluate("forgeEditor.room.cells.filter(c=>c.y===7 && c.x>=5 && c.x<=12).length") == 8)
        page.click('#editor-undo');check('legacy undo button works',page.evaluate("!forgeEditor.room.cells.some(c=>c.y===7)"))
        page.click('#editor-redo');check('legacy redo button works',page.evaluate("forgeEditor.room.cells.some(c=>c.y===7)"))
        page.click('[data-forge-action="mode"][data-mode="rect"]');page.mouse.move(*pt(16,5));page.mouse.down();page.mouse.move(*pt(18,7));page.mouse.up()
        check('rectangle tool fills inclusive selection',page.evaluate("forgeEditor.room.cells.filter(c=>c.x>=16&&c.x<=18&&c.y>=5&&c.y<=7).length") == 9)
        page.click('[data-forge-action="mode"][data-mode="select"]');page.mouse.move(*pt(5,7));page.mouse.down();page.mouse.move(*pt(12,7));page.mouse.up()
        check('marquee selects only active layer',page.evaluate('forgeEditor.selection.size')==8)
        page.locator('#editor-canvas').focus();page.keyboard.press('ArrowDown');check('keyboard moves selection one row',page.evaluate("forgeEditor.selected().every(c=>c.y===8)"))
        page.keyboard.press('Control+z');check('keyboard undo does not trigger global game input',page.evaluate("forgeEditor.room.cells.filter(c=>c.x>=5&&c.x<=12&&c.y===7).length===8"))
        page.select_option('[data-forge-field="layer"]','background');page.click('[data-forge-action="mode"][data-mode="brush"]')
        page.mouse.click(*pt(5,4));check('decoration excluded from native projection',page.evaluate("forgeEditor.room.cells.some(c=>c.layer==='background') && !forgeEditor.serialize().tiles.some(c=>c.position==='5:4')"))
        page.click('[data-forge-action="visibility"][data-layer="background"]');n=page.evaluate('forgeEditor.room.cells.length');page.mouse.click(*pt(7,4));check('hidden layer ignores painting',page.evaluate('forgeEditor.room.cells.length')==n)
        page.click('[data-forge-action="visibility"][data-layer="background"]');page.click('[data-forge-action="lock-layer"][data-layer="background"]');page.mouse.click(*pt(7,4));check('locked layer ignores painting',page.evaluate('forgeEditor.room.cells.length')==n)
        page.click('[data-forge-action="lock-layer"][data-layer="background"]')
        page.click('[data-forge-action="room-copy"]');check('room duplication exposed in UI',page.evaluate('forgeEditor.model.data.rooms.length')==2)
        page.fill('[data-forge-field="room-name"]','<img src=x onerror="window.injection=true">');page.locator('[data-forge-field="room-name"]').press('Tab')
        check('untrusted room name is text, not markup',not page.evaluate('!!window.injection') and page.locator('.forge-inspector-v130 img').count()==0)
        page.fill('[data-forge-field="room-name"]','Maintenance supérieure');page.locator('[data-forge-field="room-name"]').press('Tab')
        page.fill('[data-forge-field="width"]','48');page.fill('[data-forge-field="height"]','24');page.click('[data-forge-action="resize"]')
        check('dimensions applied in UI and document',page.evaluate('forgeEditor.cols===48 && forgeEditor.rows===24'))
        # Existing app listeners must not double-run the enhanced file handlers.
        with page.expect_download() as download_info: page.click('#editor-export')
        exported=out/'project-export.json';download_info.value.save_as(exported)
        check('export downloads all rooms',len(json.loads(exported.read_text())['rooms'])==2)
        check('old export handler is intercepted',not page.evaluate('!!window.legacyExportCalled'))
        before=page.evaluate('JSON.stringify(forgeEditor.model.data)')
        page.set_input_files('#editor-import',{'name':'broken.json','mimeType':'application/json','buffer':b'{broken'})
        page.wait_for_function("document.querySelector('.forge-message-v130').textContent.includes('JSON illisible')")
        check('bad file import keeps document intact',page.evaluate('JSON.stringify(forgeEditor.model.data)')==before)
        check('file input resets after invalid import',page.locator('#editor-import').input_value()=='')
        page.set_input_files('#editor-import',str(exported));page.wait_for_function("document.querySelector('.forge-message-v130').textContent.includes('Projet importé')")
        check('round-trip import preserves full project',page.evaluate('JSON.stringify(forgeEditor.model.data)')==before)
        check('old import handler is intercepted',not page.evaluate('!!window.legacyImportCalled'))
        # Restore readable content for visual inspection and exercise true pointer cancellation.
        page.select_option('[data-forge-field="room"]','room-1');page.click('[data-editor-tool="wall"]')
        before=page.evaluate('JSON.stringify(forgeEditor.model.data)');page.mouse.move(*pt(10,10));page.mouse.down();page.mouse.move(*pt(14,10))
        page.dispatch_event('#editor-canvas','pointercancel',{'pointerId':1});page.mouse.up()
        check('browser pointer cancellation restores document',page.evaluate('JSON.stringify(forgeEditor.model.data)')==before)
        page.click('[data-forge-action="fit"]');page.mouse.move(*pt(10,10));page.mouse.wheel(0,-200)
        check('wheel zoom remains finite',page.evaluate('forgeEditor.viewport.zoom>1&&Number.isFinite(forgeEditor.viewport.x)'))
        page.click('[data-forge-action="fit"]')
        check('campaign key unchanged by authoring and IO',page.evaluate("localStorage.getItem('atf-v47-profile-1')")==campaign)
        page.click('#editor-play');check('playtest receives current room projection',page.evaluate('nativeTestProjection.activeRoomId===forgeEditor.room.id'))
        page.screenshot(path=str(out/'forge-desktop.png'),full_page=True)
        page.click('[data-forge-action="expand"]');check('expanded atelier opens',page.locator('.forge-expanded-v130').count()==1)
        page.evaluate('forgeEditor.selection.clear()');page.locator('#editor-canvas').focus();page.keyboard.press('Escape');check('escape leaves expanded atelier',page.locator('.forge-expanded-v130').count()==0)
        # Storage failure must be visible, not falsely reported as saved.
        raw=page.evaluate('forgeStore.expectedRawV130')
        page.evaluate("forgeStore.storage={getItem:key=>localStorage.getItem(key),setItem(){throw new Error('quota-test')}};forgeEditor.edit('test quota',()=>{forgeEditor.room.name='Essai en mémoire'})")
        check('storage failure is surfaced in UI','quota-test' in page.locator('.forge-save-v130').inner_text())
        check('failed save preserves primary bytes',page.evaluate("localStorage.getItem(forgeStore.key)")==raw)
        page.evaluate('forgeStore.storage=localStorage;forgeEditor.notify()')
        load_page(page,page.evaluate('localStorage.dump()')) if args.offline else page.reload();page.wait_for_function('!!window.forgeEditor');check('persisted multiroom data survive reload',page.evaluate('forgeEditor.model.data.rooms.length')==2)
        for width,height in [(1024,768),(390,844)]:
            page.set_viewport_size({'width':width,'height':height});page.screenshot(path=str(out/f'forge-{width}.png'),full_page=True)
            check(f'no horizontal overflow at {width}px',page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'))
            check(f'canvas retains positive visible dimensions at {width}px',page.locator('#editor-canvas').bounding_box()['width']>100)
        touch=browser.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True)
        mobile=touch.new_page();load_page(mobile);mobile.wait_for_function('!!window.forgeEditor');mobile.locator('#editor-canvas').tap()
        check('touch pointer commits a paint gesture',mobile.evaluate('forgeEditor.room.cells.length')==1)
        check('no uncaught browser errors',not errors)
        browser.close()
finally:
    if server: server.shutdown();server.server_close()
    (out/'browser-results.json').write_text(json.dumps({'checks':len(results),'mode':'offline-memory-storage' if args.offline else 'http-native-storage','results':results},ensure_ascii=False,indent=2))
print(json.dumps({'checks':len(results),'passed':sum(r['passed'] for r in results),'output':str(out)},ensure_ascii=False))
