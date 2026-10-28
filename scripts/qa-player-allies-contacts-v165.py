"""Observe player stops, ankle pivots and allied walking via native controls.

The imported Forge floor is a disclosed fixture, not a campaign level. Evaluation
only observes the runtime/canvas and stores an independent RAF observer promise.
"""
import argparse
import base64
import hashlib
import json
import math
import os
from datetime import datetime, timezone
from pathlib import Path
import urllib.request
from playwright.sync_api import sync_playwright

parser = argparse.ArgumentParser()
parser.add_argument('--base', default='http://127.0.0.1:4173')
parser.add_argument('--output', type=Path, required=True)
parser.add_argument('--comparison-stage', choices=['before', 'after'], required=True)
parser.add_argument('--expect-source', help='Exact served sourceCommit, including the historical before identity')
parser.add_argument('--fixture', type=Path, help='Reuse the actual disclosed floor JSON from the before run')
args = parser.parse_args()
repo = Path(__file__).resolve().parents[1]
output = args.output.resolve()
if output == repo or repo in output.parents:
    raise SystemExit('Keep visual evidence outside the repository.')
output.mkdir(parents=True, exist_ok=True)
if (output / 'report.json').exists() or any(output.glob('*.png')):
    raise SystemExit('Keep previous observation files intact; choose a fresh output directory.')
script_start_sha = hashlib.sha256(Path(__file__).read_bytes()).hexdigest()


def identity():
    with urllib.request.urlopen(args.base.rstrip('/') + '/build-info.json', timeout=20) as response:
        raw = response.read()
    info = json.loads(raw)
    return {'sourceCommit': info['sourceCommit'], 'buildId': info['buildId'],
            'buildInfoSha256': hashlib.sha256(raw).hexdigest()}


report = {'status': 'running', 'stage': args.comparison_stage, 'startedAt': datetime.now(timezone.utc).isoformat(),
          'checks': [], 'captures': [],
          'pageErrors': [], 'httpErrors': [], 'requestFailures': [], 'identityBefore': identity(),
          'method': 'Disclosed empty floor imported through the native editor; real keyboard walking, stops, Shift aim and profile turns. Read-only runtime/canvas observations of the player and the three default native allies.',
          'limitations': ['Automated Chromium observation, not human QA.',
                         'This floor is a declared test project, not the Tantalus interior.',
                         'Eight phase bins compare the same action and gait phase; wall-clock frames are not forced or injected.',
                         'Geometry and visual comparison do not certify franchise or human-motion1:1.',
                         'The source artwork, long weapon proportions and actual opaque silhouettes remain separate from the shared96.5px standing reference.',
                         'The before run records historical resets and wide stops; those observations are not current V165 results.',
                         'A profile turn pivots the boot around its ankle; its reflected sole midpoint is not a fixed contact.',
                         'Native allied observations concern the three default companions. Sixteen alerted identities and room-context composition have separate unit coverage; this empty floor need not trigger combat alert.']}
report['sourceCommit'] = report['identityBefore']['sourceCommit']


def check(label, condition):
    if not condition:
        raise AssertionError(label)
    report['checks'].append(label)
    print('PASS ' + label, flush=True)


OBSERVE = '''() => {
 const e=__ATF_GAME__,a=e.player;
 return {time:e.animationTime,running:e.running,paused:e.paused,
   player:{x:a.x,y:a.y,w:a.w,h:a.h,vx:a.vx,vy:a.vy,facing:a.facing,
     grounded:a.grounded,crouching:a.crouching,aim:a.combatAimV83},
   locomotionState:structuredClone(a.playerLocomotionStateV129),
   visual:structuredClone(a.playerAppearanceVisualV126),
   weapon:structuredClone(a.heldWeaponVisualV125),
   allies:(e.squadActors||[]).map(b=>({crewId:b.crewId,x:b.x,y:b.y,w:b.w,h:b.h,vx:b.vx,facing:b.facing,
     alive:b.alive,grounded:b.grounded,crouching:b.crouching,downed:b.downed,climbing:b.climbing,inCover:b.inCover,
     fireClock:b.fireClock,v52FireClock:b.v52FireClock,supportClock:b.supportClock,workClock:b.workClock,
     combatReady:b.combatReady,aiming:b.aiming,alert:b.alert,alertClock:b.alertClock,
     inVehicle:b.inVehicle,vehicleAccessPhase:b.vehicleAccessPhase,
     animation:structuredClone(b.v52Animation),human:structuredClone(b.humanVisualV133),
     gait:structuredClone(e.spriteAnimation?.humanPatrolStatesV133?.get('npc:'+b.crewId)||null)})),
   camera:{x:e.camera.x,y:e.camera.y}};
}'''


