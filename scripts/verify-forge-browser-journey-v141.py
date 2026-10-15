"""Real Forge DOM and launch event chain over HTTP; native engines tested separately."""
import argparse, functools, http.server, json, os, threading
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]

def main():
    parser=argparse.ArgumentParser();parser.add_argument('--output',default='/tmp/forge-journey-v141-browser');args=parser.parse_args()
    out=Path(args.output);out.mkdir(parents=True,exist_ok=True)
    class Handler(http.server.SimpleHTTPRequestHandler):
        def log_message(self,*args):pass
    server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Handler,directory=str(ROOT)))
    threading.Thread(target=server.serve_forever,daemon=True).start()
    checks=[];errors=[]
    def check(name,passed):
        checks.append({'name':name,'passed':bool(passed)});print(('PASS ' if passed else 'FAIL ')+name,flush=True)
        if not passed:raise AssertionError(name)
    try:
        with sync_playwright() as p:
            browser=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium'),headless=True,args=['--no-sandbox'])
            page=browser.new_page(viewport={'width':1600,'height':1050},accept_downloads=True)
            page.on('pageerror',lambda error:errors.append(str(error)))
            page.goto(f'http://127.0.0.1:{server.server_port}/scripts/fixtures/forge-v130.html')
            page.wait_for_function('!!window.forgeEditor?.controlV136')
            for kind in ['mission','ship']:
                result=page.evaluate('''kind=>{
                    const room=(id,goal)=>({id,name:goal?'Destination avec objectif':'Entrée de transit',size:[32,18],cells:[
                        ...Array.from({length:32},(_,x)=>({id:`${id}-floor-${x}`,x,y:16,type:'floor',layer:'structure'})),
                        {id:`${id}-door`,x:goal?2:6,y:15,type:'door',layer:'gameplay'},
                        ...(goal?[{id:`${id}-goal`,x:5,y:15,type:'objective',layer:'gameplay'}]:[{id:`${id}-spawn`,x:1,y:15,type:'spawn',layer:'gameplay'}])
                    ]});
                    const input={schema:3,kind,name:'Parcours transit V141',activeRoomId:'a',rooms:[room('a',false),room('b',true)],
                        links:[{id:'ab',from:{roomId:'a',cellId:'a-door'},to:{roomId:'b',cellId:'b-door'},bidirectional:true}]};
                    forgeEditor.load(input);forgeEditor.ui.refresh();window.nativeTestProjection=null;
                    return {legacy:forgeEditor.validate(),projection:forgeEditor.serialize().validation,journey:forgeEditor.controlV136.getReport()};
                }''',kind)
                check(kind+': legacy validation and serialization keep their active-room scope',result['legacy']['scope']=='active-room' and not result['legacy']['ok'] and result['projection']['scope']=='active-room' and not result['projection']['ok'])
                check(kind+': journey admits transit entry and reachable remote objective',result['journey']['ok'] and result['journey']['reachableRoomIds']==['a','b'] and result['journey']['totalObjectiveCount']==1)
                check(kind+': inspector lists the journey rather than a false local error',page.locator('.forge-audit-v130 .forge-issue-error').count()==0)
                check(kind+': launch label and tooltip explain the linked journey',page.locator('#editor-play').inner_text()=='TESTER LE PARCOURS' and 'sas reliés' in page.locator('#editor-play').get_attribute('title'))
                page.click('#editor-play')
                check(kind+': real click passes every capture guard and reaches host launch',page.evaluate('nativeTestProjection?.rooms?.length===2&&nativeTestProjection?.activeRoomId==="a"'))
                with page.expect_download() as download:page.click('.forge-inspector-v130 [data-forge-action="report"]')
                path=out/f'{kind}-journey-report.json';download.value.save_as(path)
                exported=json.loads(path.read_text())
                check(kind+': inspector export includes the full admitted journey',exported['scope']=='reachable-rooms' and exported['ok'] and len(exported['roomReports'])==2 and exported['totalObjectiveCount']==1)
                page.click('[data-tab="control"]')
                page.screenshot(path=str(out/f'{kind}-transit-entry.png'),full_page=True)
                page.evaluate('''()=>{
                    forgeEditor.edit('Missing remote ground',()=>{forgeEditor.model.data.rooms[1].cells=forgeEditor.model.data.rooms[1].cells.filter(cell=>cell.type!=='floor');});
                    window.nativeTestProjection=null;
                }''')
                page.click('#editor-play')
                check(kind+': invalid reachable destination is blocked by the same launch guard',page.evaluate('nativeTestProjection===null&&!forgeEditor.controlV136.getReport().ok'))
                index=page.evaluate('forgeEditor.controlV136.getReport().issues.findIndex(issue=>issue.roomId==="b"&&issue.severity==="error")')
                page.locator(f'.forge-inspector-v130 [data-forge-action="issue"][data-issue="{index}"]').click()
                check(kind+': inspector diagnostic indices focus the matching remote room',page.evaluate('forgeEditor.room.id==="b"'))
            check('no obsolete single-room promise remains in the inspector',not page.locator('.forge-inspector-v130').evaluate('(node)=>/test natif reste limité|liaisons.*pas.*jouables|projection physique de la salle active/.test(node.textContent)'))
            check('no browser exceptions',not errors)
            browser.close()
    finally:
        server.shutdown();server.server_close()
        (out/'results.json').write_text(json.dumps({'scope':'http-real-forge-dom-and-launch-chain','checks':len(checks),'passed':sum(check['passed'] for check in checks),'results':checks,'errors':errors},ensure_ascii=False,indent=2))
if __name__=='__main__':main()
