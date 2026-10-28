"""Observe the authored batch through native Save imports and canvas reads.

Every initial position is a disclosed fixture, not a claimed journey. Longer
rooms use several independent views instead of moving the camera by script.
Evaluations only observe the game or draw a separate component reference.
"""
import argparse
import datetime
import hashlib
import json
import math
import os
from pathlib import Path
import subprocess
import urllib.request

from playwright.sync_api import sync_playwright


parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--base', default='http://127.0.0.1:4198')
parser.add_argument('--output', type=Path, required=True)
parser.add_argument('--stage', choices=['before', 'after'], required=True)
parser.add_argument('--expect-build', required=True)
parser.add_argument('--expect-harness', required=True)
parser.add_argument('--fixture-dir', type=Path)
parser.add_argument('--rooms', nargs='+', help='Optional exact room IDs; the default covers all35.')
args = parser.parse_args()
repo = Path(__file__).resolve().parents[1]
output = args.output.resolve()
if output == repo or repo in output.parents:
    parser.error('Keep observation files outside the source checkout.')
if output.exists() and any(output.iterdir()):
    parser.error('Choose an empty output directory; do not replace an earlier attempt.')
output.mkdir(parents=True, exist_ok=True)
sha = lambda raw: hashlib.sha256(raw).hexdigest()
now = lambda: datetime.datetime.now(datetime.timezone.utc).isoformat()
git = lambda *cmd: subprocess.check_output(['git', *cmd], cwd=repo, text=True).strip()
report = dict(schema=168, status='running', stage=args.stage, startedAt=now(), checks=[], captures=[],
              fixtures=[], views=[], pageErrors=[], requestFailures=[], httpErrors=[],
              method='Declared Save fixtures, native hub entry and selected short A/D controls. Actual canvas pixels are compared with an independent detached component reference.',
              limitations=[
                  'Automated Chromium observation, no human participants or canonical1:1 approval.',
                  'Room and camera starting positions are declared fixtures, not observed travel to those positions.',
                  'Separate views of a long room are separate Save imports, not a walkthrough or interdeck transport.',
                  'The detached reference never replaces a native image and never mutates an engine, actor or camera.',
                  'Pixel matching establishes visible material signatures within each installation, not whole-room artistic approval.',
                  'The refuge is entered through its real parent door because its Save contract resumes outside.',
              ])


def phase(label):
    report['phase'] = label
    print('STEP ' + label, flush=True)


def check(label, condition):
    if not condition:
        raise AssertionError(label)
    report['checks'].append(label)
    print('PASS ' + label, flush=True)


def identity():
    with urllib.request.urlopen(args.base.rstrip('/') + '/build-info.json', timeout=30) as response:
        raw = response.read()
    info = json.loads(raw)
    assert info['sourceCommit'] == args.expect_build, 'Unexpected served build identity'
    return dict(sourceCommit=info['sourceCommit'], buildId=info['buildId'], buildInfoSha256=sha(raw))


def manifest():
    paths = sorted([*repo.glob('src/**/*.js'), *repo.glob('*.css'), repo / 'index.html',
                    repo / 'sw.js', repo / 'package.json', repo / 'package-lock.json', Path(__file__).resolve()])
    return {str(path.relative_to(repo)): sha(path.read_bytes()) for path in paths}


