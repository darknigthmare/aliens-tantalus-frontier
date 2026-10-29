"""Real browser controls for four V165 passenger/annex circuits.
Only the disclosed initial05h Save fixture is authored. Runtime evaluations
observe engine/canvas or store a QA-only observer; every gameplay action uses
native buttons, keyboard, docking UI and Save import/reload. Root executes.
"""
import argparse
import base64
import datetime
import hashlib
import importlib.metadata
import json
import os
from pathlib import Path
import subprocess
import time
import urllib.request
from playwright.sync_api import sync_playwright

parser = argparse.ArgumentParser()
parser.add_argument('--base', default=os.environ.get('ATF_BASE_URL', 'http://127.0.0.1:4173'))
parser.add_argument('--output', type=Path, required=True)
parser.add_argument('--route', choices=['all', 'david-durandal', 'inez-civil', 'maksim-cockpit', 'jun-sanitary'], default='all')
parser.add_argument('--fixture-dir', type=Path)
parser.add_argument('--expect-build')
parser.add_argument('--expect-harness')
parser.add_argument('--comparison-stage', choices=['before', 'after'], default='after')
parser.add_argument('--occupied-lift-arrival', action='store_true', help='Observe the real origin, then travel natively to the destination before the watch; occupy the NPC cabin arrival and capture its opening after stepping clear.')
parser.add_argument('--journey-wall-seconds', type=int, default=1200)
args = parser.parse_args()
repo = Path(__file__).resolve().parents[1]
output = args.output.resolve()
if output == repo or repo in output.parents:
    raise SystemExit('Evidence must remain outside the repository.')
output.mkdir(parents=True, exist_ok=True)
report = {'schema': 165, 'status': 'running', 'startedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
          'comparisonStage': args.comparison_stage, 'occupiedLiftArrival': args.occupied_lift_arrival, 'checks': [], 'captures': [], 'routes': [],
          'pageErrors': [], 'requestFailures': [], 'httpErrors': [],
          'method': 'Disclosed native05h Save imports, real3h reconnaissance commands, native docking, walking/lifts/E, native exit/reload and full physical return; runtime reads only.',
          'limits': ['Automated native controls; no human participation or canonical1:1 art approval.',
                     'Initial05h positions are declared initial conditions; no pre-load travel is claimed.',
                     'Off-screen actor traces are labeled separately from visible canvas evidence.',
                     'Strategic hours and opaque chart changes are not walking distance.']}


def check(label, value):
    if not value:
        raise AssertionError(label)
    report['checks'].append(label)
    print('PASS ' + label, flush=True)


def phase(label):
    report['phase'] = label
    print('STEP ' + label, flush=True)


def identity():
    with urllib.request.urlopen(args.base.rstrip('/') + '/build-info.json', timeout=20) as response:
        raw = response.read()
    value = json.loads(raw)
    return {'sourceCommit': value['sourceCommit'], 'buildId': value['buildId'],
            'buildInfoSha256': hashlib.sha256(raw).hexdigest()}


def manifest():
    files = [*repo.glob('src/**/*.js'), *repo.glob('*.css'), *repo.glob('assets/openai/sprites/npcs/rig-v165/*.png'), repo / 'index.html', repo / 'sw.js', repo / 'package.json', repo / 'package-lock.json', Path(__file__).resolve()]
    return {str(p.relative_to(repo)): hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(files)}


def artifact(name, value):
    (output / name).write_text(json.dumps(value, indent=2, ensure_ascii=False) + '\n')


def png(name, raw, observation=None):
    path = output / name
    path.write_bytes(raw)
    item = {'file': name, 'sha256': hashlib.sha256(raw).hexdigest()}
    if observation is not None:
        item['observation'] = observation
    report['captures'].append(item)


