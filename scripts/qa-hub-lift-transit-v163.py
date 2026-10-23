"""Eight real Tantalus lift faces, native trips and mid-travel Save/resume.

Only declared initial profiles use the native Save input. Every journey starts
with an actual W/S key. Browser evaluation is read-only, including a document-click
microtask observer of the first synchronous native resumed draw.
"""
import argparse
import base64
import hashlib
import importlib.metadata
import json
import math
import os
from pathlib import Path
import subprocess
import urllib.request
from playwright.sync_api import sync_playwright

parser = argparse.ArgumentParser()
parser.add_argument('--base', default=os.environ.get('ATF_BASE_URL', 'http://127.0.0.1:4187'))
parser.add_argument('--output', type=Path, required=True)
parser.add_argument('--comparison-stage', choices=['before', 'after'], default='after')
parser.add_argument('--shafts', nargs='+', choices=['midship', 'aft'], default=['midship', 'aft'])
parser.add_argument('--decks', nargs='+', choices=[0, 1, 2, 3], type=int, default=[0, 1, 2, 3])
parser.add_argument('--fixture-dir', type=Path, help='Reuse already disclosed initial JSON byte-for-byte for a baseline comparison.')
parser.add_argument('--prepare-only', action='store_true')
args = parser.parse_args()
repo = Path(__file__).resolve().parents[1]
output = args.output.resolve()
if output == repo or repo in output.parents:
    raise SystemExit('Keep evidence outside the repository.')
output.mkdir(parents=True, exist_ok=True)
report = {'status': 'running', 'comparisonStage': args.comparison_stage, 'phase': 'prepare', 'checks': [], 'captures': [],
          'faces': [], 'fixtures': [], 'pageErrors': [], 'requestFailures': [], 'httpErrors': [],
          'method': 'Disclosed completed-onboarding initial profiles at a real lift socket minus60px; native Save input and hub navigation; if a native ladder masks the lift affordance, real A/D floor walking toward the cabin followed by key release and complete braking; then W/S. Read-only RAF/canvas capture preserves fixtureInitial separately from the actual pre-boarding initial pose; native exit during travel, actual page reload and document-click-microtask observation of synchronous native resume.',
          'limitations': ['Automated Chromium, not four human QA participants or canonical1:1 certification.',
                         'Eight player lift faces are observed. Physical cross-deck NPC locomotion is not claimed.',
                         'The source/destination coordinate chart changes behind native closed leaves; no new back-facing sprite is supplied.',
                         'The before stage accepts and records the historical instantaneous trip; it is comparison evidence, not V163 feature validation.',
                         'Source/cabin/door geometry and actual painted frames support the coverage assertions; image pixel ownership is not inferred from bounding boxes.']}


def phase(label):
    report['phase'] = label
    print('STEP ' + label, flush=True)


def check(label, condition):
    assert condition, label
    report['checks'].append(label)
    print('PASS ' + label, flush=True)


def identity():
    with urllib.request.urlopen(args.base.rstrip('/') + '/build-info.json', timeout=20) as response:
        raw = response.read()
    info = json.loads(raw)
    return {'sourceCommit': info['sourceCommit'], 'buildId': info['buildId'], 'buildInfoSha256': hashlib.sha256(raw).hexdigest()}


def fixture(shaft, deck):
    name = f'initial-lift-{shaft}-deck{deck}.json'
    if args.fixture_dir:
        raw = (args.fixture_dir.resolve() / name).read_bytes()
        profile = json.loads(raw)
        config = {'shaftId': 'hub-' + shaft + '-lift', 'fromDeck': deck,
                  'toDeck': deck + (1 if deck in [0, 2] else -1), 'key': 'KeyS' if deck in [0, 2] else 'KeyW'}
    else:
        code = """import{createDefaultSave}from'./src/save.js';import{HUB_DECKS,HUB_WORLD}from'./src/hub-game.js';
import{buildHubDoorNetworkV58}from'./src/topology-coherence-v58.js';
import{createPlayerOnboardingV84,normalizePlayerOnboardingV84}from'./src/player-onboarding-v84.js';
const shaft='hub-'+process.argv[1]+'-lift',deck=Number(process.argv[2]),s=createDefaultSave();
const lift=buildHubDoorNetworkV58(HUB_DECKS,HUB_WORLD,deck).find(d=>d.shaftId===shaft),direction=[0,2].includes(deck)?1:-1;
s.needsPlayerCreationV84=false;s.player.name='QA Lift '+process.argv[1]+' '+deck+' V163';s.scene='command';
s.settings.reducedMotion=false;s.onboardingV84=normalizePlayerOnboardingV84({...createPlayerOnboardingV84({name:s.player.name,callsign:'LIFT163'}),phase:'complete'});
Object.assign(s.hub,{deck,roomId:lift.roomId,positionX:lift.x-22-60,positionY:HUB_WORLD.floorY-92,facing:1});
console.log(JSON.stringify({profile:s,config:{shaftId:shaft,fromDeck:deck,toDeck:deck+direction,key:direction===1?'KeyS':'KeyW',lift}}));"""
        data = json.loads(subprocess.run(['node', '--input-type=module', '-e', code, shaft, str(deck)], cwd=repo,
                                         capture_output=True, text=True, check=True).stdout)
        profile, config = data['profile'], data['config']
        raw = json.dumps(profile, ensure_ascii=False, separators=(',', ':')).encode()
    (output / name).write_bytes(raw)
    report['fixtures'].append({'file': name, 'sha256': hashlib.sha256(raw).hexdigest(), 'config': config,
                               'declaredChanges': ['named isolated existing identity', 'needsPlayerCreationV84=false', 'completed onboarding initial condition',
                                                   'scene=command', 'reducedMotion=false', 'existing native lift room/deck', 'native standing floor and lift.x-22-60px'],
                               'unchanged': ['native resources/loadout', 'clock', 'NPC roster/timetable', 'native lift geometry']})
    return profile, config, raw


