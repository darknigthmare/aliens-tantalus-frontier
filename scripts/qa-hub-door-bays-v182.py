"""Native walking, climbing and paired-door checks for the five repaired bays.

Every starting position is a disclosed Save fixture imported through the public
UI. Subsequent movement uses A/D/W/S and E. Browser evaluation only observes the
production hub, its original canvas and a separate read-only frame recorder.
"""
import argparse
import base64
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
parser.add_argument('--base', default='http://127.0.0.1:4173')
parser.add_argument('--output', type=Path, required=True)
parser.add_argument('--expect-build', required=True)
parser.add_argument('--expect-harness', required=True)
args = parser.parse_args()
repo = Path(__file__).resolve().parents[1]
output = args.output.resolve()
if output == repo or repo in output.parents:
    parser.error('Keep evidence outside the repository.')
if output.exists() and any(output.iterdir()):
    parser.error('Use an empty output directory and preserve earlier attempts.')
if any(len(value) != 40 or any(c not in '0123456789abcdef' for c in value)
       for value in [args.expect_build, args.expect_harness]):
    parser.error('Both expected commits must be full lowercase hexadecimal SHAs.')
output.mkdir(parents=True, exist_ok=True)
now = lambda: datetime.datetime.now(datetime.timezone.utc).isoformat()
sha = lambda value: hashlib.sha256(value).hexdigest()
git = lambda *cmd: subprocess.check_output(['git', *cmd], cwd=repo, text=True).strip()
report = dict(
    status='running', startedAt=now(), checks=[], fixtures=[], scenarios=[],
    captures=[], nativeMoves=[], nativePassages=[], legacyResumes=[],
    pageErrors=[], requests=[], requestFailures=[], httpErrors=[], failures=[],
    method='Public Save import; real A/D/W/S traversal and E passages; original #hub-canvas captures; read-only observations.',
    limitations=[
        'Each initial floor, retired platform or retired ladder pose is a disclosed fixture, not an observed journey.',
        'A native doorway changes room coordinates; it is not interdeck travel or walking distance.',
        'Retired-pose frame recording observes native RAF and never replaces RAF, drives updates or pauses the engine.',
        'Geometry and actual canvas captures do not constitute human artistic review or 1:1 certification.',
    ])


def check(label, condition):
    if not condition:
        raise AssertionError(label)
    report['checks'].append(label)
    print('PASS ' + label, flush=True)


def phase(label):
    report['phase'] = label
    print('STEP ' + label, flush=True)


def identity():
    with urllib.request.urlopen(args.base.rstrip('/') + '/build-info.json', timeout=20) as response:
        raw = response.read()
    info = json.loads(raw)
    assert info['sourceCommit'] == args.expect_build, 'Unexpected served source commit'
    return dict(sourceCommit=info['sourceCommit'], buildId=info['buildId'], buildInfoSha256=sha(raw))


def manifest():
    files = sorted([*repo.glob('src/**/*.js'), *repo.glob('*.css'),
                    repo / 'index.html', repo / 'sw.js', repo / 'package.json',
                    repo / 'package-lock.json', Path(__file__).resolve()])
    return {str(path.relative_to(repo)): sha(path.read_bytes()) for path in files}


