"""Native Cal624/468 loop, generated climb pixels and durable real supports.

Only a disclosed05h30 Save is imported. Actual command buttons advance to
09h30/12h30; all traversal, occupation and dialogue use native keyboard/UI.
Browser evaluations observe owners/canvas and never write engine state.
"""
import argparse
import base64
import datetime
import hashlib
import importlib.metadata
import json
import math
import os
from pathlib import Path
import subprocess
import time
import urllib.request
from playwright.sync_api import sync_playwright

parser = argparse.ArgumentParser()
parser.add_argument('--base', default=os.environ.get('ATF_BASE_URL', 'http://127.0.0.1:4173'))
parser.add_argument('--output', type=Path, required=True)
parser.add_argument('--fixture', type=Path)
parser.add_argument('--walking-interaction', action='store_true', help='Qualify native E/cancel, interaction hold and resumption on the real catwalk.')
parser.add_argument('--expect-build')
parser.add_argument('--expect-harness')
args = parser.parse_args()
repo = Path(__file__).resolve().parents[1]
output = args.output.resolve()
if output == repo or repo in output.parents:
    raise SystemExit('Evidence must remain outside the repository.')
output.mkdir(parents=True, exist_ok=True)
config_script = r'''import {NPC_CAL_LOGISTICS_ROUTE_V165 as d,NPC_CAL_LOGISTICS_GEOMETRY_V165 as g} from './src/npc-cal-logistics-route-v165.js';
import {createDefaultSave} from './src/save.js';
const parentDoor=g.faces.parent.opening.x+(g.faces.parent.opening.w-44)/2;
const annexDoor=g.faces.local.opening.x+(g.faces.local.opening.w-44)/2;
const c={...d,parentDoor,annexDoor,clear:g.parent.xStart+96,ladder:g.ladder,
floorClear:g.ladder.x+160,returnFloorClear:g.ladder.x-260};
const s=createDefaultSave();s.needsPlayerCreationV84=false;s.scene='hub';s.player.name='QA Cal native V165';
s.settings.reducedMotion=false;s.clock.hour=5.5;
Object.assign(s.hub,{deck:d.deck,roomId:d.parentRoomId,positionX:c.clear,positionY:532});
console.log(JSON.stringify({config:c,save:s}));'''
prepared = json.loads(subprocess.check_output(['node', '--input-type=module', '-e', config_script], cwd=repo, text=True))
config = prepared['config']
raw_fixture = args.fixture.read_bytes() if args.fixture else (json.dumps(prepared['save']) + '\n').encode()
(output / 'cal-logistics-disclosed-native0530.json').write_bytes(raw_fixture)
report = {'status': 'running', 'startedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
          'method': 'Disclosed05h30 native Save; colony-relief4h to09h30 and frontier-recon3h to12h30; keyboard/E, actual mounted exit/reload, dialogue and occupied return.',
          'fixtureSha256': hashlib.sha256(raw_fixture).hexdigest(), 'checks': [], 'captures': [],
          'pageErrors': [], 'requestFailures': [], 'httpErrors': [],
          'limitations': ['Automated native controls, no human participant.',
                         'Same-deck Cal parent/annex vertical loop; no station-to-work interdeck claim.',
                         'Generated Cal adaptation is not canon-exact1:1 art.',
                         'Command elapsed hours and native timetable handoff are not observed travel.']}


def check(label, condition):
    assert condition, label
    report['checks'].append(label)
    print('PASS ' + label, flush=True)


def identity():
    with urllib.request.urlopen(args.base.rstrip('/') + '/build-info.json', timeout=20) as response:
        raw = response.read()
    info = json.loads(raw)
    return {'sourceCommit': info['sourceCommit'], 'buildId': info['buildId'],
            'buildInfoSha256': hashlib.sha256(raw).hexdigest()}


def manifest():
    files = sorted([*repo.glob('src/**/*.js'), repo / 'sw.js', repo / 'package.json', Path(__file__).resolve(),
                    repo / 'assets/openai/sprites/npcs/rig-v165/cal-mercer-climb-parts-v165.png',
                    repo / 'assets/openai/sprites/normalized/npcs/cal-mercer-locomotion-sheet.png',
                    repo / 'assets/openai/sprites/normalized/npcs/cal-mercer-mission-sheet.png'])
    return {str(p.relative_to(repo)): hashlib.sha256(p.read_bytes()).hexdigest() for p in files}


