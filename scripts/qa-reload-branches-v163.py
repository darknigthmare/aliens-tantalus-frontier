"""Observe real reload branches and service contacts through native controls.

Seven disclosed initial catalogue loadouts enter through the Save input. No
actor, clock, reload state or engine method is injected by the browser driver.
The selected low-capacity catalogue variants reduce repetitive live firing;
their original capacities, costs, art and mechanisms remain unmodified.
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
parser.add_argument('--base', default=os.environ.get('ATF_BASE_URL', 'http://127.0.0.1:4173'))
parser.add_argument('--output', type=Path, required=True)
parser.add_argument('--stage', choices=['before', 'after'], default='after')
parser.add_argument('--feeds', nargs='+', choices=['box', 'drum', 'tank', 'tube', 'single', 'cell', 'cylinder'],
                    default=['box', 'drum', 'tank', 'tube', 'single', 'cell', 'cylinder'])
parser.add_argument('--results', nargs='+', choices=['normal', 'success', 'perfect', 'failed'], default=['normal', 'success', 'perfect', 'failed'])
parser.add_argument('--loads', nargs='+', choices=['tactical', 'empty'], default=['tactical', 'empty'])
parser.add_argument('--prepare-only', action='store_true')
args = parser.parse_args()
repo = Path(__file__).resolve().parents[1]
output = args.output.resolve()
if output == repo or repo in output.parents:
    raise SystemExit('Keep evidence outside the repository.')
output.mkdir(parents=True, exist_ok=True)
representatives = {'box': '042', 'drum': '173', 'tank': '036', 'tube': '007', 'single': '118', 'cell': '166', 'cylinder': '141'}
report = {'status': 'running', 'stage': args.stage, 'phase': 'prepare', 'checks': [], 'captures': [], 'cases': [], 'fixtures': [],
          'pageErrors': [], 'httpErrors': [], 'requestFailures': [],
          'requestedMatrix': {'feeds': args.feeds, 'results': args.results, 'loads': args.loads},
          'method': 'Disclosed unplayed QZ18 profile input; native deployment/preparation; actual mouse shots, direction/crouch keys and R attempts; read-only RAF/canvas observations; native pause/save/page reload.',
          'limitations': ['Automated Chromium, not human QA or canonical1:1 certification.',
                         'Seven native feed representatives do not certify every catalogue bitmap. Source-level all-feed/facing/crouch/eight-aim contracts complement this native matrix.',
                         'Dedicated NORMAL/SUCCESS/PERFECT/FAILED source atlases are still absent. These captures show the existing procedural service presentation.',
                         'Weapon-change/vent/vehicle/incapacitation cancellation is covered by native domain contracts, not by fabricated browser events.']}


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


def fixture(feed):
    code = """import{createDefaultSave}from'./src/save.js';import{WEAPONS}from'./src/content.js';
