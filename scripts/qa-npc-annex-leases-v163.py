"""Three additional native annex leases of existing physical owners via disclosed05h30 Save import, actual
strategy commands, walking/E, leaf phases, exit/reload and return.
Browser evaluations observe engine/canvas; no actor, clock or method writes.
"""
import argparse
import base64
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
parser.add_argument('--route', choices=['all', 'noor-animal', 'echo-escape', 'jun-maintenance'], default='all')
parser.add_argument('--comparison-stage', choices=['before', 'after'], default='after')
parser.add_argument('--fixture', type=Path, help='Optional disclosed native Save for one --route, reused byte-for-byte for before/after.')
parser.add_argument('--fixture-dir', type=Path, help='Directory of three prepared native0530 fixtures, reused byte-for-byte.')
parser.add_argument('--prepare-only', action='store_true', help='Write disclosed default native fixtures and report; do not connect to a server or launch a browser.')
parser.add_argument('--return-cpu-throttle', type=float, default=1, help='Optional CDP CPU slowdown,1..8, only for the native occupied-return phase.')
args = parser.parse_args()
if args.fixture and args.route == 'all':
    parser.error('--fixture requires one explicit --route; use --fixture-dir for the three-route matrix.')
if args.fixture and args.fixture_dir:
    parser.error('Choose either --fixture or --fixture-dir.')
if not 1 <= args.return_cpu_throttle <= 8:
    parser.error('--return-cpu-throttle must be between1 and8.')
if args.return_cpu_throttle > 1 and args.comparison_stage != 'after':
    parser.error('--return-cpu-throttle applies only to --comparison-stage after.')
repo = Path(__file__).resolve().parents[1]
output = args.output.resolve()
if output == repo or repo in output.parents:
    raise SystemExit('Evidence must remain outside the repository.')
output.mkdir(parents=True, exist_ok=True)
ROUTES = [
    dict(id='noor-animal', crew='crew-04-noor-okafor', speaker='Okafor', deck=1,
         origin='medical', parent='crew-quarters', annex='animal-care', home=3181,
         parentDoor=682, annexDoor=122, hour=9.5, returnHour=12.5,
         player=3321, clear=3581),
    dict(id='echo-escape', crew='crew-14-echo-a', speaker='ECHO', deck=0,
         origin='combat-information', parent='cryo-bay', annex='escape-pods', home=3195,
         parentDoor=4178, annexDoor=122, hour=9.5, returnHour=12.5,
         player=3055, clear=3055),
    dict(id='jun-maintenance', crew='crew-11-jun-park', speaker='Park', deck=3,
         origin='life-support', parent='sensor-array', annex='maintenance-spine', home=3158,
         parentDoor=4248, annexDoor=122, hour=9.5, returnHour=12.5,
         player=3018, clear=3018)]
for config in ROUTES:
    config.update(action='[data-strategy-action="colony-relief"]',
                  returnAction='[data-strategy-action="frontier-recon"]')
report = {'status': 'running', 'checks': [], 'captures': [], 'pageErrors': [], 'requestFailures': [], 'httpErrors': [],
          'comparisonStage': args.comparison_stage, 'routes': [],
          'method': 'Disclosed05h30 default native Save imports; actual4h colony-relief reaches09h30 and3h reconnaissance reaches12h30. The existing physical owner is leased to one extra annex and returned on the real floor to its exact borrowed source. Keyboard/E, exact covered-leaf reload, actual native service occupation and occupied return. Evaluations observe engine/canvas only.',
          'limitations': ['Automated native controls, not human participants.',
                         'Three same-deck annex leases; no new NPC body, NPC lift or cross-deck locomotion claimed.',
                         'All fixture resources remain native defaults; no peer is removed, relocated or made transparent.',
                         'Native strategy elapsed hours are not observed walking hours.',
                         'Covered source/destination chart changes are not walking distance or new back-facing art.',
                         'Noor retains her native companion-care visit and Jun/ECHO their actual native occupation; a service post may move within its authored rail.',
                         'A returned record proves the exact physical lease return. The legacy owner may continue its own physical route after the lease ends.',
                         'Other native timetable/lifecycle handoffs remain explicitly observedTravel:false.',
                         'No new art, canonical motion or artistic1:1 approval. Before-stage images are comparisons, not lease feature checks.']}



def check(label, condition):
    assert condition, label
    report['checks'].append(label)
    print('PASS ' + label, flush=True)


def phase(label):
    report['phase'] = label
    print('STEP ' + label, flush=True)


def identity():
    with urllib.request.urlopen(args.base.rstrip('/') + '/build-info.json', timeout=20) as response:
        raw = response.read()
    info = json.loads(raw)
    return {'sourceCommit': info['sourceCommit'], 'buildId': info['buildId'], 'buildInfoSha256': hashlib.sha256(raw).hexdigest()}