CONFIG_JS = r"""
import assert from 'node:assert/strict';
import {HUB_DECKS,HUB_WORLD,buildHubObstacleGeometryV87} from './src/hub-game.js';
import {buildHubTraversalGeometryV87,HUB_TRAVERSAL_PROFILES_V60} from './src/hub-v51-runtime.js';
import {resolveHubServiceProfileV138} from './src/hub-service-geometry-v138.js';
import {HUB_ANNEX_BY_ID_V137} from './src/hub-annex-registry-v137.js';
import {HUB_ANNEX_ENTRANCES_V133} from './src/hub-navigation-layout-v133.js';
import {getHubDoorFaceV142} from './src/hub-door-passage-v142.js';
import {getHubCirculationSolidReservationsV138} from './src/hub-circulation-v137.js';
const overlap=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
const W=44,H=92,F=HUB_WORLD.floorY;
const pairs=[
 ['workshop','durandal','workshop'],['briefing','mire-archives','briefing'],
 ['cryo-bay','escape-pods','cryo'],['medical','morgue','medical'],
 ['quarantine','bioforge','quarantine']
];
const configs=pairs.map(([roomId,annexId,prefix])=>{
 const deck=HUB_DECKS.findIndex(d=>d.rooms.some(r=>r.id===roomId));
 const room=HUB_DECKS[deck].rooms.find(r=>r.id===roomId),annex=HUB_ANNEX_BY_ID_V137[annexId];
 assert.equal(annex.parentRoomId,roomId);assert.equal(annex.parentDeck,HUB_DECKS[deck].id);
 const geometry=buildHubTraversalGeometryV87(deck),entry=HUB_ANNEX_ENTRANCES_V133[annexId];
 const platforms=geometry.platforms.filter(p=>p.roomId===roomId);
 const ladders=geometry.ladders.filter(p=>p.roomId===roomId),vents=geometry.vents.filter(p=>p.roomId===roomId);
 const low=platforms.find(p=>p.id===prefix+'-low'),high=platforms.find(p=>p.id===prefix+'-high');
 const floor=ladders.find(p=>p.id===prefix+'-floor'),tier=ladders.find(p=>p.id===prefix+'-tier');
 assert.ok(low&&high&&floor&&tier,roomId+' lacks its production route');
 assert.equal(floor.bottom,F);assert.equal(floor.top,low.y);
 assert.equal(tier.bottom,low.y);assert.equal(tier.top,high.y);
 const parentDoor={x:room.xStart+entry.centerX-annex.entrance.w/2,y:entry.bottom-annex.entrance.h,
  w:annex.entrance.w,h:annex.entrance.h};
 const annexDoor={x:annex.entranceLocalX-annex.entrance.w/2,y:annex.entrance.y,
  w:annex.entrance.w,h:annex.entrance.h};
 const parentFace=getHubDoorFaceV142(parentDoor,annexDoor,annex.art.alphaBounds.door);
 const annexFace=getHubDoorFaceV142(annexDoor,parentDoor,annex.art.alphaBounds.door);
 assert.deepEqual(parentFace.pairedSize,annexFace.pairedSize);
 assert.ok(parentFace.opening.w>W&&parentFace.opening.h>=H);
 const bay={x:parentFace.target.x-7,y:parentFace.target.y-7,w:parentFace.target.w+14,h:parentFace.target.h+14};
 const steel=platforms.flatMap(p=>getHubCirculationSolidReservationsV138(p,{...geometry,room}));
 assert.ok(![...platforms,...steel].some(p=>overlap(p,bay)),roomId+' still has physical steel across its doorway');
 const solids=[...buildHubObstacleGeometryV87(deck).filter(p=>p.collisionMode!=='one-way-top'),...geometry.vents];
 const tierX=tier.x-W/2,highWalkX=[tierX+72,tierX-72].find(x=>{
  const path={x:Math.min(x,tierX),y:high.y-H,w:Math.abs(x-tierX)+W,h:H};
  return x>=high.x+6&&x+W<=high.x+high.w-6&&!solids.some(p=>overlap(p,path));
 });
 assert.ok(Number.isFinite(highWalkX),roomId+' has no clear native upper observation walk');
 const center=parentFace.opening.x+parentFace.opening.w/2,halfSpan=parentFace.opening.w/2-W/2;
 const initial={x:center-W/2-84,y:F-H,climbing:false};
 assert.ok(!solids.some(p=>overlap(p,{...initial,w:W,h:H})),roomId+' fixture intersects a solid');
 const historical=resolveHubServiceProfileV138(HUB_TRAVERSAL_PROFILES_V60[roomId]);
 const oldFloor=historical.ladders.find(p=>p.id===floor.id),oldLow=historical.platforms.find(p=>p.id===low.id);
 const legacy=[
  {kind:'retired-platform',x:room.xStart+oldFloor.x-W/2,y:oldLow.y-H,climbing:false},
  {kind:'retired-ladder',x:room.xStart+oldFloor.x-W/2,y:(oldFloor.top+oldFloor.bottom)/2-H,climbing:true}
 ];
 for(const pose of legacy){
  assert.ok(!solids.some(p=>overlap(p,{...pose,w:W,h:H})),roomId+' legacy fixture intersects a solid');
  assert.ok(!platforms.some(p=>pose.x+W>p.x+4&&pose.x<p.x+p.w-4&&Math.abs(pose.y+H-p.y)<=1),
   roomId+' historical pose still has a current platform');
 }
 return {id:roomId+'-'+annexId,roomId,annexId,deck,roomStart:room.xStart,floorY:F,actor:{w:W,h:H},
  platforms,ladders,vents,low,high,floor,tier,highWalkX,parentDoor,annexDoor,parentFace,annexFace,bay,steel,
  initial,doorApproachX:center-W/2+halfSpan/2,halfSpan,legacy,
  historicalGeometrySource:'immutable V60 profile resolved through V138, before doorway relocation'};
});
console.log(JSON.stringify(configs));
"""

