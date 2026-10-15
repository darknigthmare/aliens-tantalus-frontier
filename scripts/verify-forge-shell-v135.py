"""Actual application/editor integration; offline host, memory storage, partial images.
Does not launch native playtest or certify PWA/cloud/film-fidelity assets.
"""
import importlib.util, json, os
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
def main():
    spec=importlib.util.spec_from_file_location('shell',ROOT/'scripts/verify-forge-shell-v134.py');shell=importlib.util.module_from_spec(spec);spec.loader.exec_module(shell)
    html=shell.package_shell().replace('</head>','<style id="forge-styles-v135">'+(ROOT/'src/forge-construction-v135.css').read_text()+'</style></head>')
    out=Path(os.environ.get('FORGE_QA_OUTPUT','/tmp/forge-v135-application'));out.mkdir(parents=True,exist_ok=True)
    results=[];errors=[]
    def check(name,passed):
        results.append({'name':name,'passed':bool(passed)})
        print(('PASS ' if passed else 'FAIL ')+name,flush=True)
        if not passed:raise AssertionError(name)
    try:
        with sync_playwright() as p:
            browser=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium'),headless=True,args=['--no-sandbox'])
            page=browser.new_page(viewport={'width':1600,'height':1050});page.set_default_timeout(10000);page.on('dialog',lambda d:d.accept());page.on('pageerror',lambda e:errors.append(str(e)))
            page.set_content(html,wait_until='load');page.wait_for_function('!!window.__ATF_V51__ && !document.getElementById("boot")');page.evaluate('__ATF_V62__.openForge()');page.wait_for_function('!!__ATF_V51__.editor.constructionV135')
            campaign=page.evaluate('JSON.stringify(shellApp.saveSystem.data)')
            page.click('[data-tab="construction"]');check('Construction mounted in actual app',page.locator('#forge-panel-construction-v135').is_visible())
            page.select_option('[data-build-field="profile"]','laboratory');page.select_option('[data-build-field="shape"]','leftWing');page.fill('[data-build-field="height"]','24');page.select_option('[data-build-field="levels"]','3');page.fill('[data-build-field="name"]','Station Acheron — étude de volume')
            before=page.evaluate('JSON.stringify(__ATF_V51__.editor.model.data)');page.click('[data-build-action="preview"]')
            check('App preview leaves document unchanged',page.evaluate('JSON.stringify(__ATF_V51__.editor.model.data)')==before)
            page.evaluate('window.scrollTo({top:0,behavior:"instant"})');page.screenshot(path=str(out/'actual-construction-preview-1600.png'),full_page=True)
            page.locator('[data-build-action="preview"]').focus();page.keyboard.press('Escape')
            check('Escape is consumed before global Forge close',page.locator('[data-panel="editor"]').is_visible())
            check('Escape cancels preview',page.locator('[data-build-action="apply"]').is_disabled())
            page.click('[data-build-action="preview"]');page.click('[data-build-action="apply"]')
            check('Constructed room reaches actual app document',page.evaluate('__ATF_V51__.editor.model.data.rooms.length')==2)
            check('Actual app callback persists the constructed room',page.evaluate("__ATF_V51__.editor.workspaceV133.store.data.projects.some(p=>p.rooms.some(r=>r.name==='Station Acheron — étude de volume'))"))
            page.click('#editor-undo');check('Actual app Undo removes entire construction',page.evaluate('JSON.stringify(__ATF_V51__.editor.model.data)')==before)
            page.click('#editor-redo');check('Actual app Redo restores constructed room',page.evaluate('__ATF_V51__.editor.model.data.rooms.length')==2)
            source=page.evaluate("__ATF_V51__.editor.room.id+':'+__ATF_V51__.editor.room.cells.find(c=>c.type==='door').id")
            page.select_option('[data-build-field="source"]',source);page.fill('[data-build-field="name"]','Maintenance annexe');page.select_option('[data-build-field="profile"]','maintenance');page.click('[data-build-action="preview"]');page.click('[data-build-action="apply"]')
            check('Construction creates validated link in actual application',page.evaluate('__ATF_V51__.editor.model.data.links.length')==1)
            page.click('[data-tab="graph"]');check('New rooms immediately appear in network diagram',page.locator('.forge-node-v134').count()==3)
            page.click('[data-tab="explorer"]');page.select_option('[data-nav-field="type"]','terminal');check('Explorer finds the generated consoles',page.locator('.forge-explorer-row-v134').count()>0)
            check('Construction and undo do not change campaign',page.evaluate('JSON.stringify(shellApp.saveSystem.data)')==campaign)
            page.click('[data-tab="construction"]');page.select_option('[data-build-field="source"]','');page.click('[data-build-action="preview"]')
            for width,height in [(1600,1050),(1024,900),(390,844)]:
                page.set_viewport_size({'width':width,'height':height});page.evaluate('window.scrollTo({top:0,behavior:"instant"})');page.screenshot(path=str(out/f'actual-construction-{width}.png'),full_page=True)
                check(f'Actual shell Construction has no overflow at {width}px',page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'))
                check(f'Actual shell controls fit settings panel at {width}px',page.locator('.forge-build-settings-v135').evaluate('(panel)=>{const r=panel.getBoundingClientRect();return [...panel.querySelectorAll("input,select")].every(el=>{const b=el.getBoundingClientRect();return b.left>=r.left-1&&b.right<=r.right+1})}'))
            page.click('[data-build-action="cancel"]');page.click('#return-title')
            check('Actual app close returns to title',page.locator('#title-screen').is_visible())
            check('Campaign still unchanged after close',page.evaluate('JSON.stringify(shellApp.saveSystem.data)')==campaign)
            check('No uncaught application errors',not errors);browser.close()
    finally:
        (out/'results.json').write_text(json.dumps({'scope':'actual-application-offline-memory-partial-media','checks':len(results),'passed':sum(r['passed'] for r in results),'results':results,'errors':errors},ensure_ascii=False,indent=2))
    print(json.dumps({'checks':len(results),'passed':sum(r['passed'] for r in results)}))
if __name__=='__main__':main()
