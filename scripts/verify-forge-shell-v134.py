"""Offline integration of the actual application shell and native ES module graph.

Only module addresses, stylesheets, browser storage and unavailable image/network
resources are supplied by the host fixture. Gameplay methods are not replaced.
Does not certify cloud, HTTP deployment, actual localStorage durability or missing art.
"""
import argparse, base64, json, os, posixpath, re
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(os.environ.get('FORGE_QA_ROOT',Path(__file__).resolve().parents[1]))
def package_shell():
    imports={}
    for path in (ROOT/'src').glob('*.js'):
        name=path.relative_to(ROOT).as_posix();source=path.read_text()
        def rewrite(match):
            prefix,quote,relative=match.groups()
            target=posixpath.normpath(posixpath.join(posixpath.dirname(name),relative))
            return f'{prefix}{quote}atf/{target}{quote}'
        source=re.sub(r'''(\bfrom\s*|\bimport\s*\(\s*|\bimport\s*)(['"])(\.[^'"\n]+)\2''',rewrite,source)
        source=source.replace('import.meta.url',json.dumps('https://fixture.invalid/'+name))
        imports['atf/'+name]='data:text/javascript;base64,'+base64.b64encode(source.encode()).decode()
    html=(ROOT/'index.html').read_text()
    html=re.sub(r'<script\b[^>]*>.*?</script>','',html,flags=re.S)
    def style(match):
        path=ROOT/match.group(1).lstrip('/')
        return '<style>'+re.sub(r"@import url\('([^']+)'\);",lambda m:(ROOT/m.group(1).lstrip('/')).read_text(),path.read_text())+'</style>' if path.is_file() else ''
    html=re.sub(r'<link rel="stylesheet" href="([^"]+)"[^>]*>',style,html)
    html=html.replace('</head>','<style id="forge-styles-v130">'+(ROOT/'src/forge-editor-v130.css').read_text()+'</style></head>')
    html=html.replace('</head>','<style id="forge-styles-v133">'+(ROOT/'src/forge-workbench-v133.css').read_text()+'</style></head>')
    html=html.replace('</head>','<style id="forge-styles-v134">'+(ROOT/'src/forge-navigator-v134.css').read_text()+'</style></head>')
    assets={}
    for path in (ROOT/'assets/openai/metroidvania/props').glob('*.png'):
        assets['/'+path.relative_to(ROOT).as_posix()]='data:image/png;base64,'+base64.b64encode(path.read_bytes()).decode()
    pixel='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg=='
    host='''const memory=new Map();Object.defineProperty(globalThis,'localStorage',{value:{getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,String(v)),removeItem:k=>memory.delete(k),clear:()=>memory.clear(),dump:()=>Object.fromEntries(memory)},configurable:true});
const originalSrc=Object.getOwnPropertyDescriptor(HTMLImageElement.prototype,'src');
Object.defineProperty(HTMLImageElement.prototype,'src',{get:originalSrc.get,set(value){let path=String(value).replace('https://fixture.invalid','');originalSrc.set.call(this,ASSETS[path]||PIXEL);},configurable:true});
globalThis.fetch=async()=>new Response('{}',{status:404,headers:{'content-type':'application/json'}});
'''.replace('ASSETS',json.dumps(assets)).replace('PIXEL',json.dumps(pixel))
    entry="import * as app from 'atf/src/app.js'; window.shellApp=app;"
    return html.replace('<head>','<head><script>'+host+'</script>')+f'<script type="importmap">{json.dumps({"imports":imports})}</script><script type="module">{entry}</script>'