OBSERVE = '''()=>{const h=__ATF_HUB__,whole=h.getSnapshot(),s=whole.npcCalLogisticsRouteV165;
 const a=h.getNpcCalLogisticsActorV165?.(),annex=h.currentAnnexV71?.()?.id||null;
 const r=h.npcRoutineResolutionsV62?.get('crew-16-cal-mercer');
 const visible=annex?h.activeAnnexNpcsV141():h.npcs;
 return {route:structuredClone(s),running:h.running,deck:h.state.deck,roomId:h.state.roomId,annex,
 clock:structuredClone(h.npcRoutineContextV62.clock),player:{x:h.player.x,y:h.player.y,w:h.player.w,h:h.player.h,vx:h.player.vx},
 actual:a?{crewId:a.crewId,x:a.x,y:a.y,w:a.w,h:a.h,roomId:a.roomId,facing:a.facing,climbing:a.climbing,
   alive:a.alive,vx:a.vx,workClock:a.workClock,supportClock:a.supportClock}:null,
 routine:r?{phase:r.phase,roomId:r.roomId,deck:r.deck,reason:r.reason,alert:r.alert,missionAssigned:r.missionAssigned,needsCare:r.needsCare}:null,
 visibleCount:visible.filter(n=>n.crewId==='crew-16-cal-mercer').length,
 visibleSingleton:visible.filter(n=>n.crewId==='crew-16-cal-mercer').every(n=>n===a),
 ownerCount:(h.getNpcServiceOwnedActorsV163?.()||[]).filter(n=>n.crewId==='crew-16-cal-mercer').length,
 traffic:structuredClone(whole.npcServiceTrafficV163||null),
 interaction:structuredClone(h.hubNpcInteractions['crew-16-cal-mercer']||null)};}'''


def observed(page):
    return page.evaluate(OBSERVE)


def observed_station_origin_v181(state):
    """Accept only a real pre-watch station body, never an inferred template."""
    route = state.get('route') or {}
    actor, actual, routine = route.get('actor') or {}, state.get('actual') or {}, state.get('routine') or {}
    hour = (state.get('clock') or {}).get('hour')
    if not (isinstance(hour, (int, float)) and math.isfinite(hour) and 0 <= hour < 6
            and routine.get('phase') == 'station' and routine.get('roomId') == 'vehicle-bay'
            and routine.get('deck') == 2 and routine.get('reason') == 'daily-schedule'
            and not any(routine.get(key) for key in ['alert', 'missionAssigned', 'needsCare'])
            and state.get('deck') == 2 and state.get('annex') is None
            and state.get('visibleCount') == 1 and state.get('visibleSingleton') is True and state.get('ownerCount') == 1
            and route.get('nativeHandoff') is None and route.get('initialCondition') == 'vehicle-bay'
            and actor.get('crewId') == 'crew-16-cal-mercer' and actor.get('deck') == 2
            and actor.get('roomId') == actor.get('admittedRoomId') == actor.get('targetRoomId') == 'vehicle-bay'
            and actor.get('stage') == 'service' and actor.get('reason') == 'daily-schedule'
            and actor.get('y') == 532 and actor.get('homeX') == actor.get('x')
            and all(actor.get(key) == 0 for key in ['distance', 'verticalDistance', 'crossings', 'arrivals'])
            and all(isinstance(actor.get(key), (int, float)) and math.isfinite(actor[key]) for key in ['x', 'time'])
            and actor.get('time', -1) >= 0
            and actual.get('crewId') == actor['crewId'] and actual.get('roomId') == actor['roomId']
            and actual.get('x') == actor['x'] and actual.get('y') == actor['y']
            and actual.get('w') == 44 and actual.get('h') == 92 and actual.get('alive') is True):
        return None
    return {'crewId': actor['crewId'], 'deck': 2, 'roomId': 'vehicle-bay', 'x': actor['x'], 'y': 532,
            'facing': actor['facing'], 'observedHour': hour, 'observedNativeTime': actor['time'],
            'source': 'observed-native-station-before-watch'}


def station_origin_bookmark_v181(origin, actor):
    return bool(origin and actor and origin.get('source') == 'observed-native-station-before-watch'
                and actor.get('crewId') == origin['crewId'] and actor.get('deck') == origin['deck']
                and actor.get('admittedRoomId') == origin['roomId'] and actor.get('homeX') == origin['x'])


def observed_station_logistics_return_v181(origin, arrival, rows, final):
    """The bounded local receipt never credits the later V62 routine handoff."""
    post = (arrival.get('route') or {}).get('actor') or {}
    retained = [(row.get('route') or {}).get('actor') for row in rows if (row.get('route') or {}).get('actor')]
    if not retained:
        return False
    home = retained[-1]
    handoff = final.get('nativeHandoff') or {}
    return (station_origin_bookmark_v181(origin, post) and all(station_origin_bookmark_v181(origin, actor) for actor in retained)
            and all(row.get('ownerCount') == 1 for row in rows if (row.get('route') or {}).get('actor'))
            and post.get('roomId') == post.get('targetRoomId') == 'logistics' and post.get('stage') == 'service'
            and post.get('y') == 376 and post.get('crossings') == post.get('arrivals') == 1
            and abs(post.get('verticalDistance', -1) - 156) < .001
            and arrival.get('ownerCount') == arrival.get('visibleCount') == 1 and arrival.get('visibleSingleton') is True
            and home.get('roomId') == home.get('targetRoomId') == origin['roomId'] and home.get('stage') == 'service'
            and abs(home.get('x', math.inf) - origin['x']) < .26 and home.get('y') == origin['y']
            and home.get('crossings') == home.get('arrivals') == 2 and abs(home.get('verticalDistance', -1) - 312) < .001
            and final.get('actor') is None and handoff.get('crewId') == origin['crewId']
            and handoff.get('fromRoomId') == origin['roomId'] and handoff.get('reason') == 'daily-schedule'
            and handoff.get('observedTravel') is False)