CONFIG_SCRIPT = r'''import {NPC_INTERDECK_DEFINITIONS_V165 as defs,getNpcInterdeckGeometryV165} from './src/npc-interdeck-routes-v165.js';
import {HUB_DECKS} from './src/hub-game.js';import {npcLiftSocketV165} from './src/npc-lift-transit-v165.js';
console.log(JSON.stringify(defs.map(d=>{const g=getNpcInterdeckGeometryV165(d.id),origin=d.origins[0],room=HUB_DECKS[d.nativeDeck].rooms.find(r=>r.id===origin),lift=npcLiftSocketV165(d.nativeDeck,d.shaftId);
return{...d,origin,player:['jun-sanitary','inez-civil'].includes(d.id)?room.xEnd-140:room.xStart+96,cabinX:lift.x-22,sourceLiftRoom:lift.roomId,
parentX:g.faces.parent.opening.x+(g.faces.parent.opening.w-44)/2,annexX:g.faces.local.opening.x+(g.faces.local.opening.w-44)/2,
post:g.post.x,ladders:g.ladders,watchHour:d.id==='david-durandal'?11:d.id==='inez-civil'?20:d.id==='jun-sanitary'?17:8,
returnHour:d.id==='david-durandal'?14:d.id==='inez-civil'?23:d.id==='jun-sanitary'?20:11};})));'''
configs = json.loads(subprocess.check_output(['node', '--input-type=module', '-e', CONFIG_SCRIPT], cwd=repo, text=True))


def fixture(c):
    name = c['id'] + '-disclosed-native0500.json'
    if args.fixture_dir:
        raw = (args.fixture_dir / name).read_bytes()
    else:
        script = r'''import {createDefaultSave} from './src/save.js';const c=JSON.parse(process.argv[1]),s=createDefaultSave();
s.needsPlayerCreationV84=false;if(s.onboardingV84)s.onboardingV84.phase='complete';s.scene='hub';s.player.name='QA native interdeck V165';s.clock.hour=5;s.settings.reducedMotion=false;
Object.assign(s.hub,{deck:c.nativeDeck,roomId:c.origin,positionX:c.player,positionY:532});
Object.assign(s.hub.systems,{hull:100,power:100,oxygen:100,quarantine:100});console.log(JSON.stringify(s));'''
        raw = subprocess.check_output(['node', '--input-type=module', '-e', script, json.dumps(c)], cwd=repo)
    (output / name).write_bytes(raw)
    report.setdefault('fixtures', []).append({'file': name, 'sha256': hashlib.sha256(raw).hexdigest(), 'declaredHour': 5})
    return raw


READ = r'''c=>{const h=__ATF_HUB__,s=h.getSnapshot(),e=s.npcInterdeckRoutesV165?.routes?.[c.id]||null,
all=h.currentAnnexV71?.()?h.activeAnnexNpcsV141():h.npcs,
a=h.getNpcInterdeckActorsV165?.().find(a=>a.crewId===c.crewId)||all.find(a=>a.crewId===c.crewId)||null;
return{route:e?structuredClone(e):null,deck:h.state.deck,roomId:h.state.roomId,annex:h.currentAnnexV71?.()?.id||null,
running:h.running,player:{x:h.player.x,y:h.player.y,w:h.player.w,h:h.player.h,vx:h.player.vx,grounded:h.player.grounded,climbing:h.player.climbing},
actualActor:a?{crewId:a.crewId,x:a.x,y:a.y,w:a.w,h:a.h,roomId:a.roomId,vx:a.vx}:null,
visibleCount:all.filter(n=>n.crewId===c.crewId).length,visibleSingleton:all.filter(n=>n.crewId===c.crewId).every(n=>n===a),
clock:structuredClone(h.npcRoutineContextV62.clock),camera:{...h.camera},prompt:h.statusPrompt(),
playerTrip:structuredClone(h.hubLiftTransitV163?.trip||null),port:structuredClone(__ATF_V51__.saveSystem.data.shipPortV1),
traffic:structuredClone(s.npcServiceTrafficV163),interaction:structuredClone(h.hubNpcInteractions[c.crewId]||null)};}'''


def observed(page, c):
    return page.evaluate(READ, c)


def open_view(page, view):
    menu = page.locator('#menu-toggle')
    if menu.is_visible() and 'open' not in (page.locator('.rail').get_attribute('class') or '').split():
        menu.click()
    page.locator('[data-view="' + view + '"]').click()


def open_hub(page):
    open_view(page, 'hub')
    page.wait_for_function('()=>__ATF_HUB__?.running', timeout=90000)
    page.locator('#hub-canvas').focus()


def walk_to(page, c, x, timeout=120):
    deadline = time.monotonic() + timeout
    page.locator('#hub-canvas').focus()
    while time.monotonic() < deadline:
        p = observed(page, c)['player']
        distance = x - p['x']
        if abs(distance) <= 7 and abs(p['vx']) < 1:
            return
        # Let native inertia settle once inside the existing arrival tolerance.
        if abs(distance) <= 7:
            page.wait_for_timeout(60)
            continue
        key = 'KeyD' if distance > 0 else 'KeyA'
        page.keyboard.press(key, delay=max(16, min(160, abs(distance) * 3)))
        page.wait_for_timeout(60)
    raise AssertionError('Native walking did not reach ' + str(x))