import{resolveHeldWeaponProfileV125}from'./src/held-weapon-profiles-v125.js';
const s=createDefaultSave(),w=WEAPONS.find(w=>w.id.startsWith('weapon-'+process.argv[1]+'-'));
s.needsPlayerCreationV84=false;s.player.name='QA Reload '+process.argv[2]+' V163';s.scene='command';
s.strategy.plannedCampaignId='special-archive-relay';s.worldId='world-05-lethe';s.settings.reducedMotion=true;
s.strategy.inventory.weaponIds=[...new Set([...s.strategy.inventory.weaponIds,w.id])];s.player.weaponIds=[w.id];
console.log(JSON.stringify({profile:s,weapon:w,held:resolveHeldWeaponProfileV125(w)}));"""
    data = json.loads(subprocess.run(['node', '--input-type=module', '-e', code, representatives[feed], feed], cwd=repo,
                                     capture_output=True, text=True, check=True).stdout)
    assert data['held']['reload']['feed'] == feed
    raw = json.dumps(data['profile'], ensure_ascii=False, separators=(',', ':')).encode()
    (output / f'initial-{feed}.json').write_bytes(raw)
    report['fixtures'].append({'feed': feed, 'weapon': data['weapon'], 'sha256': hashlib.sha256(raw).hexdigest(),
                               'declaredChanges': ['named isolated existing identity', 'needsPlayerCreationV84=false', 'scene=command',
                                                   'unplayed native QZ18 plan/Lethe', 'reduced motion', 'one existing catalogue weapon initially owned and equipped'],
                               'unchanged': ['native weapon magazine/reload/cadence/mechanism/art', 'native deployment resources', 'initial mission ammo issued by production engine']})
    return data, raw


fixtures = {feed: fixture(feed) for feed in args.feeds}
if args.prepare_only:
    report['status'] = 'fixtures-prepared-no-browser'
    (output / 'report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2))
    print(json.dumps({'status': report['status'], 'fixtures': len(fixtures)}))
    raise SystemExit(0)
report['identityBefore'] = identity()

OBSERVE = """()=>{const e=__ATF_GAME__,a=e.player,s=__ATF_V51__.saveSystem.data;
 return{running:e.running,paused:e.paused,time:e.animationTime,kind:!!e.isArchiveRelayV122?.(),forge:!!e.forgeSessionV141,
 operationId:s.strategy.currentOperation?.id,weaponId:e.weaponDescriptorV124?.(a)?.id,
 player:{x:a.x,y:a.y,w:a.w,h:a.h,vx:a.vx,grounded:a.grounded,crouching:a.crouching,facing:a.facing,
 ammo:a.ammo,reserve:a.ammoReserve,magazineSize:a.magazineSize,shots:a.shots,health:a.health},
 reload:a.tacticalReload?structuredClone(a.tacticalReload):null,
 visual:a.heldWeaponVisualV125?structuredClone(a.heldWeaponVisualV125):null,
 effects:e.weaponEffectsV124?{stats:{...e.weaponEffectsV124.stats},casings:e.weaponEffectsV124.casings.map(v=>({id:v.id,kind:v.kind,weaponId:v.weaponId,x:v.x,y:v.y}))}:null,
 hud:document.querySelector('#mission-log')?.textContent,
 saved:s.strategy.currentOperation?.resumeState?structuredClone(s.strategy.currentOperation.resumeState):null};}"""


def observed(page):
    return page.evaluate(OBSERVE)


def open_view(page, view):
    if page.locator(f'[data-panel="{view}"].active').is_visible():
        return
    exit_hub = page.locator('#exit-hub')
    if exit_hub.is_visible():
        exit_hub.click()
        page.wait_for_function('()=>!document.documentElement.classList.contains("hub-mode")')
    menu = page.locator('#menu-toggle')
    if menu.is_visible() and 'open' not in (page.locator('.rail').get_attribute('class') or '').split():
        menu.click()
    page.locator(f'#nav [data-view="{view}"]').click()


def wait_runtime(page):
    page.wait_for_function('''()=>{const e=__ATF_GAME__;return e.running&&e.isArchiveRelayV122?.()
      &&!e.enemyAtlasLoadingPausedV65&&!e.userCasteLoadingV88&&!document.querySelector('#mission-runtime-v62').hidden
      &&e.player.grounded&&e.player.heldWeaponVisualV125?.weaponId===e.weaponDescriptorV124?.(e.player)?.id;}''', timeout=90000)
    if observed(page)['paused']:
        page.locator('#game-canvas').focus()
        page.keyboard.press('KeyP')


def deploy(page):
    open_view(page, 'command')
    page.locator('#operation-launch').click()
    for _ in range(12):
        if not page.locator('#mission-insertion-v62').is_visible():
            break
        if page.locator('[data-story-protocol="technical-audit"]').is_visible():
            page.locator('[data-story-protocol="technical-audit"]').click()
        page.locator('[data-insertion-action="advance"]').click()
        page.wait_for_timeout(80)
    wait_runtime(page)


def aim(page, facing=1):
    row = observed(page)
    # This is an actual visible screen point, far enough from the actor that a
    # real catalogue grenade does not hit the actor's own immediate vicinity.
    point = page.locator('#game-canvas').evaluate('''(n,f)=>{const r=n.getBoundingClientRect(),e=__ATF_GAME__,a=e.player;
      const x=Math.max(20,Math.min(1260,a.x+a.w/2-e.camera.x+f*450)),y=Math.max(20,Math.min(700,a.y+a.h*.35-e.camera.y));
      return{x:r.left+x/1280*r.width,y:r.top+y/720*r.height};}''', facing)
    page.mouse.move(point['x'], point['y'])
    page.mouse.down(button='right')
    page.wait_for_function('()=>!!__ATF_GAME__.player.pointerAimV83')
    return row


def fire_one(page):
    page.locator('#game-canvas').focus()
    page.wait_for_function('''()=>{const e=__ATF_GAME__,a=e.player;return !a.reloading&&a.fireClock<=0
      &&!e.weaponCyclesV131?.has(a)&&!e.isFieldActionBusyV124?.(a);}''', timeout=45000)
    before = observed(page)
    if before['player']['ammo'] <= 0:
        raise AssertionError('Native ammunition exhausted before requested shot')
    # Pointer contact owns an immediate accepted trigger edge; holding F across
    # zero rounds could itself start an automatic reload before the R journey.
    page.mouse.down(button='left')
    page.mouse.up(button='left')
    page.wait_for_function('ammo=>__ATF_GAME__.player.ammo<ammo', arg=before['player']['ammo'], timeout=45000)
    after = observed(page)
    check('native shot spends exactly one actual round', before['player']['ammo'] - after['player']['ammo'] == 1)
    return after


def deplete(page, load):
    aim(page, 1)
    if load == 'tactical':
        fire_one(page)
    else:
        while observed(page)['player']['ammo'] > 0:
            fire_one(page)
    page.mouse.up(button='right')
    page.wait_for_function('()=>__ATF_GAME__.player.fireClock<=0&&!__ATF_GAME__.weaponCyclesV131?.has(__ATF_GAME__.player)')
    row = observed(page)
    check(load + ': real ammunition supports the requested service branch', row['player']['reserve'] > 0
          and (row['player']['ammo'] == 0 if load == 'empty' else 0 < row['player']['ammo'] < row['player']['magazineSize'])
          and (row['reload'] or {}).get('phase') != 'reloading')
    return row


def install_observer(page):
    page.evaluate('''()=>{window.__V163_RELOAD_OBSERVER__=new Promise((resolve,reject)=>{
      const rows=[],frames={},started=performance.now();let transaction=null;
      function frame(){const row=(''' + OBSERVE + ''')(),state=row.reload;
        if(state?.phase==='reloading'||transaction){transaction??=state;rows.push(row);
          const key=state?.phase==='reloading'?String(Math.min(3,Math.floor((row.visual?.reloadProgress||0)*4))):'complete';
          if(!frames[key]&&row.visual)frames[key]={...row,png:document.querySelector('#game-canvas').toDataURL('image/png')};
          if(state?.phase==='complete'||state?.phase==='cancelled'){resolve({rows,frames});return;}}
        if(performance.now()-started>90000){reject(Error('Native reload transaction not observed to completion'));return;}
        requestAnimationFrame(frame);
      }requestAnimationFrame(frame);
    });}''')


def save_observation(label, data):
    (output / (label + '-frames.json')).write_text(json.dumps(data['rows'], ensure_ascii=False, indent=2))
    for key, frame in data['frames'].items():
        png = frame.pop('png')
        name = label + '-phase-' + key + '.png'
        (output / name).write_bytes(base64.b64decode(png.split(',')[1]))
        report['captures'].append({'file': name, 'state': frame})


def reload_case(page, feed, load, expected, case_index):
    for attempt in range(1, 5):
        label = f'{feed}-{load}-{expected}-try{attempt}'
        phase(label + ': native shots and R timing')
        # The same real profile owns all attempts. A missed tight timing window
        # is retained as evidence, then a new native shot/reload is attempted.
        before = deplete(page, load)
        facing = 1 if case_index % 2 == 0 else -1
        crouching = case_index % 3 == 1
        aim(page, facing)
        if crouching:
            page.keyboard.down('KeyZ')
            page.wait_for_function('()=>__ATF_GAME__.player.crouching')
        page.locator('#game-canvas').focus()
        install_observer(page)
        page.keyboard.press('KeyR')
        page.wait_for_function('()=>__ATF_GAME__.player.tacticalReload?.phase==="reloading"')
        if expected != 'normal':
            page.wait_for_function('''expected=>{const s=__ATF_GAME__.player.tacticalReload;if(!s||s.phase!=='reloading')return false;
              const p=s.profile,at=expected==='failed'?.12:expected==='success'?(p.successWindow[0]+p.perfectWindow[0])/2:p.perfectWindow[0]+.004;
              return s.elapsed/p.duration>=at;}''', arg=expected)
            page.keyboard.press('KeyR')
        data = page.evaluate('()=>window.__V163_RELOAD_OBSERVER__')
        page.keyboard.up('KeyZ')
        page.mouse.up(button='right')
        after = observed(page)
        save_observation(label, data)
        actual = after['reload']['result']
        total = before['player']['ammo'] + before['player']['reserve']
        loading_rows = [row for row in data['rows'] if row['reload']['phase'] == 'reloading']
        visual_rows = [row for row in loading_rows if row['visual'] and row['visual']['reloadPhase'] != 'idle']
        check(label + ': real reload conserves rounds and completes one inventory transfer', after['reload']['phase'] == 'complete'
              and after['reload']['transferred'] and after['reload']['roundsLoaded'] == before['player']['magazineSize'] - before['player']['ammo']
              and after['player']['ammo'] == before['player']['magazineSize'] and after['player']['ammo'] + after['player']['reserve'] == total
              and all(row['player']['ammo'] == before['player']['ammo'] and row['player']['reserve'] == before['player']['reserve'] for row in loading_rows))
        check(label + ': captured service hands remain finite and meet the native weapon contacts', len(visual_rows) >= 2 and all(
              all(math.isfinite(row['visual'][key][axis]) for key in ['grip', 'support', 'nearHand', 'farHand', 'reloadPort'] for axis in ['x', 'y'])
              and math.dist([row['visual']['nearHand'][axis] for axis in ['x', 'y']], [row['visual']['grip'][axis] for axis in ['x', 'y']]) < .01
              and math.dist([row['visual']['farHand'][axis] for axis in ['x', 'y']], [row['visual']['support'][axis] for axis in ['x', 'y']]) < .01
              for row in visual_rows))
        if args.stage == 'after':
            progress = [row['visual']['reloadProgress'] for row in visual_rows]
            check(label + ': presented service clock never reverses across the second R', all(a <= b + 1e-10 for a, b in zip(progress, progress[1:])))
        row = {'id': label, 'feed': feed, 'load': load, 'requested': expected, 'actual': actual, 'accepted': actual == expected,
               'facing': facing, 'crouching': crouching, 'before': before, 'after': after, 'nativeFrames': len(data['rows']),
               'observedServicePhases': sorted({row['visual']['reloadPhase'] for row in visual_rows}), 'framesFile': label + '-frames.json'}
        report['cases'].append(row)
        if actual == expected:
            check(feed + '/' + load + ': native ' + expected.upper() + ' branch is actually reached', True)
            return
    raise AssertionError(feed + '/' + load + ': desired ' + expected + ' was not reached by four real timed attempts')


def resume_case(page):
    phase('box: actual in-progress reload pause, Save, page reload and native continue')
    deplete(page, 'tactical')
    page.locator('#game-canvas').focus()
    page.keyboard.press('KeyR')
    page.wait_for_function('()=>__ATF_GAME__.player.tacticalReload?.elapsed>=.15')
    page.keyboard.press('KeyP')
    page.wait_for_function('()=>__ATF_GAME__.paused')
    paused = observed(page)
    check('box: native pause freezes a genuinely incomplete transaction', paused['reload']['phase'] == 'reloading')
    page.locator('#mission-save-v160').click()
    page.wait_for_function('()=>!!__ATF_V51__.saveSystem.data.strategy.currentOperation?.resumeState?.player?.tacticalReloadV77')
    saved = observed(page)
    page.locator('#game-canvas').screenshot(path=str(output / 'box-reload-native-saved.png'))
    report['captures'].append({'file': 'box-reload-native-saved.png', 'state': saved})
    page.reload(wait_until='domcontentloaded')
    page.locator('#title-start').click(timeout=45000)
    page.locator('#title-continue').click()
    if not page.locator('#game-canvas').is_visible():
        open_view(page, 'command')
        page.locator('#operation-launch').click()
    wait_runtime(page)
    page.wait_for_function('()=>__ATF_GAME__.player.tacticalReload?.phase==="complete"', timeout=90000)
    resumed = observed(page)
    state = saved['saved']['player']['tacticalReloadV77']
    check('box: native resume retains operation/transaction without ammo refill or duplicate transfer', resumed['operationId'] == saved['operationId']
          and resumed['reload']['weaponKey'] == state['weaponKey'] and resumed['reload']['result'] == state['result']
          and resumed['player']['ammo'] == saved['player']['magazineSize']
          and resumed['player']['ammo'] + resumed['player']['reserve'] == saved['player']['ammo'] + saved['player']['reserve'])
    report['nativeResume'] = {'saved': saved, 'resumed': resumed}
    page.locator('#game-canvas').screenshot(path=str(output / 'box-reload-native-resumed.png'))
    report['captures'].append({'file': 'box-reload-native-resumed.png', 'state': resumed})


with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True, **({'executable_path': os.environ['ATF_CHROMIUM_EXECUTABLE']} if os.environ.get('ATF_CHROMIUM_EXECUTABLE') else {}))
    report['tooling'] = {'playwright': importlib.metadata.version('playwright'), 'chromium': browser.version}
    try:
        for feed in args.feeds:
            context = browser.new_context(viewport={'width': 1600, 'height': 1000}, service_workers='block')
            page = context.new_page()
            page.set_default_timeout(90000)
            page.on('pageerror', lambda error: report['pageErrors'].append(str(error)))
            page.on('requestfailed', lambda request: report['requestFailures'].append({'url': request.url, 'failure': request.failure}))
            page.on('response', lambda response: report['httpErrors'].append({'url': response.url, 'status': response.status}) if response.status >= 400 else None)
            page.on('dialog', lambda dialog: dialog.accept())
            data, raw = fixtures[feed]
            phase(feed + ': import disclosed native catalogue loadout and deploy QZ18')
            page.goto(args.base, wait_until='domcontentloaded')
            page.locator('#title-start').click(timeout=45000)
            page.locator('#title-options').click()
            page.locator('#save-import').set_input_files({'name': 'reload-' + feed + '.json', 'mimeType': 'application/json', 'buffer': raw})
            page.wait_for_function('name=>__ATF_V51__.saveSystem.data.player.name===name', arg=data['profile']['player']['name'])
            deploy(page)
            initial = observed(page)
            check(feed + ': native unmodified representative is actually equipped outside Forge', initial['weaponId'] == data['weapon']['id']
                  and initial['visual']['weaponId'] == data['weapon']['id'] and initial['player']['magazineSize'] == data['weapon']['magazine']
                  and initial['kind'] and not initial['forge'])
            case_index = 0
            for load in args.loads:
                for result in args.results:
                    reload_case(page, feed, load, result, case_index)
                    case_index += 1
            if feed == 'box':
                resume_case(page)
            context.close()
        check('every requested native feed/load/result cell actually completed', sum(row['accepted'] for row in report['cases'])
              == len(args.feeds) * len(args.results) * len(args.loads))
        check('native reload matrix has no browser, network or HTTP error', not report['pageErrors'] and not report['requestFailures'] and not report['httpErrors'])
        report['identityAfter'] = identity()
        check('the same served build completed the entire native matrix', report['identityBefore'] == report['identityAfter'])
        report['status'] = 'passed'
    except Exception as error:
        report['status'] = 'failed'
        report['error'] = repr(error)
        if 'page' in locals() and not page.is_closed():
            try:
                page.screenshot(path=str(output / 'failure.png'), full_page=True)
                report['failureObservation'] = observed(page)
            except Exception:
                pass
        raise
    finally:
        (output / 'report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2))
        browser.close()