def manifest():
    files = sorted([*repo.glob('src/**/*.js'), *repo.glob('*.css'), repo / 'index.html', repo / 'sw.js',
                    repo / 'package.json', repo / 'package-lock.json', Path(__file__).resolve()])
    return {str(p.relative_to(repo)): hashlib.sha256(p.read_bytes()).hexdigest() for p in files}


OBSERVE = '''c => {
 const h=__ATF_HUB__,snap=h.getSnapshot(),r=snap.npcAnnexLeasesV163?.routes?.[c.id]||null;
 const traffic=snap.npcServiceTrafficV163||null;
 const annex=h.currentAnnexV71?.()?.id||null, visible=annex?h.activeAnnexNpcsV141():h.npcs;
 const a=h.getNpcAnnexLeaseActorV163?.(c.id)||visible.find(n=>n.crewId===c.crew)||null;
 return {route:r?structuredClone(r):null,traffic:structuredClone(traffic),running:h.running,deck:h.state.deck,roomId:h.state.roomId,annex,ventActive:Boolean(h.ventActorV62),
  player:{x:h.player.x,y:h.player.y,w:h.player.w,h:h.player.h,health:h.player.health},
  camera:{...h.camera},clock:structuredClone(h.npcRoutineContextV62.clock),
  actualActor:a?{crewId:a.crewId,x:a.x,y:a.y,w:a.w,h:a.h,roomId:a.roomId,vx:a.vx,facing:a.facing,
    animation:structuredClone(a.v52Animation||null),human:structuredClone(a.humanVisualV133||null)}:null,
  visibleCrew:visible.map(n=>({crewId:n.crewId,x:n.x,y:n.y,w:n.w,h:n.h,alive:n.alive!==false})),
  worldWidth:h.currentAnnexV71?.()?.world?.width||5120,
  visibleCount:visible.filter(n=>n.crewId===c.crew).length,
  visibleSingleton:visible.filter(n=>n.crewId===c.crew).every(n=>n===a),
  interaction:structuredClone(h.hubNpcInteractions[c.crew]||null),
  inputGuards:{keys:[...(h.keys||[])],activeElement:document.activeElement?.id||document.activeElement?.tagName,
    transition:Boolean(h.annexTransitionV71),closing:Boolean(h.hubDoorClosingV142),readOnly:Boolean(h.annexStateReadOnlyV87),
    nearestCrew:h.nearestAnnexNpcV141?.()?.crewId||null,playerAlive:h.player.alive,playerVx:h.player.vx,
    training:Boolean(h.hubTrainingV132?.active)},
  prompt:h.statusPrompt(),action:h.nearestInteraction()?.action||null,
  doors:[...(h.hubDoorDrawsV142?.values()||[])].filter(d=>d.annexId===c.annex),
  strategy:{serial:__ATF_V51__.saveSystem.data.strategy.serial,actions:__ATF_V51__.saveSystem.data.statistics.strategicActions}};
}'''


def observed(page, config):
    return page.evaluate(OBSERVE, config)


def capture(page, name):
    page.locator('#hub-canvas').screenshot(path=str(output / name))
    report['captures'].append(name)


def open_view(page, view):
    menu = page.locator('#mobile-menu')
    if menu.is_visible() and 'open' not in (page.locator('.rail').get_attribute('class') or '').split():
        menu.click()
    page.locator(f'[data-view="{view}"]').click()


def open_hub(page, config, art=True, require_lease=False):
    open_view(page, 'hub')
    page.wait_for_function('()=>__ATF_HUB__?.running', timeout=90000)
    if args.comparison_stage == 'after' and require_lease:
        page.wait_for_function('id=>__ATF_HUB__.getSnapshot().npcAnnexLeasesV163?.routes?.[id]?.actor', arg=config['id'])
    if art:
        page.wait_for_function('()=>__ATF_HUB__.player.playerAppearanceVisualV126?.drawn', timeout=90000)
    page.locator('#hub-canvas').focus()


def arm_bind_observation(page, config, key):
    # start() rebuilds the legacy singleton before the new lease can borrow it.
    # A fresh lease may therefore bind on the first native update, whereas a
    # saved lease is present synchronously at start. Observe those real events;
    # never substitute the stale paused snapshot or mutate the engine to pause.
    page.evaluate('''opts=>{const read=''' + OBSERVE + ''';
      window[opts.key]=null;window[opts.key+'_error']=null;
      document.addEventListener('click',function record(event){
        if(event.target.closest('[data-view]')?.dataset.view!=='hub')return;
        document.removeEventListener('click',record);
        const started=performance.now();let polls=0;
        function sample(){
          const row=read(opts.config);polls++;
          if(row.running&&row.clock.hour===opts.config.hour&&row.route?.actor){
            row.bindObservation={nativeTime:__ATF_HUB__.animationTime,
              loopToken:__ATF_HUB__.loopToken,polls,
              capturedBy:polls===1?'native-click-microtask':'first-native-bind-raf'};
            window[opts.key]=row;return;
          }
          if(performance.now()-started>=10000){
            window[opts.key+'_error']='No current-clock native lease bind within10s';return;
          }
          requestAnimationFrame(sample);
        }
        queueMicrotask(sample);
      });}''', {'config': config, 'key': key})