# Only the root runs this Node program. Its output declares inputs; it does not
# execute an engine or edit the served runtime.
CONFIG_JS = r"""
import {HUB_DECKS,buildHubObstacleGeometryV87} from './src/hub-game.js';
import {HUB_ANNEXES_V137} from './src/hub-annex-registry-v137.js';
import {getHubAnnexRuntimeGeometryV139} from './src/hub-annex-runtime-geometry-v139.js';
import {HUB_ROOM_BATCH_DETAILS_V168 as details} from './src/hub-room-batch-details-v168.js';
const overlaps=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
const valid=b=>b&&[b.x,b.y,b.w,b.h].every(Number.isFinite);
const main=HUB_DECKS.flatMap((d,deck)=>d.rooms.map(room=>({room,deck,annex:false})));
const annexes=HUB_ANNEXES_V137.map(getHubAnnexRuntimeGeometryV139).map(room=>({room,deck:HUB_DECKS.findIndex(d=>d.id===room.parentDeck),annex:true}));
const result=[];
for(const {room,deck,annex} of [...main,...annexes]){
 const start=room.xStart||0,width=room.profile?.worldWidth||room.world?.width||1280;
 const items=details.filter(d=>d.roomId===room.id),blocks=(annex?room.colliders||[]:buildHubObstacleGeometryV87(deck))
   .filter(b=>valid(b)&&b.collisionMode!=='one-way-top');
 const free=local=>{const x=(annex?0:start)+local;return local>=72&&local+44<=width-72
   &&blocks.every(b=>!overlaps({x,y:532,w:44,h:92},b));};
 const choices=[];for(let x=96;x<=width-140;x+=16)if(free(x))choices.push(x);
 if(!choices.length)throw Error('No declared floor fixture for '+room.id);
 const nearest=goal=>choices.reduce((a,b)=>Math.abs(a-goal)<=Math.abs(b-goal)?a:b);
 const visible=(item,local)=>{const camera=annex?Math.max(0,Math.min(width-1280,local-640)):
   Math.max(0,Math.min(5120-1280,start+local-640));
   // The optional short native walk and camera easing retain64px safety.
   const x=(annex?0:start)+item.bounds.x;return x>=camera+64&&x+item.bounds.w<=camera+1216;};
 const remaining=new Set(items.map(d=>d.id));let view=0;
 while(remaining.size){
  const first=items.find(d=>remaining.has(d.id));
  const local=room.id==='personal-refuge'?nearest(640):nearest(first.bounds.x+first.bounds.w/2-22);
  const expected=items.filter(d=>visible(d,local));
  if(!expected.some(d=>remaining.has(d.id)))throw Error('No complete viewport for '+first.id);
  for(const d of expected)remaining.delete(d.id);
  const walkSpan=(direction)=>{const xx=(annex?0:start)+local+(direction<0?-40:0);
    return blocks.every(b=>!overlaps({x:xx,y:532,w:84,h:92},b))&&free(local+direction*40);};
  const walk=room.id==='personal-refuge'||view>0?0:walkSpan(1)?1:walkSpan(-1)?-1:0;
  result.push({id:room.id+'-view-'+(++view),roomId:room.id,annex,deck,parentRoomId:annex?room.parentRoomId:room.id,
    localStart:local,roomStart:start,width,enterRefuge:room.id==='personal-refuge',walkDirection:walk,
    expectedIds:expected.map(d=>d.id),expectedInstallations:items,projection:room.id==='maintenance-spine'?'parallel-oblique':'orthographic'});
 }
}
console.log(JSON.stringify(result));
"""
configs = json.loads(subprocess.check_output(['node', '--input-type=module', '-e', CONFIG_JS], cwd=repo))
all_rooms = sorted({c['roomId'] for c in configs})
assert len(all_rooms) == 35, 'The complete profile must cover35 existing rooms'
if args.rooms:
    assert len(set(args.rooms)) == len(args.rooms) and set(args.rooms) <= set(all_rooms), 'Use exact unique room IDs'
    configs = [c for c in configs if c['roomId'] in args.rooms]
target_rooms = sorted({c['roomId'] for c in configs})
target_ids = sorted({item['id'] for c in configs for item in c['expectedInstallations']})
report.update(requestedRooms=target_rooms, expectedInstallationIds=target_ids, declaredViewCount=len(configs),
              subset=bool(args.rooms), requestedBatchSize=len(target_ids))