def observe_next_hub_entry_v181(page):
    # Observe the real UI event after its native target handler. Do not replace
    # RAF, pause the engine or overwrite an actor to obtain an early snapshot.
    page.evaluate('''()=>{document.addEventListener('click',function read(event){
      if(event.target.closest('[data-view]')?.dataset.view!=='hub')return;
      window.__ATF_CAL_WATCH_ENTRY_V181__={state:(''' + OBSERVE + ''')(),capturedAt:performance.now(),nativeTime:__ATF_HUB__.animationTime};
      document.removeEventListener('click',read);});}''')


CAL_INTERACTION_PROGRESS_V182 = '''function createCalInteractionProgressV182(before,accepted,started){
  let failure=null,previous=accepted,heldFrames=0,heldNativeSeconds=0,releasedAt=null,resumedDistance=0;
  const a=accepted?.route?.actor,b=before?.route?.actor;
  const pose=s=>s?.route?.actor;
  function fail(reason){failure ||= reason;return{status:'failed',reason:failure};}
  function owned(s){const n=pose(s),p=s?.actual;return s?.ownerStamp===1&&s.ownerCount===1&&s.visibleCount===1&&s.visibleSingleton===true
    &&n?.crewId==='crew-16-cal-mercer'&&n.deck===2&&n.roomId==='logistics'&&n.targetRoomId==='logistics'
    &&n.stage==='walking'&&n.y===376&&n.doorProgress===0&&!n.lift&&n.verticalVelocity===0
    &&p?.crewId===n.crewId&&p.roomId===n.roomId&&p.x===n.x&&p.y===n.y&&p.w===44&&p.h===92&&p.alive===true
    &&s.deck===2&&s.annex==='logistics'&&!s.routine?.alert&&!s.routine?.missionAssigned&&!s.routine?.needsCare;}
  function validClock(s){return Number.isFinite(s?.nativeTime)&&Number.isFinite(pose(s)?.time)
    &&Number.isFinite(s?.actual?.workClock)&&s.actual.workClock>=0&&s.actual.workClock<=2.400001;}
  const evidence=before?.walkingEvidence,p=evidence?.previous,c=evidence?.current;
  const walked=p&&c&&p.stage==='walking'&&c.stage==='walking'&&p.reason==='daily-schedule'&&c.reason==='daily-schedule'
    &&c.time>p.time&&c.x>p.x&&c.distance>p.distance&&c.x-p.x<=27*(c.time-p.time)+.03
    &&Math.abs(c.distance-p.distance-(c.x-p.x))<.03&&b?.time>=c.time&&b.x>=c.x;
  if(!owned(before)||!owned(accepted)||!validClock(before)||!validClock(accepted)
    ||!walked
    ||before.running!==true||before.dialogOpen!==false||before.actual.vx<=0||b.velocity<=0||b.reason!=='daily-schedule'
    ||before.actual.workClock!==0||before.actual.supportClock!==0||accepted.actual.supportClock!==0||a.reason!=='daily-schedule'
    ||accepted.running!==false||accepted.dialogOpen!==true||Math.abs(accepted.actual.workClock-2.4)>1e-6
    ||accepted.actual.vx!==0||accepted.interaction?.count!==(before.interaction?.count||0)+1
    ||a.crossings!==b.crossings||a.arrivals!==b.arrivals||a.crossings!==1||a.arrivals!==0
    ||a.time<b.time||accepted.nativeTime<before.nativeTime
    ||a.x<b.x||a.x-b.x>27*(a.time-b.time)+.03||Math.abs(a.distance-b.distance-(a.x-b.x))>.03)
    failure='cal-interaction-invalid-native-start';
  function snapshot(now){return{wallMs:now-started,heldFrames,heldNativeSeconds,releasedAt,resumedDistance,
    wallBudgetMs:90000,nativeBudgetSeconds:8,logicalOwnerStamp:1};}
  function check(now){return failure||(now-started>90000?'cal-interaction-wall-budget':null);}
  function observe(s,now){
    const problem=check(now);if(problem)return fail(problem);
    if(!owned(s))return fail('cal-interaction-owner-or-on-foot-segment-changed');
    if(!validClock(s)||s.nativeTime<previous.nativeTime||pose(s).time<pose(previous).time)
      return fail('cal-interaction-native-clock-invalid');
    const n=pose(s),dt=n.time-pose(previous).time,elapsed=n.time-a.time,dx=n.x-a.x;
    if(elapsed>8)return fail('cal-interaction-no-physical-resumption');
    if(n.crossings!==a.crossings||n.arrivals!==a.arrivals||n.homeX!==a.homeX||n.admittedRoomId!==a.admittedRoomId
      ||n.verticalDistance!==a.verticalDistance||Math.abs(n.x-pose(previous).x)>27*dt+.03
      ||Math.abs(n.distance-pose(previous).distance-Math.abs(n.x-pose(previous).x))>.03)
      return fail('cal-interaction-physical-receipt-changed');
    if(s.actual.workClock>previous.actual.workClock+1e-6)return fail('cal-interaction-clock-rearmed');
    if(s.dialogOpen){
      if(s.running!==false||n.time!==a.time||s.nativeTime!==accepted.nativeTime||n.x!==a.x||n.distance!==a.distance)
        return fail('cal-interaction-dialogue-pause-moved');
      previous=s;return{status:'waiting',reason:'native-dialogue-still-open'};
    }
    if(s.running!==true)return fail('cal-interaction-game-paused-after-cancel');
    if(s.actual.workClock>0){
      if(n.x!==a.x||n.distance!==a.distance||n.y!==a.y||s.actual.vx!==0)
        return fail('cal-interaction-motion-during-native-hold');
      // E pauses the UI before the route's next update. Its saved velocity
      // may still be the last walking velocity until a real native delta.
      if(elapsed>0){
        if(n.reason!=='interaction'||n.velocity!==0||Math.abs(s.actual.workClock+elapsed-2.4)>1e-5)
          return fail('cal-interaction-hold-clock-or-reason-invalid');
        heldFrames++;heldNativeSeconds=Math.max(heldNativeSeconds,elapsed);
      }
    }else{
      if(heldFrames<2||heldNativeSeconds<2.2||elapsed<2.3)return fail('cal-interaction-native-hold-not-observed');
      releasedAt ??= elapsed;
      if(n.reason!=='daily-schedule')return fail('cal-interaction-resumption-not-daily-walking');
      if(dx>=1&&n.distance-a.distance>=1&&s.actual.vx>0&&n.velocity>0){
        resumedDistance=n.distance-a.distance;previous=s;return{status:'resumed',reason:'same-native-owner-held-and-physically-resumed'};
      }
    }
    previous=s;return{status:'waiting',reason:'native-interaction-hold-or-resumption'};
  }
  return{observe,check,snapshot};
}'''