FIXTURE_JS = r"""
import {createDefaultSave} from './src/save.js';
const c=JSON.parse(process.argv[1]),pose=JSON.parse(process.argv[2]),s=createDefaultSave();
s.createdAt=Date.UTC(2026,10,4);s.updatedAt=s.createdAt;
s.needsPlayerCreationV84=false;s.scene='hub';s.player.name='QA door bays V182';
s.clock={day:1,hour:6};s.settings.reducedMotion=false;
Object.assign(s.hub,{deck:c.deck,roomId:c.roomId,positionX:pose.x,positionY:pose.y,facing:1,climbing:pose.climbing});
console.log(JSON.stringify({save:s,meta:{roomId:c.roomId,annexId:c.annexId,deck:c.deck,pose,
 startingPoseIsSaveFixture:true,activeAnnex:null,resourcesModified:false,
 clockFixture:s.clock,resources:s.galaxy.resources,geometrySource:'buildHubTraversalGeometryV87'}}));
"""

OBSERVE = r"""() => {
 const h=__ATF_HUB__,s=h.getSnapshot(),a=h.currentAnnexV71?.()||null;
 const visible=a?(h.activeAnnexNpcsV141?.()||[]):h.npcs||[],ids=visible.map(n=>n.crewId).filter(Boolean);
 return {running:h.running,roomId:a?.id||h.currentRoom()?.id,annexId:a?.id||null,deck:h.state.deck,
  nativeTime:h.animationTime,player:{x:h.player.x,y:h.player.y,w:h.player.w,h:h.player.h,
   vx:h.player.vx,vy:h.player.vy,grounded:h.player.grounded,climbing:!!h.player.climbing,
   alive:h.player.alive,health:h.player.health},
  floorY:a?.world.floorY||h.floorY,cameraX:a?h.annexCameraV71.x:h.camera.x,
  authoritativePlayerReferences:[h.player,...visible].filter(n=>n===h.player).length,
  duplicateCrew:[...new Set(ids)].filter(id=>ids.filter(value=>value===id).length>1),
  clock:structuredClone(__ATF_V51__.saveSystem.data.clock),
  resources:structuredClone(__ATF_V51__.saveSystem.data.galaxy.resources),
  transition:!!h.annexTransitionV71,closing:!!h.hubDoorClosingV142,
  blocked:structuredClone(h.hubDoorBlockedV142||null),passage:structuredClone(s.hubDoorPassageV142||null),
  nearestLadder:h.nearestTraversalLadder?.()?.id||null,
  parentDoor:h.prioritizedParentAnnexDoorV133?.()?.annexId||null,
  exitDoor:h.nearestAnnexExitV71?.()?.annexId||null};
}"""


def observe(page):
    return page.evaluate(OBSERVE)


def fixture(config, scenario_id, pose):
    value = json.loads(subprocess.check_output(
        ['node', '--input-type=module', '-e', FIXTURE_JS, json.dumps(config), json.dumps(pose)], cwd=repo))
    raw = (json.dumps(value['save'], ensure_ascii=False, separators=(',', ':')) + '\n').encode()
    meta_raw = (json.dumps(value['meta'], ensure_ascii=False, indent=2) + '\n').encode()
    name, metadata = scenario_id + '-disclosed-save.json', scenario_id + '-fixture-meta.json'
    (output / name).write_bytes(raw)
    (output / metadata).write_bytes(meta_raw)
    report['fixtures'].append(dict(id=scenario_id, file=name, sha256=sha(raw),
                                   metadata=metadata, metadataSha256=sha(meta_raw)))
    return raw, value['meta']


def open_hub(page):
    menu = page.locator('#menu-toggle')
    if menu.is_visible() and 'open' not in (page.locator('.rail').get_attribute('class') or '').split():
        menu.click()
    page.locator('[data-view="hub"]').click()
    page.wait_for_function('()=>__ATF_HUB__?.running', timeout=90000)
    page.locator('#hub-canvas').focus()