def bound_observation(page, key):
    page.wait_for_function('key=>window[key]||window[key+"_error"]', arg=key, timeout=15000)
    failure = page.evaluate('key=>window[key+"_error"]', key)
    if failure:
        raise AssertionError(failure)
    return page.evaluate('key=>window[key]', key)


def walk_to(page, config, x, precise=False):
    current = observed(page, config)['player']['x']
    if abs(current - x) >= 4:
        key = 'KeyD' if x > current else 'KeyA'
        page.locator('#hub-canvas').focus()
        page.keyboard.down(key)
        try:
            page.wait_for_function('t=>t.right?__ATF_HUB__.player.x>=t.x-3:__ATF_HUB__.player.x<=t.x+3',
                                   arg={'x': x, 'right': x > current}, timeout=90000)
        finally:
            page.keyboard.up(key)
    page.wait_for_function('()=>Math.abs(__ATF_HUB__.player.vx)<1')
    if precise:
        page.wait_for_function('()=>__ATF_HUB__.player.vx===0', timeout=15000)
        deadline = time.monotonic() + 45
        # A delayed keyup may pass a target despite the crossing predicate.
        # Correct the final resting position with bounded real keyboard taps.
        for attempt in range(16):
            if time.monotonic() >= deadline:
                break
            delta = x - observed(page, config)['player']['x']
            if abs(delta) <= 8:
                return
            page.locator('#hub-canvas').focus()
            page.keyboard.press('KeyD' if delta > 0 else 'KeyA', delay=max(16, min(70, abs(delta) * 3)))
            page.wait_for_function('()=>__ATF_HUB__.player.vx===0',
                                   timeout=min(15000, max(1, (deadline - time.monotonic()) * 1000)))
        raise AssertionError('Native keyboard steps did not settle on the actual return arrival.')


def collect(page, config, name, stop, move_to=None, exit_after=False):
    phase(name)
    page.evaluate('''opts=>{ window.__ATF_LEASES_V163_COLLECTION__=new Promise((resolve,reject)=>{
      const rows=[],frames={},h=__ATF_HUB__;
      const started=performance.now();let origin=null,lastProgress=null,lastProgressAt=started;
      const timer=setInterval(()=>{const now=performance.now();
        if(now-started>900000||now-lastProgressAt>60000){clearInterval(timer);
          reject(Error('Native service route wall/progress guard: '+opts.name));}},1000);
      function frame(){
        const snap=h.getSnapshot().npcAnnexLeasesV163.routes[opts.id],a=snap.actor;
        if(a){origin ||= a.time;const now=performance.now();
          if(!lastProgress||Math.abs(a.x-lastProgress.x)>=.5||a.roomId!==lastProgress.roomId
            ||a.stage!==lastProgress.stage||Math.abs(a.doorProgress-lastProgress.doorProgress)>=.01){
            lastProgress={x:a.x,roomId:a.roomId,stage:a.stage,doorProgress:a.doorProgress};lastProgressAt=now;}
          if(a.time-origin>150){clearInterval(timer);reject(Error('Native service route simulation guard: '+opts.name));return;}}
        const row={actor:a?structuredClone(a):null,handoff:structuredClone(snap.nativeHandoff),returned:structuredClone(snap.returned||null),originX:snap.originX,sourceRoomId:snap.sourceRoomId,traffic:structuredClone(h.getSnapshot().npcServiceTrafficV163||null),
          reserved:snap.reserved,occlusion:structuredClone(snap.occlusion),
          nativeTime:h.animationTime,player:{x:h.player.x,y:h.player.y},clock:structuredClone(h.npcRoutineContextV62.clock)};
        rows.push(row);
        for(const peer of row.traffic?.actors||[]){const key='courtesy-'+peer.crewId+'-'+peer.phase;
          if(!frames[key]&&peer.distance>.5)frames[key]={row,png:document.querySelector('#hub-canvas').toDataURL('image/png')};}
        if(a){const key=a.roomId+':'+a.stage;
          if(!frames[key]&&(['covering','revealing'].includes(a.stage)||a.stage==='service'))
            frames[key]={row,png:document.querySelector('#hub-canvas').toDataURL('image/png')};}
        const done=opts.stop==='mid-cover'&&a?.stage==='covering'&&a.doorProgress>.35&&a.doorProgress<.7
          ||opts.stop==='annex-service'&&a?.roomId===opts.annex&&a.stage==='service'&&a.arrivals>=1
          ||opts.stop==='returned'&&snap.returned?.observedTravel===true&&snap.returned.owner==='native-physical-owner-return-v163'&&!a;
        if(done){clearInterval(timer);resolve({rows,frames});return;}
        requestAnimationFrame(frame);
      } requestAnimationFrame(frame);
    }); }''', {**config, 'name': name, 'stop': stop})
    if move_to is not None:
        walk_to(page, config, move_to)
    if exit_after:
        # First transfer only the tiny completion acknowledgement. Shipping
        # the recorded rows/PNG payload to Python can take longer than the
        # remaining native covering/revealing phase. Pause through the actual
        # UI before that transfer, serialization or assertion work starts.
        page.evaluate('async()=>{await window.__ATF_LEASES_V163_COLLECTION__;return true;}')
        page.locator('#exit-hub').click()
    result = page.evaluate('()=>window.__ATF_LEASES_V163_COLLECTION__')
    rows = result['rows']
    (output / (name + '.json')).write_text(json.dumps(rows, indent=2))
    continuous = True
    transfers = 0
    for first, second in zip(rows, rows[1:]):
        a, b = first['actor'], second['actor']
        if a and not b and second.get('returned'):
            returned = second['returned']
            continuous &= a['roomId'] == returned['roomId'] and a['y'] == returned['y'] == 532\
                and abs(returned['x'] - a['x']) <= 27 * (second['nativeTime'] - first['nativeTime']) + .03\
                and returned['crossings'] == a['crossings']
        if not a or not b:
            continue
        if (a['roomId'] == config['annex']) == (b['roomId'] == config['annex']):
            continuous &= abs(b['x'] - a['x']) <= 27 * (b['time'] - a['time']) + .03
        else:
            transfers += 1
            continuous &= a['stage'] == 'covering' and b['stage'] == 'revealing' and b['doorProgress'] == 0 and b['crossings'] == a['crossings'] + 1
    report.setdefault('observedPortalTransfers', {})[name] = transfers
    check(name + ': actual floor walking and closed-leaf coordinate handoff stay distinct', continuous)
    check(name + ': every pose retains native floor624', all(not row['actor'] or row['actor']['y'] == 532 for row in rows))
    for key, frame in result['frames'].items():
        file = name + '-' + key.replace(':', '-') + '.png'
        (output / file).write_bytes(base64.b64decode(frame['png'].split(',')[1]))
        report['captures'].append(file)
    return rows


