#!/usr/bin/env python3
"""V123 native actor fixtures, including decode failures, without a campaign claim.

Reuses V121's pinned-source preflight and V122's static HTTP helper. Actual V114
sessions, projection and actor fallback run with unchanged V116/V118 renderers.
The test sets explicit angles, routes and phases; it does not simulate a journey.
"""
import argparse
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import subprocess
import tempfile
from datetime import datetime, timezone
from playwright.sync_api import sync_playwright


def helper(name):
    spec = importlib.util.spec_from_file_location(name.replace('-', '_'), Path(__file__).with_name(name + '.py'))
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


PREFLIGHT = helper('qa-aliens1986-furniture-v121')
HTTP = helper('qa-aliens1986-atlas-v122')
CURRENT = 'docs/development/aliens-1986-sprites-v123/manifest.json'
IDS = ['sentry-aim-front', 'warrior-walk-right']
sha = lambda data: hashlib.sha256(data).hexdigest()

HTML = '''<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Aliens — directions V123</title><link rel="icon" href="data:,"><style>
*{box-sizing:border-box}body{margin:0;background:#10191e;color:#e0ebe6;font:15px/1.5 system-ui,sans-serif}main{max-width:1640px;margin:auto;padding:28px}h1{margin:0 0 10px;font-size:28px}p{color:#b2c8c4}#fixtures{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}article{border:1px solid #3d565d;padding:10px;background:#18262e}h2{font-size:16px;margin:0 0 8px}canvas{width:100%;height:auto;display:block;background-color:#25333a;background-image:linear-gradient(45deg,#31434b 25%,transparent 25%),linear-gradient(-45deg,#31434b 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#31434b 75%),linear-gradient(-45deg,transparent 75%,#31434b 75%);background-size:20px 20px;background-position:0 0,0 10px,10px -10px,-10px 0}.detail{font:11px/1.45 monospace;overflow-wrap:anywhere;color:#b2c8c4}#status{padding:12px;border:1px solid #537965;margin:20px 0}.ok{color:#b4e4c1}.failed{color:#efb78c}</style></head><body><main>
<h1>Sentinelle · huit directions / Warrior · clés de pose</h1>
<p>Sessions et projection V114 réelles, sélecteurs V116/V118 inchangés, PNG natifs. Les directions, phases et routes affichées sont des états de test déclarés. Le détail est agrandi ×2 ; les dimensions de dessin restent exprimées en unités natives.</p>
<p>Une pose de marche statique est sélectionnée lorsqu’une route existe. Aucun cycle animé complet, parcours de campagne ou fidélité filmique exacte n’est certifié.</p>
<div id="status">Décodage des PNG…</div><section id="fixtures"></section>
</main><script type="module" src="/fixture/directions.mjs"></script></body></html>'''

