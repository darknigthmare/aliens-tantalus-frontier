"""Native Noor medical/morgue route via disclosed05h30 Save import, actual
strategy/research commands, walking/E, leaf phases, exit/reload and return.
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
from playwright.sync_api import sync_playwright

parser = argparse.ArgumentParser()
parser.add_argument('--base', default=os.environ.get('ATF_BASE_URL', 'http://127.0.0.1:4173'))
parser.add_argument('--output', type=Path, required=True)
parser.add_argument('--route', choices=['all', 'noor-morgue'], default='all')
parser.add_argument('--comparison-stage', choices=['before', 'after'], default='after')
parser.add_argument('--fixture', type=Path, help='Optional disclosed native Save reused byte-for-byte for before/after.')
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
ROUTES = [
    {'id': 'noor-morgue', 'crew': 'crew-04-noor-okafor', 'speaker': 'Okafor', 'deck': 1,
     'parent': 'medical', 'annex': 'morgue', 'home': 3181, 'post': 977.5,
     'parentDoor': 2878, 'annexDoor': 1754, 'hour': 10.5, 'returnHour': 13.5,
     'action': '[data-strategy-action="salvage-run"]', 'returnAction': '[data-strategy-action="frontier-recon"]'}]
report = {'status': 'running', 'checks': [], 'captures': [], 'pageErrors': [], 'requestFailures': [], 'httpErrors': [],
          'comparisonStage': args.comparison_stage, 'routes': [],
          'method': 'Disclosed05h30 native Save import, native5h salvage→10h30 and3h reconnaissance→13h30; keyboard/E, occupied portal, actual exit/reload/resume. Evaluations only observe.',
          'limitations': ['Automated native controls, not human participants.',
                         'One bounded Noor medical/morgue route; no lift or cross-deck locomotion claimed.',
                         'Native strategy elapsed hours are not observed walking hours.',
                         'Source/destination coordinates change behind fully covering native leaves, not drawn back-facing locomotion.',
                         'Subsequent native timetable handoffs explicitly have observedTravel:false.',
                         'No resources added. At08h Inez occupies the floor path;10h30 uses her existing Bioforge watch, without moving or ignoring her body. Noor09h companion-care priority is covered separately by Node.',
                         'No new art, canonical motion or artistic1:1 approval. Before-stage images are comparisons, not V162 feature checks.']}


def check(label, condition):
    assert condition, label
    report['checks'].append(label)
    print('PASS ' + label, flush=True)


def phase(label):
    report['phase'] = label
    print('STEP ' + label, flush=True)


def manifest():
    files = sorted([*repo.glob('src/**/*.js'), *repo.glob('*.css'), repo / 'index.html', repo / 'sw.js',
                    repo / 'package.json', repo / 'package-lock.json', Path(__file__).resolve()])
    return {str(p.relative_to(repo)): hashlib.sha256(p.read_bytes()).hexdigest() for p in files}


OBSERVE = '''c => {
 const h=__ATF_HUB__,snap=h.getSnapshot(),r=snap.npcMedicalRouteV162?.routes?.[c.id]||null;
 const annex=h.currentAnnexV71?.()?.id||null, visible=annex?h.activeAnnexNpcsV141():h.npcs;
 const a=h.getNpcMedicalActorV162?.()||visible.find(n=>n.crewId===c.crew)||null;
 return {route:r?structuredClone(r):null,running:h.running,deck:h.state.deck,roomId:h.state.roomId,annex,ventActive:Boolean(h.ventActorV62),
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
    report['captures'].append(name)


def open_view(page, view):
    menu = page.locator('#mobile-menu')
    if menu.is_visible() and 'open' not in (page.locator('.rail').get_attribute('class') or '').split():
        menu.click()
    page.locator(f'[data-view="{view}"]').click()


def open_hub(page, config, art=True):
    open_view(page, 'hub')
    page.wait_for_function('()=>__ATF_HUB__?.running', timeout=90000)
    if args.comparison_stage == 'after':
        page.wait_for_function('id=>__ATF_HUB__.getSnapshot().npcMedicalRouteV162?.routes?.[id]?.actor', arg=config['id'])
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


def collect(page, config, name, stop, move_to=None):
    phase(name)
    page.evaluate('''opts=>{ window.__ATF_V162_COLLECTION__=new Promise((resolve,reject)=>{
      const rows=[],frames={},h=__ATF_HUB__;
      const timer=setTimeout(()=>reject(Error('Native service route timed out: '+opts.name)),240000);
      function frame(){
        const snap=h.getSnapshot().npcMedicalRouteV162.routes[opts.id],a=snap.actor;
        const row={actor:a?structuredClone(a):null,handoff:structuredClone(snap.nativeHandoff),
          reserved:snap.reserved,occlusion:structuredClone(snap.occlusion),
          player:{x:h.player.x,y:h.player.y},clock:structuredClone(h.npcRoutineContextV62.clock)};
        rows.push(row);
        if(a){const key=a.roomId+':'+a.stage;
          if(!frames[key]&&(['covering','revealing'].includes(a.stage)||a.stage==='service'))
            frames[key]={row,png:document.querySelector('#hub-canvas').toDataURL('image/png')};}
        const done=opts.stop==='mid-cover'&&a?.stage==='covering'&&a.doorProgress>.35&&a.doorProgress<.7
          ||opts.stop==='annex-service'&&a?.roomId===opts.annex&&a.stage==='service'&&a.arrivals>=1
          ||opts.stop==='handoff'&&snap.nativeHandoff?.fromRoomId===opts.parent;
        if(done){clearTimeout(timer);resolve({rows,frames});return;}
        requestAnimationFrame(frame);
      } requestAnimationFrame(frame);
    }); }''', {**config, 'name': name, 'stop': stop})
    if move_to is not None:
        walk_to(page, config, move_to)
    result = page.evaluate('()=>window.__ATF_V162_COLLECTION__')
    rows = result['rows']
    (output / (name + '.json')).write_text(json.dumps(rows, indent=2))
    continuous = True
    transfers = 0
    for first, second in zip(rows, rows[1:]):
        a, b = first['actor'], second['actor']
        if not a or not b:
            continue
        if a['roomId'] == b['roomId']:
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
      function read(){const s=h.getSnapshot().npcMedicalRouteV162.routes[opts.id],a=s.actor,p=h.player,
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
s.needsPlayerCreationV84=false;s.scene='hub';s.player.name='QA Noor morgue V162';
s.settings.reducedMotion=false;s.clock.hour=5.5;
Object.assign(s.hub,{deck:c.deck,roomId:c.parent,positionX:2730,positionY:532});
s.crew.find(m=>m.id===c.crew).appearanceV110={schema:110,markingId:'olive'};
console.log(JSON.stringify(s));'''
    if args.fixture:
        raw = args.fixture.resolve().read_bytes()
        report['suppliedFixture'] = str(args.fixture.resolve())
    else:
        result = subprocess.run(['node', '--input-type=module', '-e', script, json.dumps(config)], cwd=repo, capture_output=True, text=True, check=True)
        raw = result.stdout.encode()
    name = config['id'] + '-disclosed-native0530.json'
    (output / name).write_bytes(raw)
    report.setdefault('fixtureSha256', {})[name] = hashlib.sha256(raw).hexdigest()
    return raw


source_start = manifest()
(output / 'runtime-source-start-v162.json').write_text(json.dumps(source_start, indent=2))
with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True, executable_path=os.environ.get('ATF_CHROMIUM_EXECUTABLE', '/usr/bin/chromium'))
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
            page.wait_for_function('name=>__ATF_V51__?.saveSystem.data.player.name===name', arg='QA Noor morgue V162')
            open_hub(page, config)
            initial = observed(page, config)
            check(prefix + ': initial native body is unique,44x92 and supported in its true parent room',
                  initial['visibleCount'] == 1 and initial['visibleSingleton'] and initial['actualActor']['roomId'] == config['parent']
                  and initial['actualActor']['w'] == 44 and initial['actualActor']['h'] == 92 and initial['actualActor']['y'] == 532)
            capture(page, prefix + '-01-parent-native0530.png')
            page.locator('#exit-hub').click()
            open_view(page, 'command')
            page.locator(config['action']).click()
            page.wait_for_function('hour=>__ATF_V51__.saveSystem.data.clock.hour===hour', arg=config['hour'])
            open_hub(page, config)
            if args.comparison_stage == 'after':
                active = observed(page, config)
                check(prefix + ': real elapsed-time command preserves owned parent origin instead of adopting a sampled annex post',
                      active['route']['actor']['roomId'] == config['parent'] and active['route']['actor']['crossings'] == 0
                      and active['route']['preLoadTravelObserved'] is False)
                check(prefix + ': both rooms keep complete2D presentation', all(row['mode'] == '2d' and not row['mixedProjectionAllowed'] for row in active['route']['presentation']))
                collect(page, config, prefix + '-02-outbound-mid-door', 'mid-cover')
                page.locator('#exit-hub').click()
                paused = observed(page, config)
                durable = page.evaluate('id=>JSON.parse(localStorage.getItem("atf-v47-profile-1")).hub.npcMedicalRouteV162.routes[id]', config['id'])
                check(prefix + ': real exit persists supported actor and exact door phase', durable['actor'] == paused['route']['actor'] and durable['actor']['stage'] in ['covering', 'revealing'])
                (output / (prefix + '-durable-covered-door.json')).write_text(json.dumps(durable, indent=2))
                page.reload(wait_until='domcontentloaded')
                page.locator('#title-start').click(timeout=45000)
                page.locator('#title-options').click()
                page.evaluate('''c=>{const read=''' + OBSERVE + '''; document.addEventListener('click',function record(event){
                  if(event.target.closest('[data-view]')?.dataset.view!=='hub')return;
                  window.__ATF_V162_RESUME_OBSERVATION__=read(c);document.removeEventListener('click',record);
                });}''', config)
                open_hub(page, config, art=False)
                restored = page.evaluate('()=>window.__ATF_V162_RESUME_OBSERVATION__')
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
                    page.wait_for_function('''p=>{const a=__ATF_HUB__.getSnapshot().npcMedicalRouteV162.routes[p.id].actor;
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
                rows = collect(page, config, prefix + '-07-return-and-handoff', 'handoff', move_to=config['parentDoor'] + 600)
                last = next(row['actor'] for row in reversed(rows) if row['actor'])
                handoff = observed(page, config)['route']['nativeHandoff']
                check(prefix + ': real floor return reaches parent home before explicit unobserved native handoff',
                      last['roomId'] == config['parent'] and abs(last['x'] - last['homeX']) < .25
                      and last['crossings'] == 2 and last['arrivals'] == 2 and handoff['observedTravel'] is False)
                check(prefix + ': continuous return observes exactly one closed-leaf portal transfer', report['observedPortalTransfers'][prefix + '-07-return-and-handoff'] == 1)
                capture(page, prefix + '-08-parent-after-native-handoff.png')
            report['routes'].append({'id': prefix, 'status': 'passed'})
            context.close()
        check('native pages/assets have no runtime, HTTP or request errors', not report['pageErrors'] and not report['requestFailures'] and not report['httpErrors'])
        report['status'] = 'passed'
    except Exception as error:
        report['status'] = 'failed'; report['error'] = str(error)
        try:
            report['failureState'] = observed(page, config)
            page.screenshot(path=str(output / 'failure.png'), full_page=True)
        except Exception as capture_error:
            report['captureError'] = str(capture_error)
        print('::error file=scripts/qa-npc-medical-route-v162.py::' + str(error).replace('%', '%25').replace('\r', '%0D').replace('\n', '%0A'), flush=True)
        raise
    finally:
        browser.close()
        source_end = manifest()
        (output / 'runtime-source-end-v162.json').write_text(json.dumps(source_end, indent=2))
        report['sourceUnchanged'] = source_start == source_end
        if not report['sourceUnchanged']:
            report['status'] = 'failed'
        (output / 'report.json').write_text(json.dumps(report, indent=2, ensure_ascii=False))
if report['status'] != 'passed':
    raise SystemExit(1)