def exercise_walking_interaction_v182(page):
    print('STEP Cal native catwalk walking E/cancel and interaction hold', flush=True)
    page.evaluate('''()=>{const h=__ATF_HUB__,owner=h.getNpcCalLogisticsActorV165(),identities=new WeakMap([[owner,1]]);
      const read=()=>({...(''' + OBSERVE + ''')(),nativeTime:h.animationTime,
        ownerStamp:identities.get(h.getNpcCalLogisticsActorV165())||null,dialogOpen:!document.querySelector('#hub-dialogue').hidden});
      window.__ATF_CAL_INTERACTION_REFERENCE_V182__={read,before:null,previous:null,evidence:null};}''')
    page.wait_for_function('''()=>{const h=__ATF_HUB__,ref=window.__ATF_CAL_INTERACTION_REFERENCE_V182__,sample=ref.read(),s=sample.route?.actor,a=h.getNpcCalLogisticsActorV165?.(),previous=ref.previous;
      ref.previous=s?{x:s.x,time:s.time,distance:s.distance,stage:s.stage,reason:s.reason}:null;
      const moving=h.running&&sample.ownerStamp===1&&s?.roomId==='logistics'&&s.stage==='walking'&&s.reason==='daily-schedule'
        &&s.y===376&&s.velocity>0&&a?.vx>0&&previous?.stage==='walking'&&previous.reason==='daily-schedule'
        &&s.time>previous.time&&s.x>previous.x&&s.distance>previous.distance
        &&h.player.y+h.player.h===468&&Math.abs(h.player.vx)<.1&&!h.player.climbing
        &&h.nearestAnnexNpcV141?.()===a&&!h.nearestAnnexStationV71?.()&&!h.nearestAnnexExitV71?.()
        &&!h.annexTransitionV71&&!h.hubDoorClosingV142;
      if(moving)ref.evidence={previous,current:ref.previous};return moving;}''', timeout=90000)
    page.evaluate('''()=>{const ref=window.__ATF_CAL_INTERACTION_REFERENCE_V182__;ref.before={...ref.read(),walkingEvidence:ref.evidence};}''')
    page.locator('#hub-canvas').focus()
    page.keyboard.press('KeyE', delay=80)
    page.locator('#hub-dialogue').wait_for(state='visible')
    check('the real moving Cal receives native E and opens his own dialogue', 'Mercer' in page.locator('#hub-dialogue-speaker').inner_text())
    binding = page.evaluate('''()=>{const ref=window.__ATF_CAL_INTERACTION_REFERENCE_V182__,accepted=ref.read(),started=performance.now(),
      progress=(''' + CAL_INTERACTION_PROGRESS_V182 + ''')(ref.before,accepted,started);
      window.__ATF_CAL_INTERACTION_WAIT_V182__=new Promise(resolve=>{const rows=[];let done=false,raf;
        function finish(status,reason){if(done)return;done=true;clearInterval(timer);cancelAnimationFrame(raf);
          resolve({status,reason,before:ref.before,accepted,rows,...progress.snapshot(performance.now())});}
        const timer=setInterval(()=>{const reason=progress.check(performance.now());if(reason)finish('failed',reason);},1000);
        function frame(){if(done)return;const row=ref.read();rows.push(row);const result=progress.observe(row,performance.now());
          if(result.status!=='waiting')return finish(result.status,result.reason);raf=requestAnimationFrame(frame);}
        raf=requestAnimationFrame(frame);
      });return{before:ref.before,accepted,scope:'same-uninterrupted-hub-session-external-WeakMap-owner-identity'};}''')
    report['walkingInteractionBindingV182'] = binding
    page.locator('#hub-dialogue-cancel').click()
    page.wait_for_function('()=>__ATF_HUB__.running&&document.querySelector("#hub-dialogue").hidden')
    # Only the real player moves. Clear the forward catwalk during the native
    # interaction clock so that the physical resumption cannot be a player block.
    walk_to(page, config['postX'] + 112)
    result = page.evaluate('async()=>window.__ATF_CAL_INTERACTION_WAIT_V182__')
    (output / 'walking-interaction-v182.json').write_text(json.dumps(result, indent=2))
    report['walkingInteractionV182'] = {key: result.get(key) for key in ['status', 'reason', 'wallMs', 'heldFrames', 'heldNativeSeconds', 'releasedAt', 'resumedDistance', 'logicalOwnerStamp']}
    print('CAL_INTERACTION_ACK ' + json.dumps(report['walkingInteractionV182'], separators=(',', ':')), flush=True)
    check('after native cancel the running game holds the same Cal owner on his2.4s interaction clock and observes physical walking resumption', result['status'] == 'resumed')