def supplemental_fixture(kind):
    filename = {'cancel': 'initial-lift-cancel-midship-deck1.json',
                'occupied': 'initial-lift-occupied-midship-deck3-1230.json'}[kind]
    saved_path = args.fixture_dir.resolve() / filename if args.fixture_dir else None
    if saved_path and saved_path.exists():
        raw = saved_path.read_bytes()
        profile = json.loads(raw)
    else:
        code = """import{createDefaultSave}from'./src/save.js';import{HUB_DECKS,HUB_WORLD}from'./src/hub-game.js';
import{buildHubDoorNetworkV58}from'./src/topology-coherence-v58.js';
import{createPlayerOnboardingV84,normalizePlayerOnboardingV84}from'./src/player-onboarding-v84.js';
const occupied=process.argv[1]==='occupied',deck=occupied?3:1,s=createDefaultSave();
const lift=buildHubDoorNetworkV58(HUB_DECKS,HUB_WORLD,deck).find(d=>d.shaftId==='hub-midship-lift');
s.needsPlayerCreationV84=false;s.player.name=occupied?'QA Lift occupied1230 V163':'QA Lift cancellation V163';s.scene='command';s.settings.reducedMotion=false;
s.onboardingV84=normalizePlayerOnboardingV84({...createPlayerOnboardingV84({name:s.player.name,callsign:'LIFT163'}),phase:'complete'});
if(occupied)s.clock.hour=12.5;
Object.assign(s.hub,{deck,roomId:lift.roomId,positionX:lift.x-22+(occupied?120:-60),positionY:HUB_WORLD.floorY-92,facing:1});
console.log(JSON.stringify(s));"""
        profile = json.loads(subprocess.run(['node', '--input-type=module', '-e', code, kind], cwd=repo,
            capture_output=True, text=True, check=True).stdout)
        raw = json.dumps(profile, ensure_ascii=False, separators=(',', ':')).encode()
    config = {'shaftId': 'hub-midship-lift', 'fromDeck': 3 if kind == 'occupied' else 1,
              'toDeck': 2 if kind == 'occupied' else 0, 'key': 'KeyW'}
    (output / filename).write_bytes(raw)
    changes = ['named isolated existing identity', 'completed onboarding initial condition', 'scene=command',
               'reducedMotion=false', 'native midship room/deck and ' + ('lift.x-22+120px' if kind == 'occupied' else 'lift.x-22-60px'), 'native standing floor']
    if kind == 'occupied':
        changes.append('initial strategic clock=day1 12h30; existing NPC timetable supplies the occupied destination')
    report['fixtures'].append({'file': filename, 'sha256': hashlib.sha256(raw).hexdigest(), 'config': config,
        'supplementalCase': kind, 'declaredChanges': changes,
        'unchanged': ['native resources/loadout', 'NPC roster/timetable/positions', 'native lift geometry', 'no imported trip or result']})
    return profile, config, raw


fixtures = {(shaft, deck): fixture(shaft, deck) for shaft in args.shafts for deck in args.decks}
supplemental = {kind: supplemental_fixture(kind) for kind in ['cancel', 'occupied']} if args.comparison_stage == 'after' else {}
if supplemental:
    report['supplementalCases'] = ['native-E-cancel-returning-save-reload', 'native-touch-cancel-returning-save-reload', 'native12h30-occupied-arrival-refusal']
    report['method'] += ' After the unchanged face matrix: actual E cancellation before handoff, durable returning/source reopening and restored walking controls; repeat the same cancellation fixture in a390x900 mobile touch context using a real tap on the visible interact button, with a window-pointerdown microtask observer after native target handlers; then a declared12h30 reactor profile whose unchanged native timetable occupies deck2/armory, real W/S refusal and retained held walking input.'
