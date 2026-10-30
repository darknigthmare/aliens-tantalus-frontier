"""Native Tantalus room comparisons through declared Save imports and real keys.

Initial Save locations are disclosed fixtures, not observed journeys to those
locations. Subsequent walking, E passages and refuge form changes are native.
Runtime evaluation reads snapshots/canvas pixels; it never sets game state.
"""
import argparse
import datetime
import hashlib
import json
import math
import os
from pathlib import Path
import subprocess
import time
import urllib.request

from playwright.sync_api import sync_playwright


parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--base', default='http://127.0.0.1:4173')
parser.add_argument('--output', type=Path, required=True)
parser.add_argument('--stage', choices=['before', 'after'], required=True)
parser.add_argument('--expect-build', help='Exact full served source SHA, when supplied by the release runner.')
parser.add_argument('--expect-harness', help='Exact full clean harness SHA, when supplied by the release runner.')
parser.add_argument('--fixture-dir', type=Path, help='Reuse the exact initial Save and metadata bytes of the before run.')
args = parser.parse_args()
repo = Path(__file__).resolve().parents[1]
output = args.output.resolve()
if output == repo or repo in output.parents:
    parser.error('Keep evidence outside the repository.')
if output.exists() and any(output.iterdir()):
    parser.error('Use an empty output directory and preserve earlier attempts.')
output.mkdir(parents=True, exist_ok=True)
now = lambda: datetime.datetime.now(datetime.timezone.utc).isoformat()
sha = lambda value: hashlib.sha256(value).hexdigest()
git = lambda *cmd: subprocess.check_output(['git', *cmd], cwd=repo, text=True).strip()