NATIVE_SERVICE_SPEAKER_V165 = r'''c=>{const h=__ATF_HUB__,p=h.player,
all=h.activeAnnexNpcsV141?.()||[],matches=all.filter(n=>n.crewId===c.crewId),
n=h.nearestAnnexNpcV141?.();
return h.running&&h.currentAnnexV71?.()?.id===c.annexRoomId
&&!h.annexTransitionV71&&!h.hubDoorClosingV142&&!h.hubDoorBlockedV142&&!h.annexStateReadOnlyV87
&&p.alive&&p.grounded&&!p.climbing&&Math.abs(p.vx)<1
&&matches.length===1&&n===matches[0]&&n.alive!==false
&&h.statusPrompt()===`E — ${n.interaction.label} · ${n.name}`;}'''


def approach_service_dialogue(page, c):
    if c['id'] != 'inez-civil':
        walk_to(page, c, c['post'] - 84)
        return
    # The counter wins at post-84; Mica wins at post+84. Approach the right
    # edge of the actual speaker. The existing7px walk tolerance remains in
    # Inez's native speaking zone; the real selector is checked before E.
    service = observed(page, c)
    actor = service['actualActor']
    check(c['id'] + ': approach retains the actual visible service singleton',
          service['annex'] == c['annexRoomId'] and service['visibleCount'] == 1
          and service['visibleSingleton'] and actor and actor['crewId'] == c['crewId'])
    walk_to(page, c, actor['x'] + actor['w'] - 7)


def open_service_dialogue(page, c):
    if c['id'] != 'inez-civil':
        page.keyboard.press('KeyE')
        page.locator('#hub-dialogue').wait_for(state='visible')
        return
    # Selection and opening share the original45s dialogue budget. A visible
    # shop/animal prompt or another crew member must never count as success.
    deadline = time.monotonic() + 45
    before = (observed(page, c)['interaction'] or {}).get('count', 0)
    page.wait_for_function(NATIVE_SERVICE_SPEAKER_V165, arg=c,
                           timeout=max(1, int((deadline - time.monotonic()) * 1000)))
    page.keyboard.press('KeyE')
    page.locator('#hub-dialogue').wait_for(state='visible',
                                         timeout=max(1, int((deadline - time.monotonic()) * 1000)))
    opened = observed(page, c)
    check(c['id'] + ': native E records exactly the requested crew interaction',
          not opened['running'] and (opened['interaction'] or {}).get('count') == before + 1)


def commands_to(page, c, hour):
    page.locator('#exit-hub').click()
    open_view(page, 'command')
    while page.evaluate('()=>__ATF_V51__.saveSystem.data.clock.hour') != hour:
        before = page.evaluate('()=>__ATF_V51__.saveSystem.data.clock.hour')
        page.locator('[data-strategy-action="frontier-recon"]').click()
        page.wait_for_function('before=>__ATF_V51__.saveSystem.data.clock.hour!==before', arg=before)
        after = page.evaluate('()=>__ATF_V51__.saveSystem.data.clock.hour')
        check(c['id'] + ': native reconnaissance advances exactly3h', abs((after - before) % 24 - 3) < .0001)
    open_hub(page)


def install_observer(page, c, session):
    page.evaluate(r'''opts=>{const read=(''' + READ + r'''),frames=[],shots={},ids=new WeakMap();let serial=0,lastKey='',lastAt=0;
const q={frames,shots,stopped:false};window.__NPC_INTERDECK_NATIVE_QA__=q;
function loop(){if(q.stopped)return;const now=performance.now();if(now-lastAt>=75){const r=read(opts.c),a=r.route?.actor,
h=__ATF_HUB__,body=h.getNpcInterdeckActorsV165?.().find(a=>a.crewId===opts.c.crewId);
if(body&&!ids.has(body))ids.set(body,++serial);const key=a?a.stage+(a.lift?':'+a.lift.phase:'')+':'+a.direction:'returned';
const sameChart=!!a&&(a.roomId===opts.c.annexRoomId?r.annex===a.roomId:!r.annex&&r.deck===a.deck),
visible=!!a&&sameChart&&a.x+44>h.camera.x&&a.x<h.camera.x+1280;
frames.push({monotonic:now/1000,sessionId:opts.session,bodyId:body?ids.get(body):null,visibleCount:r.visibleCount,
route:r.route,deck:r.deck,roomId:r.roomId,annex:r.annex,player:r.player,actorChartVisible:sameChart,actorWithinCamera:visible});
if(visible&&key!==lastKey&&!shots[key])shots[key]={png:document.querySelector('#hub-canvas').toDataURL('image/png'),
observation:{phase:key,actorChartVisible:sameChart,actorWithinCamera:true,deck:r.deck,roomId:r.roomId,annex:r.annex,actor:a}};
lastAt=now;lastKey=key;}requestAnimationFrame(loop);}requestAnimationFrame(loop);}''', {'c': c, 'session': session})