def settle(page):
    page.wait_for_function("""()=>{const h=__ATF_HUB__;return h?.running&&!h.annexTransitionV71
      &&!h.hubDoorClosingV142&&Math.abs(h.player.vx)<.4&&Math.abs(h.player.vy)<.4
      &&h.player.grounded&&!h.player.climbing;}""", timeout=45000)


def supported(label, row, room_id, standing_y):
    body = row['player']
    check(label + ': one living 44x92 player rests on the expected native support',
          row['roomId'] == room_id and row['authoritativePlayerReferences'] == 1
          and not row['duplicateCrew'] and body['alive'] and body['health'] == 100
          and body['w'] == 44 and body['h'] == 92
          and all(math.isfinite(body[key]) for key in ['x', 'y', 'vx', 'vy'])
          and body['grounded'] and not body['climbing']
          and abs(body['y'] + body['h'] - standing_y) <= .01)


def preserved(label, row, baseline):
    check(label + ': resources and strategic time remain unchanged',
          row['clock'] == baseline['clock'] and row['resources'] == baseline['resources'])


def record_png(name, raw, kind):
    assert raw[:8] == b'\x89PNG\r\n\x1a\n', 'Capture is not an original PNG'
    target = output / name
    assert not target.exists(), 'Never overwrite an earlier image'
    target.write_bytes(raw)
    report['captures'].append(dict(file=name, kind=kind, sha256=sha(raw), bytes=len(raw)))


def capture(page, name):
    raw = page.locator('#hub-canvas').screenshot()
    record_png(name, raw, 'native-hub-canvas')


def ready(page, config, room_id):
    page.wait_for_function("""c=>{const h=__ATF_HUB__,s=h?.getSnapshot(),image=h?.annexImagesV71?.get(c.annex)?.get('door');
      return h?.running&&(h.currentAnnexV71?.()?.id||h.currentRoom()?.id)===c.room
        &&s.hubRoomLifeV136?.current?.roomId===c.room&&s.hubRoomParallaxV134?.current?.nativeReady
        &&h.player.playerAppearanceVisualV126?.drawn&&image?.complete&&image.naturalWidth>0;}""",
                           arg=dict(room=room_id, annex=config['annexId']), timeout=90000)


def walk_to(page, target, label, room_id, standing_y, tolerance=3):
    before = observe(page)
    page.locator('#hub-canvas').focus()
    for attempt in range(24):
        current = observe(page)['player']['x']
        distance = target - current
        if abs(distance) <= tolerance:
            break
        key = 'KeyD' if distance > 0 else 'KeyA'
        if abs(distance) > 32:
            page.keyboard.down(key)
            try:
                page.wait_for_function("""c=>c.right?__ATF_HUB__.player.x>=c.target-18:
                  __ATF_HUB__.player.x<=c.target+18""",
                                       arg=dict(right=distance > 0, target=target), timeout=45000)
            finally:
                page.keyboard.up(key)
        else:
            page.keyboard.press(key, delay=max(18, min(70, abs(distance) / 270 * 1000)))
        settle(page)
    after = observe(page)
    report['nativeMoves'].append(dict(label=label, controls='A/D', targetX=target,
        before=before['player'], after=after['player'], roomBefore=before['roomId'], roomAfter=after['roomId']))
    check(label + ': bounded real A/D walking reaches the calculated coordinate',
          before['roomId'] == after['roomId'] == room_id
          and abs(after['player']['x'] - target) <= tolerance
          and (abs(target-before['player']['x']) < 20 or abs(after['player']['x']-before['player']['x']) >= 12))
    supported(label, after, room_id, standing_y)
    return after


def climb(page, ladder, upward, label, room_id):
    before = observe(page)
    key, target = ('KeyW', ladder['top']) if upward else ('KeyS', ladder['bottom'])
    check(label + ': the native ladder at the actual body is the intended connection',
          before['nearestLadder'] == ladder['id'] and abs(before['player']['x'] + 22 - ladder['x']) <= 4)
    page.locator('#hub-canvas').focus()
    page.keyboard.down(key)
    try:
        # Feet touching the endpoint is one frame earlier than a real dismount.
        page.wait_for_function("""y=>{const p=__ATF_HUB__.player;return Math.abs(p.y+p.h-y)<.01
          &&p.grounded&&!p.climbing;}""", arg=target, timeout=90000)
    finally:
        page.keyboard.up(key)
    settle(page)
    after = observe(page)
    report['nativeMoves'].append(dict(label=label, controls=key, ladder=ladder,
        before=before['player'], after=after['player'], nativeSeconds=after['nativeTime']-before['nativeTime']))
    check(label + ': native vertical travel covers the entire authored connection',
          abs(abs(after['player']['y']-before['player']['y'])-(ladder['bottom']-ladder['top'])) < .01
          and after['nativeTime'] > before['nativeTime'])
    supported(label, after, room_id, target)
    return after