FIXTURE_JS = r"""
import {createDefaultSave} from './src/save.js';
import {HUB_DECKS} from './src/hub-game.js';
import {HUB_ANNEX_BY_ID_V137,createHubCommercialStateV137} from './src/hub-annex-registry-v137.js';
import {getHubShipConnectionsForSpaceV137} from './src/hub-ship-layout-v137.js';
import {HUB_ANNEX_ENTRANCES_V133} from './src/hub-navigation-layout-v133.js';
const c=JSON.parse(process.argv[1]),s=createDefaultSave();
s.createdAt=Date.UTC(2026,9,28);s.updatedAt=s.createdAt;s.needsPlayerCreationV84=false;s.scene='hub';
s.player.name='QA Tantalus batch100 V168';s.clock={day:1,hour:6};s.settings.reducedMotion=false;
const a=c.annex?HUB_ANNEX_BY_ID_V137[c.roomId]:null,room=HUB_DECKS[c.deck].rooms.find(r=>r.id===c.parentRoomId);
const connection=a?getHubShipConnectionsForSpaceV137(a.id)[0]||null:null,authored=a?HUB_ANNEX_ENTRANCES_V133[a.id]:null;
const door=connection?.parentDoorBounds||a?.parentDoorBounds||(authored?{
 x:room.xStart+authored.centerX-a.entrance.w/2,y:authored.bottom-a.entrance.h,w:a.entrance.w,h:a.entrance.h}:null);
const initialX=c.annex?door.x+door.w/2-22:room.xStart+c.localStart;
Object.assign(s.hub,{deck:c.deck,roomId:room.id,positionX:initialX,positionY:532,facing:1});
if(c.annex&&!c.enterRefuge){const commercial=createHubCommercialStateV137();
 Object.assign(commercial,{activeAnnexId:a.id,lastAnnexId:a.id,annexPositionX:c.localStart,annexPositionY:532,annexClimbing:false,
 returnContext:{deckId:a.parentDeck,roomId:room.id,x:door.x+door.w/2-22,facing:1,...(connection?{endpointId:connection.id}:{})},
 ...(connection?{activeConnectionIdV137:connection.id}:{})});
 commercial.annexes[a.id].visited=true;if(!commercial.visitedAnnexIds.includes(a.id))commercial.visitedAnnexIds.push(a.id);s.hub.commercialV71=commercial;}
console.log(JSON.stringify({save:s,meta:{config:c,parentDoor:door,initialActiveAnnex:c.annex&&!c.enterRefuge?c.roomId:null,
 startingPoseIsSaveFixture:true,resourcesModified:false,clockFixture:{day:1,hour:6}}}));
"""


def fixture(config):
    save_name = config['id'] + '-disclosed-save.json'
    meta_name = config['id'] + '-fixture-meta.json'
    if args.fixture_dir:
        source = args.fixture_dir.resolve()
        raw, meta_raw = (source / save_name).read_bytes(), (source / meta_name).read_bytes()
        meta = json.loads(meta_raw)
        assert meta['config'] == config, 'The comparison fixture differs from this exact room/view configuration'
        assert json.loads(raw)['player']['name'] == 'QA Tantalus batch100 V168'
    else:
        generated = json.loads(subprocess.check_output(
            ['node', '--input-type=module', '-e', FIXTURE_JS, json.dumps(config)], cwd=repo))
        raw = (json.dumps(generated['save'], ensure_ascii=False, separators=(',', ':')) + '\n').encode()
        meta = generated['meta']
        meta_raw = (json.dumps(meta, ensure_ascii=False, indent=2) + '\n').encode()
    (output / save_name).write_bytes(raw)
    (output / meta_name).write_bytes(meta_raw)
    report['fixtures'].append(dict(id=config['id'], file=save_name, sha256=sha(raw),
                                   metadata=meta_name, metadataSha256=sha(meta_raw),
                                   reusedFrom=str(args.fixture_dir.resolve()) if args.fixture_dir else None))
    return raw, meta


OBSERVE = r"""() => {const h=__ATF_HUB__,s=h.getSnapshot(),a=h.currentAnnexV71?.()||null;
 const visible=a?(h.activeAnnexNpcsV141?.()||[]):h.npcs||[],ids=visible.map(n=>n.crewId).filter(Boolean);
 return{running:h.running,roomId:a?.id||h.currentRoom()?.id,annexId:a?.id||null,
 player:{x:h.player.x,y:h.player.y,w:h.player.w,h:h.player.h,vx:h.player.vx,vy:h.player.vy,alive:h.player.alive,grounded:h.player.grounded},
 floorY:a?.world.floorY||624,cameraX:a?h.annexCameraV71.x:h.camera.x,
 duplicateCrew:[...new Set(ids)].filter(id=>ids.filter(v=>v===id).length>1),
 authoritativePlayerReferences:[h.player,...visible].filter(n=>n===h.player).length,
 clock:structuredClone(__ATF_V51__.saveSystem.data.clock),resources:structuredClone(__ATF_V51__.saveSystem.data.galaxy.resources),
 life:structuredClone(s.hubRoomLifeV136?.current||null),parallax:structuredClone(s.hubRoomParallaxV134?.current||null),
 transition:!!h.annexTransitionV71,closing:!!h.hubDoorClosingV142};}"""