def open_view(page, view):
    toggle = page.locator('#menu-toggle')
    if toggle.is_visible() and 'open' not in (page.locator('.rail').get_attribute('class') or '').split():
        toggle.click()
    page.locator(f'[data-view="{view}"]').click()


def open_hub(page):
    open_view(page, 'hub')
    page.wait_for_function('()=>__ATF_HUB__?.running&&__ATF_HUB__.getSnapshot().npcCalLogisticsRouteV165?.actor', timeout=90000)
    page.wait_for_function('()=>__ATF_HUB__.getSnapshot().npcCalLogisticsRouteV165.artReady', timeout=90000)
    page.locator('#hub-canvas').focus()


def capture(page, name):
    page.locator('#hub-canvas').screenshot(path=str(output / name))
    report['captures'].append({'file': name, 'sha256': hashlib.sha256((output / name).read_bytes()).hexdigest()})


def walk_to(page, x, tolerance=5):
    for attempt in range(18):
        current = observed(page)['player']['x']
        if abs(x - current) <= tolerance:
            return
        key = 'KeyD' if x > current else 'KeyA'
        page.locator('#hub-canvas').focus()
        if abs(x - current) > 26:
            page.keyboard.down(key)
            try:
                page.wait_for_function('o=>o.right?__ATF_HUB__.player.x>=o.x-12:__ATF_HUB__.player.x<=o.x+12',
                                       arg={'x': x, 'right': x > current}, timeout=90000)
            finally:
                page.keyboard.up(key)
        else:
            page.keyboard.press(key, delay=max(16, min(65, abs(x - current) * 3)))
        page.wait_for_function('()=>Math.abs(__ATF_HUB__.player.vx)<.1', timeout=15000)
    raise AssertionError('Native walking failed to settle at the real target.')


def enter_or_leave(page, entering):
    walk_to(page, config['parentDoor'] if entering else config['annexDoor'])
    page.locator('#hub-canvas').focus()
    page.keyboard.press('KeyE', delay=80)
    page.wait_for_function('want=>Boolean(__ATF_HUB__.currentAnnexV71?.())===want&&!__ATF_HUB__.annexTransitionV71',
                           arg=entering, timeout=45000)