def geometry(page, config):
    actual = page.evaluate("""c=>{const h=__ATF_HUB__;return {
      platforms:h.v51Platforms.filter(p=>p.roomId===c.roomId),
      ladders:h.v51Ladders.filter(p=>p.roomId===c.roomId),vents:h.v51Vents.filter(p=>p.roomId===c.roomId),
      parentDoor:h.getParentAnnexDoorV71(c.annexId)?.bounds};}""", config)
    keys = ['id', 'roomId', 'x', 'y', 'w', 'h', 'top', 'bottom']
    project = lambda rows: [{key: row[key] for key in keys if key in row} for row in rows]
    check(config['id'] + ': the live engine uses the computed production geometry and unchanged door socket',
          all(project(actual[key]) == project(config[key]) for key in ['platforms', 'ladders', 'vents'])
          and actual['parentDoor'] == config['parentDoor'])
    report.setdefault('liveGeometry', []).append(dict(id=config['id'], geometry=actual))


def passage(page, config, direction, baseline):
    before = observe(page)
    entering = direction == 'enter'
    expected_room = config['annexId'] if entering else config['roomId']
    source = config['parentFace'] if entering else config['annexFace']
    destination = config['annexFace'] if entering else config['parentFace']
    source_offset = before['player']['x'] + 22 - (source['opening']['x'] + source['opening']['w'] / 2)
    expected_offset = max(-config['halfSpan'], min(config['halfSpan'], source_offset))
    page.wait_for_function("""c=>{const h=__ATF_HUB__;return c.entering?
      h.prioritizedParentAnnexDoorV133?.()?.annexId===c.annex:h.nearestAnnexExitV71?.()?.annexId===c.annex;}""",
                           arg=dict(entering=entering, annex=config['annexId']))
    page.locator('#hub-canvas').focus()
    page.keyboard.press('KeyE', delay=80)
    page.wait_for_function("""c=>{const h=__ATF_HUB__;return h?.running
      &&(h.currentAnnexV71?.()?.id||h.currentRoom()?.id)===c.room
      &&!h.annexTransitionV71&&!h.hubDoorClosingV142;}""", arg=dict(room=expected_room), timeout=90000)
    settle(page)
    ready(page, config, expected_room)
    after = observe(page)
    arrival = after['passage']['arrival']
    check(config['id'] + ': E completes the real ' + direction + ' passage using both unchanged paired faces',
          arrival and arrival['direction'] == direction and arrival['annexId'] == config['annexId']
          and arrival['sourceFace'] == source and arrival['destinationFace'] == destination
          and abs(source['target']['w']-destination['target']['w']) < 1e-6
          and abs(source['target']['h']-destination['target']['h']) < 1e-6
          and source['background'] == destination['background'] == 'native-wall-visible-outside-frame'
          and not after['transition'] and not after['closing'])
    source_aligned_offset = arrival['sourceAligned']['x'] + 22 - (source['opening']['x'] + source['opening']['w'] / 2)
    actual_offset = after['player']['x'] + 22 - (destination['opening']['x'] + destination['opening']['w'] / 2)
    check(config['id'] + ': ' + direction + ' retains the exact native clamped relative offset and supported arrival',
          max(abs(value-expected_offset) for value in [arrival['offsetX'], source_aligned_offset, actual_offset]) < 1e-6
          and abs(after['player']['x']-arrival['arrival']['x']) < 1e-6
          and abs(after['player']['y']-arrival['arrival']['y']) < 1e-6
          and arrival['policy'] == 'same-offset-in-paired-visible-opening')
    supported(config['id'] + ' ' + direction, after, expected_room, config['floorY'])
    preserved(config['id'] + ' ' + direction, after, baseline)
    report['nativePassages'].append(dict(id=config['id'], direction=direction, sourceOffset=source_offset,
        expectedClampedOffset=expected_offset, actualOffset=actual_offset, before=before, after=after))
    capture(page, config['id'] + ('-entered.png' if entering else '-returned.png'))
    return after