def approach_live_npc(page, config):
    """Follow the existing native visitor on its actual rail using keyboard only."""
    deadline = time.monotonic() + 180
    for _ in range(10):
        state = observed(page, config)
        actor = state['actualActor']
        if actor is None or actor['roomId'] != config['annex']:
            raise AssertionError('The actual service owner is absent from its native annex.')
        if state['inputGuards']['nearestCrew'] == config['crew']:
            return
        peers = [peer for peer in state['visibleCrew'] if peer['crewId'] != config['crew'] and peer['alive'] is not False
                 and abs(peer['y'] + peer['h'] - actor['y'] - actor['h']) < 36]
        candidates = [actor['x'] + offset for offset in [-78, 78, -60, 60]]
        candidates = [x for x in candidates if 24 <= x <= state['worldWidth'] - state['player']['w'] - 24
                      and all(abs(x + state['player']['w'] / 2 - actor['x'] - actor['w'] / 2) + 4
                              < abs(x + state['player']['w'] / 2 - peer['x'] - peer['w'] / 2) for peer in peers)]
        if not candidates:
            raise AssertionError('No native nearby interaction position separates the requested speaker from other crew.')
        target = min(candidates, key=lambda x: abs(x - state['player']['x']))
        walk_to(page, config, target)
        if time.monotonic() >= deadline:
            break
    raise AssertionError('Real keyboard pursuit did not reach the moving native service identity.')


def open_crew_dialogue(page, config):
    approach_live_npc(page, config)
    # A frame capture can leave focus with another control, and the arrival
    # animation has its own closing interval after the portal handoff. Wait
    # for the native gates and a real nearby speaker before a new key press.
    page.wait_for_function('''c=>{const h=__ATF_HUB__;return h.running&&!h.annexTransitionV71
      &&!h.hubDoorClosingV142&&!h.annexStateReadOnlyV87&&Math.abs(h.player.vx)<1
      &&h.nearestAnnexNpcV141?.()?.crewId===c.crew;}''', arg=config)
    page.locator('#hub-canvas').focus()
    report.setdefault('conversationAttempts', []).append({'route': config['id'], 'before': observed(page, config)})
    page.keyboard.press('KeyE', delay=80)
    page.locator('#hub-dialogue').wait_for(state='visible')