configs = [
    dict(id='cic-cctv', family='command-and-security', mode='parent-pair', annex='cctv', walk=1050, parentWalk=900),
    dict(id='armory-range', family='armory-and-range', mode='parent-pair', annex='proving-ground', walk=1260, parentWalk=850),
    dict(id='medical', family='clinical', mode='room', room='medical', start=820, walk=1020),
    dict(id='engine', family='drive-and-water', mode='annex', annex='engine-room', start=1480, walk=1650),
    dict(id='water', family='drive-and-water', mode='annex', annex='water-recycling', start=650, walk=800),
    dict(id='maintenance', family='oblique-maintenance', mode='annex', annex='maintenance-spine', start=1200, walk=1450),
    dict(id='refuge', family='personal-refuge', mode='refuge', annex='personal-refuge', start=1040, walk=422),
    dict(id='bridge', family='flight-observation', mode='room', room='bridge', start=180, walk=340),
    dict(id='water-reduced-motion', family='drive-and-water', mode='annex', annex='water-recycling',
         start=650, walk=800, reducedMotion=True),
]
report = dict(status='running', startedAt=now(), stage=args.stage, checks=[], captures=[],
              identityBefore=None, identityAfter=None,
              pageErrors=[], requestFailures=[], httpErrors=[], fixtures=[], nativeScenes=[], nativeMoves=[],
              families=sorted({c['family'] for c in configs}),
              comparisonInputs='reused-before-save-bytes' if args.fixture_dir else 'disclosed-generated-saves-no-cross-run-equality-claimed',
              method='Declared public Save imports, real A/D walking, E door passages and the genuine refuge personal form. Snapshot/canvas observation only.',
              limitations=[
                  'Automated Chromium, no human participants or artistic1:1 certification.',
                  'Each initial Save position is a disclosed starting fixture, not an observed journey to that room.',
                  'The refuge Save contract resumes at its parent door; entry into the refuge is observed through real walking and E.',
                  'Room-coordinate changes at native E passages are not walking distance or NPC/interdeck transport.',
                  'Before observations are separate historical comparisons, never current V165 result totals.',
                  'No personal photo is imported; the chosen name is entered and read back through the real local form.',
                  'Pixel probes confirm selected drawn fittings; they do not replace visual review of the captured room.',
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
    if args.expect_build:
        assert info['sourceCommit'] == args.expect_build, 'Unexpected served source commit'
    assert len(info['sourceCommit']) == 40, 'Build must declare its full source commit'
    return dict(sourceCommit=info['sourceCommit'], buildId=info['buildId'], buildInfoSha256=sha(raw))


def manifest():
    files = sorted([*repo.glob('src/**/*.js'), *repo.glob('*.css'),
                    repo / 'index.html', repo / 'sw.js', repo / 'package.json',
                    repo / 'package-lock.json', Path(__file__).resolve()])
    return {str(p.relative_to(repo)): sha(p.read_bytes()) for p in files}


FIXTURE_JS = r"""
import {createDefaultSave} from './src/save.js';
import {HUB_DECKS} from './src/hub-game.js';
import {HUB_ANNEX_BY_ID_V137,createHubCommercialStateV137} from './src/hub-annex-registry-v137.js';
import {getHubShipConnectionsForSpaceV137} from './src/hub-ship-layout-v137.js';
import {HUB_ANNEX_ENTRANCES_V133} from './src/hub-navigation-layout-v133.js';
const c=JSON.parse(process.argv[1]),s=createDefaultSave();
s.createdAt=Date.UTC(2026,9,26);s.updatedAt=s.createdAt;
s.needsPlayerCreationV84=false;s.scene='hub';s.player.name='QA Tantalus services V165';
s.clock={day:1,hour:6};s.settings.reducedMotion=!!c.reducedMotion;
const a=c.annex?HUB_ANNEX_BY_ID_V137[c.annex]:null;
const deck=a?HUB_DECKS.findIndex(d=>d.id===a.parentDeck):HUB_DECKS.findIndex(d=>d.rooms.some(r=>r.id===c.room));
const room=HUB_DECKS[deck].rooms.find(r=>r.id===(a?a.parentRoomId:c.room));
const connection=a?getHubShipConnectionsForSpaceV137(a.id)[0]||null:null;
const authored=a?HUB_ANNEX_ENTRANCES_V133[a.id]:null;
const door=connection?.parentDoorBounds||a?.parentDoorBounds||(authored?{
 x:room.xStart+authored.centerX-a.entrance.w/2,y:authored.bottom-a.entrance.h,w:a.entrance.w,h:a.entrance.h}:null);
const initialX=c.mode==='parent-pair'?room.xStart+650:
 (c.mode==='room'||c.mode==='refuge')?room.xStart+c.start:door.x+door.w/2-22;
Object.assign(s.hub,{deck,roomId:room.id,positionX:initialX,positionY:532,facing:1});
if(c.mode==='annex'){
 const commercial=createHubCommercialStateV137();
 Object.assign(commercial,{activeAnnexId:a.id,lastAnnexId:a.id,annexPositionX:c.start,annexPositionY:532,annexClimbing:false,
  returnContext:{deckId:a.parentDeck,roomId:room.id,x:door.x+door.w/2-22,facing:1,
   ...(connection?{endpointId:connection.id}:{})},...(connection?{activeConnectionIdV137:connection.id}:{})});
 commercial.annexes[a.id].visited=true;
 if(!commercial.visitedAnnexIds.includes(a.id))commercial.visitedAnnexIds.push(a.id);
 s.hub.commercialV71=commercial;
}
const meta={config:c,parentRoomId:room.id,parentDeck:deck,parentStart:room.xStart,
 parentDoor:door,annexExitX:connection?connection.annexDoorBounds.x+connection.annexDoorBounds.w/2-22:
  a?a.entranceLocalX-22:null,initialActiveAnnex:c.mode==='annex'?a.id:null,
 startingPoseIsSaveFixture:true,resourcesModified:false,clockFixture:{day:1,hour:6}};
console.log(JSON.stringify({save:s,meta}));
"""


def fixture(config):
    save_name, meta_name = config['id'] + '-disclosed-save.json', config['id'] + '-fixture-meta.json'
    if args.fixture_dir:
        source = args.fixture_dir.resolve()
        raw, meta_raw = (source / save_name).read_bytes(), (source / meta_name).read_bytes()
        meta = json.loads(meta_raw)
        assert meta['config'] == config, 'Before fixture belongs to a different scenario'
        assert json.loads(raw)['player']['name'] == 'QA Tantalus services V165'
        report.setdefault('reusedFixtures', []).append(dict(source=str(source / save_name), sha256=sha(raw)))
    else:
        generated = json.loads(subprocess.check_output(
            ['node', '--input-type=module', '-e', FIXTURE_JS, json.dumps(config)], cwd=repo))
        raw = (json.dumps(generated['save'], ensure_ascii=False, separators=(',', ':')) + '\n').encode()
        meta = generated['meta']
        meta_raw = (json.dumps(meta, ensure_ascii=False, indent=2) + '\n').encode()
    (output / save_name).write_bytes(raw)
    (output / meta_name).write_bytes(meta_raw)
    report['fixtures'].append(dict(id=config['id'], file=save_name, sha256=sha(raw),
                                   metadata=meta_name, metadataSha256=sha(meta_raw)))
    return raw, meta


OBSERVE = r"""() => {
 const h=__ATF_HUB__,s=h.getSnapshot(),annex=h.currentAnnexV71?.()||null;
 const visible=annex?(h.activeAnnexNpcsV141?.()||[]):(h.npcs||[]),ids=visible.map(n=>n.crewId).filter(Boolean);
 const counts=Object.fromEntries([...new Set(ids)].map(id=>[id,ids.filter(value=>value===id).length]));
 return {running:h.running,roomId:annex?.id||h.currentRoom()?.id,annexId:annex?.id||null,parentRoomId:h.state.roomId,
  player:{x:h.player.x,y:h.player.y,w:h.player.w,h:h.player.h,vx:h.player.vx,vy:h.player.vy,
   grounded:h.player.grounded,alive:h.player.alive},floorY:annex?.world.floorY||624,
  authoritativePlayerReferences:[h.player,...visible].filter(n=>n===h.player).length,
  duplicateVisibleCrewIds:Object.keys(counts).filter(id=>counts[id]>1),
  cameraX:annex?h.annexCameraV71.x:h.camera.x,depthEnabled:h.depthPresentationV116,
  transition:!!h.annexTransitionV71,closing:!!h.hubDoorClosingV142,
  prompt:h.statusPrompt(),nearestAction:h.nearestInteraction()?.action||null,
  clock:structuredClone(__ATF_V51__.saveSystem.data.clock),resources:structuredClone(__ATF_V51__.saveSystem.data.galaxy.resources),
  life:structuredClone(s.hubRoomLifeV136?.current||null),parallax:structuredClone(s.hubRoomParallaxV134?.current||null),
  passage:structuredClone(s.hubDoorPassageV142||null),refuge:structuredClone(s.refugeV87||null)};
}"""


def observe(page):
    return page.evaluate(OBSERVE)


def open_view(page, name):
    menu = page.locator('#menu-toggle')
    if menu.is_visible() and 'open' not in (page.locator('.rail').get_attribute('class') or '').split():
        menu.click()
    page.locator('[data-view="' + name + '"]').click()


def settle(page):
    page.wait_for_function("""()=>{const h=__ATF_HUB__;return h?.running&&!h.annexTransitionV71
      &&!h.hubDoorClosingV142&&Math.abs(h.player.vx)<1&&Math.abs(h.player.vy)<1;}""", timeout=45000)


def walk_to(page, target, label):
    before = observe(page)
    current = before['player']['x']
    page.locator('#hub-canvas').focus()
    if abs(target - current) >= 4:
        key = 'KeyD' if target > current else 'KeyA'
        page.keyboard.down(key)
        try:
            page.wait_for_function('c=>c.right?__ATF_HUB__.player.x>=c.x-3:__ATF_HUB__.player.x<=c.x+3',
                                   arg=dict(x=target, right=target > current), timeout=45000)
        finally:
            page.keyboard.up(key)
    settle(page)
    deadline = time.monotonic() + 35
    for attempt in range(12):
        current = observe(page)['player']['x']
        if abs(target-current) <= 8:
            break
        if time.monotonic() >= deadline:
            raise AssertionError(label + ': actual keyboard corrections exceeded their bound')
        page.keyboard.press('KeyD' if target > current else 'KeyA', delay=max(16, min(70, abs(target-current)*2)))
        settle(page)
    after = observe(page)
    report['nativeMoves'].append(dict(label=label, target=target, before=before['player'], after=after['player'],
                                      roomBefore=before['roomId'], roomAfter=after['roomId']))
    check(label + ': real keyboard walking settles at the authored observation point',
          before['roomId'] == after['roomId'] and abs(after['player']['x']-target) <= 8
          and (abs(target-before['player']['x']) < 20 or abs(after['player']['x']-before['player']['x']) >= 12))
    return after


def capture(page, name, kind='native-canvas', selector='#hub-canvas'):
    target = output / name
    assert not target.exists(), 'Never overwrite an earlier image'
    page.locator(selector).screenshot(path=str(target))
    raw = target.read_bytes()
    assert raw[:8] == b'\x89PNG\r\n\x1a\n'
    report['captures'].append(dict(file=name, kind=kind, sha256=sha(raw), bytes=len(raw)))


def inspect_scene(page, config, label, expected_room):
    settle(page)
    page.wait_for_function("""id=>{const h=__ATF_HUB__,s=h.getSnapshot();
      return (h.currentAnnexV71?.()?.id||h.currentRoom()?.id)===id
        &&s.hubRoomLifeV136?.current?.roomId===id&&s.hubRoomParallaxV134?.current?.nativeReady
        &&h.player.playerAppearanceVisualV126?.drawn;}""", arg=expected_room, timeout=90000)
    row = observe(page)
    body = row['player']
    check(label + ': one authoritative player body rests on the native floor',
          row['authoritativePlayerReferences'] == 1 and not row['duplicateVisibleCrewIds']
          and body['alive'] and all(math.isfinite(body[k]) for k in ['x', 'y', 'w', 'h'])
          and body['w'] > 0 and body['h'] > 0 and abs(body['y']+body['h']-row['floorY']) <= 1)
    wanted = 'parallel-oblique' if expected_room == 'maintenance-spine' else 'orthographic'
    check(label + ': the whole compartment retains its single authored projection',
          row['life']['projection']['kind'] == wanted
          and row['parallax']['presentationMode'] == ('2.5d' if wanted == 'parallel-oblique' else '2d'))
    if args.stage == 'after':
        details = row['life'].get('serviceDetailsV165')
        check(label + ': the actual production draw reports its admitted wall assemblies',
              details is not None and details['geometryPreserved'] and not details['collidable']
              and not details['interactive'] and details['paintedIds'] == [item['id'] for item in details['items']]
              and all(item.get('intentional') for item in details['omitted']))
        if expected_room not in ['bridge', 'personal-refuge']:
            check(label + ': its authored service bay is painted rather than silently rejected', len(details['items']) == 1)
            probe = page.evaluate(r"""() => {const h=__ATF_HUB__,s=h.getSnapshot(),d=s.hubRoomLifeV136.current.serviceDetailsV165;
              const canvas=document.querySelector('#hub-canvas'),ctx=canvas.getContext('2d');
              const camera=h.currentAnnexV71?.()?h.annexCameraV71.x:h.camera.x;
              const annexLighting=!!h.currentAnnexV71?.();
              // An independent, detached reference computes only expected
              // source-over colour. Observed pixels always come from the
              // original live hub canvas; no game draw hook/state is changed.
              const reference=document.createElement('canvas');reference.width=canvas.width;reference.height=canvas.height;
              const expected=reference.getContext('2d');
              function expectedRgba(color,x,y){
                expected.clearRect(0,0,reference.width,reference.height);
                expected.fillStyle=color;expected.fillRect(0,0,reference.width,reference.height);
                if(annexLighting){
                  // drawAnnexLightingV71 is applied after props: its native
                  // 1280x720 radial vignette must also affect the signature.
                  const vignette=expected.createRadialGradient(640,396,120,640,396,760);
                  vignette.addColorStop(0,'rgba(0, 0, 0, 0)');
                  vignette.addColorStop(1,'rgba(0, 3, 4, .62)');
                  expected.fillStyle=vignette;expected.fillRect(0,0,1280,720);
                }
                return [...expected.getImageData(Math.floor(x),Math.floor(y),1,1).data];
              }
              return d.items.flatMap(item=>{const b=item.bounds;
                // Every kind leaves the lower-right band below its cabinets,
                // pipes, grilles and valves, beyond the short code plate.
                // Keep this base signature far from outer fastening edges.
                // The bright code-plate point is beyond its engraved text;
                // a missing assembly cannot pass on dark wall colour alone.
                return [{kind:'base',dx:b.w-16,dy:b.h-4,color:'#2b4543'},
                  {kind:'code-plate',dx:45,dy:b.h-4,color:'#b1b6a3'}].map(point=>{
                  const x=b.x+point.dx-camera,y=b.y+point.dy,
                    visible=x>=0&&y>=0&&x<canvas.width&&y<canvas.height;
                  return {id:item.id,kind:point.kind,x,y,sampleX:Math.floor(x),sampleY:Math.floor(y),
                    canvasWidth:canvas.width,canvasHeight:canvas.height,sourceColor:point.color,
                    lighting:annexLighting?'native-annex-radial-vignette':'unlit-main-room',
                    rgba:visible?[...ctx.getImageData(Math.floor(x),Math.floor(y),1,1).data]:null,
                    expectedRgba:visible?expectedRgba(point.color,x,y):null};
                });});} """)
            row['servicePixelProbes'] = probe
            report.setdefault('servicePixelProbes', []).append(dict(scene=label, roomId=expected_room, probes=probe))
            raster_label = label + ': admitted hardware also reaches visible native canvas pixels'
            raster_valid = (len(probe) == 2 * len(details['items'])
                            and all(item['rgba'] and item['expectedRgba'] and item['rgba'][3] >= 250
                                    and max(abs(item['rgba'][i]-item['expectedRgba'][i]) for i in range(3)) <= 3 for item in probe))
            if raster_valid:
                check(raster_label, True)
            else:
                # Keep every failed raster assertion failed, but collect the
                # remaining genuine scenes/captures before the final guard.
                # These failures are never appended to passed check counts.
                report.setdefault('rasterFailures', []).append(dict(
                    scene=label, roomId=expected_room, assertion=raster_label,
                    expectedProbeCount=2 * len(details['items']), probes=probe))
                print('FAIL ' + raster_label + ' (retained for final failure)', flush=True)
        else:
            check(label + ': its deliberate quiet or flight envelope remains free', not details['items'])
        if config.get('reducedMotion'):
            check(label + ': the production service renderer freezes reduced-motion values',
                  details['motion']['reducedMotion'] and details['motion']['fanAngle'] == 0)
    capture(page, label + '.png')
    report['nativeScenes'].append(dict(id=label, roomId=expected_room, state=row))
    return row


def passage(page, config, destination, direction):
    before = observe(page)
    page.locator('#hub-canvas').focus()
    if direction == 'enter':
        page.wait_for_function('id=>__ATF_HUB__.prioritizedParentAnnexDoorV133?.()?.annexId===id', arg=config['annex'])
    else:
        page.wait_for_function('()=>!!__ATF_HUB__.nearestAnnexExitV71?.()')
    page.keyboard.press('KeyE', delay=80)
    page.wait_for_function("""c=>{const h=__ATF_HUB__;return (h.currentAnnexV71?.()?.id||h.currentRoom()?.id)===c.id
      &&!h.annexTransitionV71&&!h.hubDoorClosingV142&&h.running;}""", arg=dict(id=destination), timeout=90000)
    after = observe(page)
    arrival = after['passage']['arrival']
    check(config['id'] + ': native E completes the ' + direction + ' passage with paired faces',
          arrival and arrival['direction'] == direction and arrival['annexId'] == config['annex']
          and abs(arrival['sourceFace']['target']['w']-arrival['destinationFace']['target']['w']) < 1e-6
          and abs(arrival['sourceFace']['target']['h']-arrival['destinationFace']['target']['h']) < 1e-6
          and not after['closing'] and not after['transition'])
    check(config['id'] + ': the real arrival remains supported and its doorway retains native wall transparency',
          after['authoritativePlayerReferences'] == 1 and not after['duplicateVisibleCrewIds']
          and abs(after['player']['y']+after['player']['h']-after['floorY']) <= 1
          and arrival['sourceFace']['background'] == 'native-wall-visible-outside-frame'
          and arrival['destinationFace']['background'] == 'native-wall-visible-outside-frame')
    check(config['id'] + ': native passage retains resources and strategic time',
          before['clock'] == after['clock'] and before['resources'] == after['resources'])
    report.setdefault('nativePassages', []).append(dict(id=config['id'], direction=direction,
                                                        sourceRoom=before['roomId'], destinationRoom=after['roomId'], arrival=arrival))
    return after


def refuge_name(page, config):
    selected = 'Équipage Tantalus'
    page.wait_for_function("()=>__ATF_HUB__.nearestInteraction()?.action==='refuge:portrait'")
    before = observe(page)
    phase('refuge: native pointer-button persistence, then separate KeyE opening')
    viewport = page.viewport_size
    # At this real responsive viewport the existing native E button is visible.
    # A pointer gesture has no text-key default action to contaminate readback.
    page.set_viewport_size(dict(width=720, height=1000))
    menu = page.locator('#menu-toggle')
    if menu.is_visible() and 'open' in (page.locator('.rail').get_attribute('class') or '').split():
        menu.click()
    interact = page.locator('[data-hub-control="interact"]')
    interact.wait_for(state='visible')
    interact.click()
    dialog = page.locator('dialog.refuge-v87[open]')
    dialog.wait_for(state='visible')
    dialog.locator('[name="refuge-name"]').fill(selected)
    dialog.locator('[name="refuge-dedication"]').fill('Repère de comparaison du décor, saisi par le formulaire natif.')
    dialog.locator('[data-refuge-action="save"]').click()
    dialog.wait_for(state='hidden')
    settle(page)
    interact.click()
    dialog.wait_for(state='visible')
    readback = dialog.locator('[name="refuge-name"]').input_value()
    check('refuge: the real local form persists and reads back the chosen name', readback == selected)
    dialog.locator('[data-refuge-action="close"]').click()
    settle(page)
    page.set_viewport_size(viewport)
    page.locator('#hub-canvas').focus()
    page.keyboard.press('KeyE', delay=80)
    dialog.wait_for(state='visible')
    keyboard_readback = dialog.locator('[name="refuge-name"]').input_value()
    keyboard_observation = dict(expectedName=selected, observedDraft=keyboard_readback,
                                exactMatch=keyboard_readback == selected, input='native KeyE',
                                savedByThisOpening=False, discardedWithNativeClose=True)
    if args.stage == 'after':
        check('refuge: native KeyE is consumed before the opened name field receives text', keyboard_readback == selected)
    else:
        # The original21b handler can append one unsaved e after focusing the
        # form. Record that real historical defect separately, never as a V165
        # success or as evidence that persisted storage contains this draft.
        if keyboard_readback not in [selected, selected + 'e']:
            raise AssertionError('Unexpected historical keyboard-opening draft: ' + repr(keyboard_readback))
        keyboard_observation['knownHistoricalDefectObserved'] = keyboard_readback == selected + 'e'
        keyboard_observation['notCurrentV165Validation'] = True
        report.setdefault('historicalObservations', []).append(dict(kind='refuge-keyboard-opening', **keyboard_observation))
    report['refugeKeyboardOpening'] = keyboard_observation
    capture(page, 'refuge-native-keyboard-form.png', 'native-refuge-dialogue', 'dialog.refuge-v87[open]')
    dialog.locator('[data-refuge-action="close"]').click()
    settle(page)
    after = observe(page)
    check('refuge: personal editing retains the body, resources and strategic time',
          before['clock'] == after['clock'] and before['resources'] == after['resources']
          and abs(before['player']['x']-after['player']['x']) < 2 and abs(before['player']['y']-after['player']['y']) < 1)
    if args.stage == 'after':
        plate = page.evaluate(r"""async()=>{const m=await import('/src/refuge-art-v87.js'),p=m.REFUGE_PORTRAIT_LABEL_V87;
          const h=__ATF_HUB__,b=p.mountBounds,frame=m.REFUGE_PROPS_LAYOUT_V87.find(v=>v.kind==='portrait');
          const aperture=m.getRefugeApertureV87('portrait',frame),canvas=document.querySelector('#hub-canvas');
          const x=b?b.x+8-h.annexCameraV71.x:-1,y=b?b.y+4:-1;
          return {caption:p,frame,aperture,rgba:x>=0&&y>=0&&x<canvas.width&&y<canvas.height?
            [...canvas.getContext('2d').getImageData(Math.floor(x),Math.floor(y),1,1).data]:null};} """)
        b, a = plate['caption'].get('mountBounds'), plate['aperture']
        check('refuge: the selected name is mounted on the actual upper frame above its photo aperture',
              b and b['y']+b['h'] < a['y'] and plate['caption']['maxWidth'] < b['w']
              and plate['rgba'] and max(abs(plate['rgba'][i]-c) for i, c in enumerate([41, 59, 56])) <= 14)
        source_response = page.request.get(args.base.rstrip('/') + '/src/refuge-art-v87.js')
        source = source_response.text()
        check('refuge: the served renderer omits both floating development labels',
              source_response.status == 200 and 'PORTRAIT PERSONNALISABLE' not in source
              and 'SIMULATION FÉLINE GÉNÉRIQUE' not in source)
        report['refugeRendererSha256'] = sha(source_response.body())
        report['refugeNameplate'] = plate
    report['refugeForm'] = dict(enteredName=selected, readBackName=readback,
                                persistenceReadbackInput='visible native pointer button at720px',
                                keyboardDraft=keyboard_readback,
                                revisionBefore=before['refuge']['personalRevision'], revisionAfter=after['refuge']['personalRevision'])
    inspect_scene(page, config, 'refuge-native-personal-name', 'personal-refuge')


source_start = manifest()
report['sourceStart'] = source_start
page = None
try:
    harness = git('rev-parse', 'HEAD')
    check('Harness is a clean declared source commit', not git('status', '--porcelain')
          and (not args.expect_harness or harness == args.expect_harness))
    report['harnessCommit'] = harness
    report['identityBefore'] = identity()
    report['sourceCommit'] = report['identityBefore']['sourceCommit']
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True, executable_path=os.environ.get('ATF_CHROMIUM_EXECUTABLE', '/usr/bin/chromium'))
        report['chromium'] = browser.version
        try:
            for config in configs:
                phase(config['id'] + ': disclosed Save import')
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
                    page.locator('#save-import').set_input_files(dict(name=config['id']+'.json', mimeType='application/json', buffer=raw))
                    page.wait_for_function("()=>__ATF_V51__?.saveSystem.data.player.name==='QA Tantalus services V165'")
                    open_view(page, 'hub')
                    page.wait_for_function('()=>__ATF_HUB__?.running')
                    page.wait_for_function('id=>(__ATF_HUB__.currentAnnexV71?.()?.id||null)===id', arg=meta['initialActiveAnnex'])
                    settle(page)
                    phase(config['id'] + ': native walking and drawing')
                    if config['mode'] == 'parent-pair':
                        walk_to(page, meta['parentStart']+config['parentWalk'], config['id']+'-parent-walk')
                        inspect_scene(page, config, config['id']+'-parent-native', meta['parentRoomId'])
                        door = meta['parentDoor']
                        walk_to(page, door['x']+door['w']/2-22, config['id']+'-door-approach')
                        passage(page, config, config['annex'], 'enter')
                        walk_to(page, config['walk'], config['id']+'-annex-walk')
                        inspect_scene(page, config, config['id']+'-annex-native', config['annex'])
                    elif config['mode'] == 'room':
                        walk_to(page, meta['parentStart']+config['walk'], config['id']+'-native-walk')
                        inspect_scene(page, config, config['id']+'-native', config['room'])
                    else:
                        if config['mode'] == 'refuge':
                            door = meta['parentDoor']
                            walk_to(page, door['x']+door['w']/2-22, 'refuge-native-parent-door-approach')
                            passage(page, config, config['annex'], 'enter')
                        walk_to(page, config['walk'], config['id']+'-native-walk')
                        inspect_scene(page, config, config['id']+'-native', config['annex'])
                        if config['mode'] == 'refuge':
                            refuge_name(page, config)
                    if config['id'] == 'maintenance':
                        original = observe(page)
                        page.locator('#hub-canvas').focus()
                        page.keyboard.press('F7')
                        page.wait_for_function('v=>__ATF_HUB__.depthPresentationV116!==v', arg=original['depthEnabled'])
                        changed = inspect_scene(page, config, 'maintenance-native-F7', 'maintenance-spine')
                        check('maintenance: F7 changes background motion without changing projection or physical body',
                              changed['life']['projection'] == original['life']['projection']
                              and abs(changed['player']['x']-original['player']['x']) < 2
                              and abs(changed['player']['y']-original['player']['y']) < 1)
                        page.keyboard.press('F7')
                        page.wait_for_function('v=>__ATF_HUB__.depthPresentationV116===v', arg=original['depthEnabled'])
                    if config['mode'] in ['parent-pair', 'annex']:
                        walk_to(page, meta['annexExitX'], config['id']+'-native-exit-approach')
                        passage(page, config, meta['parentRoomId'], 'exit')
                        capture(page, config['id']+'-native-return.png')
                except Exception:
                    if page and not page.is_closed() and page.locator('#hub-canvas').is_visible():
                        try:
                            capture(page, config['id']+'-failure.png', 'failure-diagnostic')
                            report['failureObservation'] = observe(page)
                        except Exception as error:
                            report['failureCaptureError'] = str(error)
                    raise
                finally:
                    context.close()
                    page = None
        finally:
            browser.close()
    report['identityAfter'] = identity()
    check('The exact served build completed all native room observations', report['identityAfter'] == report['identityBefore'])
    report['sourceEnd'] = manifest()
    check('Harness and source bytes stayed unchanged throughout the observation',
          source_start == report['sourceEnd'] and git('rev-parse', 'HEAD') == harness and not git('status', '--porcelain'))
    check('Seven room families completed with no page, unexpected request or HTTP error',
          len(report['families']) >= 7 and not report['pageErrors'] and not report['httpErrors']
          and not [entry for entry in report['requestFailures'] if entry['failure'] != 'net::ERR_ABORTED'])
    if args.stage == 'after':
        failures = report.get('rasterFailures', [])
        if failures:
            # Retain every real render failure, but expose exact served-vs-expected
            # pixels in GitHub Actions rather than only a generic assertion label.
            # No test is waived and no production state or canvas is modified.
            print('RASTER_V165_DIAGNOSTICS ' + json.dumps({
                'count': len(failures),
                'scenes': [{'scene': row['scene'], 'roomId': row['roomId'],
                            'expectedProbeCount': row['expectedProbeCount'],
                            'probes': [{'kind': p['kind'], 'id': p['id'],
                                        'x': p['sampleX'], 'y': p['sampleY'],
                                        'observedRgba': p['rgba'],
                                        'expectedRgba': p['expectedRgba']}
                                       for p in row['probes']]}
                           for row in failures]
            }, ensure_ascii=False, separators=(',', ':')), flush=True)
        check('Every admitted hardware raster assertion succeeded across all observed scenes',
              not failures)
    report['status'] = 'passed'
except Exception as error:
    report['status'] = 'failed'
    report['error'] = str(error)
    report['errorType'] = type(error).__name__
    try:
        report['identityAfter'] = identity()
    except Exception as identity_error:
        report['identityAfterError'] = str(identity_error)
finally:
    report['sourceEnd'] = manifest()
    report['sourceUnchanged'] = report['sourceEnd'] == source_start
    report['finishedAt'] = now()
    (output / 'report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
print(json.dumps(dict(status=report['status'], checks=len(report['checks']), captures=len(report['captures']),
                     report=str(output/'report.json')), ensure_ascii=False), flush=True)
raise SystemExit(0 if report['status'] == 'passed' else 1)