def collect_observer(page, c, session, all_frames):
    result = page.evaluate('()=>{const q=window.__NPC_INTERDECK_NATIVE_QA__;if(!q)return{frames:[],shots:{}};q.stopped=true;return{frames:q.frames,shots:q.shots};}')
    all_frames.extend(result['frames'])
    for index, (key, shot) in enumerate(result['shots'].items()):
        name = c['id'] + '-' + session + '-' + str(index).zfill(2) + '-' + key.replace(':', '-') + '.png'
        png(name, base64.b64decode(shot['png'].split(',', 1)[1]), shot['observation'])
    return result


def follow_floor_actor(page, c, stop, timeout=None):
    deadline = time.monotonic() + (timeout or args.journey_wall_seconds)
    last_progress = time.monotonic()
    previous = None
    while time.monotonic() < deadline:
        r = observed(page, c)
        if stop(r):
            page.keyboard.up('KeyA')
            page.keyboard.up('KeyD')
            return r
        a = (r['route'] or {}).get('actor')
        if not a:
            raise AssertionError('Physical owner disappeared before the requested stage')
        key = (a['x'], a['y'], a['stage'], a.get('lift', {}).get('phase') if a.get('lift') else None, a['doorProgress'])
        if key != previous:
            last_progress = time.monotonic()
            previous = key
        if time.monotonic() - last_progress > 90:
            raise AssertionError('No actual physical phase/position progress for90wall seconds: ' + json.dumps(r))
        if c['id'] == 'jun-sanitary' and a['stage'] == 'vertical' and a.get('vertical', {}).get('ladderId') == 'quarters-tier' and r['player']['y'] < 300 and r['player']['x'] < 880:
            walk_to(page, c, 892)
        if not r['annex'] and r['deck'] == a['deck'] and a['y'] == r['player']['y'] and not a.get('lift'):
            dx = a['x'] - r['player']['x']
            goal = c['cabinX'] if a['stage'] in ['walking-lift', 'waiting-lift'] else c['parentX'] if a['stage'] == 'walking-portal' else (r['route'].get('origin') or {}).get('x', a['x'])
            direction = 1 if goal > a['x'] else -1
            if direction * dx > 165:
                page.keyboard.press('KeyD' if dx > 0 else 'KeyA', delay=100)
        page.wait_for_timeout(80)
    raise AssertionError('Native journey wall budget exhausted')


def reload_travel(page, c, all_frames):
    phase(c['id'] + ': real exit/reload during closed carriage')
    follow_floor_actor(page, c, lambda r: bool((r['route'] or {}).get('actor', {}).get('lift') and r['route']['actor']['lift']['phase'] == 'travel' and (r['route']['actor']['lift']['elapsed'] >= .12 or args.occupied_lift_arrival)))
    page.locator('#exit-hub').click()
    stopped = observed(page, c)
    durable = page.evaluate('id=>JSON.parse(localStorage.getItem("atf-v47-profile-1")).hub.npcInterdeckRoutesV165.routes[id]', c['id'])
    artifact(c['id'] + '-durable-travel.json', durable)
    check(c['id'] + ': native exit saves exact closed passenger phase', durable['actor'] == stopped['route']['actor'] and not stopped['running'])
    collect_observer(page, c, 'outbound-before-reload', all_frames)
    page.wait_for_timeout(300)
    check(c['id'] + ': paused cabin does not advance', observed(page, c)['route']['actor'] == durable['actor'])
    page.reload(wait_until='domcontentloaded')
    page.locator('#title-start').click(timeout=45000)
    page.locator('#title-options').click()
    page.evaluate(r'''c=>{document.addEventListener('click',function first(e){if(e.target.closest('[data-view]')?.dataset.view!=='hub')return;
document.removeEventListener('click',first);queueMicrotask(()=>{window.__NPC_INTERDECK_FIRST_RESUME__=(''' + READ + r''')(c);});});}''', c)
    open_hub(page)
    first = page.evaluate('()=>window.__NPC_INTERDECK_FIRST_RESUME__')
    artifact(c['id'] + '-first-resume.json', first)
    check(c['id'] + ': first resumed native frame preserves exact passenger/chart', first['route']['actor'] == durable['actor'])
    install_observer(page, c, 'outbound-after-reload')