def ensure_return_occupant(page, config, label):
    """Use real key releases/steps, then verify the actual paired arrival."""
    state = observed(page, config)
    actor = state['actualActor']
    face = state['route']['sourceFace']
    arrival = {'x': face['opening']['x'] + (face['opening']['w'] - actor['w']) / 2,
               'y': face['socket']['y'] + face['socket']['h'] - actor['h'],
               'w': actor['w'], 'h': actor['h']}
    # The native portal already puts a stationary player in this aperture.
    # A coarse extra walk can instead overshoot it after the keyup round trip.
    page.keyboard.up('KeyA')
    page.keyboard.up('KeyD')
    page.wait_for_function('()=>__ATF_HUB__.player.vx===0')
    walk_to(page, config, arrival['x'], precise=True)
    state = observed(page, config)
    player = state['player']
    overlap = player['x'] < arrival['x'] + arrival['w'] and player['x'] + player['w'] > arrival['x'] \
        and player['y'] < arrival['y'] + arrival['h'] and player['y'] + player['h'] > arrival['y']
    record = {'phase': label, 'expectedArrival': arrival, 'observed': state}
    report.setdefault('returnPlacement', []).append(record)
    check(config['id'] + ': ' + label + ' occupies the actual NPC arrival after native keyup/braking',
          not state['annex'] and not state['ventActive'] and state['deck'] == config['deck']
          and state['roomId'] == config['parent'] and abs(player['x'] - arrival['x']) <= 8 and overlap
          and abs(state['inputGuards']['playerVx']) < 1
          and not any(key in state['inputGuards']['keys'] for key in ['KeyA', 'KeyD']))
    return arrival


def wait_occupied_return(page, config):
    """Observe the complete return, bounded in simulation and wall time.

    The native loop caps each update at34ms. A complete native companion visit can leave Noor
    over2000pixels from the portal.150 simulated seconds and900 wall seconds cover
    the real return while a60-second physical-progress guard detects a stall.
    Actual x/leaf/phase progress, rather than time alone, owns the stall guard.
    """
    result = page.evaluate('''opts=>new Promise(resolve=>{
      const h=__ATF_HUB__,started=performance.now();let frames=0,done=false,lastProgressAt=started,
        lastProgress=null,origin=null,latest=null,lastSampleAt=-Infinity,simBudget=150;
      const samples=[],wallBudgetMs=900000,stallBudgetMs=60000;
      function read(){const s=h.getSnapshot().npcAnnexLeasesV163.routes[opts.id],a=s.actor,p=h.player,
        r=h.npcRoutineResolutionsV62?.get(opts.crew);
        return {actor:a?structuredClone(a):null,handoff:structuredClone(s.nativeHandoff),returned:structuredClone(s.returned||null),sourceFace:s.sourceFace,running:h.running,
          deck:h.state.deck,roomId:h.state.roomId,annex:h.currentAnnexV71?.()?.id||null,
          player:{x:p.x,y:p.y,w:p.w,h:p.h,vx:p.vx},
          routine:r?{reason:r.reason,missionAssigned:r.missionAssigned,needsCare:r.needsCare,alert:r.alert}:null};}
      function finish(status,reason){if(done)return;done=true;clearInterval(timer);cancelAnimationFrame(raf);
        const wallMs=performance.now()-started,simSeconds=latest?.actor&&origin?.actor?latest.actor.time-origin.actor.time:null;
        resolve({status,reason,frames,wallMs,simSeconds,observedRafFps:wallMs?frames*1000/wallMs:0,
          simBudgetSeconds:simBudget,wallBudgetMs,stallBudgetMs,lastProgressAgeMs:performance.now()-lastProgressAt,
          origin,latest,samples});}
      function frame(){if(done)return;frames++;const now=performance.now();latest=read();origin ||= latest;
        const a=latest.actor,p=latest.player,face=origin.sourceFace;
        const arrivalX=face.opening.x+(face.opening.w-44)/2;
        if(now-lastSampleAt>=1000){samples.push({wallMs:now-started,actor:latest.actor,player:latest.player,
          routine:latest.routine});if(samples.length>900)samples.shift();lastSampleAt=now;}
        if(!a)return finish('failed','owned-actor-lost-before-occupation');
        if(!latest.running)return finish('failed','native-loop-paused-before-occupation');
        if(latest.annex||latest.deck!==opts.deck||latest.roomId!==opts.parent
          ||Math.abs(p.x-arrivalX)>8||p.y!==532||Math.abs(p.vx)>=1)
          return finish('failed','player-left-actual-parent-arrival');
        if(a.roomId!==opts.annex||a.crossings!==1)return finish('failed','unexpected-portal-handoff-before-occupation');
        if(latest.routine?.missionAssigned||latest.routine?.needsCare||latest.routine?.alert
          ||['medical-recovery','mission-assignment','unavailable','active-crisis','infestation','annex-assignment'].includes(a.reason))
          return finish('failed','native-priority-interrupted-return');
        if(a.reason==='occupied')return finish('occupied','actual-return-opening-occupied');
        if(!lastProgress||Math.abs(a.x-lastProgress.x)>=.5||a.stage!==lastProgress.stage
          ||Math.abs(a.doorProgress-lastProgress.doorProgress)>=.01||a.crossings!==lastProgress.crossings){
          lastProgress={x:a.x,stage:a.stage,doorProgress:a.doorProgress,crossings:a.crossings};lastProgressAt=now;}
        if(a.time-origin.actor.time>simBudget)return finish('failed','simulated-return-budget-exhausted');
        raf=requestAnimationFrame(frame);
      }
      const timer=setInterval(()=>{const now=performance.now();
        if(now-started>=wallBudgetMs)finish('failed','wall-return-budget-exhausted');
        else if(now-lastProgressAt>=stallBudgetMs)finish('failed','no-physical-return-progress');},1000);
      let raf=requestAnimationFrame(frame);
    })''', config)
    report.setdefault('returnWaits', []).append(result)
    (output / (config['id'] + '-occupied-return-wait.json')).write_text(json.dumps(result, indent=2))
    check(config['id'] + ': real observed return reaches occupied within simulation/wall/progress guards',
          result['status'] == 'occupied')
    return result