JS = r'''import {Renderer} from '/modules/aliens-1986/v114/preview/renderer.mjs';
import {createSession,currentWorld} from '/modules/aliens-1986/v114/src/operation-v114.mjs';
import {installRasterRendererV116,creatureAssetIdV116} from '/modules/aliens-1986/v116/raster-renderer-v116.mjs';
import {installRasterPropsV118} from '/modules/aliens-1986/v118/raster-props-v118.mjs';
const payload=await(await fetch('/fixture/data.json')).json(),entries=payload.assets,assets=new Map(entries.map(a=>[a.id,a]));
const failure=new URL(location.href).searchParams.has('unavailable'),newIds=new Set(payload.ids);
const calls=new Map(),originalDraw=CanvasRenderingContext2D.prototype.drawImage;
CanvasRenderingContext2D.prototype.drawImage=function(image,...args){
  const id=this.canvas.dataset.fixture;
  if(id&&calls.has(id)){
    const m=this.getTransform(),[sx,sy,sw,sh,dx,dy,dw,dh]=args;
    const corners=[[dx,dy],[dx+dw,dy+dh]].map(([x,y])=>[m.a*x+m.c*y+m.e,m.b*x+m.d*y+m.f]);
    calls.get(id).push({path:new URL(image.currentSrc||image.src,document.baseURI).pathname.slice(1),naturalWidth:image.naturalWidth,naturalHeight:image.naturalHeight,
      source:[sx,sy,sw,sh],destination:[dx,dy,dw,dh],transform:[m.a,m.b,m.c,m.d,m.e,m.f],flip:m.a<0,
      bounds:{left:Math.min(...corners.map(p=>p[0])),right:Math.max(...corners.map(p=>p[0])),top:Math.min(...corners.map(p=>p[1])),bottom:Math.max(...corners.map(p=>p[1]))}});
  }
  return originalDraw.call(this,image,...args);
};
class Candidate extends Renderer {
  actor(...args){this.nativeFallbacks++;return super.actor(...args);}
}
installRasterRendererV116(Candidate,entries);installRasterPropsV118(Candidate,entries);
const seed=createSession({mode:'inspection',roomId:'v106-sentry'});
const isWarrior=a=>a.kind==='enemy'&&!['facehugger','queen','chestburster'].includes(a.role);
const warriorRoom=Object.values(seed.worlds).find(world=>world.actors.some(isWarrior))?.scene.id;
if(!warriorRoom)throw new Error('No native Warrior actor available for fixture');
const specs=[
  ['right',0,'sentry-idle-right',false],['front-right',1,'sentry-aim-front-right',false],
  ['front',2,'sentry-aim-front',false],['front-left',3,'sentry-aim-front-right',true],
  ['left',4,'sentry-idle-right',true],['rear-left',5,'sentry-aim-rear-right',true],
  ['rear',6,'sentry-aim-rear',false],['rear-right',7,'sentry-aim-rear-right',false],
].map(([id,sector,asset,flip])=>({id:'sentry-'+id,label:'Sentinelle · '+id,kind:'sentry',room:'v106-sentry',sector,asset,flip}));
specs.push({id:'sentry-turn-front',label:'Rotation 0° → 180° à 50 %',kind:'sentry',room:'v106-sentry',sector:0,asset:'sentry-aim-front',flip:false,turn:true});
for(const [id,changes,asset,flip] of [
  ['walk-right',{},'warrior-walk-right',false],['walk-left',{facing:-1},'warrior-walk-right',true],
  ['idle',{route:[]},'warrior-idle-right',false],['attack',{phase:'windup'},'warrior-attack-right',false],
  ['dead',{alive:false},'warrior-death-right',false],
])specs.push({id:'warrior-'+id,label:'Warrior · '+id,kind:'warrior',room:warriorRoom,asset,flip,changes});
function setupCanvas(canvas,actor,session,Class){const renderer=new Class(canvas);canvas.width=640;canvas.height=360;renderer.session=session;renderer.camera=actor.x;renderer.reducedMotion=true;return renderer;}
const fixtures=specs.map(spec=>{
  const session=createSession({mode:'inspection',roomId:spec.room}),world=currentWorld(session);
  const actor=world.actors.find(a=>spec.kind==='sentry'?a.role==='sentry':isWarrior(a));if(!actor)throw new Error('Native actor missing '+spec.id);
  if(spec.kind==='sentry'){
    session.tactics.sentries[actor.id]={...session.tactics.sentries[actor.id],angle:spec.sector*Math.PI/4};
    if(spec.turn)session.action={kind:'sentry-orient',id:actor.id,angle:Math.PI,elapsed:.5,duration:1};
  }else Object.assign(actor,{alive:true,role:'warrior',phase:'idle',clock:.325,facing:1,route:[{x:actor.x+80,z:actor.z}]},spec.changes);
  const node=document.createElement('article'),title=document.createElement('h2'),canvas=document.createElement('canvas'),detail=document.createElement('div');
  title.textContent=spec.label;canvas.dataset.fixture=spec.id;detail.className='detail';node.append(title,canvas,detail);document.querySelector('#fixtures').append(node);
  const renderer=setupCanvas(canvas,actor,session,Candidate),baselineCanvas=document.createElement('canvas'),baseline=setupCanvas(baselineCanvas,actor,session,Renderer);
  return {spec,session,world,actor,canvas,renderer,baselineCanvas,baseline,detail};
});
function paint(renderer,actor,world){const c=renderer.c,p=renderer.project(actor);c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,640,360);c.setTransform(2,0,0,2,320,320-p.y*2);renderer.actor(actor,world);c.setTransform(1,0,0,1,0,0);}
function samePixels(a,b){const x=a.getContext('2d').getImageData(0,0,640,360).data,y=b.getContext('2d').getImageData(0,0,640,360).data;return x.every((value,index)=>value===y[index]);}
function render(f){const before=JSON.stringify(f.session);calls.set(f.spec.id,[]);f.renderer.nativeFallbacks=0;paint(f.renderer,f.actor,f.world);f.unchanged=before===JSON.stringify(f.session);}
function expectFallback(f){return failure&&newIds.has(f.spec.asset);}
const measured=new Map();
function alpha(record){
  if(measured.has(record.asset.id))return measured.get(record.asset.id);
  const image=record.image,canvas=document.createElement('canvas');canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;
  const c=canvas.getContext('2d',{willReadFrequently:true});originalDraw.call(c,image,0,0);const data=c.getImageData(0,0,canvas.width,canvas.height).data;
  let lo=255,hi=0,zeros=0,lowAlpha=0,visible=0,l=canvas.width,t=canvas.height,r=0,b=0;
  for(let y=0;y<canvas.height;y++)for(let x=0;x<canvas.width;x++){
    const value=data[(y*canvas.width+x)*4+3];lo=Math.min(lo,value);hi=Math.max(hi,value);if(value===0)zeros++;else if(value<128)lowAlpha++;
    if(value>=128){visible++;l=Math.min(l,x);t=Math.min(t,y);r=Math.max(r,x+1);b=Math.max(b,y+1);}
  }
  const result={range:[lo,hi],transparentPixels:zeros,lowAlphaPixels:lowAlpha,visiblePixels:visible,bbox:[l,t,r,b],width:canvas.width,height:canvas.height};measured.set(record.asset.id,result);return result;
}
const close=(a,b)=>Math.abs(a-b)<1e-7,same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
try{
  for(const f of fixtures){render(f);paint(f.baseline,f.actor,f.world);f.first={fallbacks:f.renderer.nativeFallbacks,draws:calls.get(f.spec.id).length,nativePixelsEqual:samePixels(f.canvas,f.baselineCanvas)};}
  window.__QA_FIRST_FRAME__=fixtures.map(f=>({id:f.spec.id,...f.first}));
  const deadline=performance.now()+45000;let ready=false;
  while(performance.now()<deadline){
    for(const f of fixtures)render(f);
    ready=fixtures.every(f=>expectFallback(f)?f.renderer.rasterStatusV116().failed===1&&f.renderer.nativeFallbacks===1&&calls.get(f.spec.id).length===0:calls.get(f.spec.id).length===1&&calls.get(f.spec.id)[0].path===assets.get(f.spec.asset).path);
    if(ready)break;await new Promise(resolve=>setTimeout(resolve,50));
  }
  if(!ready)throw new Error('Timed out waiting for native actor states');
  const records=fixtures.map(f=>{
    const draw=calls.get(f.spec.id)[0],store=f.renderer.rasterSpritesV116,asset=store.asset(f.spec.asset),base=store.asset('warrior-idle-right');
    const scale=f.spec.kind==='sentry'?75/(asset.bbox[3]-asset.bbox[1]):118/(base.bbox[3]-base.bbox[1])*Math.max(base.width,base.height)/Math.max(asset.width,asset.height);
    const expectedSize=[(asset.bbox[2]-asset.bbox[0])*scale,(asset.bbox[3]-asset.bbox[1])*scale];
    const geometry=draw?{measuredAsset:asset,expectedSize,aspectPreserved:close(draw.destination[2]/draw.destination[3],(asset.bbox[2]-asset.bbox[0])/(asset.bbox[3]-asset.bbox[1])),sizeCorrect:close(draw.destination[2],expectedSize[0])&&close(draw.destination[3],expectedSize[1]),groundPivot:close(draw.bounds.bottom,320),cropCorrect:same(draw.source,[asset.bbox[0],asset.bbox[1],asset.bbox[2]-asset.bbox[0],asset.bbox[3]-asset.bbox[1]])}:null;
    f.detail.textContent=draw?f.spec.asset+' · '+draw.destination[2].toFixed(2)+' × '+draw.destination[3].toFixed(2)+' unités · '+(draw.flip?'miroir':'direct'):'PNG indisponible · dessin V114 natif';
    return {id:f.spec.id,expectedAsset:f.spec.asset,expectedFlip:!!f.spec.flip,declaredRoute:f.actor.route,phase:f.actor.phase,alive:f.actor.alive,room:f.world.scene.id,firstFrame:f.first,
      stateUnchanged:f.unchanged,draws:calls.get(f.spec.id),finalFallbacks:f.renderer.nativeFallbacks,nativeFallbackPixelsEqual:expectFallback(f)?samePixels(f.canvas,f.baselineCanvas):null,
      selectedCreatureId:f.spec.kind==='warrior'?creatureAssetIdV116(store,f.actor):null,geometry,status:store.status()};
  });
  const imageMeasurements=[];
  if(!failure)for(const id of newIds){const f=fixtures.find(f=>f.spec.asset===id),record=f.renderer.rasterSpritesV116.get(id);imageMeasurements.push({id,...alpha(record)});}
  const checks=[];const check=(name,pass)=>checks.push({name,pass:!!pass});
  check('Fourteen declared states execute without mutating native session data',records.length===14&&records.every(r=>r.stateUnchanged));
  check('The first frame retains the exact native V114 pixels while images load',records.every(r=>r.firstFrame.fallbacks===1&&r.firstFrame.draws===0&&r.firstFrame.nativePixelsEqual));
  check('All independent expected image keys are drawn, except deliberately failed new PNGs',records.every(r=>failure&&newIds.has(r.expectedAsset)?r.draws.length===0&&r.finalFallbacks===1:r.draws.length===1&&r.draws[0].path===assets.get(r.expectedAsset).path&&r.finalFallbacks===0));
  check('Eight directional samples preserve the reviewed mirror convention',records.filter(r=>r.id.startsWith('sentry-')).every(r=>r.draws.every(d=>d.flip===r.expectedFlip)));
  check('Routed Warrior selects the new walking key in both directions',records.filter(r=>r.id.startsWith('warrior-walk')).every(r=>r.declaredRoute.length>0&&r.selectedCreatureId==='warrior-walk-right'));
  check('Idle, windup and death keep their historical priority over the walking key',records.filter(r=>['warrior-idle','warrior-attack','warrior-dead'].includes(r.id)).every(r=>r.selectedCreatureId===r.expectedAsset));
  check('Native PNG dimensions agree with the pinned catalog',records.every(r=>r.draws.every(d=>d.naturalWidth===assets.get(r.expectedAsset).width&&d.naturalHeight===assets.get(r.expectedAsset).height)));
  check('Alpha crop and aspect ratio remain native, without nonuniform stretching',records.every(r=>!r.geometry||r.geometry.aspectPreserved&&r.geometry.cropCorrect));
  check('Sentry height and Warrior source-scale normalization stay native',records.every(r=>!r.geometry||r.geometry.sizeCorrect));
  check('Bottom pivots remain at the projected ground line',records.every(r=>!r.geometry||r.geometry.groundPivot));
  check('All drawn PNGs remain inside their inspection canvases',records.every(r=>r.draws.every(d=>d.bounds.left>=0&&d.bounds.right<=640&&d.bounds.top>=0&&d.bounds.bottom<=360)));
  check('Unexpected image failures are absent',records.every(r=>r.status.failed===(failure&&newIds.has(r.expectedAsset)?1:0)));
  if(failure)check('Deliberately failed new PNGs retain pixel-identical native V114 fallback',records.filter(r=>newIds.has(r.expectedAsset)).every(r=>r.nativeFallbackPixelsEqual));
  else{
    check('All eight sentry directions, including the formerly missing front, draw PNGs',records.filter(r=>r.id.startsWith('sentry-')&&r.id!=='sentry-turn-front').every(r=>r.draws.length===1));
    check('Half of a native 0 to 180 degree turn selects the new frontal view',records.find(r=>r.id==='sentry-turn-front').draws[0].path===assets.get('sentry-aim-front').path);
    check('Both new native PNGs contain real transparent and visible pixels',imageMeasurements.length===2&&imageMeasurements.every(m=>m.transparentPixels>0&&m.visiblePixels>0));
    check('Measured alpha ranges, including a possible maximum of 254, match the records',imageMeasurements.every(m=>same(m.range,assets.get(m.id).alphaRange)));
    check('Measured alpha>=128 bounds match both new manifest records',imageMeasurements.every(m=>same(m.bbox,assets.get(m.id).bbox)));
  }
  const ok=checks.every(c=>c.pass);document.querySelector('#status').textContent=(failure?'Deux PNG volontairement bloqués · ':'PNG natifs disponibles · ')+checks.filter(c=>c.pass).length+'/'+checks.length+' contrôles';document.querySelector('#status').className=ok?'ok':'failed';
  window.__QA_RESULT__={ok,mode:failure?'new-png-requests-aborted':'normal',checks,fixtures:records,imageMeasurements,limits:['Fourteen explicitly prepared native sessions/actor states; no campaign completion is claimed.','Eight static views/mirrors and one walk key are not complete animation cycles.','Pixel integrity, alpha and geometry are verified; exact film fidelity remains unvalidated.']};window.__QA_READY__=true;
}catch(error){window.__QA_ERROR__=String(error.stack||error);document.querySelector('#status').textContent=window.__QA_ERROR__;}
'''