def observe_allies(rows):
    for row in rows:
        for ally in row.get('allies', []):
            identity = ally.get('crewId')
            if not identity:
                continue
            item = report.setdefault('alliedObservations', {}).setdefault(identity,
                {'samples': 0, 'movingSamples': 0, 'walkingFrames': [], 'standingReferences': [],
                 'eligibleMovingWithWrongClip': 0, 'distanceRange': [], 'observedContexts': []})
            item['samples'] += 1
            human = ally.get('human') or {}
            if human.get('standingHeight') is not None and human['standingHeight'] not in item['standingReferences']:
                item['standingReferences'].append(human['standingHeight'])
            gait = ally.get('gait') or {}
            if gait.get('context') is not None and gait['context'] not in item['observedContexts']:
                item['observedContexts'].append(gait['context'])
            if gait.get('distance') is not None:
                previous = item['distanceRange']
                item['distanceRange'] = [min(previous[0], gait['distance']), max(previous[1], gait['distance'])] if previous else [gait['distance'], gait['distance']]
            eligible = ally.get('alive') is not False and ally.get('grounded') is not False and abs(ally.get('vx') or 0) > 8
            eligible = eligible and not any(ally.get(k) for k in ['crouching', 'downed', 'climbing', 'inCover', 'inVehicle', 'vehicleAccessPhase'])
            eligible = eligible and not any((ally.get(k) or 0) > 0 for k in ['fireClock', 'v52FireClock', 'supportClock', 'workClock'])
            if eligible:
                item['movingSamples'] += 1
                animation = ally.get('animation') or {}
                if animation.get('clipId') != 'walk':
                    item['eligibleMovingWithWrongClip'] += 1
                elif animation.get('frame') not in item['walkingFrames']:
                    item['walkingFrames'].append(animation['frame'])


def save_frame(name, frame):
    png = frame.pop('png')
    (output / name).write_bytes(base64.b64decode(png.split(',')[1]))
    report['captures'].append({'file': name, 'state': frame})


def capture(page, name):
    frame = page.evaluate('''() => {const row=(''' + OBSERVE + ''')();
      return {...row,png:document.querySelector('#game-canvas').toDataURL('image/png')};}''')
    save_frame(name, frame)


