"""Actual app module graph and controls, offline host/memory storage/partial image substitutes.
Native gameplay methods are not replaced. Actors are positioned near fixtures before real E presses.
"""
import importlib.util,json,os
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
def main():
    spec=importlib.util.spec_from_file_location('shell',ROOT/'scripts/verify-forge-shell-v134.py');shell=importlib.util.module_from_spec(spec);spec.loader.exec_module(shell)
    html=shell.package_shell()
    for version,filename in [('135','forge-construction-v135.css'),('136','forge-control-v136.css')]:html=html.replace('</head>',f'<style id="forge-styles-v{version}">'+(ROOT/'src'/filename).read_text()+'</style></head>')
    out=Path(os.environ.get('FORGE_QA_OUTPUT','/tmp/forge-v136-application'));out.mkdir(parents=True,exist_ok=True)
    checks=[];errors=[]
    def check(name,ok):
        checks.append({'name':name,'passed':bool(ok)});print(('PASS ' if ok else 'FAIL ')+name,flush=True)
        if not ok:raise AssertionError(name)
    try:
        with sync_playwright() as p:
            browser=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium'),headless=True,args=['--no-sandbox'])
            page=browser.new_page(viewport={'width':1600,'height':1050});page.set_default_timeout(15000);page.on('dialog',lambda d:d.accept());page.on('pageerror',lambda e:errors.append(str(e)))
            page.set_content(html,wait_until='load');page.wait_for_function('!!window.__ATF_V51__ && !document.getElementById("boot")');page.evaluate('__ATF_V62__.openForge()')
            page.wait_for_function('!!__ATF_V51__.editor.controlV136')
            campaign=page.evaluate('JSON.stringify(shellApp.saveSystem.data)')
            page.click('[data-forge-action="template"]');before=page.evaluate('JSON.stringify(__ATF_V51__.editor.model.data)')
            page.click('[data-tab="control"]');check('new control is integrated in actual application',page.locator('.forge-control-v136').is_visible())
            page.fill('[data-control-field="name"]','Avant vérification native');page.click('[data-control-action="capture"]')
            check('named version saves from actual application',page.evaluate('__ATF_V51__.editor.controlV136.store.data.entries.length')==1)
            check('version operation leaves campaign unchanged',page.evaluate('JSON.stringify(shellApp.saveSystem.data)')==campaign)
            page.click('#editor-play');page.wait_for_function('__ATF_V51__.engine.running && __ATF_V51__.engine.editorMode')
            check('actual app enters native authored Mission',page.evaluate('__ATF_V61__.standaloneContext')=='forge-playtest')
            check('all active cells are compiled in actual app',page.evaluate('__ATF_V51__.engine.editorTileCount')==35)
            page.evaluate("{const e=__ATF_V51__.engine,n=e.powerNode;Object.assign(e.player,{x:n.x,y:n.y+n.h-e.player.h,vx:0,vy:0,grounded:true});e.canvas.focus()}")
            page.keyboard.press('KeyE');page.wait_for_function('__ATF_V51__.engine.powerNode.active')
            check('real E activates the authored power terminal',page.evaluate('__ATF_V51__.engine.powerNode.active'))
            check('native interaction leaves campaign unchanged',page.evaluate('JSON.stringify(shellApp.saveSystem.data)')==campaign)
            page.keyboard.press('Escape');page.wait_for_function('__ATF_V61__.standaloneContext==="forge"')
            check('Escape returns from Mission to the same authored project',page.evaluate('JSON.stringify(__ATF_V51__.editor.model.data)')==before)
            check('returned Mission is stopped',not page.evaluate('__ATF_V51__.engine.running'))
            page.evaluate('{const ed=__ATF_V51__.editor;ed.edit("large grid",()=>ed.model.resize(128,72));}')
            page.click('#editor-play');check('actual app refuses grid beyond published Mission capacity',page.evaluate('__ATF_V61__.standaloneContext')=='forge' and page.locator('.forge-control-v136').is_visible())
            page.click('#editor-undo')
            page.select_option('#editor-mode','ship');page.click('#editor-play');page.wait_for_function('__ATF_V51__.hubEngine.editorPlaytest')
            check('actual app starts native Ship playtest',page.evaluate('__ATF_V61__.standaloneContext')=='forge-playtest')
            check('Ship keeps its authored objective in the tested no-crisis context',page.evaluate('__ATF_V51__.hubEngine.v51Objectives.length===1 && !__ATF_V51__.hubEngine.state.activeCrisis'))
            page.click('#exit-hub');page.wait_for_function('__ATF_V61__.standaloneContext==="forge"')
            check('Ship exit returns to editor rather than campaign',page.locator('[data-panel="editor"]').is_visible())
            check('both native playtests preserve campaign data',page.evaluate('JSON.stringify(shellApp.saveSystem.data)')==campaign)
            page.select_option('#editor-mode','mission');page.click('[data-tab="control"]')
            original_id=page.evaluate('__ATF_V51__.editor.workspaceV133.id');page.select_option('[data-control-field="version"]','version-1');page.click('[data-control-action="restore"]')
            check('actual app restores as independent project',page.evaluate('__ATF_V51__.editor.workspaceV133.id')!=original_id)
            check('restoration leaves old project accessible',page.evaluate('(id)=>shellApp.forgeSaveSystem.data.projects.some(p=>p.id===id)',original_id))
            page.click('[data-tab="construction"]');page.select_option('[data-build-field="profile"]','laboratory');page.select_option('[data-build-field="levels"]','2');page.fill('[data-build-field="height"]','24');page.fill('[data-build-field="name"]','Laboratoire — contrôle de volume');page.click('[data-build-action="preview"]');page.click('[data-build-action="apply"]');page.click('[data-tab="control"]')
            check('control refreshes after creating another sector', 'Laboratoire' in page.locator('[data-control-status]').inner_text())
            for w,h in [(1600,1050),(1024,900),(390,844)]:
                page.set_viewport_size({'width':w,'height':h});page.evaluate('scrollTo(0,0)');page.screenshot(path=str(out/f'actual-control-{w}.png'),full_page=True)
                check(f'actual shell control has no horizontal overflow at {w}',page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'))
            page.click('#return-title');check('close returns to actual title',page.locator('#title-screen').is_visible())
            check('closing after native tests still leaves campaign unchanged',page.evaluate('JSON.stringify(shellApp.saveSystem.data)')==campaign)
            check('no uncaught application errors',not errors);browser.close()
    finally:
        (out/'results.json').write_text(json.dumps({'scope':'actual-app-offline-memory-partial-media-native-methods','checks':len(checks),'passed':sum(c['passed'] for c in checks),'results':checks,'errors':errors},ensure_ascii=False,indent=2))
if __name__=='__main__':main()