def route(page, config, meta):
    settle(page)
    ready(page, config, config['roomId'])
    baseline = observe(page)
    supported(config['id'] + ' disclosed floor start', baseline, config['roomId'], config['floorY'])
    check(config['id'] + ': the fixture starts on the declared floor near the entrance',
          baseline['annexId'] is None and baseline['deck'] == config['deck']
          and abs(baseline['player']['x']-meta['pose']['x']) < .01
          and baseline['clock'] == meta['clockFixture'] and baseline['resources'] == meta['resources'])
    geometry(page, config)
    capture(page, config['id'] + '-before.png')
    walk_to(page, config['floor']['x']-22, config['id']+' floor approach', config['roomId'], config['floorY'])
    climb(page, config['floor'], True, config['id']+' lower ascent', config['roomId'])
    walk_to(page, config['tier']['x']-22, config['id']+' lower landing', config['roomId'], config['low']['y'])
    capture(page, config['id'] + '-lower-deck.png')
    climb(page, config['tier'], True, config['id']+' upper ascent', config['roomId'])
    walk_to(page, config['highWalkX'], config['id']+' upper landing', config['roomId'], config['high']['y'])
    capture(page, config['id'] + '-upper-deck.png')
    walk_to(page, config['tier']['x']-22, config['id']+' upper return', config['roomId'], config['high']['y'])
    climb(page, config['tier'], False, config['id']+' upper descent', config['roomId'])
    walk_to(page, config['floor']['x']-22, config['id']+' lower return', config['roomId'], config['low']['y'])
    climb(page, config['floor'], False, config['id']+' floor descent', config['roomId'])
    before_entry = walk_to(page, config['doorApproachX'], config['id']+' doorway approach',
                           config['roomId'], config['floorY'], tolerance=2.5)
    preserved(config['id'] + ' native climbing loop', before_entry, baseline)
    offset = before_entry['player']['x'] + 22 - (config['parentFace']['opening']['x'] + config['parentFace']['opening']['w']/2)
    check(config['id'] + ': the real doorway approach has a nonzero offset inside the visible opening',
          .5 < offset < config['halfSpan'])
    capture(page, config['id'] + '-before-enter.png')
    entered = passage(page, config, 'enter', baseline)
    returned = passage(page, config, 'exit', baseline)
    check(config['id'] + ': the complete E round trip returns to the real departure pose',
          abs(returned['player']['x']-before_entry['player']['x']) < 1e-6
          and abs(returned['player']['y']-before_entry['player']['y']) < 1e-6
          and entered['annexId'] == config['annexId'] and returned['annexId'] is None)


def arm_legacy_observer(page):
    # This listener runs after the public hub button's own handler. It observes
    # the restored pose before the first native frame; it never patches start,
    # player fields, physics, clocks, RAF, build-info or the game canvas.
    page.evaluate(r"""() => {
     const result={status:'armed',rows:[]};window.__ATF_DOOR_BAY_OBSERVER_V182__=result;
     document.addEventListener('click',function entry(event){
      if(event.target.closest('[data-view]')?.dataset.view!=='hub')return;
      document.removeEventListener('click',entry);
      const h=__ATF_HUB__,started=performance.now();let floorFrames=0;
      const take=()=>({nativeTime:h.animationTime,roomId:h.currentRoom()?.id,annexId:h.currentAnnexV71?.()?.id||null,
       player:{x:h.player.x,y:h.player.y,w:h.player.w,h:h.player.h,vx:h.player.vx,vy:h.player.vy,
        grounded:h.player.grounded,climbing:!!h.player.climbing,alive:h.player.alive,health:h.player.health}});
      result.rows.push(take());result.status='observing';
      result.entryCanvasPng=document.querySelector('#hub-canvas').toDataURL('image/png');
      function frame(){
       const row=take();result.rows.push(row);
       if(performance.now()-started>90000||row.nativeTime-result.rows[0].nativeTime>6||result.rows.length>2400){
        result.status='failed';result.error='Legacy pose did not settle within the native observation budget';return;
       }
       floorFrames=row.player.grounded&&!row.player.climbing&&Math.abs(row.player.y+row.player.h-h.floorY)<.01?floorFrames+1:0;
       if(floorFrames>=4){result.status='complete';return;}
       requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
     });
    }""")