def cycle(page, direction):
    page.evaluate('''direction => {window.__V160_ANATOMY_OBSERVER__=new Promise((resolve,reject)=>{
      const rows=[],frames={},started=performance.now();let firstTime=null;
      function frame(){const row=(''' + OBSERVE + ''')(),l=row.visual?.locomotion;
        if(row.visual?.drawn&&l?.drawn&&l.mode==='run'&&Math.sign(row.player.vx)===direction){
          firstTime??=row.time;rows.push(row);const bin=Math.floor(l.phase*8)%8;
          if(!frames[bin])frames[bin]={...row,png:document.querySelector('#game-canvas').toDataURL('image/png')};
          if(Object.keys(frames).length===8&&row.time-firstTime>1.25){resolve({rows,frames});return;}}
        if(performance.now()-started>15000){reject(Error('Eight actual gait phases were not observed'));return;}
        requestAnimationFrame(frame);
      }requestAnimationFrame(frame);
    });}''', direction)
    key = 'KeyD' if direction == 1 else 'KeyA'
    page.locator('#game-canvas').focus()
    page.keyboard.down(key)
    try:
        observed = page.evaluate('()=>window.__V160_ANATOMY_OBSERVER__')
    finally:
        page.keyboard.up(key)
    page.wait_for_function('()=>Math.abs(__ATF_GAME__.player.vx)<1')
    label = 'right' if direction == 1 else 'left'
    (output / ('cycle-' + label + '.json')).write_text(json.dumps(observed['rows'], indent=2))
    observe_allies(observed['rows'])
    check(label + ': eight phases come from actual floor displacement', len(observed['frames']) == 8
          and len(observed['rows']) > 20
          and abs(observed['rows'][-1]['player']['x'] - observed['rows'][0]['player']['x']) > 100)
    for bin_index, frame in observed['frames'].items():
        save_frame('cycle-' + label + '-' + bin_index + '.png', frame)
    flexions, below_floor = [], []
    for row in observed['rows']:
        locomotion = row['visual']['locomotion']
        floor = row['player']['y'] + row['player']['h']
        for leg in locomotion['legs'].values():
            u = [leg['hip'][axis] - leg['knee'][axis] for axis in ['x', 'y']]
            v = [leg['ankle'][axis] - leg['knee'][axis] for axis in ['x', 'y']]
            lengths = math.hypot(*u) * math.hypot(*v)
            flexions.append(180 - math.degrees(math.acos(max(-1, min(1, sum(a*b for a,b in zip(u,v))/lengths)))))
            below_floor.append(max(leg['toe']['y'], leg['heel']['y']) - floor)
    check(label + ': actual knees remain finite and soles stay above the floor',
          all(math.isfinite(x) for x in flexions) and max(below_floor) < 1)
    report.setdefault('measurements', {})[label] = {'frames': len(observed['rows']),
        'kneeFlexionDegrees': [min(flexions), max(flexions)], 'maximumSoleBelowFloor': max(below_floor)}


def stop_case(page, index, phase_bin):
    page.locator('#game-canvas').focus()
    page.keyboard.down('KeyD')
    page.wait_for_function('''bin => {const e=__ATF_GAME__,a=e.player,l=a.playerAppearanceVisualV126?.locomotion;
      return a.grounded&&a.vx>150&&l?.drawn&&Math.floor(l.phase*8)%8===bin;}''', arg=phase_bin, timeout=15000)
    page.evaluate('''() => {window.__ATF_CONTACTS_V165_OBSERVER__=new Promise((resolve,reject)=>{
      const observe=(''' + OBSERVE + '''),canvas=document.querySelector('#game-canvas');
      const first=observe(),rows=[first],frames={moving:{...first,png:canvas.toDataURL('image/png')}};
      const started=performance.now();let stoppedAt=null;
      function frame(){const row=observe(),state=row.locomotionState;rows.push(row);
        if(!state?.moving&&Math.abs(row.player.vx)<=8){
          stoppedAt??=row.time;
          if(!frames.stopping)frames.stopping={...row,png:canvas.toDataURL('image/png')};
          if(!frames.adjustment&&row.time-stoppedAt>=.06)frames.adjustment={...row,png:canvas.toDataURL('image/png')};
        }
        // Simulation can settle one frame before a throttled renderer. Read
        // the completed rendered stance; its spread is still checked below.
        const rendered=row.visual?.locomotion;
        if(Math.abs(row.player.vx)<.5&&!state?.moving&&state?.settleProgress>=1&&!state?.stopRecoveryV165
          &&rendered?.mode==='idle'&&!rendered?.stopRecoveryV165
          &&row.time-first.time>.55){
          frames.rest={...row,png:canvas.toDataURL('image/png')};resolve({rows,frames});return;
        }
        if(performance.now()-started>10000){reject(Error('Native stop did not reach a settled rest'));return;}
        requestAnimationFrame(frame);
      }requestAnimationFrame(frame);
    });}''')
    page.keyboard.up('KeyD')
    try:
        observed = page.evaluate('()=>window.__ATF_CONTACTS_V165_OBSERVER__')
    finally:
        page.keyboard.up('KeyD')
    rows = observed['rows']
    observe_allies(rows)
    (output / ('stop-' + str(index) + '.json')).write_text(json.dumps(rows, ensure_ascii=False, indent=2))
    check('stop' + str(index) + ': braking and rest come from the real released movement control',
          len(rows) >= 10 and set(observed['frames']) == {'moving', 'stopping', 'adjustment', 'rest'}
          and rows[-1]['player']['x'] >= rows[0]['player']['x'] and abs(rows[-1]['player']['vx']) < .5)
    for label, frame in observed['frames'].items():
        save_frame('stop-' + str(index) + '-' + label + '.png', frame)
    drifting, penetrations, recovery_samples = [], [], 0
    for previous, current in zip(rows, rows[1:]):
        a, b = previous.get('visual', {}).get('locomotion'), current.get('visual', {}).get('locomotion')
        if not a or not b:
            continue
        if b.get('stopRecoveryV165'):
            recovery_samples += 1
        floor = current['player']['y'] + current['player']['h']
        for side in ['near', 'far']:
            leg = b['legs'][side]
            penetrations.append(max(leg['heel']['y'], leg['toe']['y']) - floor)
            if a['contacts']['feet'][side]['planted'] and b['contacts']['feet'][side]['planted']:
                old = a['legs'][side]['sole']
                drifting.append(math.hypot(leg['sole']['x'] - old['x'], leg['sole']['y'] - old['y']))
    final = rows[-1]['visual']['locomotion']
    spread = abs(final['legs']['near']['ankle']['x'] - final['legs']['far']['ankle']['x'])
    metrics = {'case': index, 'targetPhaseBin': phase_bin, 'actualReleasePhase': rows[0]['visual']['locomotion']['phase'],
               'observedFrames': len(rows), 'stopRecoveryObservedSamples': recovery_samples,
               'restAnkleSpread': spread, 'maximumConsecutiveSupportedSoleDrift': max(drifting, default=0),
               'maximumBootBelowFloor': max(penetrations, default=0), 'finalMode': final['mode']}
    report.setdefault('stops', []).append(metrics)
    check('stop' + str(index) + ': reached supports stay fixed and actual boots remain above the deck',
          bool(drifting) and max(drifting) < .5 and max(penetrations, default=0) < 1)
    if args.comparison_stage == 'after':
        check('stop' + str(index) + ': the final rest uses a bounded stance after the one-shot recovery',
              spread < 30 and final['mode'] == 'idle' and not final.get('stopRecoveryV165'))