if args.prepare_only:
    report['status'] = 'fixtures-prepared-no-browser'
    (output / 'report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2))
    print(json.dumps({'status': report['status'], 'fixtures': len(fixtures) + len(supplemental)}))
    raise SystemExit(0)
report['identityBefore'] = identity()

OBSERVE = """c=>{const h=__ATF_HUB__,s=__ATF_V51__.saveSystem.data,a=h.player,
 d=h.doorStates?.find(d=>d.shaftId===c.shaftId),paint=d&&h.hubSpatialLiftsV136?.get(d.id);
 return {running:h.running,time:h.animationTime,deck:h.state?.deck,roomId:h.state?.roomId,
 player:a?{x:a.x,y:a.y,w:a.w,h:a.h,vx:a.vx,vy:a.vy,facing:a.facing,grounded:a.grounded,climbing:!!a.climbing,health:a.health}:null,
 camera:h.camera?{...h.camera}:null,
 lift:d?{id:d.id,shaftId:d.shaftId,x:d.x,roomId:d.roomId,progress:d.progress,deckIndex:d.deckIndex,
 destinations:d.destinations.map(v=>({deckIndex:v.deckIndex,roomId:v.roomId,destinationX:v.destinationX}))}:null,
 trip:h.hubLiftTransitV163?.trip?structuredClone(h.hubLiftTransitV163.trip):null,
 serial:h.hubLiftTransitV163?.serial??null,blocked:!!h.liftBlockedV163,
 departureBlocked:h.liftDepartureBlockedV163?structuredClone(h.liftDepartureBlockedV163):null,
 painted:paint?structuredClone(paint):null,
 anatomy:a?.playerAppearanceVisualV126?{drawn:a.playerAppearanceVisualV126.drawn,body:a.playerAppearanceVisualV126.body,locomotion:a.playerAppearanceVisualV126.locomotion}:null,
 affordance:a&&h.state?{liftShaftId:h.nearestLift?.()?.shaftId||null,
 ladder:h.nearestTraversalLadder?.()?structuredClone(h.nearestTraversalLadder()):null}:null,
 prompt:a&&h.state?h.statusPrompt?.():null,input:[...(h.keys||[])],annex:a&&h.state?(h.currentAnnexV71?.()?.id||null):null,
 savedHub:structuredClone(s.hub),protected:{clock:structuredClone(s.clock),resources:structuredClone(s.galaxy.resources),
 player:structuredClone(s.player),strategy:structuredClone(s.strategy)}};}"""


def observed(page, config):
    return page.evaluate(OBSERVE, config)


def open_hub(page):
    menu = page.locator('#menu-toggle')
    if menu.is_visible() and 'open' not in (page.locator('.rail').get_attribute('class') or '').split():
        menu.click()
    page.locator('#nav [data-view="hub"]').click()
    page.wait_for_function('()=>__ATF_HUB__?.running&&__ATF_HUB__.player.grounded', timeout=90000)
    page.wait_for_function('()=>__ATF_HUB__.player.playerAppearanceVisualV126?.drawn', timeout=90000)
    page.locator('#hub-canvas').focus()


def save_frame(name, frame):
    png = frame.pop('png')
    (output / name).write_bytes(base64.b64decode(png.split(',')[1]))
    report['captures'].append({'file': name, 'state': frame})


def capture(page, config, name):
    frame = page.evaluate('''c=>({...(''' + OBSERVE + ''')(c),png:document.querySelector('#hub-canvas').toDataURL('image/png')})''', config)
    save_frame(name, frame)


def approach_native_lift(page, config, label, fixture_initial):
    if fixture_initial['affordance']['liftShaftId'] == config['shaftId']:
        return fixture_initial, None
    check(label + ': the unmodified source fixture exposes a real ladder before its nearby lift',
          fixture_initial['affordance']['ladder'] is not None
          and fixture_initial['lift']['shaftId'] == config['shaftId']
          and fixture_initial['player']['grounded'] and not fixture_initial['player']['climbing'])
    phase(label + ': native floor approach clears ladder priority before W/S')
    cabin_x = fixture_initial['lift']['x'] - fixture_initial['player']['w'] / 2
    key = 'KeyD' if cabin_x > fixture_initial['player']['x'] else 'KeyA'
    page.evaluate('''c=>{window.__V163_LIFT_APPROACH__=new Promise(resolve=>{
      const rows=[],started=performance.now();let nativeStart=null,lastX=null,lastProgress=started;
      function frame(){const row=(''' + OBSERVE + ''')(c),now=performance.now();rows.push(row);
        nativeStart??=row.time;
        if(lastX===null||Math.abs(row.player.x-lastX)>=.25){lastX=row.player.x;lastProgress=now;}
        const ready=row.affordance.liftShaftId===c.shaftId&&row.player.grounded
          &&!row.player.climbing&&row.player.vx===0;
        const invalid=!row.running||row.deck!==c.fromDeck||row.trip
          ||!row.player.grounded||row.player.climbing||Math.abs(row.player.y+row.player.h-624)>.001;
        if(ready||invalid||now-started>30000||row.time-nativeStart>3||now-lastProgress>6000){
          resolve({rows,status:ready?'ready':'failed',reason:ready?'native-lift-affordance-after-braking'
            :invalid?'native-source-support-or-chart-changed':now-started>30000?'wall-budget'
            :row.time-nativeStart>3?'simulation-budget':'no-physical-progress'});return;}
        requestAnimationFrame(frame);
      }requestAnimationFrame(frame);
    });}''', config)
    page.locator('#hub-canvas').focus()
    page.keyboard.down(key)
    try:
        page.wait_for_function('''shaft=>__ATF_HUB__.nearestLift?.()?.shaftId===shaft
          &&__ATF_HUB__.player.grounded&&!__ATF_HUB__.player.climbing''', arg=config['shaftId'], timeout=15000)
    finally:
        page.keyboard.up(key)
    page.wait_for_function('()=>__ATF_HUB__.player.vx===0&&__ATF_HUB__.player.grounded&&!__ATF_HUB__.player.climbing', timeout=15000)
    trace = page.evaluate('()=>window.__V163_LIFT_APPROACH__')
    initial = observed(page, config)
    trace.update({'key': key, 'fixtureInitial': fixture_initial, 'initial': initial})
    (output / (label + '-native-floor-approach.json')).write_text(json.dumps(trace, ensure_ascii=False, indent=2))
    check(label + ': real keyboard approach reaches and brakes at the actual lift affordance',
          trace['status'] == 'ready' and initial['affordance']['liftShaftId'] == config['shaftId']
          and initial['player']['vx'] == 0 and abs(initial['player']['x'] - fixture_initial['player']['x']) > .25
          and all(row['deck'] == config['fromDeck'] and row['roomId'] == fixture_initial['roomId']
                  and not row['trip'] and row['player']['grounded'] and not row['player']['climbing']
                  and row['player']['w'] == 44 and row['player']['h'] == 92
                  and abs(row['player']['y'] + row['player']['h'] - 624) < .001 for row in trace['rows']))
    check(label + ': floor approach uses bounded native steps and preserves resources and strategic time',
          initial['protected'] == fixture_initial['protected']
          and all(row['protected'] == fixture_initial['protected'] for row in trace['rows'])
          and all(abs(b['player']['x'] - a['player']['x']) <= 270 * max(0, b['time'] - a['time']) + .01
                  for a, b in zip(trace['rows'], trace['rows'][1:])))
    capture(page, config, label + '-source-after-native-approach.png')
    return initial, trace


def install_observer(page, config):
    page.evaluate('''c=>{window.__V163_LIFT_OBSERVER__=new Promise((resolve,reject)=>{
      const rows=[],frames={},started=performance.now();let began=false;
      function finish(reason){resolve({rows,frames,reason});}
      function frame(){const row=(''' + OBSERVE + ''')(c);
        if(row.running){began=true;rows.push(row);
          const endDeck=c.observerEndDeck??c.toDeck,endPhase=c.observerTerminalPhase||'arrived';
          const phase=row.trip?.phase||((row.deck===endDeck)?endPhase:'source');
          const progress=row.painted?.interior?.progress;
          const mid=phase==='closing'||phase==='opening'||phase==='returning';
          if(!frames[phase]&&(!mid||(progress>=.3&&progress<=.7)))
            frames[phase]={...row,png:document.querySelector('#hub-canvas').toDataURL('image/png')};
          if(row.deck===endDeck&&!row.trip){finish(endPhase);return;}}
        else if(began){rows.push(row);finish('native-exit');return;}
        if(performance.now()-started>120000){reject(Error('Native lift journey timed out'));return;}
        requestAnimationFrame(frame);
      }requestAnimationFrame(frame);
    });}''', config)


def collect(page, label, segment):
    result = page.evaluate('()=>window.__V163_LIFT_OBSERVER__')
    for key, frame in result['frames'].items():
        save_frame(f'{label}-{segment}-{key}.png', frame)
    (output / f'{label}-{segment}-frames.json').write_text(json.dumps(result['rows'], ensure_ascii=False, indent=2))
    return result


def first_resume_observer(page, config):
    # This observes the native hub click after all synchronous handlers return,
    # before a scheduled engine RAF can advance the saved trip. The listener
    # only reads state/canvas; it does not invoke or patch any game function.
    page.evaluate('''c=>{window.__V163_FIRST_RESUME__=new Promise(resolve=>{
      const listener=event=>{if(!event.target.closest?.('#nav [data-view="hub"]'))return;
        document.removeEventListener('click',listener);
        queueMicrotask(()=>resolve({...(''' + OBSERVE + ''')(c),png:document.querySelector('#hub-canvas').toDataURL('image/png')}));
      };document.addEventListener('click',listener);
    });}''', config)


def reload_midtravel(page, config, label):
    phase(label + ': native exit while travel is closed, real reload, exact native first resumed state')
    page.wait_for_function('''()=>{const t=__ATF_HUB__.hubLiftTransitV163?.trip;
      return t?.phase==='travel'&&t.elapsed>=.12;}''')
    page.locator('#exit-hub').click()
    stopped = observed(page, config)
    partial = collect(page, label, 'outbound-before-reload')
    durable = stopped['savedHub']
    check(label + ': ordinary hub exit persists the exact closed travelling trip', not stopped['running']
          and stopped['trip']['phase'] == 'travel' and durable['hubLiftTransitV163']['trip'] == stopped['trip']
          and durable['deck'] == config['fromDeck'] and durable['positionX'] == stopped['player']['x']
          and durable['positionY'] == stopped['player']['y'])
    (output / (label + '-durable-midtravel.json')).write_text(json.dumps(durable, ensure_ascii=False, indent=2))
    page.reload(wait_until='domcontentloaded')
    page.locator('#title-start').click(timeout=45000)
    page.locator('#title-options').click()
    reloaded = observed(page, config)
    check(label + ': actual page reload retains the exact saved trip before hub entry', reloaded['savedHub']['hubLiftTransitV163'] == durable['hubLiftTransitV163']
          and reloaded['savedHub']['positionX'] == durable['positionX'] and reloaded['savedHub']['deck'] == durable['deck'])
    install_observer(page, config)
    first_resume_observer(page, config)
    open_hub(page)
    first = page.evaluate('()=>window.__V163_FIRST_RESUME__')
    first_state = {key: value for key, value in first.items() if key != 'png'}
    save_frame(label + '-first-native-resumed-draw.png', first)
    check(label + ': synchronous native resume restores exact phase, elapsed, shaft and supported pose', first_state['running']
          and first_state['trip'] == durable['hubLiftTransitV163']['trip'] and first_state['deck'] == durable['deck']
          and first_state['player']['x'] == durable['positionX'] and first_state['player']['y'] == durable['positionY'])
    remaining = collect(page, label, 'outbound-after-reload')
    report.setdefault('resumes', []).append({'id': label, 'stopped': stopped, 'reloadedBeforeEntry': reloaded, 'firstNativeDraw': first_state})
    return partial['rows'] + remaining['rows']


def verify_journey(label, config, initial, rows, final):
    live_rows = [row for row in rows if row['running']]
    check(label + ': native key reaches its actual paired socket and keeps the standing floor', final['deck'] == config['toDeck']
          and final['lift']['shaftId'] == config['shaftId'] and abs(final['player']['y'] + final['player']['h'] - 624) < .001
          and final['player']['w'] == 44 and final['player']['h'] == 92 and not final['annex'])
    check(label + ': walking/lift activity preserves strategic clock, inventory and resources', final['protected'] == initial['protected'])
    if args.comparison_stage == 'before':
        return {'instantaneousComparison': True, 'observedPhases': sorted({row['trip']['phase'] for row in live_rows if row['trip']}),
                'nativeHorizontalDisplacement': final['player']['x'] - initial['player']['x']}
    trip_rows = [row for row in live_rows if row['trip']]
    phases = {row['trip']['phase'] for row in trip_rows}
    check(label + ': all four native stages are physically observed', phases == {'boarding', 'closing', 'travel', 'opening'})
    check(label + ': every observed body keeps one44x92 supported pose', all(row['player']['w'] == 44 and row['player']['h'] == 92
          and abs(row['player']['y'] + row['player']['h'] - 624) < .001 and row['player']['grounded'] for row in trip_rows))
    check(label + ': boarding moves at most the native bounded walking speed', all(
          abs(b['player']['x'] - a['player']['x']) <= 90 * max(0, b['time'] - a['time']) + .01
          for a, b in zip(live_rows, live_rows[1:]) if a['trip'] and b['trip'] and b['time'] >= a['time']))
    changes = [(a, b) for a, b in zip(live_rows, live_rows[1:]) if a['deck'] != b['deck']]
    check(label + ': exactly one chart change occurs behind closed paired leaves at identical X/feet', len(changes) == 1 and all(
          a['trip'] and b['trip'] and a['trip']['phase'] == 'travel' and b['trip']['phase'] == 'opening'
          and a['lift']['progress'] == 0 and abs(a['player']['x'] - b['player']['x']) < .001
          and abs(a['player']['y'] + a['player']['h'] - b['player']['y'] - b['player']['h']) < .001 for a, b in changes))
    painted = [row['painted']['interior'] for row in trip_rows if row['painted'] and row['painted'].get('interior')]
    check(label + ': rendered paired faces keep the same frontal native size and floor', len(painted) >= 3
          and all(m['projection'] == 'frontal' and abs(m['target']['h'] - 156) < .001
                  and abs(m['target']['y'] + m['target']['h'] - 624) < .001
                  and abs(m['target']['w'] / m['target']['h'] - 187 / 191) < 1e-6 for m in painted)
          and abs(final['player']['x'] - final['lift']['x'] + 22) < .001)
    return {'instantaneousComparison': False, 'observedPhases': sorted(phases), 'observedFrames': len(live_rows),
            'chartChanges': len(changes), 'nativeHorizontalDisplacement': final['player']['x'] - initial['player']['x'],
            'maximumObservedDoorHeight': max(m['target']['h'] for m in painted)}


def supplemental_page(browser, profile, config, raw, label, input_mode='keyboard'):
    context_options = {'viewport': {'width': 1600, 'height': 1000}, 'service_workers': 'block'}
    if input_mode == 'touch':
        context_options.update(viewport={'width': 390, 'height': 900}, has_touch=True, is_mobile=True)
    context = browser.new_context(**context_options)
    page = context.new_page()
    page.set_default_timeout(90000)
    page.on('pageerror', lambda error: report['pageErrors'].append(str(error)))
    page.on('requestfailed', lambda request: report['requestFailures'].append({'url': request.url, 'failure': request.failure}))
    page.on('response', lambda response: report['httpErrors'].append({'url': response.url, 'status': response.status}) if response.status >= 400 else None)
    page.on('dialog', lambda dialog: dialog.accept())
    page.goto(args.base, wait_until='domcontentloaded')
    page.locator('#title-start').click(timeout=45000)
    page.locator('#title-options').click()
    page.locator('#save-import').set_input_files({'name': label + '.json', 'mimeType': 'application/json', 'buffer': raw})
    page.wait_for_function('name=>__ATF_V51__.saveSystem.data.player.name===name', arg=profile['player']['name'])
    open_hub(page)
    return context, page


def prove_source_controls(page, config, label, initial):
    # Walk back over the same admitted approach, using actual native keys.
    # A returning cabin or a refused departure must not retain input ownership.
    origin = observed(page, config)['player']['x']
    page.locator('#hub-canvas').focus()
    page.keyboard.down('KeyA')
    try:
        page.wait_for_function('x=>__ATF_HUB__.player.x<=x-16', arg=origin, timeout=15000)
    finally:
        page.keyboard.up('KeyA')
    page.wait_for_function('()=>__ATF_HUB__.player.vx===0')
    moved = observed(page, config)
    check(label + ': native walking controls return on the original supported floor', moved['deck'] == config['fromDeck']
          and moved['trip'] is None and moved['player']['x'] < origin - 12 and moved['player']['grounded']
          and abs(moved['player']['y'] + moved['player']['h'] - 624) < .001 and moved['anatomy']['drawn'])
    check(label + ': returned controls do not spend strategic time, inventory or resources', moved['protected'] == initial['protected'])
    capture(page, config, label + '-source-walking-controls.png')
    return moved


def cancellation_case(page, profile, config, input_mode='keyboard'):
    label = 'midship-cancel-during-travel' + ('-touch' if input_mode == 'touch' else '')
    phase(label + ': actual ' + ('touch-button tap' if input_mode == 'touch' else 'E')
          + ' cancellation, durable returning phase and native reload')
    initial = observed(page, config)
    capture(page, config, label + '-source.png')
    if input_mode == 'touch':
        page.locator('[data-hub-control="interact"]').scroll_into_view_if_needed()
    install_observer(page, config)
    page.keyboard.press(config['key'])
    page.wait_for_function('()=>{const t=__ATF_HUB__.hubLiftTransitV163?.trip;return t?.phase==="travel"&&t.elapsed>=.12;}')
    travelling = observed(page, config)
    # Window bubble observes the real keyboard or button-pointer dispatch after
    # its native handlers, before RAF advances the new returning phase.
    page.evaluate('''c=>{window.__V163_FIRST_CANCEL__=new Promise(resolve=>{
      const touch=c.inputMode==='touch',eventType=touch?'pointerdown':'keydown';
      const listener=event=>{
        if(touch?!event.target.closest?.('[data-hub-control="interact"]')||event.pointerType!=='touch'
          :event.code!=='KeyE'||event.target.id!=='hub-canvas')return;
        window.removeEventListener(eventType,listener);
        const cancellationInput={type:event.type,isTrusted:event.isTrusted,pointerType:event.pointerType||null,
          control:touch?'interact':'KeyE'};
        queueMicrotask(()=>resolve({...(''' + OBSERVE + ''')(c),cancellationInput,
          png:document.querySelector('#hub-canvas').toDataURL('image/png')}));
      };window.addEventListener(eventType,listener);
    });}''', {**config, 'inputMode': input_mode})
    if input_mode == 'touch':
        page.locator('[data-hub-control="interact"]').tap()
    else:
        page.keyboard.press('KeyE')
    first = page.evaluate('()=>window.__V163_FIRST_CANCEL__')
    first_state = {key: value for key, value in first.items() if key != 'png'}
    save_frame(label + '-first-native-returning-draw.png', first)
    check(label + ': ' + ('visible touch button' if input_mode == 'touch' else 'E')
          + ' creates a real source-deck return without rewind or chart handoff', first_state['trip']['phase'] == 'returning'
          and first_state['trip']['elapsed'] == 0 and first_state['trip']['id'] == travelling['trip']['id']
          and first_state['trip']['fromDeck'] == travelling['trip']['fromDeck']
          and first_state['trip']['toDeck'] == travelling['trip']['toDeck']
          and first_state['deck'] == config['fromDeck'] and first_state['player']['x'] == travelling['player']['x']
          and first_state['player']['y'] == travelling['player']['y'] and first_state['lift']['progress'] == 0)
    check(label + ': cancellation comes from the real requested browser input', first_state['cancellationInput']['isTrusted']
          and first_state['cancellationInput']['type'] == ('pointerdown' if input_mode == 'touch' else 'keydown')
          and (input_mode != 'touch' or first_state['cancellationInput']['pointerType'] == 'touch'))
    page.locator('#exit-hub').click()
    stopped = observed(page, config)
    partial = collect(page, label, 'before-reload')
    durable = stopped['savedHub']
    check(label + ': native exit durably preserves the exact returning source pose', not stopped['running']
          and stopped['trip']['phase'] == 'returning' and durable['hubLiftTransitV163']['trip'] == stopped['trip']
          and durable['deck'] == config['fromDeck'] and durable['roomId'] == initial['roomId']
          and durable['positionX'] == stopped['player']['x'] and durable['positionY'] == stopped['player']['y'])
    (output / (label + '-durable-returning.json')).write_text(json.dumps(durable, ensure_ascii=False, indent=2))
    page.reload(wait_until='domcontentloaded')
    page.locator('#title-start').click(timeout=45000); page.locator('#title-options').click()
    reloaded = observed(page, config)
    check(label + ': page reload retains returning identity, elapsed and source coordinates exactly',
          reloaded['savedHub']['hubLiftTransitV163'] == durable['hubLiftTransitV163']
          and reloaded['savedHub']['deck'] == durable['deck'] and reloaded['savedHub']['roomId'] == durable['roomId']
          and reloaded['savedHub']['positionX'] == durable['positionX'] and reloaded['savedHub']['positionY'] == durable['positionY'])
    return_config = {**config, 'observerEndDeck': config['fromDeck'], 'observerTerminalPhase': 'source-reopened'}
    install_observer(page, return_config); first_resume_observer(page, config); open_hub(page)
    resumed = page.evaluate('()=>window.__V163_FIRST_RESUME__')
    resumed_state = {key: value for key, value in resumed.items() if key != 'png'}
    save_frame(label + '-first-native-resumed-returning-draw.png', resumed)
    check(label + ': first synchronous native resumed draw restores the exact returning chart and pose',
          resumed_state['trip'] == durable['hubLiftTransitV163']['trip'] and resumed_state['deck'] == durable['deck']
          and resumed_state['player']['x'] == durable['positionX'] and resumed_state['player']['y'] == durable['positionY'])
    remaining = collect(page, label, 'after-reload')
    final = observed(page, config)
    rows = partial['rows'] + remaining['rows']
    live = [row for row in rows if row['running']]
    check(label + ': cancellation never changes native decks or rewinds the cabin pose',
          all(row['deck'] == config['fromDeck'] for row in live)
          and all(row['player']['x'] == travelling['player']['x'] and row['player']['y'] == travelling['player']['y']
                  for row in live if row['trip'] and row['trip']['phase'] in ['travel', 'returning'])
          and final['trip'] is None and final['deck'] == config['fromDeck'] and final['roomId'] == initial['roomId']
          and final['serial'] == travelling['serial'] and final['player']['x'] == travelling['player']['x'])
    returning = [row for row in live if row['trip'] and row['trip']['phase'] == 'returning']
    final_progress = final['painted'].get('interior', {}).get('progress') if final['painted'] else None
    check(label + ': native paired leaves visibly reopen on the source floor', returning
          and any(row['lift']['progress'] > 0 for row in returning) and final_progress is not None and final_progress >= .95
          and final['player']['grounded'] and abs(final['player']['y'] + final['player']['h'] - 624) < .001)
    capture(page, config, label + '-source-reopened.png')
    if input_mode == 'touch':
        viewport_file = label + '-actual-touch-viewport.png'
        page.screenshot(path=str(output / viewport_file))
        report['captures'].append({'file': viewport_file, 'state': {
            'viewport': page.viewport_size, 'scope': 'Actual mobile CSS viewport and HTML controls; separate from native canvas pixels.'}})
    moved = prove_source_controls(page, config, label, initial)
    report['touchCancellation' if input_mode == 'touch' else 'cancellation'] = {
        'fixture': 'initial-lift-cancel-midship-deck1.json', 'inputMode': input_mode,
        'viewport': page.viewport_size, 'fixtureReusedWithoutChanges': True, 'initial': initial,
        'beforeCancellation': travelling, 'firstNativeReturningDraw': first_state, 'durableReturning': durable,
        'firstNativeResumedDraw': resumed_state, 'sourceReopened': final, 'walkingControls': moved,
        'chartChanges': 0, 'completionReason': remaining['reason']}


def occupied_peers(page, config):
    # Read the same explicitly read-only native destination admission helper.
    # It builds a detached routine context and never transfers/moves NPC owners.
    return page.evaluate('''async c=>{const{liftDestinationPeersV163}=await import('/src/hub-lift-transit-v163.js');
      return liftDestinationPeersV163(__ATF_HUB__,c.toDeck)
        .filter(n=>['crew-02-tamsin-velez','crew-13-pablo-reyes'].includes(n.crewId))
        .map(n=>({crewId:n.crewId,roomId:n.roomId,x:n.x,y:n.y,w:n.w,h:n.h,alive:n.alive!==false}));}''', config)


def occupied_case(page, profile, config):
    label = 'midship-occupied-arrival-1230'
    phase(label + ': native12h30 timetable refuses boarding and retains walking input')
    initial, peers = observed(page, config), occupied_peers(page, config)
    source_peers = page.evaluate('''()=>__ATF_HUB__.npcs.map(n=>({crewId:n.crewId,roomId:n.roomId,
      x:n.x,y:n.y,w:n.w,h:n.h,alive:n.alive!==false}))''')
    report['occupiedArrival'] = {'fixture': 'initial-lift-occupied-midship-deck3-1230.json', 'initial': initial,
        'actualSourcePeersBefore': source_peers, 'nativeArrivalPeersBefore': peers, 'npcPlacementInjected': False}
    check(label + ': declared12h30 reactor source has real native armory peers at the arrival socket',
          initial['protected']['clock']['hour'] == 12.5 and initial['deck'] == 3 and initial['roomId'] == 'reactor'
          and abs(initial['player']['x'] - initial['lift']['x'] + 22 - 120) < .001
          and initial['affordance']['liftShaftId'] == config['shaftId']
          and {n['crewId']: n['x'] for n in peers} == {'crew-02-tamsin-velez': 2350, 'crew-13-pablo-reyes': 2408}
          and all(n['roomId'] == 'armory' and n['y'] == 532 and n['alive'] for n in peers))
    capture(page, config, label + '-source.png')
    page.keyboard.press('KeyW')
    refused = observed(page, config)
    report['occupiedArrival']['refusedW'] = refused
    check(label + ': actual W refuses occupied deck2 without boarding, chart change or body displacement',
          refused['trip'] is None and refused['serial'] == initial['serial'] and refused['deck'] == 3
          and refused['roomId'] == 'reactor' and refused['player']['x'] == initial['player']['x']
          and refused['player']['y'] == initial['player']['y']
          and refused['departureBlocked'] == {'shaftId': config['shaftId'], 'toDeck': 2}
          and 'ARRIVÉE OCCUPÉE' in refused['prompt'] and 'ARRIVÉE OCCUPÉE' in page.locator('#hub-prompt').inner_text())
    capture(page, config, label + '-native-refusal.png')
    # S at the engineering endpoint is separately out of bounds. It must also
    # leave the source and input owner intact; it is not a second occupied route.
    page.keyboard.press('KeyS')
    outward = observed(page, config)
    check(label + ': native S at the last deck also refuses without capturing the source controls',
          outward['trip'] is None and outward['deck'] == 3 and outward['serial'] == initial['serial']
          and outward['player']['x'] == initial['player']['x'] and outward['player']['y'] == initial['player']['y'])
    page.keyboard.down('KeyA')
    try:
        page.wait_for_function('x=>__ATF_HUB__.player.x<=x-12', arg=initial['player']['x'], timeout=15000)
        page.keyboard.press('KeyW')
        held = observed(page, config)
        check(label + ': refused departure preserves a genuinely held walking input',
              'KeyA' in held['input'] and held['trip'] is None and held['deck'] == 3
              and held['departureBlocked'] == {'shaftId': config['shaftId'], 'toDeck': 2})
    finally:
        page.keyboard.up('KeyA')
    page.wait_for_function('()=>__ATF_HUB__.player.vx===0')
    final = observed(page, config)
    after_peers = occupied_peers(page, config)
    check(label + ': refused W/S neither moves the arrival peers nor spends resources or strategic time',
          after_peers == peers and final['protected'] == initial['protected']
          and final['trip'] is None and final['deck'] == 3 and final['player']['x'] < initial['player']['x'] - 10)
    capture(page, config, label + '-walking-input-retained.png')
    report['occupiedArrival'] = {'fixture': 'initial-lift-occupied-midship-deck3-1230.json', 'initial': initial,
        'actualSourcePeersBefore': source_peers,
        'nativeArrivalPeersBefore': peers, 'refusedW': refused, 'outOfRangeS': outward,
        'heldWalkingAfterRefusal': held, 'final': final, 'nativeArrivalPeersAfter': after_peers,
        'npcPlacementInjected': False}


with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True, **({'executable_path': os.environ['ATF_CHROMIUM_EXECUTABLE']} if os.environ.get('ATF_CHROMIUM_EXECUTABLE') else {}))
    report['tooling'] = {'playwright': importlib.metadata.version('playwright'), 'chromium': browser.version}
    try:
        for (shaft, deck), (profile, config, raw) in fixtures.items():
            label = f'{shaft}-deck{deck}'
            phase(label + ': import disclosed native near-lift profile')
            context = browser.new_context(viewport={'width': 1600, 'height': 1000}, service_workers='block')
            page = context.new_page()
            page.set_default_timeout(90000)
            page.on('pageerror', lambda error: report['pageErrors'].append(str(error)))
            page.on('requestfailed', lambda request: report['requestFailures'].append({'url': request.url, 'failure': request.failure}))
            page.on('response', lambda response: report['httpErrors'].append({'url': response.url, 'status': response.status}) if response.status >= 400 else None)
            page.on('dialog', lambda dialog: dialog.accept())
            page.goto(args.base, wait_until='domcontentloaded')
            page.locator('#title-start').click(timeout=45000)
            page.locator('#title-options').click()
            page.locator('#save-import').set_input_files({'name': label + '.json', 'mimeType': 'application/json', 'buffer': raw})
            page.wait_for_function('name=>__ATF_V51__.saveSystem.data.player.name===name', arg=profile['player']['name'])
            open_hub(page)
            fixture_initial = observed(page, config)
            check(label + ': initial native fixture is at its real source socket minus60px', fixture_initial['deck'] == deck
                  and fixture_initial['lift']['shaftId'] == config['shaftId'] and abs(fixture_initial['player']['x'] - fixture_initial['lift']['x'] + 82) < .01
                  and fixture_initial['player']['grounded'])
            capture(page, config, label + '-source.png')
            initial, approach = approach_native_lift(page, config, label, fixture_initial)
            install_observer(page, config)
            page.locator('#hub-canvas').focus()
            page.keyboard.press(config['key'])
            if args.comparison_stage == 'after' and deck == 1:
                rows = reload_midtravel(page, config, label)
            else:
                rows = collect(page, label, 'outbound')['rows']
            final = observed(page, config)
            metrics = verify_journey(label, config, initial, rows, final)
            capture(page, config, label + '-arrival.png')
            report['faces'].append({'id': label, 'config': config, 'fixtureInitial': fixture_initial,
                                    'initial': initial, 'nativeFloorApproach': approach, 'final': final, 'metrics': metrics,
                                    'fixtureSha256': hashlib.sha256(raw).hexdigest()})
            context.close()
        check('every requested native lift face was observed', len(report['faces']) == len(args.shafts) * len(args.decks))
        if args.comparison_stage == 'after':
            for kind, run_case in [('cancel', cancellation_case), ('occupied', occupied_case)]:
                profile, config, raw = supplemental[kind]
                context, page = supplemental_page(browser, profile, config, raw, kind)
                run_case(page, profile, config)
                context.close()
                if kind == 'cancel':
                    context, page = supplemental_page(browser, profile, config, raw, 'cancel-touch', input_mode='touch')
                    cancellation_case(page, profile, config, input_mode='touch')
                    context.close()
        check('lift matrix has no browser runtime, request or HTTP error', not report['pageErrors'] and not report['requestFailures'] and not report['httpErrors'])
        report['identityAfter'] = identity()
        check('the same served build completed every native lift face', report['identityBefore'] == report['identityAfter'])
        report['status'] = 'passed'
    except Exception as error:
        report['status'] = 'failed'
        report['error'] = repr(error)
        if 'page' in locals() and not page.is_closed():
            try:
                page.screenshot(path=str(output / 'failure.png'), full_page=True)
                report['failureObservation'] = observed(page, config)
            except Exception:
                pass
        raise
    finally:
        (output / 'report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2))
        browser.close()
