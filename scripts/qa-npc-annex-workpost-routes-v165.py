"""Two native workpost circuits, a disclosed07h00 Save import and actual3h
reconnaissance commands. Real walking/E, durable leaves, occupied return and
explicitly unobserved native handoff. No station-to-work or interdeck claim.
Browser evaluations observe engine/canvas; no actor, clock or method writes.
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
parser.add_argument('--route', choices=['all', 'rook-cctv', 'tamsin-proving'], default='all')
parser.add_argument('--comparison-stage', choices=['before', 'after'], default='after')
parser.add_argument('--fixture-dir', type=Path, help='Directory containing the two disclosed07h00 Save files, reused byte-for-byte.')
parser.add_argument('--expect-build', help='Actual served commit expected for this observation.')
parser.add_argument('--expect-harness', help='Exact clean Git commit of this QA driver expected by root.')
parser.add_argument('--return-cpu-throttle', type=float, default=1, help='Optional CDP CPU slowdown,1..8, only for the native occupied-return phase.')
args = parser.parse_args()
if not 1 <= args.return_cpu_throttle <= 8:
    parser.error('--return-cpu-throttle must be between1 and8.')
if args.return_cpu_throttle > 1 and args.comparison_stage != 'after':
    parser.error('--return-cpu-throttle applies only to --comparison-stage after.')
repo = Path(__file__).resolve().parents[1]
output = args.output.resolve()
if output == repo or repo in output.parents:
    raise SystemExit('Evidence must remain outside the repository.')
output.mkdir(parents=True, exist_ok=True)
ROUTES_SCRIPT = r'''import {HUB_DECKS} from './src/hub-game.js';
import {getNpcRoutineStandingAnchorV158} from './src/hub-v62-runtime.js';
import {createAnnexNpcsV141} from './src/hub-annex-npc-life-v141.js';
import {resolveNpcRoutineV62} from './src/npc-dialogue-v62.js';
import {HUB_NPC_ANNEX_WORKPOST_ROUTE_DEFINITIONS_V165 as definitions,HUB_NPC_ANNEX_WORKPOST_ROUTES_V165 as routes} from './src/npc-annex-workpost-routes-v165.js';
console.log(JSON.stringify(definitions.map(d=>{const route=routes.find(r=>r.definition.id===d.id),room=HUB_DECKS[d.deck].rooms.find(r=>r.id===d.parentRoomId);
const parentDoor=route.faces.parent.opening.x+(route.faces.parent.opening.w-44)/2;
const annexDoor=route.faces.local.opening.x+(route.faces.local.opening.w-44)/2;
const home=getNpcRoutineStandingAnchorV158(d.crewId,d.parentRoomId,'work'),left=room.xStart+96,right=room.xEnd-140;
const clear=left<Math.min(home,parentDoor)-72?left:right;
const post=createAnnexNpcsV141([{...d,roomId:d.annexRoomId}],new Map([[d.crewId,resolveNpcRoutineV62(d.crewId,{clock:{day:1,hour:10}})]]))[0].x;
return {id:d.id,crew:d.crewId,speaker:d.id==='rook-cctv'?'Rook':'Velez',deck:d.deck,origin:d.parentRoomId,parent:d.parentRoomId,
mainRoomIds:HUB_DECKS[d.deck].rooms.map(room=>room.id),
annex:d.annexRoomId,home,post,parentDoor,annexDoor,clear,player:clear,hour:10,returnHour:13,
action:'[data-strategy-action="frontier-recon"]',returnAction:'[data-strategy-action="frontier-recon"]'};})));'''
ROUTES = json.loads(subprocess.check_output(['node', '--input-type=module', '-e', ROUTES_SCRIPT], cwd=repo, text=True))
report = {'status': 'running', 'startedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
          'checks': [], 'captures': [], 'pageErrors': [], 'requestFailures': [], 'httpErrors': [],
          'comparisonStage': args.comparison_stage, 'routes': [],
          'method': 'Disclosed07h00 native Save imports; actual3h frontier-recon to10h and3h return to13h; keyboard/E, native owner priority/courtesy, exact leaf reload and occupied arrival. Evaluations only observe.',
          'limitations': ['Automated native controls, not human participants.',
                         'Two local native workpost circuits; native roster station-to-work interdeck travel remains unobserved.',
                         'Native strategy elapsed hours are not observed walking hours.',
                         'Covered source/destination chart changes are not walking distance or back-facing art.',
                         'Other native timetable handoffs and courtesy lifecycle/context handoffs remain explicitly observedTravel:false.',
                         'No new art, canonical motion or artistic1:1 approval. Before-stage images are comparisons, not current V165 feature checks.']}



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
                    repo / 'package.json', repo / 'package-lock.json', Path(__file__).resolve(),
                    repo / 'assets/openai/sprites/normalized/npcs/rook-locomotion-sheet.png',
                    repo / 'assets/openai/sprites/normalized/npcs/tamsin-velez-locomotion-sheet.png'])
    return {str(p.relative_to(repo)): hashlib.sha256(p.read_bytes()).hexdigest() for p in files}


OBSERVE = '''c => {
 const h=__ATF_HUB__,snap=h.getSnapshot(),r=snap.npcAnnexWorkpostRoutesV165?.routes?.[c.id]||null;
 const traffic=snap.npcServiceTrafficV163||null;
 const annex=h.currentAnnexV71?.()?.id||null, visible=annex?h.activeAnnexNpcsV141():h.npcs;
 const a=h.getNpcAnnexWorkpostActorV165?.(c.id)||visible.find(n=>n.crewId===c.crew)||null;
 return {route:r?structuredClone(r):null,traffic:structuredClone(traffic),
  passage:structuredClone(snap.npcAnnexWorkpostRoutesV165?.passage||null),
  owners:(h.getNpcServiceOwnedActorsV163?.()||[]).map(n=>({crewId:n.crewId,x:n.x,y:n.y,w:n.w,h:n.h,roomId:n.roomId})),
  running:h.running,deck:h.state.deck,roomId:h.state.roomId,annex,ventActive:Boolean(h.ventActorV62),
  player:{x:h.player.x,y:h.player.y,w:h.player.w,h:h.player.h,health:h.player.health},
  camera:{...h.camera},clock:structuredClone(h.npcRoutineContextV62.clock),
  actualActor:a?{crewId:a.crewId,x:a.x,y:a.y,w:a.w,h:a.h,roomId:a.roomId,vx:a.vx,facing:a.facing,
    animation:structuredClone(a.v52Animation||null),human:structuredClone(a.humanVisualV133||null)}:null,
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
    report['captures'].append({'file': name, 'sha256': hashlib.sha256((output / name).read_bytes()).hexdigest()})


def open_view(page, view):
    menu = page.locator('#menu-toggle')
    if menu.is_visible() and 'open' not in (page.locator('.rail').get_attribute('class') or '').split():
        menu.click()
    page.locator(f'[data-view="{view}"]').click()


def open_hub(page, config, art=True):
    open_view(page, 'hub')
    page.wait_for_function('()=>__ATF_HUB__?.running', timeout=90000)
    if args.comparison_stage == 'after':
        page.wait_for_function('id=>__ATF_HUB__.getSnapshot().npcAnnexWorkpostRoutesV165?.routes?.[id]?.actor', arg=config['id'])
    if art:
        page.wait_for_function('()=>__ATF_HUB__.player.playerAppearanceVisualV126?.drawn', timeout=90000)
    page.locator('#hub-canvas').focus()


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
    page.evaluate('''opts=>{ window.__ATF_V165_COLLECTION__=new Promise((resolve,reject)=>{
      const rows=[],frames={},h=__ATF_HUB__;
      const started=performance.now();let origin=null,lastProgress=null,lastProgressAt=started;
      const timer=setInterval(()=>{const now=performance.now();
        if(now-started>480000||now-lastProgressAt>45000){clearInterval(timer);
          reject(Error('Native service route wall/progress guard: '+opts.name));}},1000);
      function copyFrame(){const source=document.querySelector('#hub-canvas'),copy=document.createElement('canvas');
        copy.width=source.width;copy.height=source.height;copy.getContext('2d').drawImage(source,0,0);return copy;}
      function frame(){
        const whole=h.getSnapshot(),snap=whole.npcAnnexWorkpostRoutesV165.routes[opts.id],a=snap.actor;
        if(a){origin ||= a.time;const now=performance.now();
          if(!lastProgress||Math.abs(a.x-lastProgress.x)>=.5||a.roomId!==lastProgress.roomId
            ||a.stage!==lastProgress.stage||Math.abs(a.doorProgress-lastProgress.doorProgress)>=.01){
            lastProgress={x:a.x,roomId:a.roomId,stage:a.stage,doorProgress:a.doorProgress};lastProgressAt=now;}
          if(a.time-origin>150){clearInterval(timer);reject(Error('Native service route simulation guard: '+opts.name));return;}}
        const row={actor:a?structuredClone(a):null,handoff:structuredClone(snap.nativeHandoff),traffic:structuredClone(whole.npcServiceTrafficV163||null),
          passage:structuredClone(whole.npcAnnexWorkpostRoutesV165.passage||null),
          owners:(h.getNpcServiceOwnedActorsV163?.()||[]).map(n=>({crewId:n.crewId,x:n.x,y:n.y,w:n.w,h:n.h,roomId:n.roomId})),
          reserved:snap.reserved,occlusion:structuredClone(snap.occlusion),
          player:{x:h.player.x,y:h.player.y},clock:structuredClone(h.npcRoutineContextV62.clock)};
        rows.push(row);
        if(row.passage){const key='owner-priority-'+row.passage.mode;
          if(!frames[key])frames[key]={row,bitmap:copyFrame()};}
        for(const peer of row.traffic?.actors||[]){const key='courtesy-'+peer.crewId+'-'+peer.phase;
          if(!frames[key]&&peer.distance>.5)frames[key]={row,bitmap:copyFrame()};}
        if(a){const key=a.roomId+':'+a.stage;
          if(!frames[key]&&(['covering','revealing'].includes(a.stage)||a.stage==='service'))
            frames[key]={row,bitmap:copyFrame()};}
        const done=opts.stop==='mid-cover'&&a?.stage==='covering'&&a.doorProgress>.35&&a.doorProgress<.7
          ||opts.stop==='annex-service'&&a?.roomId===opts.annex&&a.stage==='service'&&a.arrivals>=1
          ||opts.stop==='handoff'&&snap.nativeHandoff?.fromRoomId===opts.parent
          ||opts.stop==='parent-service'&&a?.roomId===opts.parent&&a.stage==='service'&&a.crossings===2
          ||opts.stop==='home-service'&&a?.roomId===opts.origin&&a.stage==='service'&&Math.abs(a.x-a.homeX)<.25&&a.crossings===2;
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
        page.evaluate('async()=>{await window.__ATF_V165_COLLECTION__;return true;}')
        page.locator('#exit-hub').click()
    result = page.evaluate('''async()=>{const result=await window.__ATF_V165_COLLECTION__;
      return {rows:result.rows,frames:Object.fromEntries(Object.entries(result.frames).map(([key,frame])=>
        [key,{row:frame.row,png:frame.bitmap.toDataURL('image/png')}]))};}''')
    rows = result['rows']
    (output / (name + '.json')).write_text(json.dumps(rows, indent=2))
    continuous = True
    transfers = 0
    for first, second in zip(rows, rows[1:]):
        a, b = first['actor'], second['actor']
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
    ordered = True
    previous = {}
    for row in rows:
        bodies = {body['crewId']: body for body in [*row['owners'], *(row['traffic'] or {}).get('actors', [])]
                  if body['roomId'] in config['mainRoomIds'] and body['crewId'] in
                  ['crew-06-rook', 'crew-14-echo-a', 'crew-10-david-8r']}
        for first_id, first_body in bodies.items():
            for second_id, second_body in bodies.items():
                if first_id >= second_id or first_id not in previous or second_id not in previous:
                    continue
                before = previous[first_id]['x'] - previous[second_id]['x']
                after = first_body['x'] - second_body['x']
                ordered &= before * after >= -.01
        previous = bodies
    check(name + ': real owner/courtesy bodies preserve their floor ordering without overtaking', ordered)
    for key, frame in result['frames'].items():
        file = name + '-' + key.replace(':', '-') + '.png'
        (output / file).write_bytes(base64.b64decode(frame['png'].split(',')[1]))
        report['captures'].append({'file': file, 'sha256': hashlib.sha256((output / file).read_bytes()).hexdigest()})
    return rows


def open_crew_dialogue(page, config):
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

    The native loop caps each update at34ms. The ~29 simulated seconds needed
    here require ~850 frames;120 wall seconds cannot cover that below7FPS.
    Actual x/leaf/phase progress, rather than time alone, owns the stall guard.
    """
    result = page.evaluate('''opts=>new Promise(resolve=>{
      const h=__ATF_HUB__,started=performance.now();let frames=0,done=false,lastProgressAt=started,
        lastProgress=null,origin=null,latest=null,lastSampleAt=-Infinity,simBudget=50;
      const samples=[],wallBudgetMs=360000,stallBudgetMs=45000;
      function read(){const s=h.getSnapshot().npcAnnexWorkpostRoutesV165.routes[opts.id],a=s.actor,p=h.player,
        r=h.npcRoutineResolutionsV62?.get(opts.crew);
        return {actor:a?structuredClone(a):null,handoff:structuredClone(s.nativeHandoff),sourceFace:s.sourceFace,running:h.running,
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
          routine:latest.routine});if(samples.length>360)samples.shift();lastSampleAt=now;}
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
s.needsPlayerCreationV84=false;s.scene='hub';s.player.name='QA native workposts V165';
s.settings.reducedMotion=false;s.clock.hour=7;
Object.assign(s.hub,{deck:c.deck,roomId:c.origin,positionX:c.player,positionY:532});
console.log(JSON.stringify(s));'''
    if args.fixture_dir:
        source = args.fixture_dir.resolve() / (config['id'] + '-disclosed-native0700.json')
        raw = source.read_bytes()
        report.setdefault('suppliedFixtures', []).append({'path': str(source), 'sha256': hashlib.sha256(raw).hexdigest()})
    else:
        result = subprocess.run(['node', '--input-type=module', '-e', script, json.dumps(config)], cwd=repo, capture_output=True, text=True, check=True)
        raw = result.stdout.encode()
    name = config['id'] + '-disclosed-native0700.json'
    (output / name).write_bytes(raw)
    report.setdefault('fixtureSha256', {})[name] = hashlib.sha256(raw).hexdigest()
    return raw


report['identityBefore'] = identity()
report['sourceCommit'] = report['identityBefore']['sourceCommit']
report['harnessCommit'] = subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=repo, text=True).strip()
if args.expect_build and report['sourceCommit'] != args.expect_build:
    raise SystemExit('Served build differs from declared observation.')