def turn_case(page, target):
    page.wait_for_function('''() => {const a=__ATF_GAME__.player,s=a.playerLocomotionStateV129;
      return a.grounded&&Math.abs(a.vx)<.5&&!s?.moving&&s?.settleProgress>=1&&!s?.stopRecoveryV165;}''')
    page.evaluate('''target => {window.__ATF_CONTACTS_V165_OBSERVER__=new Promise((resolve,reject)=>{
      const observe=(''' + OBSERVE + '''),canvas=document.querySelector('#game-canvas');
      const previous=document.createElement('canvas');previous.width=canvas.width;previous.height=canvas.height;
      const ctx=previous.getContext('2d');let last=observe();ctx.drawImage(canvas,0,0);
      if(last.player.facing===target){reject(Error('Turn target already matches the current facing'));return;}
      const rows=[last],started=performance.now();
      function frame(){const row=observe();rows.push(row);
        if(row.player.facing===target){
          resolve({rows,before:{...last,png:previous.toDataURL('image/png')},
            after:{...row,png:canvas.toDataURL('image/png')}});return;
        }
        last=row;ctx.clearRect(0,0,previous.width,previous.height);ctx.drawImage(canvas,0,0);
        if(performance.now()-started>8000){reject(Error('Real aim control did not produce the requested turn'));return;}
        requestAnimationFrame(frame);
      }requestAnimationFrame(frame);
    });}''', target)
    key = 'KeyA' if target < 0 else 'KeyD'
    page.keyboard.down('ShiftLeft')
    page.keyboard.down(key)
    try:
        observed = page.evaluate('()=>window.__ATF_CONTACTS_V165_OBSERVER__')
    finally:
        page.keyboard.up(key)
        page.keyboard.up('ShiftLeft')
    observe_allies(observed['rows'])
    label = 'left' if target < 0 else 'right'
    (output / ('turn-' + label + '.json')).write_text(json.dumps(observed['rows'], ensure_ascii=False, indent=2))
    before, after = observed['before'], observed['after']
    check('turn-' + label + ': real aim changes heading on the same grounded body',
          before['player']['facing'] != after['player']['facing'] and after['player']['facing'] == target
          and before['player']['grounded'] and after['player']['grounded']
          and abs(before['player']['x'] - after['player']['x']) < .5)
    pairs = []
    for side, other in [('near', 'far'), ('far', 'near')]:
        old = before['visual']['locomotion']['legs'][other]['ankle']
        new = after['visual']['locomotion']['legs'][side]['ankle']
        pairs.append(math.hypot(new['x'] - old['x'], new['y'] - old['y']))
    metrics = {'targetFacing': target, 'distanceBefore': before['locomotionState']['distance'],
               'distanceAfter': after['locomotionState']['distance'], 'depthSwappedAnkleErrors': pairs,
               'headingObservation': after['visual']['locomotion'].get('headingV165'),
               'soleMidpointExpectedToRotate': True}
    report.setdefault('turns', []).append(metrics)
    if args.comparison_stage == 'after':
        check('turn-' + label + ': the observed travel history and planted ankles survive the depth swap',
              metrics['distanceBefore'] > 0 and abs(metrics['distanceBefore'] - metrics['distanceAfter']) < 1e-6
              and max(pairs) < .5 and bool(metrics['headingObservation']))
    save_frame('turn-' + label + '-before.png', before)
    save_frame('turn-' + label + '-after.png', after)