def preflight(root):
    payload, routes = PREFLIGHT.preflight(root)
    code = """import {verifyAliens1986RasterSourcesV116} from './scripts/public-aliens1986-dlc-admissions.mjs';
import {renderAliens1986RasterV116} from './scripts/derive-aliens1986-raster-v116.mjs';
await verifyAliens1986RasterSourcesV116();const r=await renderAliens1986RasterV116();
process.stdout.write(JSON.stringify({assets:r.assets,assetRevision:r.assetRevision,gameSha256:r.sha256}));"""
    derivative = json.loads(subprocess.check_output(['node', '--input-type=module', '-e', code], cwd=root, text=True))
    assert derivative['assetRevision'] == 123 and len(derivative['assets']) == 166
    assets = list(payload['assets'])
    for version in (122, 123):
        name = f'docs/development/aliens-1986-sprites-v{version}/manifest.json'
        blob = (root / name).read_bytes()
        payload['provenance']['manifestHashes'][name] = sha(blob)
        assets.extend(json.loads(blob)['assets'])
    assert len(assets) == len({a['id'] for a in assets}) == 166
    for asset in assets:
        path = root / asset['path']
        assert path.is_file() and not path.is_symlink() and path.resolve() == path
        routes['/' + asset['path']] = (path, 'image/png')
    payload.update({'assets': assets, 'ids': IDS, 'currentManifest': CURRENT})
    payload['provenance'].update({'gameSha256': derivative['gameSha256'], 'assetRevision': 123,
        'verifiedPngCount': 166, 'fixtureSources': {'script': sha(Path(__file__).read_bytes()), 'html': sha(HTML.encode()), 'javascript': sha(JS.encode())}})
    return payload, routes


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source-root', type=Path, default=Path.cwd())
    parser.add_argument('--output', type=Path, required=True)
    parser.add_argument('--executable', type=Path)
    args = parser.parse_args()
    root, output = args.source_root.resolve(), args.output.resolve()
    if output == root or root in output.parents:
        parser.error('Evidence must be outside the source tree')
    output.mkdir(parents=True, exist_ok=True)
    receipt = {'schema': 1, 'ok': False, 'timestampUtc': datetime.now(timezone.utc).isoformat(),
               'scope': 'Native actor fixtures with declared state changes; no campaign claim', 'runs': [], 'captures': []}

    def flush():
        (output / 'directions-v123-report.json').write_text(json.dumps(receipt, ensure_ascii=False, indent=2) + '\n')

    try:
        payload, routes = preflight(root)
        receipt['provenance'] = payload['provenance']
        blocked_paths = {'/' + a['path'] for a in payload['assets'] if a['id'] in IDS}
        with tempfile.TemporaryDirectory(prefix='aliens-v123-fixtures-') as temporary:
            site = Path(temporary)
            for name, (body, _mime) in routes.items():
                destination = site / name.lstrip('/')
                destination.parent.mkdir(parents=True, exist_ok=True)
                if isinstance(body, Path):
                    destination.symlink_to(body)
                else:
                    destination.write_bytes(body)
            (site / 'fixture').mkdir(exist_ok=True)
            (site / 'fixture/index.html').write_text(HTML)
            (site / 'fixture/directions.mjs').write_text(JS)
            (site / 'fixture/data.json').write_text(json.dumps(payload))
            with HTTP.static_site(site) as base, sync_playwright() as playwright:
                executable = args.executable or os.environ.get('ATF_CHROMIUM_EXECUTABLE')
                browser = playwright.chromium.launch(headless=True, executable_path=str(executable) if executable else None)
                receipt['browser'] = {'engine': 'Chromium', 'version': browser.version, 'headless': True}
                try:
                    for failure in (False, True):
                        context = browser.new_context(viewport={'width': 1640, 'height': 1100}, device_scale_factor=1)
                        page = context.new_page()
                        errors, unexpected_requests, http_errors, aborted = [], [], [], []
                        page.on('pageerror', lambda error: errors.append(str(error)))
                        page.on('response', lambda response: http_errors.append({'url': response.url, 'status': response.status}) if response.status >= 400 else None)
                        from urllib.parse import urlsplit
                        page.on('requestfailed', lambda request: unexpected_requests.append({'url': request.url, 'failure': request.failure}) if not (failure and urlsplit(request.url).path in blocked_paths) else None)
                        if failure:
                            def intercept(route):
                                path = urlsplit(route.request.url).path
                                if path in blocked_paths:
                                    aborted.append(path)
                                    route.abort('failed')
                                else:
                                    route.continue_()
                            context.route('**/*.png', intercept)
                        try:
                            page.goto(base + '/fixture/index.html' + ('?unavailable=1' if failure else ''), wait_until='networkidle')
                            page.wait_for_function('window.__QA_READY__ || window.__QA_ERROR__', timeout=60000)
                            error = page.evaluate('window.__QA_ERROR__ || null')
                            if error:
                                raise RuntimeError(error)
                            run = page.evaluate('window.__QA_RESULT__')
                            run['resourceEvidence'] = {'pageErrors': errors, 'unexpectedRequestFailures': unexpected_requests, 'httpErrors': http_errors, 'deliberatelyAborted': aborted}
                            run['checks'].append({'name': 'No unexpected network or browser error', 'pass': not (errors or unexpected_requests or http_errors)})
                            if failure:
                                run['checks'].append({'name': 'Both new PNG request paths were deliberately aborted', 'pass': set(aborted) == blocked_paths})
                            run['ok'] = bool(run['ok'] and all(check['pass'] for check in run['checks']))
                            receipt['runs'].append(run)
                            name = 'directions-v123-failure.png' if failure else 'directions-v123.png'
                            page.screenshot(path=str(output / name), full_page=True)
                            receipt['captures'].append({'file': name, 'sha256': sha((output / name).read_bytes()), 'imageEdited': False})
                            flush()
                        finally:
                            context.close()
                finally:
                    browser.close()
        receipt['ok'] = len(receipt['runs']) == 2 and all(run['ok'] for run in receipt['runs'])
    except Exception as error:
        receipt['error'] = str(error)
        receipt['errorType'] = type(error).__name__
    finally:
        flush()
    checks = [check for run in receipt['runs'] for check in run['checks']]
    print(json.dumps({'ok': receipt['ok'], 'checks': len(checks), 'passed': sum(check['pass'] for check in checks),
                      'report': str(output / 'directions-v123-report.json'), 'error': receipt.get('error')}))
    return 0 if receipt['ok'] else 1


if __name__ == '__main__':
    raise SystemExit(main())