if args.expect_harness and (report['harnessCommit'] != args.expect_harness or subprocess.check_output(['git', 'status', '--porcelain'], cwd=repo, text=True).strip()):
    raise SystemExit('QA harness is not the exact clean declared commit.')
report['profileName'] = 'npc-annex-workpost-routes-v165'
report['saveFixtureNames'] = [c['id'] + '-disclosed-native0700.json' for c in ROUTES if args.route in ['all', c['id']]]
source_start = manifest()
(output / 'runtime-source-start-v165.json').write_text(json.dumps(source_start, indent=2))
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
            phase(prefix + ': native07h00 import')
            page.goto(args.base, wait_until='domcontentloaded')
            page.locator('#title-start').click(timeout=45000)
            page.locator('#title-options').click()
            page.locator('#save-import').set_input_files({'name': prefix + '.json', 'mimeType': 'application/json', 'buffer': fixture(config)})
            page.wait_for_function('name=>__ATF_V51__?.saveSystem.data.player.name===name', arg='QA native workposts V165')
            open_hub(page, config)
            initial = observed(page, config)
            check(prefix + ': initial native body is unique,44x92 and supported in its true parent room',
                  initial['visibleCount'] == 1 and initial['visibleSingleton'] and initial['actualActor']['roomId'] == config['origin']
                  and initial['actualActor']['w'] == 44 and initial['actualActor']['h'] == 92 and initial['actualActor']['y'] == 532)
            capture(page, prefix + '-01-parent-native0700.png')
            page.locator('#exit-hub').click()
            open_view(page, 'command')
            page.locator(config['action']).click()
            page.wait_for_function('hour=>__ATF_V51__.saveSystem.data.clock.hour===hour', arg=config['hour'])
            open_hub(page, config)
            if args.comparison_stage == 'after':
                active = observed(page, config)
                check(prefix + ': real elapsed-time command preserves owned parent origin instead of adopting a sampled annex post',
                      active['route']['actor']['roomId'] == config['origin'] and active['route']['actor']['crossings'] == 0
                      and active['route']['preLoadTravelObserved'] is False)
                check(prefix + ': both rooms keep complete2D presentation', all(row['mode'] == '2d' and not row['mixedProjectionAllowed'] for row in active['route']['presentation']))
                collect(page, config, prefix + '-02-outbound-mid-door', 'mid-cover', exit_after=True)
                paused = observed(page, config)
                durable = page.evaluate('id=>JSON.parse(localStorage.getItem("atf-v47-profile-1")).hub.npcAnnexWorkpostRoutesV165.routes[id]', config['id'])
                (output / (prefix + '-durable-covered-door.json')).write_text(json.dumps(durable, indent=2))
                (output / (prefix + '-paused-covered-door.json')).write_text(json.dumps(paused, indent=2))
                check(prefix + ': real exit persists supported actor and exact door phase', durable['actor'] == paused['route']['actor'] and durable['actor']['stage'] in ['covering', 'revealing'])
                page.reload(wait_until='domcontentloaded')
                page.locator('#title-start').click(timeout=45000)
                page.locator('#title-options').click()
                page.evaluate('''c=>{const read=''' + OBSERVE + '''; document.addEventListener('click',function record(event){
                  if(event.target.closest('[data-view]')?.dataset.view!=='hub')return;
                  window.__ATF_V165_RESUME_OBSERVATION__=read(c);document.removeEventListener('click',record);
                });}''', config)
                open_hub(page, config, art=False)
                restored = page.evaluate('()=>window.__ATF_V165_RESUME_OBSERVATION__')
                check(prefix + ': reload restores exact saved door state before first resumed frame', restored['route']['actor'] == durable['actor'])
                collect(page, config, prefix + '-03-resumed-annex-arrival', 'annex-service')
                arrived = observed(page, config)
                check(prefix + ': complete outbound owns one portal and the existing safe service post', arrived['route']['actor']['crossings'] == 1 and abs(arrived['route']['actor']['x'] - config['post']) < .25)
            walk_to(page, config, config['parentDoor'])
            page.keyboard.press('KeyE')
            page.wait_for_function('id=>__ATF_HUB__.currentAnnexV71?.()?.id===id&&!__ATF_HUB__.annexTransitionV71', arg=config['annex'], timeout=45000)
            walk_to(page, config, config['post'] - 84)
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
                    open_hub(page, config)
                    ensure_return_occupant(page, config, 'after native resume')
                    wait_occupied_return(page, config)
                    occupied = observed(page, config)
                    page.wait_for_function('''p=>{const a=__ATF_HUB__.getSnapshot().npcAnnexWorkpostRoutesV165.routes[p.id].actor;
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
                stop = 'handoff'
                rows = collect(page, config, prefix + '-07-return-and-handoff', stop, move_to=config['clear'])
                last = next(row['actor'] for row in reversed(rows) if row['actor'])
                handoff = observed(page, config)['route']['nativeHandoff']
                check(prefix + ': real floor return reaches its actual workpost bookmark before explicit unobserved native handoff',
                      last['roomId'] == config['origin'] and abs(last['x'] - last['homeX']) < .25
                      and last['crossings'] == 2 and last['arrivals'] == 2 and handoff['observedTravel'] is False)
                check(prefix + ': continuous return observes exactly one closed-leaf portal transfer', report['observedPortalTransfers'][prefix + '-07-return-and-handoff'] == 1)
                capture(page, prefix + '-08-parent-after-native-return.png')
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
        print('::error file=scripts/qa-npc-annex-workpost-routes-v165.py::' + str(error).replace('%', '%25').replace('\r', '%0D').replace('\n', '%0A'), flush=True)
        raise
    finally:
        browser.close()
        try:
            report['identityAfter'] = identity()
        except Exception as identity_error:
            report['status'] = 'failed'
            report['identityError'] = str(identity_error)
        source_end = manifest()
        (output / 'runtime-source-end-v165.json').write_text(json.dumps(source_end, indent=2))
        report['sourceUnchanged'] = source_start == source_end
        report['captureSha256'] = {entry['file']: entry['sha256'] for entry in report['captures']}
        report['localCircuitsObserved'] = len(report['routes']) if report['status'] == 'passed' and args.comparison_stage == 'after' else 0
        report['stationToWorkTravelObserved'] = False
        report['npcLiftTransportImplemented'] = False
        if not report['sourceUnchanged']:
            report['status'] = 'failed'
        report['finishedAt'] = datetime.datetime.now(datetime.timezone.utc).isoformat()
        (output / 'report.json').write_text(json.dumps(report, indent=2, ensure_ascii=False))
if report['status'] != 'passed':
    raise SystemExit(1)