def fixture(config):
    script = '''import {createDefaultSave} from './src/save.js';
const c=JSON.parse(process.argv[1]),s=createDefaultSave();
s.needsPlayerCreationV84=false;s.scene='hub';s.player.name='QA annex leases V163';
s.settings.reducedMotion=false;s.clock.hour=5.5;
Object.assign(s.hub,{deck:c.deck,roomId:c.origin,positionX:c.player,positionY:532});
s.crew.find(m=>m.id===c.crew).appearanceV110={schema:110,markingId:'olive'};
console.log(JSON.stringify(s));'''
    supplied = args.fixture.resolve() if args.fixture else args.fixture_dir.resolve() / (config['id'] + '-disclosed-native0530.json') if args.fixture_dir else None
    if supplied:
        raw = supplied.read_bytes()
        report.setdefault('suppliedFixtures', {})[config['id']] = str(supplied)
    else:
        result = subprocess.run(['node', '--input-type=module', '-e', script, json.dumps(config)], cwd=repo, capture_output=True, text=True, check=True)
        raw = result.stdout.encode()
    name = config['id'] + '-disclosed-native0530.json'
    (output / name).write_bytes(raw)
    report.setdefault('fixtureSha256', {})[name] = hashlib.sha256(raw).hexdigest()
    report.setdefault('fixtures', []).append({'file': name, 'sha256': hashlib.sha256(raw).hexdigest(),
        'declaredChanges': ['isolated named existing player', 'needsPlayerCreationV84=false', 'scene=hub', 'clock05h30 initial condition',
                            'native source deck and room', 'player supported at y532 and declared source approach', 'reducedMotion=false', 'olive marking for tested crew'],
        'unchanged': ['native resources', 'NPC roster and timetable', 'other physical route owners', 'geometry and authored service rails']})
    return raw


report['profileName'] = 'npc-annex-leases-v163'
report['saveFixtureNames'] = [c['id'] + '-disclosed-native0530.json' for c in ROUTES if args.route in ['all', c['id']]]
if args.prepare_only:
    for config in ROUTES:
        if args.route in ['all', config['id']]:
            fixture(config)
    report['status'] = 'fixtures-prepared-no-browser'
    (output / 'report.json').write_text(json.dumps(report, indent=2, ensure_ascii=False))
    print(json.dumps({'status': report['status'], 'fixtures': len(report['fixtures'])}))
    raise SystemExit(0)