def observe(page):
    return page.evaluate(OBSERVE)


def open_hub(page):
    menu = page.locator('#menu-toggle')
    if menu.is_visible() and 'open' not in (page.locator('.rail').get_attribute('class') or '').split():
        menu.click()
    page.locator('[data-view="hub"]').click()
    page.wait_for_function('()=>__ATF_HUB__?.running', timeout=90000)
    page.locator('#hub-canvas').focus()


def settle(page):
    page.wait_for_function('''()=>{const h=__ATF_HUB__;return h?.running&&!h.annexTransitionV71
      &&!h.hubDoorClosingV142&&Math.abs(h.player.vx)<1&&Math.abs(h.player.vy)<1;}''', timeout=45000)


def capture(page, filename):
    target = output / filename
    assert not target.exists()
    page.locator('#hub-canvas').screenshot(path=str(target))
    raw = target.read_bytes()
    assert raw[:8] == b'\x89PNG\r\n\x1a\n'
    report['captures'].append(dict(file=filename, kind='native-canvas', bytes=len(raw), sha256=sha(raw)))


PIXELS = r"""async raw => {
 const cfg=JSON.parse(raw),h=__ATF_HUB__,a=h.currentAnnexV71?.(),room=a||h.currentRoom(),canvas=document.querySelector('#hub-canvas');
 const cam=a?h.annexCameraV71.x:h.camera.x,nativeContext=canvas.getContext('2d'),native=nativeContext.getImageData(0,0,canvas.width,canvas.height).data;
 const {getHubRoomLifePlanV136}=await import('/src/hub-room-life-v136.js');
 const {drawHubRoomBatchDetailsV168}=await import('/src/hub-room-batch-details-v168.js');
 const plan=getHubRoomLifePlanV136(room).batchDetailsV168;
 const reference=document.createElement('canvas');reference.width=canvas.width;reference.height=canvas.height;
 const c=reference.getContext('2d');c.imageSmoothingEnabled=nativeContext.imageSmoothingEnabled;
 c.imageSmoothingQuality=nativeContext.imageSmoothingQuality;c.save();c.translate(-cam,0);
 const draw=drawHubRoomBatchDetailsV168(c,plan,{images:h.hubLifeImagesV136||new Map()});c.restore();
 if(a){const v=c.createRadialGradient(640,396,120,640,396,760);v.addColorStop(0,'rgba(0, 0, 0, 0)');v.addColorStop(1,'rgba(0, 3, 4, .62)');c.fillStyle=v;c.fillRect(0,0,1280,720);}
 const ref=c.getImageData(0,0,reference.width,reference.height).data;
 return cfg.expectedIds.map(id=>{const item=plan.items.find(v=>v.id===id);if(!item)return{id,error:'missing-plan-item'};
  const b=item.bounds,x0=Math.ceil(b.x-cam),y0=Math.ceil(b.y),x1=Math.floor(b.x+b.w-cam),y1=Math.floor(b.y+b.h);
  const visible=x0>=0&&x1<canvas.width&&y0>=0&&y1<canvas.height;let candidates=0,matches=0,opaque=0,colorful=0;
  if(visible)for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){const j=(y*canvas.width+x)*4;
   if(native[j+3]>=250)opaque++;if(Math.max(native[j],native[j+1],native[j+2])-Math.min(native[j],native[j+1],native[j+2])>8)colorful++;
   // Bright opaque reference cores exclude the dark mounting/background base.
   // Native vignette is reproduced above; tolerance admits other light trims
   // and source resampling, while requiring actual coloured material pixels.
   if(ref[j+3]<254||ref[j]+ref[j+1]+ref[j+2]<240)continue;candidates++;
   if(Math.max(Math.abs(ref[j]-native[j]),Math.abs(ref[j+1]-native[j+1]),Math.abs(ref[j+2]-native[j+2]))<=18)matches++;
  }
  return{id,kind:item.kind,bounds:{...b},cameraX:cam,canvasWidth:canvas.width,canvasHeight:canvas.height,
   fullyInNativeCanvas:visible,expectedOpaqueBrightPixels:candidates,nativeMatchingCorePixels:matches,
   nativeOpaquePixels:opaque,nativeChromaticPixels:colorful,detachedReferencePainted:draw.painted.some(v=>v.id===id),
   referenceMethod:'separate-component-render-no-engine-mutation',lighting:a?'native-annex-radial-vignette':'main-room'};
 });
}"""