def player_lift_to(page, c, deck):
    page.wait_for_function('shaft=>!__ATF_HUB__.npcLiftCabinReservationV165?.(shaft)', arg=c['shaftId'], timeout=args.journey_wall_seconds * 1000)
    walk_to(page, c, c['cabinX'])
    for _ in range(4):
        r = observed(page, c)
        if r['deck'] == deck:
            return
        before = r['deck']
        page.locator('#hub-canvas').focus()
        # Native W decreases the deck index; S increases it.
        page.keyboard.press('KeyS' if deck > before else 'KeyW')
        page.wait_for_function('before=>__ATF_HUB__.hubLiftTransitV163?.trip||__ATF_HUB__.state.deck!==before', arg=before)
        page.wait_for_function('before=>__ATF_HUB__.state.deck!==before&&!__ATF_HUB__.hubLiftTransitV163?.trip', arg=before, timeout=90000)
    raise AssertionError('Native player lift did not reach destination')


def climb_parent(page, c):
    for ladder in c['ladders']:
        walk_to(page, c, ladder['x'] - 22)
        page.keyboard.down('KeyW')
        try:
            # Keep climbing until the native endpoint releases the ladder and
            # the platform supports the player; reaching its height is earlier.
            page.wait_for_function('top=>__ATF_HUB__.player.y+__ATF_HUB__.player.h<=top+.1&&__ATF_HUB__.player.grounded&&!__ATF_HUB__.player.climbing', arg=ladder['top'], timeout=90000)
        finally:
            page.keyboard.up('KeyW')
        page.wait_for_function('()=>__ATF_HUB__.player.grounded&&!__ATF_HUB__.player.climbing', timeout=45000)
    walk_to(page, c, 700)


def dock_native(page, c):
    phase(c['id'] + ': native hangar terminal authorization and actual docking')
    player_lift_to(page, c, 3)
    walk_to(page, c, 18)
    page.keyboard.press('KeyE')
    page.locator('dialog.ship-port-v87').wait_for(state='visible')
    page.locator('[data-port-action="dock"]').click()
    # An accepted terminal action closes its dialog and resumes the real hub.
    page.locator('dialog.ship-port-v87').wait_for(state='hidden')
    page.wait_for_function('()=>__ATF_HUB__.running')
    page.wait_for_function('()=>__ATF_V51__.saveSystem.data.shipPortV1.phase==="docked"', timeout=90000)
    check(c['id'] + ': real terminal completes the local docking period', observed(page, c)['port']['phase'] == 'docked')
    png(c['id'] + '-native-docked-terminal.png', page.screenshot())
    # Return the observer to the origin deck using its own native lift.
    player_lift_to(page, c, c['nativeDeck'])
    walk_to(page, c, c['cabinX'] + 220)


report['identityBefore'] = identity()
report['sourceCommit'] = report['identityBefore']['sourceCommit']
report['harnessSha256'] = hashlib.sha256(Path(__file__).read_bytes()).hexdigest()
report['harnessCommit'] = subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=repo, text=True).strip()
if args.expect_build and report['sourceCommit'] != args.expect_build:
    raise SystemExit('Served build differs from expected source commit.')
if args.expect_harness and (report['harnessCommit'] != args.expect_harness or subprocess.check_output(['git', 'status', '--porcelain'], cwd=repo, text=True).strip()):
    raise SystemExit('QA harness is not the declared exact clean commit.')
