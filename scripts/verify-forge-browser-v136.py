"""V136 editor integration. HTTP uses real origin storage; --offline uses explicit memory.
This fixture does not load the native game. Native-engine coverage is a separate Node suite.
"""
import argparse, functools, http.server, importlib.util, json, os, threading
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
def main():
    parser=argparse.ArgumentParser();parser.add_argument('--offline',action='store_true');parser.add_argument('--output',default='/tmp/forge-v136-browser');args=parser.parse_args()
    out=Path(args.output);out.mkdir(parents=True,exist_ok=True)
    spec=importlib.util.spec_from_file_location('host',ROOT/'scripts/forge-offline-harness-v130.py');host=importlib.util.module_from_spec(spec);spec.loader.exec_module(host)
    html=host.build_offline_html(ROOT) if args.offline else None
    server=None;results=[];errors=[]
    class Handler(http.server.SimpleHTTPRequestHandler):
        def log_message(self,*_):pass
    if not args.offline:
        server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Handler,directory=str(ROOT)))
        threading.Thread(target=server.serve_forever,daemon=True).start()
    def check(name,ok):
        results.append({'name':name,'passed':bool(ok)});print(('PASS ' if ok else 'FAIL ')+name,flush=True)
        if not ok:raise AssertionError(name)
    try:
        with sync_playwright() as p:
            browser=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium'),headless=True,args=['--no-sandbox'])
            page=browser.new_page(viewport={'width':1600,'height':1050},accept_downloads=True);page.set_default_timeout(10000)
            accepts={'value':True};page.on('dialog',lambda d:d.accept() if accepts['value'] else d.dismiss());page.on('pageerror',lambda e:errors.append(str(e)))
            def load(records=None):
                if args.offline:host.prepare_offline_page(page,html,records)
                else:page.goto(f'http://127.0.0.1:{server.server_port}/scripts/fixtures/forge-v130.html')
                page.wait_for_function('!!window.forgeEditor?.controlV136');page.wait_for_function('!!document.querySelector("[data-control-status]").textContent')
            def field(n):return page.locator(f'[data-control-field="{n}"]')
            def click(n):page.click(f'[data-control-action="{n}"]')
            def snap():return page.evaluate('JSON.stringify(forgeEditor.model.data)')
            load();page.click('#editor-play')
            check('invalid playtest opens Control rather than entering native launch callback',page.locator('.forge-control-v136').is_visible() and not page.evaluate('!!window.nativeTestProjection'))
            check('initial errors are explicit',page.locator('.forge-control-error-v136').count()>0)
            page.click('[data-forge-action="template"]');page.click('[data-tab="control"]')
            check('ready room enables native test',page.locator('[data-control-action="test"]').is_enabled())
            baseline=snap();writes=page.evaluate('getChangeCount()');click('audit')
            check('inspection neither writes nor changes document/history',snap()==baseline and page.evaluate('getChangeCount()')==writes)
            check('real engine dimensions are displayed', '6200' in page.locator('[data-control-status]').inner_text())
            click('test');check('admitted room reaches existing launch binding',page.evaluate('!!nativeTestProjection'))
            page.evaluate("forgeEditor.edit('second objective',()=>forgeEditor.model.paint(6,15,'objective','gameplay'));window.nativeTestProjection=null")
            page.click('#editor-play');check('extra Mission objective cannot be silently ignored by launch',not page.evaluate('!!nativeTestProjection') and 'seul objectif' in page.locator('[data-control-issues]').inner_text())
            page.click('#editor-undo')
            page.evaluate("forgeEditor.edit('large grid',()=>forgeEditor.model.resize(128,72));window.nativeTestProjection=null")
            page.click('#editor-play');check('maximum-grid Mission reaches the launch binding without a stale 64 by 36 refusal',page.evaluate('nativeTestProjection?.size?.[0]===128&&nativeTestProjection?.size?.[1]===72') and '64 × 36' not in page.locator('[data-control-issues]').inner_text())
            page.click('#editor-undo');field('name').fill('Avant découpage');before=snap();history=page.evaluate('forgeEditor.history.length');click('capture')
            check('named version stored without adding a document edit',page.evaluate('forgeEditor.controlV136.store.data.entries.length')==1 and snap()==before and page.evaluate('forgeEditor.history.length')==history)
            selected=field('version').input_value();check('new version is selected and restore enabled',bool(selected) and page.locator('[data-control-action="restore"]').is_enabled())
            click('compare');check('identical comparison is recognized','identique' in page.locator('[data-control-diff]').inner_text())
            page.evaluate("forgeEditor.edit('new wall',()=>forgeEditor.model.paint(8,8,'wall','structure'))")
            click('compare');check('comparison counts a new block','1 bloc(s) ajouté(s)' in page.locator('[data-control-diff]').inner_text())
            with page.expect_download() as info:click('diff-report')
            info.value.save_as(out/'differences.json');check('difference report downloads exact counts',json.loads((out/'differences.json').read_text())['totals']['cells']['added']==1)
            current=snap();old_id=page.evaluate('forgeEditor.workspaceV133.id');accepts['value']=False;click('restore');accepts['value']=True
            check('declining restore preserves current project',snap()==current and page.evaluate('forgeEditor.workspaceV133.id')==old_id)
            click('restore')
            check('restore creates a different project with original checkpoint content',page.evaluate('forgeEditor.workspaceV133.id')!=old_id and not page.evaluate('forgeEditor.room.cells.some(c=>c.x===8&&c.y===8)'))
            check('restore preserves the old edited project in workspace',page.evaluate('(id)=>forgeStore.data.projects.find(p=>p.id===id).rooms[0].cells.some(c=>c.x===8&&c.y===8)',old_id))
            check('restore opens a clean document history',page.evaluate('forgeEditor.history.length')==0)
            check('restore does not consume checkpoint',page.evaluate('forgeEditor.controlV136.store.data.entries.length')==1)
            page.click('[data-tab="control"]');field('version').select_option(selected)
            with page.expect_download() as info:click('export')
            info.value.save_as(out/'versions.json');check('export contains full canonical document',len(json.loads((out/'versions.json').read_text())['entries'][0]['project']['rooms'])==1)
            before=snap();field('import').set_input_files(str(out/'versions.json'));page.wait_for_function('forgeEditor.controlV136.store.data.entries.length===2')
            check('import adds copies with new IDs',page.evaluate('new Set(forgeEditor.controlV136.store.data.entries.map(e=>e.id)).size')==2)
            check('import never replaces open document',snap()==before)
            field('import').set_input_files({'name':'bad.json','mimeType':'application/json','buffer':b'{broken'})
            page.wait_for_function('document.querySelector("[data-control-message]").dataset.error==="true"')
            check('bad import preserves versions and resets file input',page.evaluate('forgeEditor.controlV136.store.data.entries.length')==2 and field('import').input_value()=='')
            page.evaluate("window.realVersionStorage=forgeEditor.controlV136.store.storage;forgeEditor.controlV136.store.storage={getItem:k=>realVersionStorage.getItem(k),setItem(){throw new Error('version-quota')}}")
            field('name').fill('Quota check');click('capture')
            check('version quota is visible and does not add a ghost entry','version-quota' in page.locator('[data-control-message]').inner_text() and page.evaluate('forgeEditor.controlV136.store.data.entries.length')==2)
            page.evaluate('forgeEditor.controlV136.store.storage=realVersionStorage')
            field('version').select_option(selected);accepts['value']=False;click('delete');accepts['value']=True
            check('version deletion asks confirmation',page.evaluate('forgeEditor.controlV136.store.data.entries.length')==2)
            click('delete');check('confirmed deletion changes only the chosen version',page.evaluate('forgeEditor.controlV136.store.data.entries.length')==1 and snap()==before)
            field('name').fill('<img src=x onerror="window.versionXss=true">');click('capture')
            check('untrusted version name never becomes executable markup',not page.evaluate('!!window.versionXss') and page.locator('.forge-control-v136 img').count()==0)
            page.select_option('#editor-mode','ship');page.click('[data-tab="control"]')
            check('mode switch refreshes technical bounds', '5120' in page.locator('[data-control-status]').inner_text())
            page.evaluate("forgeEditor.edit('vehicle',()=>forgeEditor.model.paint(9,15,'vehicle','gameplay'));window.nativeTestProjection=null")
            page.click('#editor-play');check('manual Ship vehicle is refused explicitly','aucun véhicule' in page.locator('[data-control-issues]').inner_text() and not page.evaluate('!!nativeTestProjection'))
            page.click('#editor-undo');field('severity').select_option('warning');check('diagnostic filter hides errors',page.locator('.forge-control-error-v136').count()==0)
            with page.expect_download() as info:click('report')
            info.value.save_as(out/'control.json');check('control export retains full unfiltered report',json.loads((out/'control.json').read_text())['scope']=='active-room')
            before=snap();page.evaluate("localStorage.setItem('atf-v47-profile-1','campaign-proof')")
            records=page.evaluate('localStorage.dump()') if args.offline else None
            load(records);page.click('[data-tab="control"]')
            check('versions survive reload',page.evaluate('forgeEditor.controlV136.store.data.entries.length')==2)
            check('reload preserves current room without undo-to-empty',snap()==before and page.evaluate('forgeEditor.history.length')==0)
            check('campaign bytes remain unchanged',page.evaluate("localStorage.getItem('atf-v47-profile-1')")=='campaign-proof')
            for w,h in [(1600,1050),(1024,900),(390,844)]:
                page.set_viewport_size({'width':w,'height':h});page.evaluate('scrollTo(0,0)');page.screenshot(path=str(out/f'control-{w}.png'),full_page=True)
                check(f'no horizontal overflow at {w}',page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'))
                check(f'version controls stay in workbench at {w}',page.locator('.forge-control-v136').evaluate('(root)=>{const r=root.getBoundingClientRect();return [...root.querySelectorAll("input,select")].every(el=>{const b=el.getBoundingClientRect();return b.left>=r.left-1&&b.right<=r.right+1})}'))
            check('no uncaught browser errors',not errors);browser.close()
    finally:
        if server:server.shutdown();server.server_close()
        (out/'results.json').write_text(json.dumps({'scope':'offline-memory' if args.offline else 'http-native-storage','checks':len(results),'passed':sum(r['passed'] for r in results),'results':results,'errors':errors},ensure_ascii=False,indent=2))
if __name__=='__main__':main()