def legacy_resume(page, config, scenario_id, meta):
    page.wait_for_function("()=>['complete','failed'].includes(window.__ATF_DOOR_BAY_OBSERVER_V182__?.status)", timeout=90000)
    observation = page.evaluate('()=>structuredClone(window.__ATF_DOOR_BAY_OBSERVER_V182__)')
    encoded = observation.pop('entryCanvasPng', None)
    if encoded:
        record_png(scenario_id + '-entry.png', base64.b64decode(encoded.split(',', 1)[1]),
                   'original-hub-canvas-read-at-public-entry-before-first-frame')
    report['legacyResumes'].append(dict(id=scenario_id, fixturePose=meta['pose'], observation=observation))
    check(scenario_id + ': the native frame observer reaches a stable floor without driving the engine',
          observation['status'] == 'complete' and len(observation['rows']) >= 6)
    rows, pose = observation['rows'], meta['pose']
    first = rows[0]['player']
    check(scenario_id + ': public Save restore retains exact historical coordinates and clears stale climbing',
          abs(first['x']-pose['x']) < .01 and abs(first['y']-pose['y']) < .01
          and not first['climbing'] and not first['grounded'] and first['vy'] == 0)
    valid, falling_steps = True, 0
    for previous, current in zip(rows, rows[1:]):
        old, body = previous['player'], current['player']
        delta = current['nativeTime'] - previous['nativeTime']
        dy = body['y'] - old['y']
        falling_steps += dy > .001
        valid = valid and current['roomId'] == config['roomId'] and current['annexId'] is None \
            and body['alive'] and body['health'] == 100 and body['w'] == 44 and body['h'] == 92 \
            and abs(body['x']-pose['x']) < .01 and not body['climbing'] \
            and delta >= 0 and dy >= -.01 \
            and dy <= (abs(old['vy']) + 1900 * delta) * delta + .02
    check(scenario_id + ': observed intermediate frames fall continuously under native gravity without a position rewrite',
          valid and falling_steps >= 2 and rows[-1]['player']['y'] > first['y'])
    settle(page)
    ready(page, config, config['roomId'])
    after = observe(page)
    supported(scenario_id, after, config['roomId'], config['floorY'])
    preserved(scenario_id, after, dict(clock=meta['clockFixture'], resources=meta['resources']))
    capture(page, scenario_id + '-settled.png')