source_start = manifest()
artifact('source-start.json', source_start)
with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True, **({'executable_path': os.environ['ATF_CHROMIUM_EXECUTABLE']} if os.environ.get('ATF_CHROMIUM_EXECUTABLE') else {}))
    report['tooling'] = {'playwright': importlib.metadata.version('playwright'), 'chromium': browser.version}
    try:
        for c in configs:
            if args.route not in ['all', c['id']]:
                continue
            phase(c['id'] + ': disclosed native05h origin')
            frames = []
            context = browser.new_context(viewport={'width': 1600, 'height': 1000}, service_workers='block')
            page = context.new_page()
            page.set_default_timeout(45000)
            page.on('pageerror', lambda error: report['pageErrors'].append(str(error)))
            page.on('requestfailed', lambda request: report['requestFailures'].append({'url': request.url, 'failure': request.failure}))
            page.on('response', lambda response: report['httpErrors'].append({'url': response.url, 'status': response.status}) if response.status >= 400 else None)
            page.on('dialog', lambda dialog: dialog.accept())
            page.goto(args.base, wait_until='domcontentloaded')
            page.locator('#title-start').click(timeout=45000)
            page.locator('#title-options').click()
            page.locator('#save-import').set_input_files({'name': c['id'] + '.json', 'mimeType': 'application/json', 'buffer': fixture(c)})
            page.wait_for_function('()=>__ATF_V51__?.saveSystem.data.player.name==="QA native interdeck V165"')
            open_hub(page)
            initial = observed(page, c)
            check(c['id'] + ': initial body is real, unique and floor-supported in its station', initial['visibleCount'] == 1 and initial['visibleSingleton'] and initial['actualActor']['roomId'] == c['origin'] and initial['actualActor']['y'] == 532)
            png(c['id'] + '-native-origin0500.png', page.locator('#hub-canvas').screenshot(), initial)
            if c['id'] == 'inez-civil':
                dock_native(page, c)
            if args.occupied_lift_arrival:
                player_lift_to(page, c, c['deck'])
                walk_to(page, c, c['cabinX'])
            commands_to(page, c, c['watchHour'])
            if args.comparison_stage == 'before':
                before = observed(page, c)
                artifact(c['id'] + '-before-native-watch.json', before)
                png(c['id'] + '-before-native-watch.png', page.locator('#hub-canvas').screenshot(), before)
                report['routes'].append({'id': c['id'], 'status': 'baseline-observed', 'npcJourneyEstablished': False})
                context.close()
                continue
            start = observed(page, c)
            check(c['id'] + ': strategy Save boundary preserves observed station bookmark', start['route']['origin']['roomId'] == c['origin'] and start['route']['actor']['crossings'] == 0 and start['route']['actor']['liftJourneys'] == 0)
            install_observer(page, c, 'outbound-before-reload')
            reload_travel(page, c, frames)
            if args.occupied_lift_arrival:
                held_lift = observed(page, c)
                check(c['id'] + ': actual destination player holds the source-chart closed cabin', held_lift['route']['actor']['lift']['phase'] == 'travel' and held_lift['route']['actor']['deck'] == c['nativeDeck'] and held_lift['deck'] == c['deck'])
                png(c['id'] + '-occupied-lift-arrival.png', page.locator('#hub-canvas').screenshot(), held_lift)
                walk_to(page, c, c['cabinX'] + 160)
            else:
                player_lift_to(page, c, c['deck'])
            if c['id'] == 'jun-sanitary':
                climb_parent(page, c)
            arrived = follow_floor_actor(page, c, lambda r: (r['route'] or {}).get('actor', {}).get('stage') == 'service')
            collect_observer(page, c, 'outbound-after-reload', frames)
            check(c['id'] + ': timed real passenger arrives through one paired annex portal', arrived['route']['actor']['roomId'] == c['annexRoomId'] and arrived['route']['actor']['crossings'] == 1 and arrived['route']['actor']['liftJourneys'] == 1)
            if c['id'] == 'jun-sanitary':
                check(c['id'] + ': two real ladders spend248vertical pixels', abs(arrived['route']['actor']['verticalDistance'] - 248) < .001)
            walk_to(page, c, c['parentX'])
            page.keyboard.press('KeyE')
            page.wait_for_function('id=>__ATF_HUB__.currentAnnexV71?.()?.id===id&&!__ATF_HUB__.annexTransitionV71', arg=c['annexRoomId'])
            approach_service_dialogue(page, c)
            service = observed(page, c)
            check(c['id'] + ': actual player entry sees the same singleton at the service post', service['visibleCount'] == 1 and service['visibleSingleton'])
            png(c['id'] + '-visible-annex-service.png', page.locator('#hub-canvas').screenshot(), service)
            open_service_dialogue(page, c)
            check(c['id'] + ': native E opens crew dialogue and pauses physical movement', not observed(page, c)['running'])
            png(c['id'] + '-native-dialogue.png', page.locator('#hub-canvas').screenshot())
            page.locator('[data-npc-dialogue-choice]:not([disabled])').first.click()
            page.locator('#hub-dialogue-continue').click()
            page.wait_for_function('()=>__ATF_HUB__.running')
            walk_to(page, c, c['annexX'])
            page.keyboard.press('KeyE')
            page.wait_for_function('()=>!__ATF_HUB__.currentAnnexV71?.()&&!__ATF_HUB__.annexTransitionV71')
            commands_to(page, c, c['returnHour'])
            install_observer(page, c, 'return')
            # Staying at the actual parent socket deliberately occupies the
            # returning NPC arrival, including Jun's real high landing.
            held = follow_floor_actor(page, c, lambda r: (r['route'] or {}).get('actor', {}).get('reason') == 'occupied', timeout=180)
            check(c['id'] + ': real player body holds the occupied parent arrival', held['route']['actor']['roomId'] == c['annexRoomId'] and held['route']['actor']['crossings'] == 1)
            png(c['id'] + '-actual-occupied-return.png', page.locator('#hub-canvas').screenshot(), held)
            clear = 892 if c['id'] == 'jun-sanitary' else max(24, c['parentX'] - 150) if c['cabinX'] > c['parentX'] else c['parentX'] + 150
            walk_to(page, c, clear)
            returned = follow_floor_actor(page, c, lambda r: bool((r['route'] or {}).get('returned')))
            collect_observer(page, c, 'return', frames)
            done = returned['route']['returned']
            check(c['id'] + ': full native roundtrip reaches the exact physical bookmark', done['observedTravel'] is True and done['roomId'] == start['route']['origin']['roomId'] and done['x'] == start['route']['origin']['x'] and done['liftJourneys'] == 2 and done['crossings'] == 2)
            trace = {'schema': 165, 'routeId': c['id'], 'build': report['identityBefore'], 'frames': frames}
            artifact(c['id'] + '-native-trace.json', trace)
            artifact(c['id'] + '-native-return.json', returned)
            check(c['id'] + ': trace includes all five real cabin phases', all(any((f.get('route') or {}).get('actor', {}).get('lift', {}).get('phase') == p for f in frames if (f.get('route') or {}).get('actor') and (f['route']['actor'].get('lift'))) for p in ['boarding', 'closing', 'travel', 'opening', 'exiting']))
            report['routes'].append({'id': c['id'], 'status': 'passed', 'nativeRoundTrip': True, 'initialOriginDeclared': True, 'preLoadTravelObserved': False})
            context.close()
        check('browser pages/assets have no runtime, HTTP or request failures', not report['pageErrors'] and not report['httpErrors'] and not report['requestFailures'])
        report['identityAfter'] = identity()
        check('same served build before and after native observations', report['identityBefore'] == report['identityAfter'])
        report['status'] = 'passed'
    except Exception as error:
        report['status'] = 'failed'
        report['error'] = str(error)
        try:
            png('failure.png', page.screenshot(full_page=True))
            report['failureState'] = observed(page, c)
            if args.comparison_stage == 'after':
                collect_observer(page, c, 'failure', frames)
                artifact(c['id'] + '-failed-native-trace.json', {'schema': 165, 'routeId': c['id'], 'build': report['identityBefore'], 'frames': frames})
        except Exception as failure:
            report['captureError'] = str(failure)
        raise
    finally:
        browser.close()
        try:
            report['identityAfter'] = identity()
        except Exception as error:
            report['identityError'] = str(error)
            report['status'] = 'failed'
        source_end = manifest()
        artifact('source-end.json', source_end)
        report['sourceUnchanged'] = source_start == source_end
        if not report['sourceUnchanged']:
            report['status'] = 'failed'
        report['nativeRoundTripsObserved'] = sum(row.get('nativeRoundTrip') is True for row in report['routes'])
        report['preLoadTravelObserved'] = False
        report['canonicalExact'] = False
        report['finishedAt'] = datetime.datetime.now(datetime.timezone.utc).isoformat()
        artifact('report.json', report)
if report['status'] != 'passed':
    raise SystemExit(1)