def inspect(page, config):
    page.wait_for_function('''id=>{const h=__ATF_HUB__,s=h.getSnapshot();return h?.running
      &&(h.currentAnnexV71?.()?.id||h.currentRoom()?.id)===id&&s.hubRoomLifeV136?.current?.roomId===id
      &&s.hubRoomParallaxV134?.current?.nativeReady&&h.player.playerAppearanceVisualV126?.drawn;}''',
                           arg=config['roomId'], timeout=90000)
    if args.stage == 'after':
        page.wait_for_function('''id=>{const p=__ATF_HUB__.getSnapshot().hubRoomLifeV136?.current;
          return p?.roomId===id&&p.batchDetailsV168&&!p.batchDetailsV168.pending.length;}''', arg=config['roomId'], timeout=45000)
    settle(page)
    row = observe(page)
    check(config['id'] + ': the correct compartment has one supported player and no cloned crew',
          row['authoritativePlayerReferences'] == 1 and not row['duplicateCrew'] and row['player']['alive']
          and row['player']['w'] == 44 and row['player']['h'] == 92
          and all(math.isfinite(row['player'][k]) for k in ['x', 'y', 'w', 'h'])
          and abs(row['player']['y'] + row['player']['h'] - row['floorY']) <= 1)
    check(config['id'] + ': the whole room retains its authored projection',
          row['life']['projection']['kind'] == config['projection']
          and row['parallax']['presentationMode'] == ('2.5d' if config['projection'] == 'parallel-oblique' else '2d'))
    if args.stage == 'after':
        details = row['life']['batchDetailsV168']
        check(config['id'] + ': all room installations are admitted and actually painted without new interactions or colliders',
              not details['pending'] and not details['omitted'] and not details['collidable'] and not details['interactive']
              and sorted(item['id'] for item in details['painted']) == sorted(item['id'] for item in config['expectedInstallations']))
        probes = page.evaluate(PIXELS, json.dumps(config))
        row['installationPixelProbes'] = probes
        # Keep pixel failures failed but finish other views for diagnosis.
        failures = [probe for probe in probes if not probe.get('fullyInNativeCanvas')
                    or not probe.get('detachedReferencePainted') or probe.get('expectedOpaqueBrightPixels', 0) < 16
                    or probe.get('nativeMatchingCorePixels', 0) < 16]
        if failures:
            report.setdefault('rasterFailures', []).append(dict(view=config['id'], probes=failures))
            print('FAIL ' + config['id'] + ': material cores missing from the native raster', flush=True)
        else:
            check(config['id'] + ': every assigned installation reaches visible native canvas material pixels', True)
        report.setdefault('visibleInstallationIds', []).extend(probe['id'] for probe in probes if probe not in failures)
    capture(page, config['id'] + '-native.png')
    report['views'].append(dict(id=config['id'], roomId=config['roomId'], expectedIds=config['expectedIds'], state=row))
    return row


