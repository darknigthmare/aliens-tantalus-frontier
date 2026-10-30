"""Five native annex watches and actual courtesy via disclosed05h30 Save import, actual
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
import urllib.request
from playwright.sync_api import sync_playwright

parser = argparse.ArgumentParser()
parser.add_argument('--base', default=os.environ.get('ATF_BASE_URL', 'http://127.0.0.1:4173'))
parser.add_argument('--output', type=Path, required=True)
parser.add_argument('--route', choices=['all', 'maksim-arrival', 'inez-bioforge', 'asha-refuge', 'jun-water', 'mara-archives'], default='all')
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
    dict(id='maksim-arrival', crew='crew-08-maksim-orlov', speaker='Orlov', deck=3,
         origin='dropship-hangar', parent='dropship-hangar', annex='arrival-airlock', home=365,
         post=1220, parentDoor=1018, annexDoor=1754, hour=10.5, returnHour=13.5,
         player=225, clear=225, action='[data-strategy-action="salvage-run"]',
         returnAction='[data-strategy-action="frontier-recon"]'),
    dict(id='inez-bioforge', crew='crew-09-inez-harlow', speaker='Harlow', deck=2,
         origin='quarantine', parent='quarantine', annex='bioforge', home=643,
         post=1205.5, parentDoor=318, annexDoor=1754, hour=10.5, returnHour=13.5,
         player=783, clear=783, action='[data-strategy-action="salvage-run"]',
         returnAction='[data-strategy-action="frontier-recon"]'),
    dict(id='asha-refuge', crew='crew-12-asha-mbaye', speaker='Mbaye', deck=1,
         origin='crew-quarters', parent='crew-quarters', annex='personal-refuge', home=619,
         post=908.4330357142857, parentDoor=1187, annexDoor=122, hour=17.5, returnHour=20.5,
         player=479, clear=479, action='[data-research-id="vehicle-doctrine"]',
         returnAction='[data-strategy-action="frontier-recon"]', research=20),
    dict(id='jun-water', crew='crew-11-jun-park', speaker='Park', deck=3,
         origin='life-support', parent='life-support', annex='water-recycling', home=3158,
         post=643.9258426966292, parentDoor=3278, annexDoor=122, hour=10.5, returnHour=13.5,
         player=3018, clear=3018, action='[data-strategy-action="salvage-run"]',
         returnAction='[data-strategy-action="frontier-recon"]'),
    dict(id='mara-archives', crew='crew-01-mara-vega', speaker='Vega', deck=0,
         origin='bridge', parent='briefing', annex='mire-archives', home=484,
         post=1310.3502304147466, parentDoor=1558, annexDoor=1754, hour=10.5, returnHour=14.5,
         player=300, clear=1400, action='[data-strategy-action="salvage-run"]',
         returnAction='[data-strategy-action="colony-relief"]')]
report = {'status': 'running', 'checks': [], 'captures': [], 'pageErrors': [], 'requestFailures': [], 'httpErrors': [],
          'comparisonStage': args.comparison_stage, 'routes': [],
          'method': 'Disclosed05h30 native Save imports; actual5h salvage or12h research watch,3h reconnaissance or4h colony-relief return; keyboard/E, physical courtesy, exact leaf reload and occupied arrival. Evaluations only observe.',
          'limitations': ['Automated native controls, not human participants.',
                         'Five native parent/annex watches; Mara uses the real west bulkhead. Asha separately observes the existing Jun-sanitary interdeck return before testing her own occupied arrival.',
                         'Jun prerequisite:900s wall/360s native simulation/45s without physical progress, justified by the observed316.033s return; each player door passage keeps45s. Asha occupation retains50s simulation/360s wall/45s stall and final collection150s simulation/480s wall/45s stall.',
                         'Asha fixture adds exactly20 research to pay the existing vehicle-doctrine12h command in one mutation; other fixture resources remain defaults.',
                         'Native strategy elapsed hours are not observed walking hours.',
                         'Covered source/destination chart changes are not walking distance or back-facing art.',
                         'Other native timetable handoffs and courtesy lifecycle/context handoffs remain explicitly observedTravel:false.',
                         'No new art, canonical motion or artistic1:1 approval. Before-stage images are comparisons, not V163 feature checks.']}



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
 const h=__ATF_HUB__,snap=h.getSnapshot(),r=snap.npcAnnexRoutesV163?.routes?.[c.id]||null;
 const traffic=snap.npcServiceTrafficV163||null;
 const annex=h.currentAnnexV71?.()?.id||null, visible=annex?h.activeAnnexNpcsV141():h.npcs;
 const a=h.getNpcAnnexServiceActorV163?.(c.id)||visible.find(n=>n.crewId===c.crew)||null;
 return {route:r?structuredClone(r):null,traffic:structuredClone(traffic),running:h.running,deck:h.state.deck,roomId:h.state.roomId,annex,ventActive:Boolean(h.ventActorV62),
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
        page.wait_for_function('id=>__ATF_HUB__.getSnapshot().npcAnnexRoutesV163?.routes?.[id]?.actor', arg=config['id'])
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


NATIVE_ASHA_DEPENDENCY_V163 = '''function createAshaDependencyV163(opts,started) {
  const dependencyId='jun-sanitary',crewId='crew-11-jun-park';
  const wallBudgetMs=900000,simBudgetSeconds=360,stallBudgetMs=45000;
  let first=null,lastPose=null,lastProgressAt=started,simSeconds=0,seen=false;
  const originMatches=o=>o&&o.crewId===crewId&&o.deck===3&&o.roomId==='life-support'
    &&Math.abs(o.x-3158)<.25&&o.y===532&&o.source==='legacy-physical-owner';
  const check=now=>now-started>=wallBudgetMs?'jun-wall-budget-exhausted'
    :now-lastProgressAt>=stallBudgetMs?'jun-no-physical-progress'
    :simSeconds>simBudgetSeconds?'jun-simulation-budget-exhausted':null;
  const failed=reason=>({status:'failed',reason});
  function observe(s,now){
    const timeout=check(now);if(timeout)return failed(timeout);
    if(opts.id!=='asha-refuge'||s.dependencyId!==dependencyId)return failed('foreign-return-dependency');
    const e=s.dependency,a=e?.actor,p=s.player,o=s.owner;
    if(!e)return failed('jun-dependency-missing');
    if(!Number.isFinite(s.nativeTime))return failed('native-simulation-clock-missing');
    if(!first)first=structuredClone(s);
    simSeconds=s.nativeTime-first.nativeTime;
    if(simSeconds<0)return failed('native-simulation-clock-reversed');
    if(!s.running||s.annex!==opts.annex||s.deck!==opts.deck||!p?.alive||p.y!==532
      ||Math.abs(p.vx)>=1||Math.abs(p.x-first.player.x)>.01||s.exitAnnex!==opts.annex)
      return failed('player-left-native-refuge-threshold');
    if(!o||o.crewId!==opts.crew||o.roomId!==opts.annex||o.crossings!==1||s.ownerHandoff)
      return failed('asha-owner-changed-during-jun-return');
    if(!originMatches(e.origin)||!originMatches(first.dependency?.origin))return failed('jun-origin-mismatch');
    if(e.nativeHandoff||s.routine?.missionAssigned||s.routine?.needsCare||s.routine?.alert
      ||['medical-recovery','mission-assignment','unavailable','active-crisis','infestation','annex-assignment'].includes(a?.reason))
      return failed('jun-priority-handoff-is-not-a-return');
    if(!seen&&(!a||s.passageRequested!==true))return failed('jun-passing-request-not-active');
    if(a){
      if(a.crewId!==crewId)return failed('foreign-jun-physical-owner');
      if(s.passageRequested!==true)return failed('jun-passing-request-not-active');
      if(o.stage!=='service'||o.reason!=='occupied'||o.doorProgress!==0)
        return failed('asha-is-not-held-for-jun');
      seen=true;
      const pose={x:a.x,y:a.y,deck:a.deck,roomId:a.roomId,stage:a.stage,doorProgress:a.doorProgress,
        crossings:a.crossings,liftJourneys:a.liftJourneys,liftPhase:a.lift?.phase||null};
      if(!lastPose||Math.abs(pose.x-lastPose.x)>=.5||Math.abs(pose.y-lastPose.y)>=.5
        ||pose.deck!==lastPose.deck||pose.roomId!==lastPose.roomId||pose.stage!==lastPose.stage
        ||Math.abs(pose.doorProgress-lastPose.doorProgress)>=.01||pose.crossings!==lastPose.crossings
        ||pose.liftJourneys!==lastPose.liftJourneys||pose.liftPhase!==lastPose.liftPhase){
        lastPose=pose;lastProgressAt=now;}
    }else{
      const r=e.returned,origin=first.dependency.origin;
      if(s.passageRequested!==false||!r||r.observedTravel!==true||r.crewId!==crewId
        ||r.deck!==origin.deck||r.roomId!==origin.roomId||!Number.isFinite(r.x)||Math.abs(r.x-origin.x)>=.25||r.y!==origin.y
        ||r.crossings!==2||r.liftJourneys!==2||!Number.isFinite(r.verticalDistance)||Math.abs(r.verticalDistance-496)>1e-6
        ||!Number.isFinite(r.distance)||r.distance<=0||r.distance<first.dependency.actor.distance)
        return failed('jun-lost-without-complete-physical-return');
      const timeout=check(now);return timeout?failed(timeout):{status:'returned',reason:'jun-complete-native-return'};
    }
    const timeoutAfter=check(now);return timeoutAfter?failed(timeoutAfter):{status:'waiting',reason:'jun-physical-return-in-progress'};
  }
  const snapshot=now=>({dependencyId,simSeconds,wallMs:now-started,lastProgressAgeMs:now-lastProgressAt,
    simBudgetSeconds,wallBudgetMs,stallBudgetMs,observedOrigin:first?.dependency?.origin||null});
  return{dependencyId,observe,check,snapshot};
}'''


def pass_asha_dependency_door(page, config, entering):
    """Use E and the native projection; preserve its real local offset, not a fabricated125px pose."""
    deadline = time.monotonic() + 45
    projection = page.wait_for_function('''o=>{const h=__ATF_HUB__,c=o.config,
      door=o.entering?h.nearestParentAnnexDoorV71?.():h.nearestAnnexExitV71?.(),
      annex=o.entering?door?.annex:h.currentAnnexV71?.();
      if(!h.running||!h.player.alive||Math.abs(h.player.vx)>=1||h.annexTransitionV71||h.hubDoorClosingV142
        ||h.annexStateReadOnlyV87||door?.annexId!==c.annex||annex?.id!==c.annex
        ||h.npcAnnexDoorReservedV159?.(c.annex))return false;
      return h.prepareHubDoorPassageV142(annex,o.entering?'enter':'exit',door.endpointId)||false;
    }''', arg={'config': config, 'entering': entering}, timeout=45000).json_value()
    page.locator('#hub-canvas').focus()
    assert time.monotonic() < deadline, 'Asha prerequisite passage exceeded45s before E'
    page.keyboard.press('KeyE')
    remaining = (deadline - time.monotonic()) * 1000
    assert remaining > 0, 'Asha prerequisite passage exceeded45s before completion'
    page.wait_for_function('''o=>{const h=__ATF_HUB__,a=h.currentAnnexV71?.();
      return (o.entering?a?.id===o.config.annex:!a&&h.state.roomId===o.config.parent)
        &&!h.annexTransitionV71&&!h.hubDoorClosingV142&&h.running; }''',
        arg={'config': config, 'entering': entering}, timeout=remaining)
    state = observed(page, config)
    check(config['id'] + ': prerequisite E keeps the real projected arrival',
          abs(state['player']['x'] - projection['arrival']['x']) < .25
          and state['player']['y'] == projection['arrival']['y'] and state['inputGuards']['playerAlive'])
    report.setdefault('ashaDependencyPassages', []).append({'entering': entering,
        'projection': projection, 'player': state['player'], 'annex': state['annex']})


def arm_asha_return_dependency(page, config):
    # The promise stays in the page. Only a small completion acknowledgement
    # crosses to Python before E leaves the refuge; detailed samples wait until
    # Asha's actual occupied opening has been secured by the player.
    page.evaluate('''opts=>{const createProgress=(''' + NATIVE_ASHA_DEPENDENCY_V163 + ''');
      window.__ATF_ASHA_JUN_DEPENDENCY_V163__=new Promise(resolve=>{
        const h=__ATF_HUB__,started=performance.now(),progress=createProgress(opts,started),samples=[];
        let done=false,raf,latest=null,origin=null,lastSampleAt=-Infinity,frames=0;
        function finish(status,reason){if(done)return;done=true;clearInterval(timer);cancelAnimationFrame(raf);
          resolve({status,reason,frames,...progress.snapshot(performance.now()),origin,latest,samples});}
        function frame(){if(done)return;frames++;const now=performance.now(),snap=h.getSnapshot(),
          route=snap.npcAnnexRoutesV163.routes[opts.id],p=h.player,r=h.npcRoutineResolutionsV62?.get('crew-11-jun-park');
          latest={nativeTime:h.animationTime,running:h.running,deck:h.state.deck,annex:h.currentAnnexV71?.()?.id||null,
            exitAnnex:h.nearestAnnexExitV71?.()?.annexId||null,player:{x:p.x,y:p.y,vx:p.vx,alive:p.alive},
            owner:structuredClone(route.actor),ownerHandoff:structuredClone(route.nativeHandoff),
            dependencyId:progress.dependencyId,dependency:structuredClone(h.npcInterdeckStateV165?.routes[progress.dependencyId]||null),
            passageRequested:h.npcInterdeckPassingRequestV165?.(opts.id)===true,
            routine:r?{missionAssigned:r.missionAssigned,needsCare:r.needsCare,alert:r.alert}:null};
          origin ||= latest;
          if(now-lastSampleAt>=1000){samples.push(latest);if(samples.length>900)samples.shift();lastSampleAt=now;}
          const result=progress.observe(latest,now);
          if(result.status!=='waiting')return finish(result.status,result.reason);
          raf=requestAnimationFrame(frame);
        }
        const timer=setInterval(()=>{const failure=progress.check(performance.now());if(failure)finish('failed',failure);},1000);
        raf=requestAnimationFrame(frame);
      });}''', config)


def prepare_asha_return_dependency(page, config):
    phase(config['id'] + ': native refuge entry for the exact Jun return prerequisite')
    pass_asha_dependency_door(page, config, True)
    arm_asha_return_dependency(page, config)
    acknowledgement = page.evaluate('''async()=>{const r=await window.__ATF_ASHA_JUN_DEPENDENCY_V163__;
      return{status:r.status,reason:r.reason,simSeconds:r.simSeconds,wallMs:r.wallMs,
        lastProgressAgeMs:r.lastProgressAgeMs,returned:r.latest?.dependency?.returned||null,
        observedOrigin:r.observedOrigin};}''')
    report.setdefault('ashaDependencyAcknowledgements', []).append(acknowledgement)
    check(config['id'] + ': Jun completes its exact native physical return before Asha occupation',
          acknowledgement['status'] == 'returned')
    # Avoid transferring the large sample history while Asha starts its29s walk.
    pass_asha_dependency_door(page, config, False)
    ensure_return_occupant(page, config, 'after the observed Jun physical return')


def export_asha_return_dependency(page, config):
    result = page.evaluate('()=>window.__ATF_ASHA_JUN_DEPENDENCY_V163__')
    report.setdefault('ashaDependencyWaits', []).append(result)
    (output / (config['id'] + '-jun-physical-prerequisite.json')).write_text(json.dumps(result, indent=2))


def collect(page, config, name, stop, move_to=None, exit_after=False):
    phase(name)
    page.evaluate('''opts=>{ window.__ATF_V163_COLLECTION__=new Promise((resolve,reject)=>{
      const rows=[],frames={},h=__ATF_HUB__;
      const started=performance.now();let origin=null,lastProgress=null,lastProgressAt=started,finished=false,raf;
      function fail(message){if(finished)return;finished=true;clearInterval(timer);cancelAnimationFrame(raf);reject(Error(message));}
      const timer=setInterval(()=>{const now=performance.now();
        if(now-started>480000||now-lastProgressAt>45000)
          fail('Native service route wall/progress guard: '+opts.name);},1000);
      function frame(){
        if(finished)return;
        const snap=h.getSnapshot().npcAnnexRoutesV163.routes[opts.id],a=snap.actor;
        if(a){origin ||= a.time;const now=performance.now();
          if(!lastProgress||Math.abs(a.x-lastProgress.x)>=.5||a.roomId!==lastProgress.roomId
            ||a.stage!==lastProgress.stage||Math.abs(a.doorProgress-lastProgress.doorProgress)>=.01){
            lastProgress={x:a.x,roomId:a.roomId,stage:a.stage,doorProgress:a.doorProgress};lastProgressAt=now;}
          if(a.time-origin>150){fail('Native service route simulation guard: '+opts.name);return;}}
        const row={actor:a?structuredClone(a):null,handoff:structuredClone(snap.nativeHandoff),traffic:structuredClone(h.getSnapshot().npcServiceTrafficV163||null),
          reserved:snap.reserved,occlusion:structuredClone(snap.occlusion),
          player:{x:h.player.x,y:h.player.y},clock:structuredClone(h.npcRoutineContextV62.clock)};
        rows.push(row);
        for(const peer of row.traffic?.actors||[]){const key='courtesy-'+peer.crewId+'-'+peer.phase;
          if(!frames[key]&&peer.distance>.5)frames[key]={row,png:document.querySelector('#hub-canvas').toDataURL('image/png')};}
        if(a){const key=a.roomId+':'+a.stage;
          if(!frames[key]&&(['covering','revealing'].includes(a.stage)||a.stage==='service'))
            frames[key]={row,png:document.querySelector('#hub-canvas').toDataURL('image/png')};}
        const done=opts.stop==='mid-cover'&&a?.stage==='covering'&&a.doorProgress>.35&&a.doorProgress<.7
          ||opts.stop==='annex-service'&&a?.roomId===opts.annex&&a.stage==='service'&&a.arrivals>=1
          ||opts.stop==='handoff'&&snap.nativeHandoff?.fromRoomId===opts.parent
          ||opts.stop==='parent-service'&&a?.roomId===opts.parent&&a.stage==='service'&&a.crossings===2
          ||opts.stop==='home-service'&&a?.roomId===opts.origin&&a.stage==='service'&&Math.abs(a.x-a.homeX)<.25&&a.crossings===2;
        if(done){finished=true;clearInterval(timer);cancelAnimationFrame(raf);resolve({rows,frames});return;}
        raf=requestAnimationFrame(frame);
      } raf=requestAnimationFrame(frame);
    }); }''', {**config, 'name': name, 'stop': stop})
    if move_to is not None:
        walk_to(page, config, move_to)
    if exit_after:
        # First transfer only the tiny completion acknowledgement. Shipping
        # the recorded rows/PNG payload to Python can take longer than the
        # remaining native covering/revealing phase. Pause through the actual
        # UI before that transfer, serialization or assertion work starts.
        page.evaluate('async()=>{await window.__ATF_V163_COLLECTION__;return true;}')
        page.locator('#exit-hub').click()
    result = page.evaluate('()=>window.__ATF_V163_COLLECTION__')
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
      function read(){const s=h.getSnapshot().npcAnnexRoutesV163.routes[opts.id],a=s.actor,p=h.player,
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
        if(a.time-origin.actor.time>simBudget)return finish('failed','simulated-return-budget-exhausted');
        if(now-started>=wallBudgetMs)return finish('failed','wall-return-budget-exhausted');
        if(now-lastProgressAt>=stallBudgetMs)return finish('failed','no-physical-return-progress');
        if(a.reason==='occupied'&&a.stage==='opening'&&Math.abs(a.x-opts.annexDoor)<.25)
          return finish('occupied','actual-return-opening-occupied');
        if(!lastProgress||Math.abs(a.x-lastProgress.x)>=.5||a.stage!==lastProgress.stage
          ||Math.abs(a.doorProgress-lastProgress.doorProgress)>=.01||a.crossings!==lastProgress.crossings){
          lastProgress={x:a.x,stage:a.stage,doorProgress:a.doorProgress,crossings:a.crossings};lastProgressAt=now;}
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
s.needsPlayerCreationV84=false;s.scene='hub';s.player.name='QA annex services V163';
s.settings.reducedMotion=false;s.clock.hour=5.5;
Object.assign(s.hub,{deck:c.deck,roomId:c.origin,positionX:c.player,positionY:532});
if(c.research)s.galaxy.resources.research=c.research;
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


report['identityBefore'] = identity()
report['profileName'] = 'npc-annex-service-routes-v163'
report['saveFixtureNames'] = [c['id'] + '-disclosed-native0530.json' for c in ROUTES if args.route in ['all', c['id']]]
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
            page.wait_for_function('name=>__ATF_V51__?.saveSystem.data.player.name===name', arg='QA annex services V163')
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
            open_hub(page, config)
            if args.comparison_stage == 'after':
                active = observed(page, config)
                check(prefix + ': real elapsed-time command preserves owned parent origin instead of adopting a sampled annex post',
                      active['route']['actor']['roomId'] == config['origin'] and active['route']['actor']['crossings'] == 0
                      and active['route']['preLoadTravelObserved'] is False)
                check(prefix + ': both rooms keep complete2D presentation', all(row['mode'] == '2d' and not row['mixedProjectionAllowed'] for row in active['route']['presentation']))
                collect(page, config, prefix + '-02-outbound-mid-door', 'mid-cover', exit_after=True)
                paused = observed(page, config)
                durable = page.evaluate('id=>JSON.parse(localStorage.getItem("atf-v47-profile-1")).hub.npcAnnexRoutesV163.routes[id]', config['id'])
                (output / (prefix + '-durable-covered-door.json')).write_text(json.dumps(durable, indent=2))
                (output / (prefix + '-paused-covered-door.json')).write_text(json.dumps(paused, indent=2))
                check(prefix + ': real exit persists supported actor and exact door phase', durable['actor'] == paused['route']['actor'] and durable['actor']['stage'] in ['covering', 'revealing'])
                page.reload(wait_until='domcontentloaded')
                page.locator('#title-start').click(timeout=45000)
                page.locator('#title-options').click()
                page.evaluate('''c=>{const read=''' + OBSERVE + '''; document.addEventListener('click',function record(event){
                  if(event.target.closest('[data-view]')?.dataset.view!=='hub')return;
                  window.__ATF_V163_RESUME_OBSERVATION__=read(c);document.removeEventListener('click',record);
                });}''', config)
                open_hub(page, config, art=False)
                restored = page.evaluate('()=>window.__ATF_V163_RESUME_OBSERVATION__')
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
                try:
                    open_hub(page, config)
                    ensure_return_occupant(page, config, 'after native resume')
                    if config['id'] == 'asha-refuge':
                        prepare_asha_return_dependency(page, config)
                    if args.return_cpu_throttle > 1:
                        cdp = context.new_cdp_session(page)
                        cdp.send('Emulation.setCPUThrottlingRate', {'rate': args.return_cpu_throttle})
                        report['returnCpuThrottle']['applied'] = True
                    wait_occupied_return(page, config)
                    occupied = observed(page, config)
                    page.wait_for_function('''p=>{const a=__ATF_HUB__.getSnapshot().npcAnnexRoutesV163.routes[p.id].actor;
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
                    if config['id'] == 'asha-refuge':
                        export_asha_return_dependency(page, config)
                finally:
                    if cdp:
                        cdp.send('Emulation.setCPUThrottlingRate', {'rate': 1})
                        cdp.detach()
                        report['returnCpuThrottle']['restoredRate'] = 1
                capture(page, prefix + '-06-occupied-return-opening.png')
                stop = 'parent-service' if prefix == 'mara-archives' else 'handoff'
                rows = collect(page, config, prefix + '-07-return-and-handoff', stop, move_to=config['clear'])
                last = next(row['actor'] for row in reversed(rows) if row['actor'])
                handoff = observed(page, config)['route']['nativeHandoff']
                if prefix == 'mara-archives':
                    check(prefix + ': archive return walks to the actual native briefing work post',
                          last['roomId'] == 'briefing' and last['stage'] == 'service'
                          and last['crossings'] == 2 and abs(last['x'] - last['targetPostX']) < .25 and handoff is None)
                else:
                    check(prefix + ': real floor return reaches origin before explicit unobserved native handoff',
                          last['roomId'] == config['origin'] and abs(last['x'] - last['homeX']) < .25
                          and last['crossings'] == 2 and last['arrivals'] == 2 and handoff['observedTravel'] is False)
                check(prefix + ': continuous return observes exactly one closed-leaf portal transfer', report['observedPortalTransfers'][prefix + '-07-return-and-handoff'] == 1)
                capture(page, prefix + '-08-parent-after-native-return.png')
                if prefix == 'mara-archives':
                    walk_to(page, config, 300)
                    page.locator('#exit-hub').click()
                    open_view(page, 'command')
                    page.locator('[data-strategy-action="colony-relief"]').click()
                    page.wait_for_function('()=>__ATF_V51__.saveSystem.data.clock.hour===18.5')
                    page.locator('[data-strategy-action="frontier-recon"]').click()
                    page.wait_for_function('()=>__ATF_V51__.saveSystem.data.clock.hour===21.5')
                    open_hub(page, config)
                    home_rows = collect(page, config, prefix + '-09-main-deck-home', 'home-service')
                    check(prefix + ': bridge return crosses native rooms on the floor with no extra portal chart transfer',
                          home_rows[-1]['actor']['roomId'] == 'bridge'
                          and report['observedPortalTransfers'][prefix + '-09-main-deck-home'] == 0)
                    capture(page, prefix + '-10-real-bridge-home.png')
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
        print('::error file=scripts/qa-npc-annex-service-routes-v163.py::' + str(error).replace('%', '%25').replace('\r', '%0D').replace('\n', '%0A'), flush=True)
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