def collect(page, name, stop, exit_after=False):
    print('STEP ' + name, flush=True)
    page.evaluate('''opts=>{window.__ATF_CAL_COLLECTION__=new Promise((resolve,reject)=>{
      const h=__ATF_HUB__,rows=[],frames={},started=performance.now();let origin=null,last=null,lastAt=started,done=false;
      function end(error){if(done)return;done=true;clearInterval(timer);error?reject(Error(error)):resolve({rows,frames});}
      const timer=setInterval(()=>{if(performance.now()-started>900000)end('Cal wall budget');
        else if(performance.now()-lastAt>60000)end('Cal physical progress budget');},1000);
      function bitmap(){const a=document.querySelector('#hub-canvas'),b=document.createElement('canvas');
        b.width=a.width;b.height=a.height;b.getContext('2d').drawImage(a,0,0);return b;}
      function tick(){if(done)return;const s=h.getSnapshot().npcCalLogisticsRouteV165,a=s.actor;
        const row={route:structuredClone(s),player:{x:h.player.x,y:h.player.y},ownerCount:(h.getNpcServiceOwnedActorsV163?.()||[])
          .filter(n=>n.crewId==='crew-16-cal-mercer').length};rows.push(row);
        if(a){origin??=a.time;if(a.time-origin>260)return end('Cal simulated budget');
          if(!last||Math.abs(a.x-last.x)>.5||Math.abs(a.y-last.y)>.5||a.stage!==last.stage
            ||Math.abs(a.doorProgress-last.doorProgress)>.01){last={...a};lastAt=performance.now();}
          const phase=a.roomId+'-'+a.stage;if(!frames[phase])frames[phase]={row,bitmap:bitmap()};
          if(s.rig?.drawn&&s.rig.stage===a.stage&&Math.abs(s.rig.actorY-a.y)<.5) {
            const key=a.stage+'-height-'+Math.floor((a.y-376)/33);if(!frames[key])frames[key]={row,bitmap:bitmap()};
          }
        }
        const doneNow=opts.stop==='mounted'&&a?.stage==='climbing-up'&&a.y<485&&a.y>430
          ||opts.stop==='service'&&a?.roomId==='logistics'&&a.stage==='service'&&a.y===376&&a.arrivals===1
          ||opts.stop==='floor-dismount'&&a?.stage==='floor-dismount'&&a.phaseProgress>.8
          ||opts.stop==='occupied'&&a?.reason==='occupied'&&a.roomId==='logistics'&&a.crossings===1&&a.y===532
          ||opts.stop==='handoff'&&s.nativeHandoff?.fromRoomId==='vehicle-bay';
        if(doneNow)return end();requestAnimationFrame(tick);
      }requestAnimationFrame(tick);
    });}''', {'stop': stop})
    page.evaluate('async()=>{await window.__ATF_CAL_COLLECTION__;return true;}')
    if exit_after:
        page.locator('#exit-hub').click()
    result = page.evaluate('''async()=>{const r=await window.__ATF_CAL_COLLECTION__;return {rows:r.rows,
      frames:Object.fromEntries(Object.entries(r.frames).map(([k,f])=>[k,{row:f.row,png:f.bitmap.toDataURL('image/png')}]))};}''')
    rows = result['rows']
    (output / (name + '.json')).write_text(json.dumps(rows, indent=2))
    continuous = True
    for first, second in zip(rows, rows[1:]):
        a, b = first['route']['actor'], second['route']['actor']
        if not a or not b:
            continue
        dt = b['time'] - a['time']
        if a['roomId'] == b['roomId']:
            continuous &= abs(b['x'] - a['x']) <= 27 * dt + .03 and abs(b['y'] - a['y']) <= 24 * dt + .03
        else:
            continuous &= a['stage'] == 'covering' and b['stage'] == 'revealing' and b['doorProgress'] == 0
    check(name + ': actual owner motion is bounded and coordinate changes require covered paired leaves', continuous)
    check(name + ': every retained body has one real owner', all(row['ownerCount'] == 1 for row in rows if row['route']['actor']))
    check(name + ': every retained phase keeps the actually observed station bookmark',
          all(station_origin_bookmark_v181(report.get('stationOriginV181'), row['route']['actor']) for row in rows if row['route']['actor']))
    for key, frame in result['frames'].items():
        file = name + '-' + key + '.png'
        (output / file).write_bytes(base64.b64decode(frame['png'].split(',')[1]))
        report['captures'].append({'file': file, 'sha256': hashlib.sha256((output / file).read_bytes()).hexdigest()})
    report.setdefault('collections', {})[name] = {'samples': len(rows), 'last': rows[-1]}
    return rows


report['identityBefore'] = identity()
report['sourceCommit'] = report['identityBefore']['sourceCommit']
report['profileName'] = 'npc-cal-logistics-route-v165'
report['comparisonStage'] = 'after'
report['harnessCommit'] = subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=repo, text=True).strip()
if args.expect_build and report['identityBefore']['sourceCommit'] != args.expect_build:
    raise SystemExit('Served build differs from declared observation.')
if args.expect_harness and (report['harnessCommit'] != args.expect_harness or subprocess.check_output(['git', 'status', '--porcelain'], cwd=repo, text=True).strip()):
    raise SystemExit('Harness is not the exact clean declared commit.')
