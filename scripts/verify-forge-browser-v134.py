"""V134 editor integration. HTTP uses real localStorage; --offline uses an in-memory adapter.
Fixture data are authored through the real model; no native mission gameplay is exercised.
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
    parser.add_argument('--output', default='/tmp/forge-v134-browser')
    parser.add_argument('--offline', action='store_true')
    args = parser.parse_args()
    out = Path(args.output); out.mkdir(parents=True, exist_ok=True)
    spec = importlib.util.spec_from_file_location('host', ROOT/'scripts/forge-offline-harness-v130.py')
    host = importlib.util.module_from_spec(spec); spec.loader.exec_module(host)
    html = host.build_offline_html(ROOT) if args.offline else None
    class Handler(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *_): pass
    server = None; url = ''
    if not args.offline:
        server = http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Handler,directory=str(ROOT)))
        threading.Thread(target=server.serve_forever,daemon=True).start()
        url = f'http://127.0.0.1:{server.server_port}/scripts/fixtures/forge-v130.html'
    results = []; errors = []
    def check(name, value):
        results.append({'name':name,'passed':bool(value)})
        if not value: raise AssertionError(name)
    def load(page, records=None):
        if args.offline: host.prepare_offline_page(page, html, records)
        else: page.goto(url)
        page.wait_for_function('!!window.forgeEditor?.navigatorV134')
    def reload(page):
        if args.offline: load(page,page.evaluate('localStorage.dump()'))
        else:
            page.reload();page.wait_for_function('!!window.forgeEditor?.navigatorV134')
    try:
        with sync_playwright() as p:
            browser=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium'),headless=True,args=['--no-sandbox'])
            page=browser.new_page(viewport={'width':1600,'height':1100},accept_downloads=True)
            page.on('dialog',lambda d:d.accept());page.on('pageerror',lambda e:errors.append(str(e)))
            load(page)
            nav=lambda a:page.locator(f'[data-nav-action="{a}"]')
            field=lambda n:page.locator(f'[data-nav-field="{n}"]')
            tab=lambda t:page.locator(f'[data-work-action="tab"][data-tab="{t}"]').click()
            page.evaluate("localStorage.setItem('atf-v47-profile-1','campaign-sentinel');forgeEditor.edit('fixture layout',()=>{for(const [x,y] of [[2,2],[2,3],[10,5],[20,8]])forgeEditor.model.paint(x,y,'wall','structure')})")
            check('V134 explorer is mounted beside historical workshops',page.locator('.forge-tabs-v133 [data-tab]').count()==5)
            check('default namespace is isolated from old releases',page.evaluate("forgeStore.key==='atf-frontier-forge-workspace-v134'&&localStorage.getItem('atf-v62-frontier-forge-workspace')===null"))
            page.click('[data-work-action="select-all"]')
            page.locator('.forge-layout-v134 summary').click()
            field('command').select_option('left')
            before=page.evaluate('JSON.stringify(forgeEditor.model.data)');count=page.evaluate('getChangeCount()')
            nav('preview').click()
            check('layout preview leaves data and persistence untouched',page.evaluate('JSON.stringify(forgeEditor.model.data)')==before and page.evaluate('getChangeCount()')==count)
            check('preview reports connected group count','3 groupe(s)' in page.locator('[data-nav-plan]').inner_text())
            check('valid changed layout enables Apply',nav('apply').is_enabled())
            page.screenshot(path=str(out/'layout-preview-1600.png'),full_page=True)
            nav('apply').click()
            check('align operation is applied to all groups',page.evaluate('forgeEditor.room.cells.every(c=>c.x===2)'))
            check('layout commits exactly once',page.evaluate('getChangeCount()')==count+1)
            page.click('#editor-undo')
            check('single undo restores complete group layout',page.evaluate('JSON.stringify(forgeEditor.model.data)')==before)
            page.click('[data-work-action="select-all"]');field('command').select_option('distributeX');nav('preview').click();nav('apply').click()
            check('horizontal spacing preserves outer groups',page.evaluate('JSON.stringify(forgeEditor.room.cells.map(c=>c.x))')=='[2,2,11,20]')
            page.click('#editor-undo');page.click('[data-work-action="select-all"]')
            field('grouping').select_option('cells');field('command').select_option('top');nav('preview').click()
            check('conflicting single-cell alignment is refused',nav('apply').is_disabled() and 'case occupée' in page.locator('[data-nav-plan]').inner_text())
            nav('cancel').click();field('grouping').select_option('islands');field('command').select_option('left');nav('preview').click()
            page.locator('#editor-canvas').focus();page.keyboard.press('Escape')
            check('Escape cancels the preview without changing level',nav('apply').is_disabled() and page.evaluate('JSON.stringify(forgeEditor.model.data)')==before)
            nav('preview').click();page.evaluate("forgeEditor.edit('edit after preview',()=>forgeEditor.room.name='Salle Atelier')")
            check('later document edits invalidate the preview',nav('apply').is_disabled())
            nav('frame-selection').click()
            check('fit-selection produces finite bounded zoom',page.evaluate('Number.isFinite(forgeEditor.viewport.x)&&forgeEditor.viewport.zoom>=.25&&forgeEditor.viewport.zoom<=8'))
            page.locator('#editor-canvas').focus();page.keyboard.press('Home')
            check('Home framing does not add history',page.evaluate('forgeEditor.room.cells.length')==4)
            tab('explorer')
            check('explorer lists authored cells',page.locator('[data-nav-results] .forge-explorer-row-v134').count()==4)
            field('query').fill('cloison')
            check('French type search finds wall blocks',page.locator('[data-nav-results] .forge-explorer-row-v134').count()==4)
            field('type').select_option('door')
            check('combined filters can produce an empty result','Aucun bloc' in page.locator('[data-nav-results]').inner_text())
            nav('reset').click();nav('page-mark').click()
            page.locator('#forge-panel-explorer-v134 details summary').click()
            field('prefix').fill('Accès sécurisé');field('start').fill('7');nav('label').click()
            check('batch numbering preserves stable identifiers',page.evaluate("forgeEditor.room.cells.map(c=>c.label).join('|')==='Accès sécurisé 007|Accès sécurisé 008|Accès sécurisé 009|Accès sécurisé 010'"))
            field('query').fill('acces securise')
            check('search is accent insensitive',page.locator('[data-nav-results] .forge-explorer-row-v134').count()==4)
            nav('select-marked').click()
            check('marked hits become a canvas selection',page.evaluate('forgeEditor.selection.size')==4)
            tab('explorer')
            with page.expect_download() as info:nav('export-search').click()
            report=out/'search-report.json';info.value.save_as(report)
            check('download contains all matching labels',json.loads(report.read_text())['total']==4)
            page.locator('[data-nav-action="focus"]').first.click()
            check('explorer focus selects the requested cell',page.evaluate('forgeEditor.selection.size')==1)
            # Injection-looking labels remain inert text in the real DOM.
            page.evaluate("forgeEditor.edit('unsafe-looking label',()=>forgeEditor.room.cells[0].label='<img src=x onerror=window.injected134=true>')")
            nav('reset').click()
            check('untrusted labels are escaped',page.locator('[data-nav-results] img').count()==0 and not page.evaluate('!!window.injected134'))
            # Populate more than a page and test bounded DOM and complete export.
            page.evaluate("forgeEditor.edit('dense room',()=>{for(let x=0;x<32;x++)for(let y=11;y<15;y++)forgeEditor.model.paint(x,y,'floor','structure')})")
            check('explorer caps rendered rows to 50',page.locator('[data-nav-results] .forge-explorer-row-v134').count()==50)
            nav('next').click();check('next page is visible','page 2/' in page.locator('[data-nav-page]').inner_text())
            with page.expect_download() as info:nav('export-search').click()
            full=out/'search-full.json';info.value.save_as(full)
            check('search export is not truncated to the visible page',len(json.loads(full.read_text())['items'])==132)
            field('type').select_option('wall');check('filter resets pagination','page 1/1' in page.locator('[data-nav-page]').inner_text())
            # Directed-room diagram uses the actual model, with no fake native transition.
            page.evaluate("""forgeEditor.edit('three-room network',()=>{const m=forgeEditor.model;m.paint(5,4,'door','gameplay');const first=m.room.cells.find(c=>c.type==='door').id;m.addRoom();m.room.name='Maintenance';m.paint(5,4,'door','gameplay');m.link(m.room.cells[0].id,'room-1',first,true);m.addRoom();m.room.name='Secteur isolé';m.paint(5,4,'door','gameplay');m.data.activeRoomId='room-1'})""")
            tab('graph')
            check('diagram shows all room cards',page.locator('.forge-node-v134').count()==3)
            check('diagram renders the directed link',page.locator('.forge-edge-v134').count()==1)
            check('isolated sector is marked non-reachable',page.locator('.forge-node-v134[data-reachable="false"]').count()==1)
            page.screenshot(path=str(out/'room-network-1600.png'),full_page=True)
            page.locator('.forge-node-v134[data-room="room-2"]').focus();page.keyboard.press('Enter')
            check('room diagram is keyboard operable',page.evaluate('forgeEditor.room.id')=='room-2')
            tab('explorer');nav('reset').click();field('state').select_option('unlinked')
            check('unlinked-door filter finds the isolated door',page.locator('[data-nav-results] .forge-explorer-row-v134').count()==1)
            field('scope').select_option('current')
            check('current-room scope does not include other room doors','Aucun bloc' in page.locator('[data-nav-results]').inner_text())
            # Reopen the exact app-shaped saved object and immediately undo.
            page.evaluate('forgeEditor.workspaceV133.saveCurrent()');saved=page.evaluate('JSON.stringify(forgeEditor.model.data)')
            reload(page)
            check('boot reopen starts with no undo or redo entries',page.evaluate('forgeEditor.history.length===0&&forgeEditor.future.length===0'))
            check('undo right after reopen cannot overwrite the project',page.evaluate('forgeEditor.undo()') is False and page.evaluate('JSON.stringify(forgeEditor.model.data)')==saved)
            # Non-destructive migration: old key is retained verbatim, canonical data survive an old-release write.
            raw=page.evaluate('forgeStore.export()')
            page.evaluate("raw=>{localStorage.setItem('atf-v62-frontier-forge-workspace',raw);localStorage.removeItem('atf-frontier-forge-workspace-v134')}",raw)
            reload(page)
            check('legacy workspace migrated with all three rooms',page.evaluate('forgeEditor.model.data.rooms.length')==3)
            check('migration preserves legacy raw bytes',page.evaluate("localStorage.getItem('atf-v62-frontier-forge-workspace')")==raw)
            page.evaluate("localStorage.setItem('atf-v62-frontier-forge-workspace',JSON.stringify({schema:1,projects:[]}))")
            reload(page)
            check('old-release rewrite leaves canonical rooms intact',page.evaluate('forgeEditor.model.data.rooms.length')==3)
            check('campaign data remains untouched',page.evaluate("localStorage.getItem('atf-v47-profile-1')")=='campaign-sentinel')
            tab('explorer');nav('reset').click();field('type').select_option('door')
            page.screenshot(path=str(out/'explorer-1600.png'),full_page=True)
            for width,height in [(1024,768),(390,844)]:
                page.set_viewport_size({'width':width,'height':height});page.screenshot(path=str(out/f'explorer-{width}.png'),full_page=True)
                check(f'no horizontal document overflow at {width}px',page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'))
                tab('graph');page.screenshot(path=str(out/f'network-{width}.png'),full_page=True)
                check(f'wide diagram stays inside its scroll container at {width}px',page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'))
                tab('explorer')
            check('no uncaught browser errors',not errors)
            browser.close()
    finally:
        if server:server.shutdown();server.server_close()
        (out/'results.json').write_text(json.dumps({'checks':len(results),'mode':'offline-memory' if args.offline else 'http-native-localStorage','results':results,'errors':errors},ensure_ascii=False,indent=2))
    print(json.dumps({'checks':len(results),'passed':sum(r['passed'] for r in results),'output':str(out)}))

if __name__=='__main__':main()
