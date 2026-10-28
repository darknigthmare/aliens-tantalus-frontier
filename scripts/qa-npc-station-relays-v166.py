"""Native05h→09h→12h station relays, with byte-identical before/after imports.

Only the disclosed initial Save is authored. Commands, lifts, floor walking,
doors, dialogue and pause/reload use public native UI. Evaluations read the
runtime or record a separate RAF observer; they never set engine state.
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
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeout

parser = argparse.ArgumentParser()
parser.add_argument('--base', default=os.environ.get('ATF_BASE_URL', 'http://127.0.0.1:4173'))
parser.add_argument('--output', type=Path, required=True)
parser.add_argument('--route', choices=['all', 'rook-station-relay', 'tamsin-station-relay'], default='all')
parser.add_argument('--fixture-dir', type=Path)
parser.add_argument('--comparison-stage', choices=['before', 'after'], default='after')
parser.add_argument('--expect-build')
parser.add_argument('--expect-harness')
parser.add_argument('--journey-wall-seconds', type=int, default=1200)
args = parser.parse_args()
repo = Path(__file__).resolve().parents[1]
output = args.output.resolve()
if output == repo or repo in output.parents:
    raise SystemExit('Evidence must remain outside the repository.')
output.mkdir(parents=True, exist_ok=True)
report = {'schema': 166, 'status': 'running', 'profileName': 'npc-station-relays-v166',
          'comparisonStage': args.comparison_stage, 'canonicalExact': False,
          'startedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
          'checks': [], 'captures': [], 'routes': [], 'pageErrors': [], 'requestFailures': [], 'httpErrors': [],
          'method': 'Disclosed native05h Save, colony-relief4h→09h, frontier-recon3h→12h; native walking/lifts/E, covered-carriage and local-owner save/reload, occupied local arrival and exact station return.',
          'limitations': ['Automated native controls, no human participant or canonical1:1 art approval.',
                          'The initial05h station is a declared initial condition; no earlier travel is claimed.',
                          'Off-screen traces are labeled separately from visible canvas evidence.',
                          'Strategic hours and covered chart changes are not walking distance.',
                          'Before-stage captures compare the actual baseline and do not validate V166 journeys.']}


def check(label, condition):
    if not condition:
        raise AssertionError(label)
    report['checks'].append(label)
    print('PASS ' + label, flush=True)


def phase(label):
    report['phase'] = label
    print('STEP ' + label, flush=True)


def artifact(name, value):
    (output / name).write_text(json.dumps(value, indent=2, ensure_ascii=False) + '\n')


def png(name, data, observation=None):
    (output / name).write_bytes(data)
    item = {'file': name, 'sha256': hashlib.sha256(data).hexdigest()}
    if observation is not None:
        item['observation'] = observation
    report['captures'].append(item)


def identity():
    with urllib.request.urlopen(args.base.rstrip('/') + '/build-info.json', timeout=20) as response:
        raw = response.read()
    value = json.loads(raw)
    return {'sourceCommit': value['sourceCommit'], 'buildId': value['buildId'],
            'buildInfoSha256': hashlib.sha256(raw).hexdigest()}


def manifest():
    files = [*repo.glob('src/**/*.js'), *repo.glob('*.css'), repo / 'index.html', repo / 'sw.js',
             repo / 'package.json', repo / 'package-lock.json', Path(__file__).resolve(),
             repo / 'assets/openai/sprites/normalized/npcs/rook-locomotion-sheet.png',
             repo / 'assets/openai/sprites/normalized/npcs/tamsin-velez-locomotion-sheet.png']
    return {str(p.relative_to(repo)): hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(files)}


CONFIG_SCRIPT = r'''import {NPC_STATION_RELAY_DEFINITIONS_V166 as defs} from './src/npc-station-relays-v166.js';
import {HUB_NPC_ANNEX_WORKPOST_ROUTES_V165 as routes} from './src/npc-annex-workpost-routes-v165.js';
import {HUB_DECKS} from './src/hub-game.js';import {createAnnexNpcsV141} from './src/hub-annex-npc-life-v141.js';
import {npcLiftSocketV165} from './src/npc-lift-transit-v165.js';
console.log(JSON.stringify(defs.map(d=>{const r=routes.find(r=>r.definition.id===d.localId),p=HUB_DECKS[d.deck].rooms.find(r=>r.id===d.parentRoomId),
s=HUB_DECKS[d.stationDeck].rooms.find(r=>r.id===d.stationRoomId),lift=npcLiftSocketV165(d.stationDeck,d.shaftId);
return{...d,player:s.xStart+96,cabinX:lift.x-22,parentX:r.faces.parent.opening.x+(r.faces.parent.opening.w-44)/2,
annexX:r.faces.local.opening.x+(r.faces.local.opening.w-44)/2,clear:p.xStart+72,
post:createAnnexNpcsV141([{...r.definition,roomId:d.annexRoomId}],new Map())[0].x};})));'''
configs = json.loads(subprocess.check_output(['node', '--input-type=module', '-e', CONFIG_SCRIPT], cwd=repo, text=True))


def fixture(c):
    name = c['id'] + '-disclosed-native0500.json'
    if args.fixture_dir:
        raw = (args.fixture_dir.resolve() / name).read_bytes()
    else:
        script = r'''import {createDefaultSave} from './src/save.js';const c=JSON.parse(process.argv[1]),s=createDefaultSave();
s.needsPlayerCreationV84=false;if(s.onboardingV84)s.onboardingV84.phase='complete';s.scene='hub';
s.player.name='QA station relays V166';s.clock.hour=5;s.settings.reducedMotion=false;
Object.assign(s.hub,{deck:c.stationDeck,roomId:c.stationRoomId,positionX:c.player,positionY:532});
Object.assign(s.hub.systems,{hull:100,power:100,oxygen:100,quarantine:100});console.log(JSON.stringify(s));'''
        raw = subprocess.check_output(['node', '--input-type=module', '-e', script, json.dumps(c)], cwd=repo)
    (output / name).write_bytes(raw)
    report.setdefault('fixtures', []).append({'file': name, 'sha256': hashlib.sha256(raw).hexdigest(), 'declaredHour': 5})
    return raw


READ = r'''c=>{const h=__ATF_HUB__,s=h.getSnapshot(),e=s.npcStationRelaysV166?.routes?.[c.id]||null,
local=h.getNpcServicePhysicalStateV165?.(c.localId)||null,annex=h.currentAnnexV71?.()?.id||null,visible=annex?h.activeAnnexNpcsV141():h.npcs,
a=h.getNpcStationRelayActorV166?.(c.id)||h.getNpcAnnexWorkpostActorV165?.(c.localId)||visible.find(a=>a.crewId===c.crewId)||null,
echo=h.getNpcAnnexLeaseActorV163?.('echo-escape')||null;
return{route:e?structuredClone(e):null,local:local?structuredClone(local):null,deck:h.state.deck,roomId:h.state.roomId,annex,running:h.running,
localRecord:structuredClone(s.npcAnnexWorkpostRoutesV165?.routes?.[c.localId]||null),
playerDoorTransition:Boolean(h.annexTransitionV71||h.hubDoorClosingV142),
player:{x:h.player.x,y:h.player.y,w:h.player.w,h:h.player.h,vx:h.player.vx},
actualActor:a?{crewId:a.crewId,x:a.x,y:a.y,w:a.w,h:a.h,roomId:a.roomId,facing:a.facing,vx:a.vx}:null,
visibleCount:visible.filter(n=>n.crewId===c.crewId).length,visibleSingleton:visible.filter(n=>n.crewId===c.crewId).every(n=>n===a),
ownerCount:(h.getNpcServiceOwnedActorsV163?.()||[]).filter(n=>n.crewId===c.crewId).length,
physicalOwners:(h.getNpcServiceOwnedActorsV163?.()||[]).map(n=>({crewId:n.crewId,x:n.x,y:n.y,roomId:n.roomId})),
liftReservations:['hub-midship-lift','hub-aft-lift'].map(id=>h.npcLiftCabinReservationV165?.(id)||null),
echo:echo?{crewId:echo.crewId,roomId:echo.roomId,x:echo.x,y:echo.y,w:echo.w,h:echo.h}:null,
localIsSame:!!a&&h.getNpcServiceActorV161?.(c.localId)===a,
clock:structuredClone(h.npcRoutineContextV62.clock),camera:{...h.camera},playerTrip:structuredClone(h.hubLiftTransitV163?.trip||null),
traffic:structuredClone(s.npcServiceTrafficV163||null),prompt:h.statusPrompt()};}'''


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


def walk_to(page, c, x, tolerance=7):
    page.locator('#hub-canvas').focus()
    for attempt in range(30):
        p = observed(page, c)['player']
        distance = x - p['x']
        if abs(distance) <= tolerance and abs(p['vx']) < 1:
            return
        key = 'KeyD' if distance > 0 else 'KeyA'
        if abs(distance) > 80:
            page.keyboard.down(key)
            try:
                page.wait_for_function('o=>o.right?__ATF_HUB__.player.x>=o.x-20:__ATF_HUB__.player.x<=o.x+20',
                                       arg={'x': x, 'right': distance > 0}, timeout=90000)
            finally:
                page.keyboard.up(key)
        else:
            page.keyboard.press(key, delay=max(16, min(160, abs(distance) * 3)))
        page.wait_for_function('()=>Math.abs(__ATF_HUB__.player.vx)<1', timeout=20000)
    raise AssertionError('Native walking could not settle at ' + str(x))


def command(page, c, action, target_hour):
    page.locator('#exit-hub').click()
    open_view(page, 'command')
    before = page.evaluate('()=>({hour:__ATF_V51__.saveSystem.data.clock.hour,serial:__ATF_V51__.saveSystem.data.strategy.serial})')
    page.locator('[data-strategy-action="' + action + '"]').click()
    page.wait_for_function('hour=>__ATF_V51__.saveSystem.data.clock.hour===hour', arg=target_hour)
    after = page.evaluate('()=>({hour:__ATF_V51__.saveSystem.data.clock.hour,serial:__ATF_V51__.saveSystem.data.strategy.serial,strategy:structuredClone(__ATF_V51__.saveSystem.data.strategy)})')
    report.setdefault('nativeCommands', []).append({'route': c['id'], 'action': action, 'before': before, 'after': after})
    check(c['id'] + ': native ' + action + ' reaches the exact declared watch', after['hour'] == target_hour and after['serial'] > before['serial'])
    open_hub(page)


def install_observer(page, c, session):
    page.evaluate(r'''o=>{const read=(''' + READ + r'''),rows=[],shots={},ids=new WeakMap();let serial=0,lastAt=0;
const q={rows,shots,stopped:false};window.__NPC_RELAY_NATIVE_QA__=q;
function bitmap(){const a=document.querySelector('#hub-canvas'),b=document.createElement('canvas');b.width=a.width;b.height=a.height;b.getContext('2d').drawImage(a,0,0);return b;}
function frame(){if(q.stopped)return;const now=performance.now();if(now-lastAt>=75){const r=read(o.c),e=r.route,a=r.actualActor,
body=__ATF_HUB__.getNpcStationRelayActorV166?.(o.c.id)||__ATF_HUB__.getNpcAnnexWorkpostActorV165?.(o.c.localId);
if(body&&!ids.has(body))ids.set(body,++serial);
const logical=e?.actor,actorDeck=logical?.deck??o.c.deck,sameChart=!!a&&(a.roomId===o.c.annexRoomId?r.annex===a.roomId:!r.annex&&r.deck===actorDeck),
inCamera=!!a&&sameChart&&a.x+44>__ATF_HUB__.camera.x&&a.x<__ATF_HUB__.camera.x+1280,
phase=e?.localOwner?'local:'+r.local?.stage:(logical?logical.stage+(logical.lift?':'+logical.lift.phase:'')+':'+logical.direction:'baseline'),
capturePhase=phase+(logical?.lift?.phase==='closing'&&logical.lift.elapsed>=.18?':partial-cover':'');
rows.push({wallTime:now/1000,session:o.session,bodyId:body?ids.get(body):null,actorChartVisible:sameChart,actorWithinCamera:inCamera,...r});
if(inCamera&&!shots[capturePhase])shots[capturePhase]={bitmap:bitmap(),observation:{phase:capturePhase,actorChartVisible:true,actorWithinCamera:true,
deck:r.deck,roomId:r.roomId,annex:r.annex,actor:a,relay:logical,local:r.local}};lastAt=now;}
requestAnimationFrame(frame);}requestAnimationFrame(frame);}''', {'c': c, 'session': session})


def collect_observer(page, c, session, frames):
    result = page.evaluate('''()=>{const q=window.__NPC_RELAY_NATIVE_QA__;if(!q)return{rows:[],shots:{}};q.stopped=true;
return{rows:q.rows,shots:Object.fromEntries(Object.entries(q.shots).map(([k,v])=>[k,{png:v.bitmap.toDataURL('image/png'),observation:v.observation}]))};}''')
    frames.extend(result['rows'])
    for index, (key, shot) in enumerate(result['shots'].items()):
        name = c['id'] + '-' + session + '-' + str(index).zfill(2) + '-' + key.replace(':', '-') + '.png'
        png(name, base64.b64decode(shot['png'].split(',', 1)[1]), shot['observation'])
    return result['rows']


def wait_body(page, c, stop, label, follow=False):
    deadline = time.monotonic() + args.journey_wall_seconds
    previous = None
    progress_at = time.monotonic()
    while time.monotonic() < deadline:
        r = observed(page, c)
        if stop(r):
            return r
        e = r['route'] or {}
        a = e.get('actor') or r['local']
        if not a:
            raise AssertionError(label + ': physical owner disappeared')
        key = json.dumps([a['x'], a['y'], a['stage'], (a.get('lift') or {}).get('phase'),
                          (a.get('lift') or {}).get('elapsed'), (r['local'] or {}).get('doorProgress'),
                          r['physicalOwners'], r['liftReservations'],
                          [(p['crewId'], p['x'], p['phase']) for p in (r['traffic'] or {}).get('actors', [])]])
        if key != previous:
            progress_at = time.monotonic()
            previous = key
        if time.monotonic() - progress_at > 90:
            raise AssertionError(label + ': no actual physical progress for90s: ' + json.dumps(r))
        if follow and not r['annex'] and r['deck'] == a.get('deck', c['deck']) and not a.get('lift'):
            actual = r['actualActor']
            if actual and actual['roomId'] != c['annexRoomId']:
                goal = c['cabinX'] if a['stage'] in ['walking-lift', 'waiting-lift'] else c['workGoalX']
                direction = 1 if goal > actual['x'] else -1
                gap = direction * (actual['x'] - r['player']['x'])
                if gap > 205:
                    page.keyboard.press('KeyD' if direction > 0 else 'KeyA', delay=100)
        page.wait_for_timeout(80)
    raise AssertionError(label + ': native wall budget exhausted')


def player_lift_to(page, c, deck):
    for attempt in range(12):
        r = observed(page, c)
        if r['deck'] == deck:
            return
        # A spectator waiting in the aperture would itself prevent an
        # arriving NPC cabin from opening. Wait outside both96px exits,
        # using real floor controls, before attempting the shared shaft.
        if any(v and v['shaftId'] == c['shaftId'] for v in r['liftReservations']):
            walk_to(page, c, c['cabinX'] - 160)
            page.wait_for_function('shaft=>!__ATF_HUB__.npcLiftCabinReservationV165?.(shaft)',
                                   arg=c['shaftId'], timeout=args.journey_wall_seconds * 1000)
        walk_to(page, c, c['cabinX'])
        r = observed(page, c)
        if any(v and v['shaftId'] == c['shaftId'] for v in r['liftReservations']):
            continue
        before = r['deck']
        page.locator('#hub-canvas').focus()
        # Native W goes toward the lower deck index; S toward the higher.
        page.keyboard.press('KeyS' if deck > before else 'KeyW')
        try:
            page.wait_for_function('before=>__ATF_HUB__.hubLiftTransitV163?.trip||__ATF_HUB__.state.deck!==before', arg=before, timeout=3000)
        except PlaywrightTimeout:
            continue
        page.wait_for_function('before=>__ATF_HUB__.state.deck!==before&&!__ATF_HUB__.hubLiftTransitV163?.trip', arg=before, timeout=90000)
    raise AssertionError('Native spectator lift failed to reach the real deck')


def enter_annex(page, c, entering):
    walk_to(page, c, c['parentX'] if entering else c['annexX'])
    page.keyboard.press('KeyE', delay=80)
    page.wait_for_function('want=>Boolean(__ATF_HUB__.currentAnnexV71?.())===want&&!__ATF_HUB__.annexTransitionV71', arg=entering, timeout=90000)


def reload_exact(page, c, field, session, frames):
    page.locator('#exit-hub').click()
    paused = observed(page, c)
    durable = page.evaluate('id=>JSON.parse(localStorage.getItem("atf-v47-profile-1")).hub.npcStationRelaysV166.routes[id]', c['id'])
    artifact(c['id'] + '-' + session + '-durable.json', durable)
    check(c['id'] + ': native exit persists exact ' + field, durable['actor'] == paused['route']['actor']
          and durable['localState'] == paused['route']['localState'])
    if field == 'closed carriage':
        check(c['id'] + ': saved outbound carriage remains covered on its actual source chart',
              durable['actor']['lift']['phase'] == 'travel' and durable['actor']['deck'] == c['stationDeck'])
    else:
        check(c['id'] + ': saved local handoff retains its real factory owner and annex support',
              durable['localOwner'] and durable['localState']['actor']['roomId'] == c['annexRoomId'])
    collect_observer(page, c, session, frames)
    page.wait_for_timeout(300)
    check(c['id'] + ': paused ' + field + ' remains stationary', observed(page, c)['route']['actor'] == durable['actor'])
    page.reload(wait_until='domcontentloaded')
    page.locator('#title-start').click(timeout=45000)
    page.locator('#title-options').click()
    page.evaluate(r'''c=>{document.addEventListener('click',function read(e){if(e.target.closest('[data-view]')?.dataset.view!=='hub')return;
document.removeEventListener('click',read);queueMicrotask(()=>{window.__NPC_RELAY_FIRST_RESUME__=(''' + READ + r''')(c);});});}''', c)
    open_hub(page)
    resumed = page.evaluate('()=>window.__NPC_RELAY_FIRST_RESUME__')
    check(c['id'] + ': first resumed frame keeps exact ' + field, resumed['route']['actor'] == durable['actor']
          and resumed['route']['localState'] == durable['localState'])
    check(c['id'] + ': resumed ownership binds one real body to exactly its current controller',
          resumed['localIsSame'] == durable['localOwner'] and resumed['ownerCount'] == 1 and resumed['visibleSingleton'])
    artifact(c['id'] + '-' + session + '-resumed.json', resumed)
    install_observer(page, c, session + '-resumed')


def dialogue(page, c):
    r = observed(page, c)
    a = r['actualActor']
    walk_to(page, c, a['x'] + (84 if r['player']['x'] > a['x'] else -84))
    page.wait_for_function('crew=>__ATF_HUB__.nearestAnnexNpcV141?.()?.crewId===crew', arg=c['crewId'])
    page.locator('#hub-canvas').focus()
    page.keyboard.press('KeyE', delay=80)
    page.locator('#hub-dialogue').wait_for(state='visible')
    who = page.locator('#hub-dialogue-speaker').inner_text()
    check(c['id'] + ': native E talks to the real transported local owner', ('Rook' if c['localId'] == 'rook-cctv' else 'Velez') in who)
    png(c['id'] + '-native-local-dialogue.png', page.screenshot(full_page=True), observed(page, c))
    page.locator('[data-npc-dialogue-choice]:not([disabled])').first.click()
    page.locator('#hub-dialogue-continue').click()
    page.wait_for_function('()=>__ATF_HUB__.running')


def local_return_ready(r, c):
    local = r['local']
    if not local or local['roomId'] != c['annexRoomId'] or local['stage'] != 'walking' or local['targetRoomId'] != c['parentRoomId']:
        return False
    if c['localId'] != 'rook-cctv' or args.comparison_stage == 'before':
        return True
    echo = r['echo']
    return echo is None or echo['roomId'] in ['bridge', 'briefing', 'combat-information', 'cryo-bay'] \
        and echo['x'] + echo['w'] + 12 <= c['parentX']


def occupied_local_arrival(r, c):
    local = r['local']
    if not local or local['reason'] != 'occupied' or local['roomId'] != c['annexRoomId'] \
            or local['crossings'] != 1 or local['stage'] not in ['opening', 'covering'] \
            or abs(local['x'] - c['annexX']) >= .26 or r['annex'] or r['deck'] != c['deck'] or r['playerDoorTransition']:
        return False
    p = r['player']
    return p['x'] < c['parentX'] + 44 and p['x'] + p['w'] > c['parentX'] \
        and p['y'] < 624 and p['y'] + p['h'] > 532 and abs(p['vx']) < 1


report['identityBefore'] = identity()
report['sourceCommit'] = report['identityBefore']['sourceCommit']
report['harnessCommit'] = subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=repo, text=True).strip()
report['harnessSha256'] = hashlib.sha256(Path(__file__).read_bytes()).hexdigest()
if args.expect_build and report['sourceCommit'] != args.expect_build:
    raise SystemExit('Served build differs from the declared observation.')
if args.expect_harness and (report['harnessCommit'] != args.expect_harness or subprocess.check_output(['git', 'status', '--porcelain'], cwd=repo, text=True).strip()):
    raise SystemExit('The QA harness is not the exact declared clean commit.')
source_start = manifest()
artifact('source-start.json', source_start)
with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True, **({'executable_path': os.environ['ATF_CHROMIUM_EXECUTABLE']} if os.environ.get('ATF_CHROMIUM_EXECUTABLE') else {}))
    report['tooling'] = {'playwright': importlib.metadata.version('playwright'), 'chromium': browser.version}
    try:
        for c in configs:
            if args.route not in ['all', c['id']]:
                continue
            phase(c['id'] + ': native05h station import')
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
            page.wait_for_function('()=>__ATF_V51__?.saveSystem.data.player.name==="QA station relays V166"')
            open_hub(page)
            initial = observed(page, c)
            check(c['id'] + ': initial native station body is unique,44x92 and supported at624', initial['visibleCount'] == 1
                  and initial['visibleSingleton'] and initial['actualActor']['roomId'] == c['stationRoomId']
                  and initial['actualActor']['w'] == 44 and initial['actualActor']['h'] == 92 and initial['actualActor']['y'] == 532)
            png(c['id'] + '-native0500-station.png', page.locator('#hub-canvas').screenshot(), initial)
            if args.comparison_stage == 'after':
                check(c['id'] + ': retained source is the actually observed05h station', initial['route']['stationOrigin']['x'] == initial['actualActor']['x']
                      and initial['route']['actor']['liftJourneys'] == 0 and initial['route']['actor']['distance'] == 0)
            command(page, c, 'colony-relief', 9)
            install_observer(page, c, 'outbound-source')
            if args.comparison_stage == 'after':
                wait_body(page, c, lambda r: bool((r['route'] or {}).get('actor', {}).get('lift')
                          and r['route']['actor']['lift']['phase'] == 'travel'), 'real outbound carriage', follow=True)
                reload_exact(page, c, 'closed carriage', 'outbound-source', frames)
                wait_body(page, c, lambda r: bool((r['route'] or {}).get('actor')
                          and r['route']['actor']['deck'] == c['deck'] and not r['route']['actor'].get('lift')),
                          'real destination exit')
            player_lift_to(page, c, c['deck'])
            wait_body(page, c, lambda r: bool(r['local'] and r['local']['roomId'] == c['annexRoomId']
                      and r['local']['stage'] == 'service'), 'real local service')
            enter_annex(page, c, True)
            visible = observed(page, c)
            check(c['id'] + ': destination annex shows one coherent existing identity', visible['visibleCount'] == 1 and visible['visibleSingleton'])
            png(c['id'] + '-native0900-local-post.png', page.locator('#hub-canvas').screenshot(), visible)
            if args.comparison_stage == 'after':
                check(c['id'] + ': local factory adopted the same transported body after a physical work arrival', visible['route']['localOwner']
                      and visible['localIsSame'] and visible['route']['actor']['liftJourneys'] == 1
                      and visible['route']['workBookmark']['source'] == 'actual-walking-arrival' and visible['local']['crossings'] == 1)
            dialogue(page, c)
            if args.comparison_stage == 'after':
                reload_exact(page, c, 'local owner', 'local-post', frames)
            # Wait inside the annex at its real player exit. In particular,
            # standing on the CIC floor aperture would itself block ECHO's
            # westbound courtesy passage and prevent Rook from returning.
            walk_to(page, c, c['annexX'])
            collect_observer(page, c, 'before-return-command', frames)
            command(page, c, 'frontier-recon', 12)
            install_observer(page, c, 'return-watch')
            ready = wait_body(page, c, lambda r: local_return_ready(r, c), 'real local release after physical passing clearance')
            artifact(c['id'] + '-return-release-readiness.json', ready)
            enter_annex(page, c, False)
            walk_to(page, c, c['parentX'])
            if args.comparison_stage == 'after':
                wait_body(page, c, lambda r: occupied_local_arrival(r, c), 'occupied real work arrival')
                occupied = observed(page, c)
                png(c['id'] + '-native1200-occupied-local-arrival.png', page.locator('#hub-canvas').screenshot(), occupied)
                check(c['id'] + ': the real parent occupant prevents a local-owner chart handoff', occupied['route']['localOwner']
                      and occupied['localIsSame'] and occupied['local']['crossings'] == 1)
                walk_to(page, c, c['clear'])
                wait_body(page, c, lambda r: bool((r['route'] or {}).get('actor') and not r['route']['localOwner']
                          and r['route']['actor']['direction'] == 'return'), 'real local restitution')
                wait_body(page, c, lambda r: bool((r['route'] or {}).get('actor', {}).get('lift')
                          and r['route']['actor']['lift']['phase'] == 'travel'), 'real return carriage', follow=True)
                wait_body(page, c, lambda r: bool((r['route'] or {}).get('returned')), 'exact observed station return')
                player_lift_to(page, c, c['stationDeck'])
                final = observed(page, c)
                origin = initial['route']['stationOrigin']
                check(c['id'] + ': both timed carriages and two local leaves return the same held body to its exact05h bookmark',
                      final['route']['returned']['x'] == origin['x'] and final['route']['returned']['roomId'] == origin['roomId']
                      and final['route']['returned']['liftJourneys'] == 2 and final['route']['returned']['localCrossings'] == 2
                      and final['route']['returned']['observedTravel'] is True and final['actualActor']['x'] == origin['x']
                      and final['actualActor']['roomId'] == origin['roomId'] and not final['localIsSame'])
                walk_to(page, c, origin['x'] + (84 if final['player']['x'] > origin['x'] else -84))
                final = observed(page, c)
                check(c['id'] + ': the native spectator sees the returned station singleton', final['visibleCount'] == 1 and final['visibleSingleton'])
                png(c['id'] + '-native1200-returned-station.png', page.locator('#hub-canvas').screenshot(), final)
            else:
                # Baseline comparison deliberately records its real local
                # circuit and absent station relay without claiming a flight.
                walk_to(page, c, c['clear'])
                wait_body(page, c, lambda r: bool(r['local'] and r['local']['roomId'] == c['parentRoomId']
                          and r['local']['stage'] == 'service' or (r['localRecord'] or {}).get('nativeHandoff', {})
                          and r['localRecord']['nativeHandoff']['fromRoomId'] == c['parentRoomId']), 'baseline local return')
                baseline = observed(page, c)
                check(c['id'] + ': actual baseline has no V166 station transport ledger', baseline['route'] is None)
                player_lift_to(page, c, c['stationDeck'])
                png(c['id'] + '-baseline1200-station-comparison.png', page.locator('#hub-canvas').screenshot(), observed(page, c))
            collect_observer(page, c, 'finished', frames)
            artifact(c['id'] + '-native-trace.json', frames)
            if args.comparison_stage == 'after':
                sessions = {}
                for row in frames:
                    if row['bodyId'] is not None:
                        sessions.setdefault(row['session'], set()).add(row['bodyId'])
                check(c['id'] + ': each uninterrupted runtime session retains one object identity', all(len(ids) == 1 for ids in sessions.values()))
                check(c['id'] + ': every visible phase preserves one matching native identity', all(row['visibleCount'] <= 1 and row['visibleSingleton'] for row in frames))
            report['routes'].append({'id': c['id'], 'status': 'passed', 'stationLoopObserved': args.comparison_stage == 'after'})
            context.close()
        check('native game has no runtime, request or HTTP errors', not report['pageErrors'] and not report['requestFailures'] and not report['httpErrors'])
        report['status'] = 'passed'
    except Exception as error:
        report['status'] = 'failed'
        report['error'] = str(error)
        try:
            report['failureState'] = observed(page, c)
            png('failure.png', page.screenshot(full_page=True), report['failureState'])
        except Exception as capture_error:
            report['captureError'] = str(capture_error)
        raise
    finally:
        browser.close()
        report['identityAfter'] = identity()
        source_end = manifest()
        artifact('source-end.json', source_end)
        report['sourceUnchanged'] = source_start == source_end
        report['sameBuild'] = report['identityBefore'] == report['identityAfter']
        report['stationLoopsObserved'] = sum(row['stationLoopObserved'] for row in report['routes']) if report['status'] == 'passed' else 0
        if not report['sourceUnchanged'] or not report['sameBuild']:
            report['status'] = 'failed'
            report['stationLoopsObserved'] = 0
        report['finishedAt'] = datetime.datetime.now(datetime.timezone.utc).isoformat()
        artifact('report.json', report)
if report['status'] != 'passed':
    raise SystemExit(1)