with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True, executable_path=os.environ.get('ATF_CHROMIUM_EXECUTABLE', '/usr/bin/chromium'))
    page = browser.new_page(viewport={'width': 1600, 'height': 1000}, service_workers='block')
    page.set_default_timeout(30000)
    page.on('pageerror', lambda e: report['pageErrors'].append(str(e)))
    page.on('requestfailed', lambda q: report['requestFailures'].append({'url': q.url, 'failure': q.failure}))
    page.on('response', lambda q: report['httpErrors'].append({'url': q.url, 'status': q.status}) if q.status >= 400 else None)
    page.on('dialog', lambda d: d.accept() if d.type == 'confirm' and 'Remplacer le projet ouvert' in d.message else d.dismiss())
    try:
        check('The served build has the exact declared source identity',
              not args.expect_source or report['identityBefore']['sourceCommit'] == args.expect_source)
        page.goto(args.base, wait_until='domcontentloaded')
        page.locator('#title-start').click(timeout=45000)
        page.locator('#title-forge').click()
        plan = {'schema': 2, 'kind': 'mission', 'name': 'Sol de comparaison des appuis V165', 'size': [64, 18],
                'tiles': [{'position': str(x)+':16', 'type': 'floor'} for x in range(64)]
                + [{'position': '12:15', 'type': 'spawn'}, {'position': '62:15', 'type': 'objective'}]}
        fixture_bytes = args.fixture.read_bytes() if args.fixture else json.dumps(plan, ensure_ascii=False, indent=2).encode()
        check('The disclosed input is the unchanged empty native editor floor', json.loads(fixture_bytes) == plan)
        fixture_file = output / 'disclosed-floor-v165.json'
        fixture_file.write_bytes(fixture_bytes)
        report['fixture'] = {'path': str(fixture_file), 'sha256': hashlib.sha256(fixture_bytes).hexdigest(),
                             'reusedFrom': str(args.fixture.resolve()) if args.fixture else None,
                             'notATantalusRoomOrCompletedForgeFeature': True}
        page.locator('#editor-import').set_input_files({'name': 'contacts-floor-v165.json', 'mimeType': 'application/json', 'buffer': fixture_bytes})
        page.wait_for_function("()=>document.querySelector('#editor-import').value===''")
        page.locator('#editor-play').click()
        page.wait_for_function('()=>__ATF_GAME__?.running&&__ATF_GAME__.player?.grounded&&__ATF_GAME__.player.playerAppearanceVisualV126?.drawn', timeout=90000)
        capture(page, 'idle-before-motion.png')
        cycle(page, 1)
        page.wait_for_function('()=>!__ATF_GAME__.player.playerLocomotionStateV129?.stopRecoveryV165')
        capture(page, 'idle-after-right.png')
        cycle(page, -1)
        page.wait_for_function('()=>!__ATF_GAME__.player.playerLocomotionStateV129?.stopRecoveryV165')
        capture(page, 'idle-after-left.png')
        for index, phase_bin in enumerate([1, 3, 5], start=1):
            stop_case(page, index, phase_bin)
        turn_case(page, -1)
        turn_case(page, 1)
        if args.comparison_stage == 'after':
            check('At least one genuinely observed stop includes the bounded single-foot recovery',
                  any(row['stopRecoveryObservedSamples'] >= 2 for row in report['stops']))
        page.keyboard.down('ShiftLeft')
        directions = [('right', ['KeyD']), ('up-right', ['KeyW', 'KeyD']), ('up', ['KeyW']),
                      ('up-left', ['KeyW', 'KeyA']), ('left', ['KeyA']), ('down-left', ['KeyS', 'KeyA']),
                      ('down', ['KeyS']), ('down-right', ['KeyS', 'KeyD'])]
        try:
            for name, keys in directions:
                for key in keys:
                    page.keyboard.down(key)
                page.wait_for_timeout(160)
                capture(page, 'aim-' + name + '.png')
                for key in keys:
                    page.keyboard.up(key)
        finally:
            page.keyboard.up('ShiftLeft')
        check('Eight native aim directions keep the operator on its actual floor', all(
            x['state']['player']['grounded'] and abs(x['state']['player']['vx']) < 1
            for x in report['captures'] if x['file'].startswith('aim-')))
        allies = report.get('alliedObservations', {})
        check('The three original native companions are observed without inserting or cloning an actor', len(allies) == 3)
        references = [value for item in allies.values() for value in item['standingReferences']]
        player_references = [c['state']['visual']['humanVisualV133']['standingHeight']
                             for c in report['captures'] if c['state']['visual'].get('humanVisualV133')]
        check('The player and native allies keep the same measured standing reference, independently of their collision height',
              len(references) >= 3 and bool(player_references)
              and max(references + player_references) - min(references + player_references) < .01)
        if args.comparison_stage == 'after':
            check('The native companions advance actual authored walking cells while following the player',
                  all(item['movingSamples'] >= 5 and len(item['walkingFrames']) >= 3
                      and item['eligibleMovingWithWrongClip'] == 0 for item in allies.values()))
        check('No browser or asset request error was observed', not report['pageErrors'] and not report['httpErrors'] and not report['requestFailures'])
        report['status'] = 'passed'
    except Exception as error:
        report['status'] = 'failed'
        report['error'] = str(error)
        raise
    finally:
        browser.close()
        report['identityAfter'] = identity()
        report['distributionIdentityUnchanged'] = report['identityBefore'] == report['identityAfter']
        report['captureSha256'] = {p.name: hashlib.sha256(p.read_bytes()).hexdigest() for p in output.glob('*.png')}
        report['scriptSha256'] = hashlib.sha256(Path(__file__).read_bytes()).hexdigest()
        report['scriptUnchanged'] = report['scriptSha256'] == script_start_sha
        report['finishedAt'] = datetime.now(timezone.utc).isoformat()
        report['currentVsHistoricalScope'] = 'Historical before observation' if args.comparison_stage == 'before' else 'Current candidate after observation'
        integrity_error = 'The served distribution changed during observation.' if not report['distributionIdentityUnchanged'] \
            else 'The observation driver changed while running.' if not report['scriptUnchanged'] else None
        if integrity_error:
            report['status'] = 'failed'
            report['error'] = integrity_error
        (output / 'report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2)+'\n')
        if integrity_error:
            raise AssertionError(integrity_error)
print(json.dumps({'status': report['status'], 'checks': len(report['checks']), 'captures': len(report['captures'])}))