def main():
    out=Path(os.environ.get('FORGE_QA_OUTPUT','/tmp/forge-v134-actual-shell'));out.mkdir(parents=True,exist_ok=True)
    results=[];errors=[]
    def check(name,passed):
        results.append({'name':name,'passed':bool(passed)})
        if not passed:raise AssertionError(name)
    try:
        with sync_playwright() as p:
            browser=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium'),headless=True,args=['--no-sandbox'])
            page=browser.new_page(viewport={'width':1600,'height':1000});page.on('dialog',lambda d:d.accept());page.on('pageerror',lambda e:errors.append(str(e)))
            page.set_content(package_shell(),wait_until='load');page.wait_for_function('!!window.__ATF_V51__');page.wait_for_timeout(500)
            page.evaluate('__ATF_V62__.openForge()');page.wait_for_function('!!__ATF_V51__.editor.workbenchV133')
            check('actual application mounts the authoring workbench',page.locator('.forge-workbench-v133').is_visible())
            campaign=page.evaluate('JSON.stringify(shellApp.saveSystem.data)')
            page.click('[data-forge-action="template"]')
            page.click('[data-work-action="tab"][data-tab="projects"]');page.fill('[data-work-field="project-name"]','Station Horizon');page.click('[data-work-action="project-rename"]')
            first=page.evaluate('__ATF_V51__.editor.workspaceV133.id')
            check('actual application save callback retains chosen project name',page.evaluate('__ATF_V51__.editor.workspaceV133.store.data.projects[0].name')=='Station Horizon')
            page.select_option('#editor-mode','ship')
            check('actual mode change does not create or overwrite a second project',page.evaluate('__ATF_V51__.editor.workspaceV133.store.data.projects.length')==1)
            page.fill('[data-work-field="project-name"]','Copie de travail');page.click('[data-work-action="project-copy"]')
            check('actual application opens an independent duplicate',page.evaluate('__ATF_V51__.editor.workspaceV133.id')!=first)
            check('copy has its own undo history',page.evaluate('__ATF_V51__.editor.history.length')==0)
            page.click(f'[data-work-action="project-open"][data-project="{first}"]')
            check('actual project switch restores original name',page.evaluate('__ATF_V51__.editor.model.data.name')=='Station Horizon')
            check('workspace operations leave campaign model unchanged',page.evaluate('JSON.stringify(shellApp.saveSystem.data)')==campaign)
            page.click('[data-work-action="tab"][data-tab="explorer"]')
            page.select_option('[data-nav-field="type"]','spawn')
            check('actual explorer finds the insertion marker',page.locator('[data-nav-results] .forge-explorer-row-v134').count()==1)
            page.click('[data-nav-action="focus"]')
            check('explorer focuses the actual application canvas',page.evaluate('__ATF_V51__.editor.selection.size')==1)
            page.locator('#editor-canvas').focus();page.keyboard.press('Home')
            check('framing hotkey keeps the Forge context',page.locator('[data-panel="editor"]').is_visible())
            page.click('[data-work-action="tab"][data-tab="tools"]')
            page.locator('.forge-layout-v134 summary').click()
            page.select_option('[data-nav-field="command"]','right');page.select_option('[data-nav-field="reference"]','room')
            before=page.evaluate('JSON.stringify(__ATF_V51__.editor.model.data)')
            page.click('[data-nav-action="preview"]')
            check('actual layout preview is non-destructive',page.evaluate('JSON.stringify(__ATF_V51__.editor.model.data)')==before)
            page.locator('#editor-canvas').focus();page.keyboard.press('Escape')
            check('preview Escape does not close the native Forge screen',page.locator('[data-panel="editor"]').is_visible())
            check('preview cancellation keeps the authored project',page.evaluate('JSON.stringify(__ATF_V51__.editor.model.data)')==before)
            check('application writes to the versioned namespace',page.evaluate('__ATF_V51__.editor.workspaceV133.store.key')=='atf-frontier-forge-workspace-v134')
            for width,height in [(1600,1000),(1024,900),(390,844)]:
                page.set_viewport_size({'width':width,'height':height})
                for tab in ['tools','assemblies','projects','graph','explorer']:
                    page.click(f'[data-work-action="tab"][data-tab="{tab}"]')
                    check(f'actual shell {tab} panel has no page overflow at {width}',page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'))
                check(f'palette fields remain inside their panel at {width}',page.locator('.tool-panel').evaluate("""panel=>{const r=panel.getBoundingClientRect();return [...panel.querySelectorAll('input,select')].every(el=>{const b=el.getBoundingClientRect();return b.left>=r.left&&b.right<=r.right;});}"""))
                page.click('[data-work-action="tab"][data-tab="tools"]');page.evaluate('window.scrollTo({top:0,behavior:"instant"})');page.wait_for_timeout(100)
                page.screenshot(path=str(out/f'actual-shell-{width}.png'),full_page=True)
            page.set_viewport_size({'width':1600,'height':1000});page.click('[data-work-action="tab"][data-tab="assemblies"]');page.evaluate('window.scrollTo({top:0,behavior:"instant"})');page.wait_for_timeout(100);page.screenshot(path=str(out/'actual-assemblies.png'),full_page=True)
            check('Forge shell banner is no longer sticky over tools',page.locator('.topbar').evaluate('(el)=>getComputedStyle(el).position')=='relative')
            page.evaluate("""__ATF_V51__.editor.edit('Démonstration réseau',()=>{const m=__ATF_V51__.editor.model;let prior;for(let i=0;i<3;i++){if(i)m.addRoom({duplicate:true});m.room.name=['Réception','Maintenance','Contrôle'][i];m.paint(5,15,'door','gameplay');m.paint(26,15,'door','gameplay');const left=m.room.cells.find(c=>c.x===5&&c.type==='door').id;if(prior)m.link(left,prior.roomId,prior.id,true);prior={roomId:m.room.id,id:m.room.cells.find(c=>c.x===26&&c.type==='door').id};for(const c of m.room.cells)if(c.type==='terminal')c.label='Console '+m.room.name;}m.data.activeRoomId='room-1'});__ATF_V51__.editor.fit();""")
            page.click('[data-work-action="tab"][data-tab="graph"]');page.screenshot(path=str(out/'actual-network-v134.png'),full_page=True)
            page.click('[data-work-action="tab"][data-tab="explorer"]');page.select_option('[data-nav-field="type"]','terminal');page.screenshot(path=str(out/'actual-explorer-v134.png'),full_page=True)
            page.set_viewport_size({'width':390,'height':844});page.screenshot(path=str(out/'actual-explorer-v134-390.png'),full_page=True)
            page.click('#return-title')
            check('close control returns to native title screen',page.locator('#title-screen').is_visible())
            check('closing editor leaves campaign unchanged',page.evaluate('JSON.stringify(shellApp.saveSystem.data)')==campaign)
            check('no uncaught application errors',not errors)
            browser.close()
    finally:
        (out/'results.json').write_text(json.dumps({'scope':'full-application-offline-host-memory-storage-partial-media','checks':len(results),'results':results,'errors':errors},indent=2,ensure_ascii=False))
    print(json.dumps({'passed':len(results),'output':str(out)}))
if __name__=='__main__':main()