source_start = manifest()
report['sourceStart'] = source_start
page = None
try:
    harness = git('rev-parse', 'HEAD')
    check('The harness is the exact clean declared commit',
          harness == args.expect_harness and not git('status', '--porcelain'))
    report['harnessCommit'] = harness
    report['identityBefore'] = identity()
    report['sourceCommit'] = report['identityBefore']['sourceCommit']
    configs = json.loads(subprocess.check_output(['node', '--input-type=module', '-e', CONFIG_JS], cwd=repo))
    report['configs'] = configs
    check('All five repaired doorway routes are computed from the genuine production geometry', len(configs) == 5)
    # Runtime arrays are also checked in the page. These source comparisons
    # prevent a newer harness's geometry or painter from describing an older build.
    compared = ['src/hub-game.js', 'src/hub-v51-runtime.js', 'src/hub-service-geometry-v137.js',
                'src/hub-service-geometry-v138.js', 'src/hub-service-geometry-v139.js',
                'src/hub-circulation-v137.js', 'src/hub-door-passage-v142.js',
                'src/hub-navigation-layout-v133.js', 'src/hub-opening-v88.js']
    report['servedGeometrySources'] = {}
    for name in compared:
        with urllib.request.urlopen(args.base.rstrip('/') + '/' + name, timeout=30) as response:
            digest = sha(response.read())
        report['servedGeometrySources'][name] = digest
        check(name + ': served geometry or rendering source equals the clean harness source', digest == source_start[name])
    with sync_playwright() as pw:
        executable = os.environ.get('ATF_CHROMIUM_EXECUTABLE', '/usr/bin/chromium')
        browser = pw.chromium.launch(headless=True, executable_path=executable)
        report['chromium'] = browser.version
        try:
            for config in configs:
                cases = [('route', config['initial']), *[(pose['kind'], pose) for pose in config['legacy']]]
                for kind, pose in cases:
                    scenario_id = config['id'] + '-' + kind
                    phase(scenario_id + ': disclosed public Save import')
                    raw, meta = fixture(config, scenario_id, pose)
                    context = browser.new_context(viewport=dict(width=1600, height=1000), service_workers='block')
                    result = dict(id=scenario_id, kind=kind, status='running')
                    report['scenarios'].append(result)
                    try:
                        page = context.new_page()
                        page.set_default_timeout(45000)
                        page.on('pageerror', lambda error, name=scenario_id: report['pageErrors'].append(dict(id=name, error=str(error))))
                        page.on('request', lambda request, name=scenario_id: report['requests'].append(dict(id=name, url=request.url, method=request.method, resourceType=request.resource_type)))
                        page.on('requestfailed', lambda request, name=scenario_id: report['requestFailures'].append(dict(id=name, url=request.url, failure=request.failure)))
                        page.on('response', lambda response, name=scenario_id: report['httpErrors'].append(dict(id=name, url=response.url, status=response.status)) if response.status >= 400 else None)
                        page.on('dialog', lambda dialog: dialog.accept())
                        page.goto(args.base, wait_until='domcontentloaded')
                        page.locator('#title-start').click()
                        page.locator('#title-options').click()
                        page.locator('#save-import').set_input_files(dict(name=scenario_id + '.json', mimeType='application/json', buffer=raw))
                        page.wait_for_function("()=>__ATF_V51__?.saveSystem.data.player.name==='QA door bays V182'")
                        if kind != 'route':
                            arm_legacy_observer(page)
                        open_hub(page)
                        if kind == 'route':
                            route(page, config, meta)
                        else:
                            legacy_resume(page, config, scenario_id, meta)
                        result['status'] = 'passed'
                    except Exception as error:
                        result.update(status='failed', error=str(error), errorType=type(error).__name__)
                        report['failures'].append(dict(result))
                        print('FAIL ' + scenario_id + ': ' + str(error), flush=True)
                        try:
                            if page and not page.is_closed() and page.locator('#hub-canvas').is_visible():
                                capture(page, scenario_id + '-failure.png')
                                result['failureObservation'] = observe(page)
                        except Exception as capture_error:
                            result['failureCaptureError'] = str(capture_error)
                    finally:
                        context.close()
                        page = None
        finally:
            browser.close()
    check('Every real doorway route and both historical poses per bay succeeded',
          len(report['scenarios']) == 15 and not report['failures']
          and all(row['status'] == 'passed' for row in report['scenarios']))
    check('All five annexes were entered and exited through real E',
          sorted((row['id'], row['direction']) for row in report['nativePassages'])
          == sorted((config['id'], direction) for config in configs for direction in ['enter', 'exit']))
    report['identityAfter'] = identity()
    check('The exact served build stayed unchanged', report['identityBefore'] == report['identityAfter'])
    report['sourceEnd'] = manifest()
    check('The source and exact clean harness stayed unchanged', source_start == report['sourceEnd']
          and git('rev-parse', 'HEAD') == harness and not git('status', '--porcelain'))
    check('No runtime, unexpected request or HTTP error was observed', not report['pageErrors'] and not report['httpErrors']
          and not [row for row in report['requestFailures'] if row['failure'] != 'net::ERR_ABORTED'])
    report['status'] = 'passed'
except Exception as error:
    report.update(status='failed', error=str(error), errorType=type(error).__name__)
finally:
    report['sourceEnd'] = manifest()
    report['sourceUnchanged'] = source_start == report['sourceEnd']
    try:
        report['identityAfter'] = identity()
        report['sameBuild'] = report.get('identityBefore') == report['identityAfter']
        report['harnessUnchanged'] = git('rev-parse', 'HEAD') == args.expect_harness and not git('status', '--porcelain')
    except Exception as error:
        report['identityAfterError'] = str(error)
        report['sameBuild'] = False
    if not report['sourceUnchanged'] or not report['sameBuild'] or not report.get('harnessUnchanged'):
        report['status'] = 'failed'
    report['finishedAt'] = now()
    (output / 'report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
print(json.dumps(dict(status=report['status'], checks=len(report['checks']), captures=len(report['captures']),
                     scenarios=len(report['scenarios']), failures=len(report['failures']),
                     report=str(output / 'report.json'))), flush=True)
raise SystemExit(0 if report['status'] == 'passed' else 1)
