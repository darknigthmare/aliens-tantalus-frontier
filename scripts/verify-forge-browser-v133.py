"""V133 authoring UI regression. --offline uses native ES modules and in-memory Storage.
The default HTTP mode uses Chromium's real origin storage; no campaign runtime is claimed.
"""
import argparse
import functools
import http.server
import importlib.util
import json
import os
from pathlib import Path
import threading
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--output', default='/tmp/forge-v133-browser')
    parser.add_argument('--offline', action='store_true')
    args = parser.parse_args()
    out = Path(args.output); out.mkdir(parents=True, exist_ok=True)
    spec = importlib.util.spec_from_file_location('host', ROOT / 'scripts/forge-offline-harness-v130.py')
    host = importlib.util.module_from_spec(spec); spec.loader.exec_module(host)
    html = host.build_offline_html(ROOT) if args.offline else None
    class Handler(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *_): pass
    server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Handler, directory=str(ROOT)))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    url = f'http://127.0.0.1:{server.server_port}/scripts/fixtures/forge-v130.html'
    results = []; errors = []
    def check(name, passed):
        results.append({'name': name, 'passed': bool(passed)})
        if not passed: raise AssertionError(name)
    def load(page, records=None):
        if args.offline: host.prepare_offline_page(page, html, records)
        else: page.goto(url)
        page.wait_for_function('!!window.forgeEditor?.workbenchV133')
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH', '/usr/bin/chromium'), headless=True, args=['--no-sandbox'])
            page = browser.new_page(viewport={'width': 1600, 'height': 1080}, accept_downloads=True)
            page.on('dialog', lambda d: d.accept()); page.on('pageerror', lambda e: errors.append(str(e)))
            load(page)
            act = lambda name: page.locator(f'[data-work-action="{name}"]')
            field = lambda name: page.locator(f'[data-work-field="{name}"]')
            def tab(name): page.click(f'[data-work-action="tab"][data-tab="{name}"]')
            def pt(x,y):
                box = page.locator('#editor-canvas').bounding_box(); m = page.evaluate('forgeEditor.matrix()')
                return box['x'] + (m['x']+(x+.5)*m['scale']) / 1280 * box['width'], box['y'] + (m['y']+(y+.5)*m['scale']) / 720 * box['height']
            page.evaluate("localStorage.setItem('atf-v47-profile-1','unaltered-campaign')")
            check('four editor workbench tabs are present', page.locator('.forge-tabs-v133 [data-tab]').count() == 4)
            tab('assemblies')
            check('ten original assembly modules are available', act('assembly-choose').count() == 10)
            page.click('[data-assembly="builtin-terminal"]'); act('stamp').click()
            page.locator('#editor-canvas').scroll_into_view_if_needed()
            before = page.evaluate('forgeEditor.room.cells.length')
            page.mouse.move(*pt(2,5))
            check('preview never modifies the authored document', page.evaluate('forgeEditor.room.cells.length') == before)
            writes = page.evaluate('getChangeCount()'); page.mouse.click(*pt(2,5))
            check('stamp places the whole group in one change', page.evaluate('getChangeCount()') == writes+1 and page.evaluate('forgeEditor.room.cells.length') == 6)
            before = page.evaluate('JSON.stringify(forgeEditor.model.data)'); page.mouse.click(*pt(2,5))
            check('conflicting stamp is rejected without partial writes', page.evaluate('JSON.stringify(forgeEditor.model.data)') == before)
            check('collision message is explicit', 'Pose refusée' in page.locator('[data-work-message]').inner_text())
            page.mouse.click(*pt(10,5))
            check('successive stamps have unique cell IDs', page.evaluate('new Set(forgeEditor.room.cells.map(c=>c.id)).size===12'))
            page.keyboard.press('Escape')
            check('Escape exits stamp without leaving the editor', page.evaluate('forgeEditor.mode==="brush"'))
            tab('tools'); field('scope').select_option('visible'); act('select-all').click()
            check('visible-layer selection includes structure and interactions', page.evaluate('forgeEditor.selection.size') == 12)
            act('lock').click(); check('bulk lock reaches both layers', page.evaluate('forgeEditor.room.cells.every(c=>c.locked)'))
            act('rotate').click(); check('locked group cannot rotate', 'Déverrouillez' in page.locator('[data-work-message]').inner_text())
            act('unlock').click(); check('bulk unlock is applied', page.evaluate('forgeEditor.room.cells.every(c=>!c.locked)'))
            tab('assemblies'); field('assembly-name').fill('Double poste personnel'); act('capture').click()
            check('selected group is persisted in the personal library', page.evaluate('forgeEditor.workbenchV133.library.data.entries.length') == 1)
            check('personal library uses its own storage namespace', page.evaluate("JSON.parse(localStorage.getItem('atf-forge-assemblies-v133')).entries[0].name==='Double poste personnel'"))
            act('stamp-rotate').click(); act('stamp-mirror').click()
            check('assembly rotation and mirror update the placement selection', '90°' in page.locator('[data-work-assembly-name]').inner_text() and 'miroir' in page.locator('[data-work-assembly-name]').inner_text())
            with page.expect_download() as info: act('library-export').click()
            file = out/'assemblies-export.json'; info.value.save_as(file)
            check('library export contains the reusable cell group', len(json.loads(file.read_text())['entries'][0]['cells']) == 12)
            field('library-import').set_input_files(str(file))
            page.wait_for_function('forgeEditor.workbenchV133.library.data.entries.length===2')
            check('library import adds a copy instead of overwriting', page.evaluate('forgeEditor.workbenchV133.library.data.entries.length') == 2)
            field('assembly-search').fill('personnel');check('library text filter works', act('assembly-choose').count() == 2)
            field('assembly-search').fill('');page.screenshot(path=str(out/'assemblies-1600.png'),full_page=True)
            tab('projects'); field('project-name').fill('Station Alpha'); act('project-rename').click()
            first = page.evaluate('forgeEditor.workspaceV133.id'); before = page.evaluate('JSON.stringify(forgeEditor.model.data.rooms)')
            check('user-chosen name survives the old app callback', page.evaluate('forgeStore.data.projects[0].name') == 'Station Alpha')
            page.select_option('#editor-mode','ship')
            check('mode change keeps the same project identity', page.evaluate('forgeEditor.workspaceV133.id') == first and page.evaluate('forgeStore.data.projects.length') == 1)
            field('project-name').fill('Station Bêta');field('project-kind').select_option('mission');act('project-create').click()
            second = page.evaluate('forgeEditor.workspaceV133.id')
            check('new project retains old project content', page.evaluate('forgeStore.data.projects.length') == 2)
            check('new document has isolated empty history', page.evaluate('forgeEditor.history.length===0&&forgeEditor.room.cells.length===0'))
            page.click(f'[data-project="{first}"]')
            check('opening project restores its exact rooms', page.evaluate('JSON.stringify(forgeEditor.model.data.rooms)') == before)
            check('opening a project does not create an undo route to another project', page.evaluate('forgeEditor.history.length') == 0)
            field('project-name').fill('Copie Alpha');act('project-copy').click()
            check('save-as creates a third independent project', page.evaluate('forgeStore.data.projects.length') == 3)
            field('project-search').fill('Bêta');check('project filter finds requested project', act('project-open').count() == 1);field('project-search').fill('')
            with page.expect_download() as info: act('workspace-export').click()
            file = out/'projects-export.json';info.value.save_as(file)
            check('workspace export includes every project', len(json.loads(file.read_text())['projects']) == 3)
            field('workspace-import').set_input_files(str(file));page.wait_for_function('forgeStore.data.projects.length===6')
            check('workspace import retains existing projects and adds unique copies', page.evaluate('new Set(forgeStore.data.projects.map(p=>p.id)).size===6'))
            # Defer a real file text promise, change the document, then finish the old read.
            page.evaluate('''()=>{const input=document.querySelector('[data-work-field="workspace-import"]'),data=new DataTransfer(),file=new File([JSON.stringify({schema:1,projects:[]})],'slow.json',{type:'application/json'});file.text=()=>new Promise(resolve=>window.finishImport=resolve);data.items.add(file);input.files=data.files;input.dispatchEvent(new Event('change',{bubbles:true}));}''')
            field('project-name').fill('Renommé pendant lecture');act('project-rename').click()
            page.evaluate('finishImport(JSON.stringify({schema:1,projects:[]}))')
            page.wait_for_function("document.querySelector('[data-work-message]').textContent.includes('lecture')")
            check('stale asynchronous import is rejected', 'Import annulé' in page.locator('[data-work-message]').inner_text())
            check('file input resets after stale import', field('workspace-import').input_value() == '')
            active = page.evaluate('forgeEditor.workspaceV133.id'); disk = page.evaluate('forgeStore.expectedRawV130')
            page.evaluate("forgeStore.storage={getItem:k=>localStorage.getItem(k),setItem(){throw new Error('quota-v133')}}")
            page.click(f'[data-project="{second}"]')
            check('quota failure blocks project switching', page.evaluate('forgeEditor.workspaceV133.id') == active)
            check('quota failure keeps previous durable bytes', page.evaluate('localStorage.getItem(forgeStore.key)') == disk)
            check('quota warning tells user to export', 'Exportez' in page.locator('[data-work-message]').inner_text())
            page.evaluate('forgeStore.storage=localStorage');act('project-save').click()
            check('save can be retried without losing current project', page.evaluate('forgeStore.lastWriteV130.persisted'))
            page.screenshot(path=str(out/'projects-1600.png'),full_page=True)
            # Create two sectors and link doors using the actual inspector controls.
            tab('tools');page.click('[data-forge-action="room-add"]')
            page.click('[data-forge-action="template"]')
            page.evaluate("forgeEditor.edit('sas fixture',()=>forgeEditor.model.paint(8,15,'door','gameplay'))")
            room2 = page.evaluate('forgeEditor.room.id')
            page.click('[data-forge-action="room-copy"]')
            page.select_option('[data-forge-field="link-to"]',index=0);page.click('[data-forge-action="link"]')
            tab('graph');check('room network lists all sectors', page.locator('[data-work-graph] article').count() == 3)
            check('network reports the disconnected original sector', page.locator('[data-work-graph] article[data-reachable="false"]').count() == 1)
            page.locator(f'[data-work-action="room-open"][data-room="{room2}"]').first.click()
            check('clicking the room network opens that sector', page.evaluate('forgeEditor.room.id') == room2)
            page.locator('[data-work-action="door-focus"]').last.click()
            check('door node focuses and selects the physical door', page.evaluate('forgeEditor.selected()[0]?.type') == 'door')
            page.screenshot(path=str(out/'network-1600.png'),full_page=True)
            tab('tools');act('outline').click();page.locator('#editor-canvas').scroll_into_view_if_needed();page.mouse.move(*pt(2,2));page.mouse.down();page.mouse.move(*pt(6,5),steps=5);page.mouse.up()
            check('hollow rectangle has no center fill', page.evaluate('!forgeEditor.room.cells.some(c=>c.x===3&&c.y===3)'))
            with page.expect_download() as info: act('png').click()
            file = out/'canvas-export.png'; info.value.save_as(file)
            check('PNG export produces a real image file', file.read_bytes().startswith(b'\x89PNG'))
            records = page.evaluate('localStorage.dump()') if args.offline else None
            load(page, records) if args.offline else page.reload()
            page.wait_for_function('!!forgeEditor.workspaceV133')
            check('workspace projects survive fixture reload', page.evaluate('forgeStore.data.projects.length') == 6)
            check('personal assemblies survive fixture reload', page.evaluate('forgeEditor.workbenchV133.library.data.entries.length') == 2)
            check('campaign bytes unchanged throughout authoring workflow', page.evaluate("localStorage.getItem('atf-v47-profile-1')") == 'unaltered-campaign')
            for width,height in [(1600,1080),(1024,900),(390,844)]:
                page.set_viewport_size({'width':width,'height':height})
                for name in ['tools','assemblies','projects','graph']:
                    tab(name)
                    check(f'no horizontal page overflow on {name} at {width}',page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'))
                tab('tools');page.screenshot(path=str(out/f'workbench-{width}.png'),full_page=True)
            check('no uncaught browser errors',not errors)
            browser.close()
    finally:
        server.shutdown();server.server_close()
        (out/'results.json').write_text(json.dumps({'scope':'offline-native-modules-memory-storage' if args.offline else 'http-native-storage','checks':len(results),'results':results,'errors':errors},indent=2,ensure_ascii=False))
    print(json.dumps({'passed':len(results),'output':str(out)}))
if __name__=='__main__': main()