source_start = manifest()
report['sourceStart'] = source_start
page = None
try:
    harness = git('rev-parse', 'HEAD')
    check('The harness is the exact clean declared commit', harness == args.expect_harness and not git('status', '--porcelain'))
    report['harnessCommit'] = harness
    report['identityBefore'] = identity()
    report['sourceCommit'] = report['identityBefore']['sourceCommit']
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True, executable_path=os.environ.get('ATF_CHROMIUM_EXECUTABLE', '/usr/bin/chromium'))
        report['chromium'] = browser.version
        try:
            for config in configs:
                phase(config['id'] + ': native Save import')
                raw, meta = fixture(config)
                context = browser.new_context(viewport=dict(width=1600, height=1000), service_workers='block')
                try:
                    page = context.new_page()
                    page.set_default_timeout(45000)
                    page.on('pageerror', lambda error, name=config['id']: report['pageErrors'].append(dict(id=name, error=str(error))))
                    page.on('requestfailed', lambda request, name=config['id']: report['requestFailures'].append(dict(id=name, url=request.url, failure=request.failure)))
                    page.on('response', lambda response, name=config['id']: report['httpErrors'].append(dict(id=name, url=response.url, status=response.status)) if response.status >= 400 else None)
                    page.on('dialog', lambda dialog: dialog.accept())
                    page.goto(args.base, wait_until='domcontentloaded')
                    page.locator('#title-start').click()
                    page.locator('#title-options').click()
                    page.locator('#save-import').set_input_files(dict(name=config['id'] + '.json', mimeType='application/json', buffer=raw))
                    page.wait_for_function("()=>__ATF_V51__?.saveSystem.data.player.name==='QA Tantalus batch100 V168'")
                    open_hub(page)
                    # JSON string preserves a null expected annex in the polling utility world.
                    page.wait_for_function('raw=>(__ATF_HUB__.currentAnnexV71?.()?.id||null)===JSON.parse(raw)',
                                           arg=json.dumps(meta['initialActiveAnnex']))
                    settle(page)
                    if config['enterRefuge']:
                        page.keyboard.press('KeyE', delay=80)
                        page.wait_for_function("()=>__ATF_HUB__.currentAnnexV71?.()?.id==='personal-refuge'&&!__ATF_HUB__.annexTransitionV71", timeout=90000)
                        settle(page)
                    before = observe(page)
                    if config['walkDirection']:
                        key = 'KeyD' if config['walkDirection'] > 0 else 'KeyA'
                        page.locator('#hub-canvas').focus()
                        page.keyboard.press(key, delay=150)
                        settle(page)
                        moved = observe(page)
                        delta = moved['player']['x'] - before['player']['x']
                        check(config['id'] + ': a short native control moves on the declared clear floor segment',
                              before['roomId'] == moved['roomId'] and config['walkDirection'] * delta >= 3
                              and abs(delta) <= 60 and abs(moved['player']['y'] + moved['player']['h'] - moved['floorY']) <= 1)
                        report.setdefault('nativeMoves', []).append(dict(view=config['id'], key=key, before=before['player'], after=moved['player']))
                    row = inspect(page, config)
                    check(config['id'] + ': observing and walking preserve resources and strategic time',
                          before['clock'] == row['clock'] and before['resources'] == row['resources'])
                except Exception:
                    try:
                        if page and not page.is_closed() and page.locator('#hub-canvas').is_visible():
                            capture(page, config['id'] + '-failure.png')
                            report['failureObservation'] = observe(page)
                    except Exception as error:
                        report['failureCaptureError'] = str(error)
                    raise
                finally:
                    context.close()
                    page = None
        finally:
            browser.close()
    check('Every requested compartment has native observations', sorted({row['roomId'] for row in report['views']}) == target_rooms)
    if args.stage == 'after':
        visible = sorted(set(report.get('visibleInstallationIds', [])))
        check('Every requested installation is visible in a native raster, with no failed probes', visible == target_ids and not report.get('rasterFailures'))
        report['uniqueVisibleInstallations'] = len(visible)
    report['identityAfter'] = identity()
    check('The exact served build stayed unchanged', report['identityBefore'] == report['identityAfter'])
    report['sourceEnd'] = manifest()
    check('The complete source and harness stayed unchanged', source_start == report['sourceEnd']
          and git('rev-parse', 'HEAD') == harness and not git('status', '--porcelain'))
    check('No runtime, unexpected request or HTTP error was observed', not report['pageErrors'] and not report['httpErrors']
          and not [row for row in report['requestFailures'] if row['failure'] != 'net::ERR_ABORTED'])
    report['status'] = 'passed'
except Exception as error:
    report['status'] = 'failed'
    report['error'] = str(error)
    report['errorType'] = type(error).__name__
finally:
    report['sourceEnd'] = manifest()
    report['sourceUnchanged'] = source_start == report['sourceEnd']
    try:
        report['identityAfter'] = identity()
        report['sameBuild'] = report.get('identityBefore') == report['identityAfter']
    except Exception as error:
        report['identityAfterError'] = str(error)
        report['sameBuild'] = False
    if not report['sourceUnchanged'] or not report['sameBuild']:
        report['status'] = 'failed'
    report['finishedAt'] = now()
    (output / 'report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
print(json.dumps(dict(status=report['status'], checks=len(report['checks']), captures=len(report['captures']),
                     rooms=len({row['roomId'] for row in report['views']}),
                     uniqueVisibleInstallations=report.get('uniqueVisibleInstallations'), report=str(output / 'report.json'))), flush=True)
raise SystemExit(0 if report['status'] == 'passed' else 1)