report['identityBefore'] = identity()
source_start = manifest()
(output / 'runtime-source-start-v163.json').write_text(json.dumps(source_start, indent=2))
with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True, **({'executable_path': os.environ['ATF_CHROMIUM_EXECUTABLE']} if os.environ.get('ATF_CHROMIUM_EXECUTABLE') else {}))
    report['tooling'] = {'playwright': importlib.metadata.version('playwright'), 'chromium': browser.version}
    try:
        for config in ROUTES:
            if args.route not in ['all', config['id']]:
                continue
            prefix = config['id']
            context = browser.new_context(viewport={'width': 1600, 'height': 1000}, service_workers='block')
            page = context.new_page()
            page.set_default_timeout(30000)
            page.on('pageerror', lambda error: report['pageErrors'].append(str(error)))
            page.on('requestfailed', lambda request: report['requestFailures'].append({'url': request.url, 'failure': request.failure}))
            page.on('response', lambda response: report['httpErrors'].append({'url': response.url, 'status': response.status}) if response.status >= 400 else None)
            page.on('dialog', lambda dialog: dialog.accept())
            phase(prefix + ': native05h30 import')
            page.goto(args.base, wait_until='domcontentloaded')
            page.locator('#title-start').click(timeout=45000)
            page.locator('#title-options').click()
            page.locator('#save-import').set_input_files({'name': prefix + '.json', 'mimeType': 'application/json', 'buffer': fixture(config)})
            page.wait_for_function('name=>__ATF_V51__?.saveSystem.data.player.name===name', arg='QA annex leases V163')
            open_hub(page, config)
            initial = observed(page, config)
            check(prefix + ': initial native body is unique,44x92 and supported in its true parent room',
                  initial['visibleCount'] == 1 and initial['visibleSingleton'] and initial['actualActor']['roomId'] == config['origin']
                  and initial['actualActor']['w'] == 44 and initial['actualActor']['h'] == 92 and initial['actualActor']['y'] == 532)
            capture(page, prefix + '-01-parent-native0530.png')
            page.locator('#exit-hub').click()
            open_view(page, 'command')
            page.locator(config['action']).click()
            page.wait_for_function('hour=>__ATF_V51__.saveSystem.data.clock.hour===hour', arg=config['hour'])
            if args.comparison_stage == 'after':
                arm_bind_observation(page, config, '__ATF_LEASES_V163_ACTIVATION__')
            open_hub(page, config, require_lease=True)
            if args.comparison_stage == 'after':
                active = bound_observation(page, '__ATF_LEASES_V163_ACTIVATION__')
                check(prefix + ': first current-clock lease bind is observed within one bounded native frame',
                      active['clock']['hour'] == config['hour'] and 0 <= active['bindObservation']['nativeTime'] <= .034)
                (output / (prefix + '-first-native-bind.json')).write_text(json.dumps(active, indent=2))
                check(prefix + ': real elapsed-time command preserves owned parent origin instead of adopting a sampled annex post',
                      active['route']['actor']['roomId'] == active['route']['sourceRoomId']
                      and active['route']['actor']['crossings'] == 0
                      and abs(active['route']['actor']['x'] - active['route']['originX']) <= 3)
                borrowed_origin = {'roomId': active['route']['sourceRoomId'], 'x': active['route']['originX']}
                report.setdefault('borrowedOrigins', {})[prefix] = borrowed_origin
                check(prefix + ': each whole room preserves its native2D or2.5D mode without mixing',
                      all(row['mode'] in ['2d', '2.5d'] and not row['mixedProjectionAllowed'] for row in active['route']['presentation']))
                report.setdefault('nativeRoomPresentation', {})[prefix] = active['route']['presentation']
                collect(page, config, prefix + '-02-outbound-mid-door', 'mid-cover', exit_after=True)
                paused = observed(page, config)
                durable = page.evaluate('id=>JSON.parse(localStorage.getItem("atf-v47-profile-1")).hub.npcAnnexLeasesV163.routes[id]', config['id'])
                (output / (prefix + '-durable-covered-door.json')).write_text(json.dumps(durable, indent=2))
                (output / (prefix + '-paused-covered-door.json')).write_text(json.dumps(paused, indent=2))
                check(prefix + ': real exit persists supported actor and exact door phase', durable['actor'] == paused['route']['actor'] and durable['actor']['stage'] in ['covering', 'revealing'])
                page.reload(wait_until='domcontentloaded')
                page.locator('#title-start').click(timeout=45000)
                page.locator('#title-options').click()
                arm_bind_observation(page, config, '__ATF_LEASES_V163_RESUME_OBSERVATION__')
                open_hub(page, config, art=False, require_lease=True)
                restored = bound_observation(page, '__ATF_LEASES_V163_RESUME_OBSERVATION__')
                check(prefix + ': saved lease bind is observed before the first native resumed frame',
                      restored['bindObservation']['nativeTime'] == 0)
                (output / (prefix + '-first-native-resume.json')).write_text(json.dumps(restored, indent=2))
                check(prefix + ': reload restores exact saved door state before first resumed frame', restored['route']['actor'] == durable['actor'])
                collect(page, config, prefix + '-03-resumed-annex-arrival', 'annex-service')
                arrived = observed(page, config)
                check(prefix + ': complete outbound owns one portal and the existing safe service post', arrived['route']['actor']['crossings'] == 1
                      and arrived['route']['actor']['roomId'] == config['annex']
                      and arrived['actualActor']['w'] == 44 and arrived['actualActor']['h'] == 92
                      and arrived['actualActor']['y'] == 532)
            walk_to(page, config, config['parentDoor'])
            page.keyboard.press('KeyE')
            page.wait_for_function('id=>__ATF_HUB__.currentAnnexV71?.()?.id===id&&!__ATF_HUB__.annexTransitionV71', arg=config['annex'], timeout=45000)
            approach_live_npc(page, config)
            visible = observed(page, config)
            check(prefix + ': native player entry sees the same single service identity', visible['visibleCount'] == 1 and visible['visibleSingleton'])
            capture(page, prefix + '-04-annex-service-post.png')
            open_crew_dialogue(page, config)
            talking = observed(page, config)
            check(prefix + ': E opens the existing crew dialogue at the real post', config['speaker'] in page.locator('#hub-dialogue-speaker').inner_text() and not talking['running'])
            capture(page, prefix + '-05-native-dialogue.png')
            page.locator('[data-npc-dialogue-choice]:not([disabled])').first.click()
            page.locator('#hub-dialogue-continue').click()
            page.wait_for_function('()=>__ATF_HUB__.running')
            if args.comparison_stage == 'after':
                check(prefix + ': dialogue retains the original actor, floor and crossing count', observed(page, config)['route']['actor']['crossings'] == 1)
                walk_to(page, config, config['annexDoor'])
                page.keyboard.press('KeyE')
                page.wait_for_function('()=>!__ATF_HUB__.currentAnnexV71?.()&&!__ATF_HUB__.annexTransitionV71', timeout=45000)
                arrival = ensure_return_occupant(page, config, 'before native save')
                page.locator('#exit-hub').click()
                saved_player = page.evaluate('()=>({x:__ATF_V51__.saveSystem.data.hub.positionX,y:__ATF_V51__.saveSystem.data.hub.positionY})')
                report['savedReturnPlayer'] = saved_player
                check(prefix + ': native save retains the actual occupied return position',
                      abs(saved_player['x'] - arrival['x']) <= 8.5 and saved_player['y'] == arrival['y'])
                open_view(page, 'command')
                page.locator(config['returnAction']).click()
                page.wait_for_function('hour=>__ATF_V51__.saveSystem.data.clock.hour===hour', arg=config['returnHour'])
                cdp = None
                report['returnCpuThrottle'] = {'rate': args.return_cpu_throttle, 'phase': 'native occupied return', 'applied': False}
                if args.return_cpu_throttle > 1:
                    cdp = context.new_cdp_session(page)
                    cdp.send('Emulation.setCPUThrottlingRate', {'rate': args.return_cpu_throttle})
                    report['returnCpuThrottle']['applied'] = True
                try:
                    open_hub(page, config, require_lease=True)
                    ensure_return_occupant(page, config, 'after native resume')
                    wait_occupied_return(page, config)
                    occupied = observed(page, config)
                    page.wait_for_function('''p=>{const a=__ATF_HUB__.getSnapshot().npcAnnexLeasesV163.routes[p.id].actor;
                      return !a||a.roomId!==p.annex||a.crossings!==1||a.time>=p.time+.15;}''',
                      arg={'id': config['id'], 'annex': config['annex'], 'time': occupied['route']['actor']['time']}, timeout=45000)
                    waiting = observed(page, config)
                    check(prefix + ': actual destination occupant prevents return handoff across native simulation frames',
                          occupied['route']['actor']['roomId'] == config['annex'] and waiting['route']['actor'] is not None
                          and waiting['route']['actor']['roomId'] == config['annex'] and waiting['route']['actor']['crossings'] == 1
                          and waiting['route']['actor']['reason'] == 'occupied'
                          and waiting['route']['actor']['time'] >= occupied['route']['actor']['time'] + .15
                          and waiting['route']['actor']['x'] == occupied['route']['actor']['x']
                          and waiting['player']['x'] == occupied['player']['x'])
                finally:
                    if cdp:
                        cdp.send('Emulation.setCPUThrottlingRate', {'rate': 1})
                        cdp.detach()
                        report['returnCpuThrottle']['restoredRate'] = 1
                capture(page, prefix + '-06-occupied-return-opening.png')
                rows = collect(page, config, prefix + '-07-return-to-physical-owner', 'returned', move_to=config['clear'])
                final = observed(page, config)
                returned = final['route']['returned']
                check(prefix + ': the borrowed same physical owner reaches its exact supported origin before lease release',
                      final['route']['actor'] is None and returned is not None
                      and returned['crewId'] == config['crew'] and returned['roomId'] == borrowed_origin['roomId']
                      and abs(returned['x'] - borrowed_origin['x']) < .25 and returned['y'] == 532
                      and returned['crossings'] == 2 and returned['arrivals'] >= 2 and returned['distance'] > 0
                      and returned['observedTravel'] is True and returned['owner'] == 'native-physical-owner-return-v163')
                check(prefix + ': native legacy ownership resumes without a second visible crew identity', final['visibleCount'] <= 1)
                check(prefix + ': continuous return observes exactly one closed-leaf portal transfer', report['observedPortalTransfers'][prefix + '-07-return-to-physical-owner'] == 1)
                (output / (prefix + '-physical-return-record.json')).write_text(json.dumps(returned, indent=2))
                capture(page, prefix + '-08-after-returned-legacy-owner.png')
            report['routes'].append({'id': prefix, 'status': 'passed'})
            context.close()
        check('native pages/assets have no runtime, HTTP or request errors', not report['pageErrors'] and not report['requestFailures'] and not report['httpErrors'])
        report['identityAfter'] = identity()
        check('the same served build completed every actual native watch', report['identityBefore'] == report['identityAfter'])
        report['status'] = 'passed'
    except Exception as error:
        report['status'] = 'failed'; report['error'] = str(error)
        try:
            report['failureState'] = observed(page, config)
            page.screenshot(path=str(output / 'failure.png'), full_page=True)
        except Exception as capture_error:
            report['captureError'] = str(capture_error)
        print('::error file=scripts/qa-npc-annex-leases-v163.py::' + str(error).replace('%', '%25').replace('\r', '%0D').replace('\n', '%0A'), flush=True)
        raise
    finally:
        browser.close()
        report['identityAfter'] = identity()
        source_end = manifest()
        (output / 'runtime-source-end-v163.json').write_text(json.dumps(source_end, indent=2))
        report['sourceUnchanged'] = source_start == source_end
        if not report['sourceUnchanged']:
            report['status'] = 'failed'
        (output / 'report.json').write_text(json.dumps(report, indent=2, ensure_ascii=False))
if report['status'] != 'passed':
    raise SystemExit(1)