source_start = manifest()
(output / 'runtime-source-start-v165.json').write_text(json.dumps(source_start, indent=2))
with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True, **({'executable_path': os.environ['ATF_CHROMIUM_EXECUTABLE']} if os.environ.get('ATF_CHROMIUM_EXECUTABLE') else {}))
    report['tooling'] = {'playwright': importlib.metadata.version('playwright'), 'chromium': browser.version}
    context = browser.new_context(viewport={'width': 1600, 'height': 1000}, service_workers='block')
    page = context.new_page()
    page.set_default_timeout(45000)
    page.on('pageerror', lambda error: report['pageErrors'].append(str(error)))
    page.on('requestfailed', lambda request: report['requestFailures'].append({'url': request.url, 'failure': request.failure}))
    page.on('response', lambda response: report['httpErrors'].append({'url': response.url, 'status': response.status}) if response.status >= 400 else None)
    page.on('dialog', lambda dialog: dialog.accept())
    try:
        page.goto(args.base, wait_until='domcontentloaded')
        page.locator('#title-start').click(timeout=45000)
        page.locator('#title-options').click()
        page.locator('#save-import').set_input_files({'name': 'cal-native0530.json', 'mimeType': 'application/json', 'buffer': raw_fixture})
        page.wait_for_function('()=>__ATF_V51__?.saveSystem.data.player.name==="QA Cal native V165"')
        open_hub(page)
        initial = observed(page)
        check('native05h30 Cal is one44x92 body on the vehicle-bay floor', initial['visibleCount'] == 1
              and initial['visibleSingleton'] and initial['actual']['roomId'] == 'vehicle-bay'
              and initial['actual']['w'] == 44 and initial['actual']['h'] == 92 and initial['actual']['y'] == 532)
        origin = observed_station_origin_v181(initial)
        check('the pre-watch station origin is observed on the sole native Cal rather than inferred from a template', origin is not None)
        report['stationOriginV181'] = origin
        (output / 'station-origin-v181.json').write_text(json.dumps({'origin': origin, 'observation': initial}, indent=2))
        capture(page, '01-native-Cal-before-watch.png')
        enter_or_leave(page, True)
        walk_to(page, config['floorClear'])
        if args.walking_interaction:
            walk_to(page, config['ladder']['x'])
            page.keyboard.down('KeyW')
            try:
                page.wait_for_function('()=>__ATF_HUB__.player.y+__ATF_HUB__.player.h<=468.1', timeout=90000)
            finally:
                page.keyboard.up('KeyW')
            walk_to(page, config['ladder']['x'] + 28)
        page.locator('#exit-hub').click()
        saved_station = page.evaluate('()=>JSON.parse(localStorage.getItem("atf-v47-profile-1")).hub.npcCalLogisticsRouteV165.actor')
        check('native exit retains the exact observed station position and bookmark before the macro command',
              station_origin_bookmark_v181(origin, saved_station) and saved_station['roomId'] == origin['roomId']
              and saved_station['x'] == origin['x'] and saved_station['y'] == origin['y']
              and saved_station['crossings'] == saved_station['arrivals'] == 0)
        open_view(page, 'command')
        page.locator('[data-strategy-action="colony-relief"]').click()
        page.wait_for_function('()=>__ATF_V51__.saveSystem.data.clock.hour===9.5')
        observe_next_hub_entry_v181(page)
        open_hub(page)
        entry = page.evaluate('()=>({...window.__ATF_CAL_WATCH_ENTRY_V181__,observerAgeMs:performance.now()-window.__ATF_CAL_WATCH_ENTRY_V181__.capturedAt,nativeAgeSeconds:__ATF_HUB__.animationTime-window.__ATF_CAL_WATCH_ENTRY_V181__.nativeTime})')
        report['stationWatchEntryV181'] = entry
        check('the native hub entry restores the exact saved station body before physical traversal resumes',
              entry['state']['route']['actor'] == saved_station and entry['state']['ownerCount'] == 1)
        active = observed(page)
        check('actual4h command retains the true native origin with no preloaded arrival', active['route']['actor']['roomId'] == 'vehicle-bay'
              and active['route']['actor']['crossings'] == 0 and active['route']['preLoadTravelObserved'] is False)
        rows = collect(page, '02-real-outbound-to-mounted-save', 'mounted', exit_after=True)
        paused = observed(page)
        durable = page.evaluate('()=>JSON.parse(localStorage.getItem("atf-v47-profile-1")).hub.npcCalLogisticsRouteV165')
        (output / 'durable-mounted-state.json').write_text(json.dumps(durable, indent=2))
        check('native exit persists the exact mounted height, support phase and owner', durable['actor'] == paused['route']['actor']
              and durable['actor']['stage'] == 'climbing-up' and 376 < durable['actor']['y'] < 532)
        page.reload(wait_until='domcontentloaded')
        page.locator('#title-start').click(timeout=45000)
        page.locator('#title-options').click()
        page.evaluate('''()=>{document.addEventListener('click',function read(event){if(event.target.closest('[data-view]')?.dataset.view!=='hub')return;
          window.__ATF_CAL_RESUMED__=structuredClone(__ATF_HUB__.getSnapshot().npcCalLogisticsRouteV165.actor);
          document.removeEventListener('click',read);});}''')
        open_hub(page)
        check('reload restores mounted coordinates and phase before the first resumed frame', page.evaluate('()=>window.__ATF_CAL_RESUMED__') == durable['actor'])
        if args.walking_interaction:
            exercise_walking_interaction_v182(page)
        resumed = collect(page, '03-mounted-resume-to-real-catwalk', 'service')
        arrived = observed(page)
        if args.walking_interaction:
            identified_arrival = page.evaluate('()=>window.__ATF_CAL_INTERACTION_REFERENCE_V182__.read()')
            check('the externally identified Cal owner reaches his real catwalk post in the same uninterrupted visit',
                  identified_arrival['ownerStamp'] == 1 and identified_arrival['ownerCount'] == 1
                  and all(identified_arrival['route']['actor'][key] == arrived['route']['actor'][key]
                          for key in ['crewId', 'deck', 'roomId', 'x', 'y', 'homeX', 'stage', 'targetRoomId',
                                      'distance', 'verticalDistance', 'crossings', 'arrivals', 'admittedRoomId']))
            report['walkingInteractionArrivalV182'] = identified_arrival
        check('actual ascent reaches the physical468catwalk with one door crossing and156vertical pixels', arrived['route']['actor']['y'] == 376
              and arrived['route']['actor']['crossings'] == 1 and abs(arrived['route']['actor']['verticalDistance'] - 156) < .001)
        rigs = [row['route']['rig'] for row in [*rows, *resumed] if row['route']['rig'] and row['route']['rig']['drawn']]
        check('actual canvas uses the transparent Cal component rig during mounted movement', bool(rigs)
              and all(rig['source'] == 'separated-Cal-parts-position-owned-real-rungs' for rig in rigs))
        capture(page, '04-Cal-supported-upper-post.png')
        walk_to(page, config['ladder']['x'])
        page.keyboard.down('KeyW')
        try:
            page.wait_for_function('()=>__ATF_HUB__.player.y+__ATF_HUB__.player.h<=468.1', timeout=90000)
        finally:
            page.keyboard.up('KeyW')
        walk_to(page, config['postX'] - 84)
        page.wait_for_function('()=>__ATF_HUB__.nearestAnnexNpcV141?.()?.crewId==="crew-16-cal-mercer"')
        page.keyboard.press('KeyE', delay=80)
        page.locator('#hub-dialogue').wait_for(state='visible')
        check('native E opens Cal dialogue at his actual upper service post', 'Mercer' in page.locator('#hub-dialogue-speaker').inner_text()
              and observed(page)['visibleCount'] == 1)
        capture(page, '05-Cal-upper-post-dialogue.png')
        page.locator('[data-npc-dialogue-choice]:not([disabled])').first.click()
        page.locator('#hub-dialogue-continue').click()
        page.wait_for_function('()=>__ATF_HUB__.running')
        walk_to(page, config['ladder']['x'])
        page.keyboard.down('KeyS')
        try:
            page.wait_for_function('()=>__ATF_HUB__.player.y+__ATF_HUB__.player.h>=623.9', timeout=90000)
        finally:
            page.keyboard.up('KeyS')
        walk_to(page, config['returnFloorClear'])
        page.locator('#exit-hub').click()
        open_view(page, 'command')
        page.locator('[data-strategy-action="frontier-recon"]').click()
        page.wait_for_function('()=>__ATF_V51__.saveSystem.data.clock.hour===12.5')
        open_hub(page)
        descent = collect(page, '06-real-visible-descent-to-floor', 'floor-dismount')
        drawn_down = [row['route']['rig'] for row in descent if row['route']['rig']
                      and row['route']['rig']['drawn'] and row['route']['rig']['stage'] == 'climbing-down']
        check('the real reverse journey draws Cal on the same physical rungs before floor release', bool(drawn_down))
        enter_or_leave(page, False)
        walk_to(page, config['parentDoor'], tolerance=8)
        occupied_player = observed(page)['player']
        check('native player occupies the real paired return socket after braking', abs(occupied_player['x'] - config['parentDoor']) <= 8
              and occupied_player['y'] == 532 and abs(occupied_player['vx']) < .1)
        back = collect(page, '07-real-floor-return-and-occupied-door', 'occupied')
        occupied = observed(page)
        check('real descent returns to624 without crossing the occupied destination', occupied['route']['actor']['y'] == 532
              and occupied['route']['actor']['crossings'] == 1 and abs(occupied['route']['actor']['verticalDistance'] - 312) < .001)
        capture(page, '08-actual-occupied-return-door.png')
        # Move only the real player. The same physical Cal owner finishes.
        walk_to(page, config['clear'])
        finished = collect(page, '09-return-to-native-bookmark', 'handoff')
        last = next(row['route']['actor'] for row in reversed(finished) if row['route']['actor'])
        final = observed(page)['route']
        check('full loop reaches the original supported bookmark before native unobserved handoff', last['crossings'] == 2
              and last['arrivals'] == 2 and last['y'] == 532 and abs(last['x'] - last['homeX']) < .26
              and final['nativeHandoff']['observedTravel'] is False)
        station_loop = observed_station_logistics_return_v181(origin, arrived, finished, final)
        check('the local inspection returns to the actually observed station origin before the unobserved V62 handoff', station_loop)
        report['stationOriginToLogisticsReceiptV181'] = {'origin': origin, 'post': arrived['route']['actor'],
            'lastRetained': last, 'handoff': final['nativeHandoff'], 'observed': station_loop,
            'scope': 'observed-vehicle-bay-station-to-local-logistics-inspection-and-back',
            'v62DropshipHangarTravelObserved': False}
        check('native game and images have no runtime, request or HTTP errors', not report['pageErrors']
              and not report['requestFailures'] and not report['httpErrors'])
        report['status'] = 'passed'
    except Exception as error:
        report['status'] = 'failed'
        report['error'] = str(error)
        try:
            report['failureState'] = observed(page)
            page.screenshot(path=str(output / 'failure.png'), full_page=True)
        except Exception as capture_error:
            report['captureError'] = str(capture_error)
        raise
    finally:
        browser.close()
        report['identityAfter'] = identity()
        source_end = manifest()
        report['sourceUnchanged'] = source_start == source_end
        report['sameBuild'] = report['identityBefore'] == report['identityAfter']
        (output / 'runtime-source-end-v165.json').write_text(json.dumps(source_end, indent=2))
        report['captureSha256'] = {entry['file']: entry['sha256'] for entry in report['captures']}
        report['localVerticalCircuitObserved'] = report['status'] == 'passed'
        report['stationToWorkTravelObserved'] = False
        report['walkingInteractionObservedV182'] = report['status'] == 'passed' and report.get('walkingInteractionV182', {}).get('status') == 'resumed'
        report['stationOriginToLogisticsObservedV181'] = report['status'] == 'passed' and bool(report.get('stationOriginToLogisticsReceiptV181', {}).get('observed'))
        report['canonicalExact'] = False
        if not report['sourceUnchanged'] or not report['sameBuild']:
            report['status'] = 'failed'
            report['localVerticalCircuitObserved'] = False
            report['stationOriginToLogisticsObservedV181'] = False
            report['walkingInteractionObservedV182'] = False
        report['finishedAt'] = datetime.datetime.now(datetime.timezone.utc).isoformat()
        (output / 'report.json').write_text(json.dumps(report, indent=2, ensure_ascii=False))
if report['status'] != 'passed':
    raise SystemExit(1)
