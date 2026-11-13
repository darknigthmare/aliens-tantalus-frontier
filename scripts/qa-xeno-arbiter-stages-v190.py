"""Native Chromium journey for the original ARBITER investigation and stages.

An ordinary, unplayed default profile is imported through System. Only its name,
creation flag, selected Lethe location and audio preferences are prepared. All
mission progress, extractions, dossier choices and Trials entries use real UI
and keyboard input. Evaluation reads snapshots and modules; it never writes
actors, position, HP, timers, RNG, objectives, receipts or results.
"""
import argparse
import hashlib
import json
import os
from pathlib import Path
import subprocess
import time
from urllib.parse import urlparse, unquote

from playwright.sync_api import sync_playwright

PARSER = argparse.ArgumentParser()
PARSER.add_argument('--base', default=os.environ.get('ATF_BASE_URL', 'http://127.0.0.1:4173'))
PARSER.add_argument('--output', type=Path, required=True)
PARSER.add_argument('--mode', choices=['campaign', 'stages', 'all'], default='all')
PARSER.add_argument('--allow-changing-sources', action='store_true', help='Exploratory only; cannot produce a final stable-source verdict.')
ARGS = PARSER.parse_args()
REPO = Path(os.environ.get('ATF_QA_REPO', Path(__file__).resolve().parents[1])).resolve()
OUT = ARGS.output.resolve()
if OUT == REPO or REPO in OUT.parents:
    raise SystemExit('Keep browser evidence outside the repository.')
OUT.mkdir(parents=True, exist_ok=True)
REPORT = {'status': 'running', 'mode': ARGS.mode, 'checks': [], 'captures': [], 'pageErrors': [], 'httpErrors': [], 'requestFailures': [],
          'missions': [], 'stages': [], 'httpBodies': {},
          'fixtures': ['An ordinary unplayed default profile is imported through the native System picker. Its creation flag, QA name, selected Lethe location, music/effects preferences and reduced-motion preference are prepared; no campaign return is prefilled.'],
          'nativeControlMethod': 'Mission walking uses ordinary A/D and the real Shift fixed-aim control to settle at a terminal before held E; no velocity is assigned.',
          'limits': ['Native Chromium keyboard and UI automation is not a physical peripheral or human play assessment.',
                     'The ARBITER investigation is original Tantalus fiction, not certified franchise canon.',
                     'Four Trials stage visits are partial evaluations ending in native abandonment, not match victories.',
                     'No live actor, health, position, objective, timer, RNG, receipt or result is injected.']}


def write_report():
    (OUT / 'report.json').write_text(json.dumps(REPORT, ensure_ascii=False, indent=2) + '\n')


def check(label, condition, evidence=None):
    if not condition:
        raise AssertionError(label)
    REPORT['checks'].append({'label': label, 'evidence': evidence})
    print('PASS ' + label, flush=True)
    write_report()


def source_manifest():
    paths = [*REPO.glob('src/**/*.js'), *REPO.glob('*.css'), REPO / 'index.html', REPO / 'sw.js',
             REPO / 'package.json', REPO / 'package-lock.json', Path(__file__).resolve()]
    for namespace in ['assets/openai/stages/xeno-trials-v190', 'assets/openai/campaign/xeno-arbiter-v190']:
        paths.extend(p for p in (REPO / namespace).glob('**/*') if p.is_file())
    return {str(p.relative_to(REPO)): hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(set(paths))}


def node_json(code):
    return json.loads(subprocess.check_output(['node', '--input-type=module', '-e', code], cwd=REPO, text=True))


def observe(page):
    return page.evaluate('''()=>{const e=__ATF_GAME__,s=__ATF_V51__.saveSystem.data;return {
      save:structuredClone(s),running:e.running,paused:e.paused,mission:e.mission?.state,
      snapshot:e.mission?e.getSnapshot?.():null,resume:e.mission?e.captureResumeState?.():null,
      arbiter:e.arbiterV190?structuredClone(e.arbiterV190):null,
      player:e.player?{x:e.player.x,y:e.player.y,w:e.player.w,h:e.player.h,vx:e.player.vx,health:e.player.health,
        armor:e.player.armor,ammo:e.player.ammo,alive:e.player.alive}:null,
      campaignId:e.campaign?.id,camera:e.camera?{...e.camera}:null,
      insertionVisible:!!document.querySelector('#mission-insertion-v62')&&!document.querySelector('#mission-insertion-v62').hidden};}''')


def arbiter_state(value):
    return value.get('arbiter') or (value.get('snapshot') or {}).get('arbiterV190') or (value.get('resume') or {}).get('arbiterV190')


def trials(page):
    return page.evaluate('()=>__ATF_XENO_TRIALS_V96__.snapshot()')


def enter(page, selector):
    page.locator(selector).wait_for(state='visible')
    page.locator(selector).focus()
    page.keyboard.press('Enter')


def capture(page, name, selector=None):
    if selector:
        page.locator(selector).screenshot(path=str(OUT / name))
    else:
        page.screenshot(path=str(OUT / name), full_page=True)
    REPORT['captures'].append(name)


def open_view(page, view):
    if view != 'xenotrials' and page.locator('#xeno-trials-v96.active').is_visible():
        enter(page, '[data-xt="return"]')
    if page.locator(f'[data-panel="{view}"].active').is_visible():
        return
    if page.locator('#exit-hub').is_visible():
        page.locator('#exit-hub').click()
        page.wait_for_function('()=>!document.documentElement.classList.contains("hub-mode")')
    menu = page.locator('#menu-toggle')
    if menu.is_visible() and 'open' not in (page.locator('.rail').get_attribute('class') or '').split():
        menu.click()
    enter(page, f'#nav [data-view="{view}"]')


def open_plan(page):
    open_view(page, 'command')
    page.locator('#operation-launch').wait_for(state='visible')
    dossier = page.locator('[data-arbiter-dossier]')
    if dossier.count() and dossier.get_attribute('open') is None:
        enter(page, '[data-arbiter-dossier] > summary')


def release(page):
    for key in ['KeyA', 'KeyD', 'KeyE', 'KeyF', 'ShiftLeft', 'ArrowLeft', 'ArrowRight', 'KeyS', 'Space']:
        page.keyboard.up(key)


def advance_insertion(page):
    for _ in range(9):
        root = page.locator('#mission-insertion-v62')
        if not root.is_visible():
            return
        resume = page.locator('[data-insertion-action="resume"]')
        if resume.is_visible():
            enter(page, '[data-insertion-action="resume"]')
            continue
        previous = root.get_attribute('data-insertion-phase')
        enter(page, '[data-insertion-action="advance"]')
        page.wait_for_function('previous=>{const r=document.querySelector("#mission-insertion-v62");return !r||r.hidden||r.dataset.insertionPhase!==previous}', arg=previous)
    raise AssertionError('Insertion did not hand control to the native mission.')


def wait_mission(page, campaign_id):
    page.wait_for_function('''id=>__ATF_GAME__?.running&&__ATF_GAME__.mission?.state==="active"
      &&__ATF_V51__.saveSystem.data.strategy.currentOperation?.campaignId===id
      &&!document.querySelector('#mission-runtime-v62').hidden''', arg=campaign_id, timeout=45000)
    page.locator('#game-canvas').focus()


def move_to(page, x, tolerance=14, limit=22):
    page.locator('#game-canvas').focus()
    deadline = time.monotonic() + limit
    held = None
    start = observe(page)['player']
    try:
        while time.monotonic() < deadline:
            value = page.evaluate('''()=>{const e=__ATF_GAME__,p=e.player;return {mission:e.mission?.state,
              player:p?{x:p.x,y:p.y,w:p.w,h:p.h,vx:p.vx,health:p.health,armor:p.armor,ammo:p.ammo,alive:p.alive}:null};}''')
            actor = value['player']
            assert actor and actor['alive'] and value['mission'] == 'active', 'Native operator must remain active and alive.'
            delta = x - (actor['x'] + actor['w'] / 2)
            if abs(delta) <= tolerance:
                page.keyboard.down('ShiftLeft')
                if held:
                    page.keyboard.up(held)
                    held = None
                page.wait_for_function('Math.abs(__ATF_GAME__.player.vx)<1', timeout=4000)
                page.keyboard.up('ShiftLeft')
                settled = observe(page)['player']
                if abs(x - settled['x'] - settled['w'] / 2) <= 45:
                    return {'start': start, 'end': settled, 'targetX': x}
                continue
            wanted = 'KeyD' if delta > 0 else 'KeyA'
            if held != wanted:
                if held:
                    page.keyboard.up(held)
                page.keyboard.down(wanted)
                held = wanted
            page.wait_for_timeout(45)
        raise AssertionError('Native traversal exceeded its budget at x=' + str(x))
    finally:
        if held:
            page.keyboard.up(held)
        page.keyboard.up('ShiftLeft')


def complete_station(page, index, seconds):
    page.locator('#game-canvas').focus()
    page.keyboard.down('KeyE')
    try:
        page.wait_for_function('index=>{const e=__ATF_GAME__;const s=e.arbiterV190||e.getSnapshot?.().arbiterV190;return s&&s.stage>index}', arg=index, timeout=int((seconds + 12) * 1000))
    finally:
        page.keyboard.up('KeyE')
    return arbiter_state(observe(page))


def probe_locked_route(page, mission):
    move_to(page, mission['stations'][1]['x'])
    page.keyboard.down('KeyE')
    page.wait_for_timeout(650)
    page.keyboard.up('KeyE')
    wrong = arbiter_state(observe(page))
    check('The later terminal cannot copy evidence before its required predecessor', wrong['stage'] == 0 and wrong['channelProgress'] == 0)
    page.keyboard.down('KeyD')
    last_x, stable_since = None, None
    deadline = time.monotonic() + 12
    try:
        while time.monotonic() < deadline:
            row = observe(page)
            player = row['player']
            if last_x is not None and abs(player['x'] - last_x) < .1 and player['x'] > 1600:
                stable_since = stable_since or time.monotonic()
                if time.monotonic() - stable_since > .7:
                    break
            else:
                stable_since = None
            last_x = player['x']
            page.wait_for_timeout(80)
        else:
            raise AssertionError('The authored return gate did not physically stop the unqualified operator.')
    finally:
        page.keyboard.up('KeyD')
    blocked = observe(page)
    check('The real return gate physically blocks extraction before local evidence is copied',
          blocked['player']['x'] + blocked['player']['w'] <= 1871 and blocked['player']['x'] > 1600
          and blocked['save']['strategy']['currentOperation'] is not None and arbiter_state(blocked)['stage'] == 0,
          {'player': blocked['player'], 'state': arbiter_state(blocked)})
    capture(page, '02-native-return-gate-blocked.png', '#game-canvas')


def reload_checkpoint(page, campaign_id):
    page.locator('#game-canvas').focus()
    page.keyboard.down('KeyE')
    page.wait_for_function('()=>{const e=__ATF_GAME__,s=e.arbiterV190||e.getSnapshot?.().arbiterV190;return s?.channelProgress>.35}')
    page.keyboard.press('KeyP')
    page.keyboard.up('KeyE')
    page.wait_for_function('__ATF_GAME__.paused')
    before = observe(page)
    enter(page, '#mission-save-v160')
    saved = observe(page)
    checkpoint = {'arbiter': arbiter_state(saved), 'player': saved['player'], 'operationId': saved['save']['strategy']['currentOperation']['id'],
                  'resources': saved['save']['galaxy']['resources'], 'clock': saved['save']['clock']}
    REPORT['checkpointBeforeReload'] = checkpoint
    (OUT / 'checkpoint-profile-before-reload.json').write_text(json.dumps(saved['save'], ensure_ascii=False, indent=2) + '\n')
    write_report()
    page.wait_for_timeout(500)
    still = observe(page)
    check('Mission pause freezes the current local channel and actor position', arbiter_state(still) == arbiter_state(before)
          and still['player']['x'] == before['player']['x'], {'stage': checkpoint['arbiter']['stage'], 'channelProgress': checkpoint['arbiter']['channelProgress']})
    capture(page, '03-gallery-channel-paused.png', '#game-canvas')
    page.reload(wait_until='domcontentloaded')
    enter(page, '#title-start')
    enter(page, '#title-continue')
    current = observe(page)
    if not (current['running'] and current.get('campaignId') == campaign_id and current.get('mission') == 'active'):
        open_plan(page)
        enter(page, '#operation-launch')
        advance_insertion(page)
    wait_mission(page, campaign_id)
    if not observe(page)['paused']:
        page.keyboard.press('KeyP')
        page.wait_for_function('__ATF_GAME__.paused')
    restored = observe(page)
    check('Real page reload restores the same operation, local channel and completed stations',
          arbiter_state(restored) == checkpoint['arbiter'] and restored['save']['strategy']['currentOperation']['id'] == checkpoint['operationId'],
          {'operationId': checkpoint['operationId'], 'arbiter': arbiter_state(restored)})
    check('Reload does not pay a second departure or change campaign resources', restored['save']['galaxy']['resources'] == checkpoint['resources']
          and restored['save']['clock'] == checkpoint['clock'])
    check('Reload restores the physical operator at the saved channel position',
          all(restored['player'][key] == checkpoint['player'][key] for key in ['x', 'y', 'health', 'armor', 'ammo']))
    capture(page, '04-gallery-native-checkpoint-restored.png', '#game-canvas')
    page.locator('#game-canvas').focus()
    page.keyboard.press('KeyP')
    page.wait_for_function('!__ATF_GAME__.paused')
    REPORT['checkpoint'] = checkpoint


def verify_campaign_scenery(page, mission):
    expected = {1: 'xt190-executive-gallery', 2: 'xt190-executive-gallery', 4: 'xt190-evidence-stack'}
    page.wait_for_function('''()=>{const v=__ATF_GAME__.getSnapshot?.().arbiterSceneryV190;
      return v?.rear?.loaded&&v?.front?.loaded}''', timeout=30000)
    value = observe(page)
    scene = value['snapshot']['arbiterSceneryV190']
    rear, front = scene['rear'], scene['front']
    planes = rear['drawnPlanes'] + front['drawnPlanes']
    check(mission['campaignId'] + ': the native investigation draws its actual interior atlas behind the local scene',
          rear['stageId'] == expected[mission['index']] and front['stageId'] == expected[mission['index']]
          and [plane['id'] for plane in planes] == ['far', 'middle', 'foreground']
          and not rear['proceduralFallback'] and not front['proceduralFallback']
          and len({plane['path'] for plane in planes}) == 1, scene)
    check(mission['campaignId'] + ': the real scenery clips preserve actor support and foreground clearance',
          rear['floorWorld'] == 570 and front['floorWorld'] == 570
          and rear['clip']['y'] + rear['clip']['height'] <= rear['floorScreen']
          and front['clip']['y'] >= front['floorScreen'] + 8,
          {'rearClip': rear['clip'], 'frontClip': front['clip'], 'floorScreen': front['floorScreen']})
    check(mission['campaignId'] + ': the interior draw receipt stays outside the saved objective authority',
          'arbiterSceneryV190' not in value['resume'] and not any('drawnPlanes' in key for key in arbiter_state(value)))
    REPORT.setdefault('campaignScenery', []).append({'campaignId': mission['campaignId'], 'actualDraw': scene})
    if mission['index'] == 1:
        capture(page, '03-gallery-native-interior.png', '#game-canvas')
    elif mission['index'] == 4:
        capture(page, '06-isolated-archive-native-interior.png', '#game-canvas')


def campaign_journey(page):
    missions = node_json("import{ARBITER_MISSIONS_V190 as m}from'./src/xeno-arbiter-campaign-v190.js';console.log(JSON.stringify(m));")
    open_plan(page)
    current = observe(page)['save'].get('xenoArbiterV190')
    check('All six original investigation chapters are exposed without fabricated progress', len(missions) == 6 and current['completedCampaignIds'] == [])
    check('Only the first chapter can initially be planned', not page.locator(f'[data-arbiter-plan="{missions[0]["campaignId"]}"]').is_disabled()
          and all(page.locator(f'[data-arbiter-plan="{m["campaignId"]}"]').is_disabled() for m in missions[1:]))
    capture(page, '01-arbiter-unplayed-dossier.png')
    open_view(page, 'xenotrials')
    check('Historical Trials remains accessible before the device is recovered', page.locator('[data-xt-branch="on-demand"]').is_visible() and trials(page)['match'] is None)
    open_plan(page)
    for index, mission in enumerate(missions):
        campaign_id = mission['campaignId']
        print('STEP Native campaign ' + campaign_id, flush=True)
        enter(page, f'[data-arbiter-plan="{campaign_id}"]')
        check('Planning chapter ' + str(index + 1) + ' selects the exact operation without completing it',
              observe(page)['save']['strategy']['plannedCampaignId'] == campaign_id and len(observe(page)['save']['xenoArbiterV190']['completedCampaignIds']) == index)
        enter(page, '#operation-launch')
        page.locator('#mission-insertion-v62').wait_for(state='visible')
        if index in [0, 2, 5]:
            capture(page, 'briefing-' + str(index + 1) + '.png', '#mission-insertion-v62')
        check('Chapter ' + str(index + 1) + ' presents its authored investigation briefing', 'ARBITER' in page.locator('#mission-insertion-v62').inner_text())
        advance_insertion(page)
        wait_mission(page, campaign_id)
        if index in [1, 2, 4]:
            verify_campaign_scenery(page, mission)
        operation_id = observe(page)['save']['strategy']['currentOperation']['id']
        observations = []
        if index == 0:
            probe_locked_route(page, mission)
        for station_index, station in enumerate(mission['stations']):
            travel = move_to(page, station['x'])
            if index == 1 and station_index == 1:
                reload_checkpoint(page, campaign_id)
            result = complete_station(page, station_index, station['seconds'])
            check(campaign_id + ': physical station ' + station['id'] + ' completes through held E', result['stage'] == station_index + 1
                  and result['completedStationIds'][-1] == station['id'] and result['complete'] is False,
                  {'station': station['id'], 'travel': travel, 'nativeState': result})
            observations.append({'station': station['id'], 'position': observe(page)['player'], 'state': result})
            if index == 2 and station_index == 0:
                capture(page, '05-device-native-custody.png', '#game-canvas')
        check(campaign_id + ': copied evidence alone cannot complete the operation',
              observe(page)['save']['strategy']['currentOperation']['id'] == operation_id and not arbiter_state(observe(page))['complete'])
        move_to(page, mission['extraction']['x'])
        page.keyboard.down('KeyE')
        try:
            page.wait_for_function('()=>__ATF_V51__.saveSystem.data.strategy.currentOperation===null', timeout=18000)
        finally:
            page.keyboard.up('KeyE')
        returned = observe(page)
        progress = returned['save']['xenoArbiterV190']
        check(campaign_id + ': the actual eastern sas commits one successful campaign return', len(progress['completedCampaignIds']) == index + 1
              and progress['completedCampaignIds'][-1] == campaign_id and progress['returns'][-1]['operationId'] == operation_id
              and returned['save']['strategy']['lastOperation']['success'] is True,
              {'operationId': operation_id, 'return': progress['returns'][-1]})
        capture(page, 'return-' + str(index + 1) + '.png', '#game-canvas')
        REPORT['missions'].append({'campaignId': campaign_id, 'operationId': operation_id, 'stations': observations,
                                   'return': progress['returns'][-1], 'ending': 'Native complete mission and eastern extraction.'})
        enter(page, '#retreat-mission')
        open_plan(page)
        after = observe(page)['save']['xenoArbiterV190']
        for _ in range(2):
            open_view(page, 'xenotrials')
            open_plan(page)
        check(campaign_id + ': reopening dossier and terminal cannot duplicate a return', observe(page)['save']['xenoArbiterV190'] == after)
        if index < 5:
            check('Extraction ' + str(index + 1) + ' opens exactly the next investigation chapter',
                  not page.locator(f'[data-arbiter-plan="{missions[index + 1]["campaignId"]}"]').is_disabled()
                  and all(page.locator(f'[data-arbiter-plan="{m["campaignId"]}"]').is_disabled() for m in missions[index + 2:]))
    last = observe(page)['save']['xenoArbiterV190']
    check('The six genuine returns end with a recovered module, isolated copy and local MIRE replay',
          len(last['returns']) == 6 and last['returns'][2]['receipt']['deviceRecovered'] and last['returns'][4]['receipt']['localIsolated']
          and last['returns'][5]['receipt']['localMireEnabled'])
    enter(page, '[data-arbiter-open-trials]')
    check('The acquired local replay opens the existing Trials terminal through its diegetic action', page.locator('[data-xt-branch="on-demand"]').is_visible())
    capture(page, '08-local-mire-tie-in.png')


def stage_scene(match):
    return match.get('stageSceneV190') or match.get('stageV190')


def trials_home(page):
    if page.locator('[data-xt="home"]').is_visible():
        return
    if not page.locator('[data-xt="activities"]').is_visible():
        enter(page, '[data-xt="branch-return"]')
    if page.locator('[data-xt="activities"]').is_visible():
        enter(page, '[data-xt="home-return"]')


def begin_stage(page, stage_id):
    trials_home(page)
    enter(page, '[data-xt-branch="on-demand"]')
    page.locator('[name="difficulty"]').select_option('easy')
    enter(page, '[data-xt="confirm-target"]')
    enter(page, '[data-xt="confirm-fighters"]')
    page.locator('[name="stageId"]').select_option(stage_id)
    enter(page, '[data-xt="start"]')
    page.wait_for_function('()=>{const m=__ATF_XENO_TRIALS_V96__.snapshot().match;return m&&!m.paused&&!m.presentation.blocksSimulation}', timeout=45000)
    page.locator('[data-xt="canvas"]').focus()
    return trials(page)['match']


def abandon_trial(page):
    release(page)
    if not trials(page)['match']['paused']:
        page.locator('[data-xt="canvas"]').focus()
        page.keyboard.press('KeyP')
        page.wait_for_function('__ATF_XENO_TRIALS_V96__.snapshot().match.paused')
    enter(page, '[data-xt="abandon-overlay"]')
    page.wait_for_function('__ATF_XENO_TRIALS_V96__.snapshot().progress.pending===null')
    trials_home(page)


def plane_displacement(first, second):
    old = first['destination']['xPositions']
    new = second['destination']['xPositions']
    return min(abs(x - y) for x in old for y in new)


def stage_journey(page):
    ids = ['xt190-adjudication-vault', 'xt190-specimen-transfer', 'xt190-executive-gallery', 'xt190-evidence-stack']
    open_view(page, 'xenotrials')
    for index, stage_id in enumerate(ids):
        print('STEP Native stage ' + stage_id, flush=True)
        first = begin_stage(page, stage_id)
        scene = stage_scene(first)
        check(stage_id + ': native selection loads the exact corporate arena', first['config']['stageId'] == stage_id and scene is not None)
        rear, front = scene['rear'], scene['front']
        planes = rear['drawnPlanes'] + front['drawnPlanes']
        check(stage_id + ': actual Canvas rendering submits all three image bands without procedural fallback',
              [plane['id'] for plane in planes] == ['far', 'middle', 'foreground'] and rear['proceduralFallback'] is False
              and len({plane['path'] for plane in planes}) == 1, planes)
        check(stage_id + ': actual clipping keeps the fast foreground beneath the physical contact line',
              front['frontClip']['y'] == front['floor'] + 8 and rear['rearClip']['height'] == rear['floor'])
        check(stage_id + ': at least one coherent background activity is actually drawn at native entry', bool(rear['drawnEvents']), rear['drawnEvents'])
        page.locator('[data-xt="canvas"]').focus()
        page.keyboard.down('ArrowRight')
        page.keyboard.down('KeyS')
        try:
            page.wait_for_timeout(1600)
        finally:
            page.keyboard.up('ArrowRight')
            page.keyboard.up('KeyS')
        moved = trials(page)['match']
        check(stage_id + ': native fighter motion advances the physical camera and scenery clock', moved['tick'] > first['tick']
              and moved['fighters'][0]['x'] != first['fighters'][0]['x'] and moved['cameraV119']['center'] != first['cameraV119']['center'],
              {'before': first['cameraV119'], 'after': moved['cameraV119'], 'scene': stage_scene(moved)})
        changed_scene = stage_scene(moved)
        changed_planes = changed_scene['rear']['drawnPlanes'] + changed_scene['front']['drawnPlanes']
        displacements = [plane_displacement(old, new) for old, new in zip(planes, changed_planes)]
        check(stage_id + ': the drawn far, middle and foreground actually move at three distinct camera depths',
              0 < displacements[0] < displacements[1] < displacements[2], displacements)
        check(stage_id + ': rear activity progresses with the accepted match tick', changed_scene['rear']['time'] > rear['time']
              and changed_scene['rear']['events'] != rear['events'])
        capture(page, 'stage-' + str(index + 1) + '-active.png')
        page.keyboard.press('KeyP')
        page.wait_for_function('__ATF_XENO_TRIALS_V96__.snapshot().match.paused')
        paused = trials(page)['match']
        page.wait_for_timeout(500)
        still = trials(page)['match']
        check(stage_id + ': pause freezes the scene event phase and combat tick', still['tick'] == paused['tick'] and stage_scene(still) == stage_scene(paused), stage_scene(paused))
        REPORT['stages'].append({'stageId': stage_id, 'first': scene, 'moved': stage_scene(moved), 'paused': stage_scene(paused),
                                 'ending': 'Partial native stage visit, followed by abandonment; no victory claimed.'})
        abandon_trial(page)
    open_view(page, 'settings')
    page.locator('#setting-motion').check()
    check('The real accessibility control enables reduced motion in the saved profile', observe(page)['save']['settings']['reducedMotion'] is True)
    open_view(page, 'xenotrials')
    reduced = begin_stage(page, ids[2])
    reduced_scene = stage_scene(reduced)
    check('Reduced motion retains the actual three image planes and suppresses every background activity',
          reduced_scene['rear']['reducedMotion'] and reduced_scene['rear']['time'] == 0
          and not reduced_scene['rear']['drawnEvents'] and all(not event['active'] for event in reduced_scene['rear']['events'])
          and len(reduced_scene['rear']['drawnPlanes']) + len(reduced_scene['front']['drawnPlanes']) == 3)
    page.wait_for_timeout(650)
    next_reduced = trials(page)['match']
    check('Reduced-motion scenery has no independent animation clock while real combat advances',
          next_reduced['tick'] > reduced['tick'] and stage_scene(next_reduced)['rear']['time'] == 0
          and not stage_scene(next_reduced)['rear']['drawnEvents'])
    page.set_viewport_size({'width': 390, 'height': 844})
    page.wait_for_timeout(120)
    capture(page, '09-corporate-stage-reduced-motion-mobile.png')
    check('The portrait Trials canvas and pause control remain accessible with the corporate scenery',
          page.locator('[data-xt="canvas"]').is_visible() and page.locator('[data-xt="pause"]').is_visible())
    abandon_trial(page)
    page.set_viewport_size({'width': 1440, 'height': 1000})
    open_view(page, 'settings')
    page.locator('#setting-motion').uncheck()
    open_view(page, 'xenotrials')
    trials_home(page)
    enter(page, '[data-xt-branch="operations"]')
    enter(page, '[data-xt-activity="xto188-escort-1"]')
    enter(page, '[data-xt="confirm-fighters"]')
    enter(page, '[data-xt="start"]')
    page.wait_for_function('()=>{const m=__ATF_XENO_TRIALS_V96__.snapshot().match;return m&&!m.paused&&!m.presentation.blocksSimulation}')
    legacy = trials(page)['match']
    check('An existing horde operation retains its physical objective and terrain hazard with the new rear enrichment',
          legacy['config']['stageId'] == 'xt179-ship-habitation' and legacy['hordeV180'] is not None
          and legacy['operationViewV188'] is not None and legacy['stageHazardViewV188'] is not None
          and stage_scene(legacy)['rear']['replacesArena'] is False and not stage_scene(legacy)['rear']['drawnPlanes'],
          {'operation': legacy['operationViewV188'], 'hazard': legacy['stageHazardViewV188'], 'scenery': stage_scene(legacy)})
    capture(page, '10-preserved-horde-hazard-enrichment.png')
    REPORT['legacyOperationVisit'] = {'id': 'xto188-escort-1', 'ending': 'Partial native visit followed by abandonment; objective and hazard remain active, no victory claimed.'}
    abandon_trial(page)


def fixture(page):
    raw = subprocess.check_output(['node', '--input-type=module', '-e',
        "import{createDefaultSave}from'./src/save.js';const s=createDefaultSave();s.needsPlayerCreationV84=false;s.player.name='QA_ARBITER_V190';s.worldId='world-05-lethe';s.scene='command';s.settings.music=0;s.settings.effects=.35;s.settings.reducedMotion=false;console.log(JSON.stringify(s));"], cwd=REPO)
    (OUT / 'unplayed-arbiter-profile.json').write_bytes(raw)
    REPORT['fixtureSha256'] = hashlib.sha256(raw).hexdigest()
    page.locator('#save-import').set_input_files({'name': 'unplayed-arbiter-profile.json', 'mimeType': 'application/json', 'buffer': raw})
    page.wait_for_function("__ATF_V51__.saveSystem.data.player.name==='QA_ARBITER_V190'")


def response_receipt(response):
    path = unquote(urlparse(response.url).path).lstrip('/')
    if response.status >= 400:
        REPORT['httpErrors'].append({'url': response.url, 'status': response.status})
    if 'v190' not in path or not path.endswith(('.js', '.png', '.webp', '.css')):
        return
    local = REPO / path
    if not local.is_file():
        return
    try:
        body = response.body()
        REPORT['httpBodies'][path] = {'bytes': len(body), 'sha256': hashlib.sha256(body).hexdigest(),
                                      'matchesDisk': body == local.read_bytes()}
    except Exception as error:
        REPORT.setdefault('responseReceiptErrors', []).append({'path': path, 'error': str(error)})


before = source_manifest()
(OUT / 'source-start.json').write_text(json.dumps(before, indent=2) + '\n')
with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True, executable_path=os.environ.get('ATF_CHROMIUM_EXECUTABLE', '/usr/bin/chromium'))
    context = browser.new_context(viewport={'width': 1440, 'height': 1000}, service_workers='block')
    page = context.new_page()
    page.set_default_timeout(30000)
    page.on('pageerror', lambda error: REPORT['pageErrors'].append(str(error)))
    page.on('requestfailed', lambda request: REPORT['requestFailures'].append({'url': request.url, 'failure': request.failure}))
    page.on('response', response_receipt)
    page.on('dialog', lambda dialog: dialog.accept())
    try:
        page.goto(ARGS.base, wait_until='domcontentloaded')
        enter(page, '#title-start')
        enter(page, '#title-options')
        fixture(page)
        page.locator('#language-select-v185').select_option('fr')
        if ARGS.mode in ['campaign', 'all']:
            campaign_journey(page)
        if ARGS.mode in ['stages', 'all']:
            stage_journey(page)
        check('The native browser reports no JavaScript, HTTP or request failures', not REPORT['pageErrors'] and not REPORT['httpErrors'] and not REPORT['requestFailures'])
        check('The actual ARBITER stylesheet is included in both the source receipt and matching HTTP responses',
              'xeno-arbiter-v190.css' in before and REPORT['httpBodies'].get('xeno-arbiter-v190.css', {}).get('matchesDisk') is True)
        check('Every received V190 module and illustration body matches its source bytes', bool(REPORT['httpBodies']) and all(row['matchesDisk'] for row in REPORT['httpBodies'].values()) and not REPORT.get('responseReceiptErrors'))
        after = source_manifest()
        changed = sorted(key for key in set(before) | set(after) if before.get(key) != after.get(key))
        REPORT['sourceReceipt'] = {'beforeFiles': len(before), 'afterFiles': len(after), 'unchanged': not changed, 'changed': changed,
                                   'harnessSha256': before[str(Path(__file__).resolve().relative_to(REPO))]}
        if not ARGS.allow_changing_sources:
            check('All native source and new illustration files stay frozen throughout the run', not changed)
        REPORT['status'] = 'exploratory-passed' if ARGS.allow_changing_sources else 'passed'
    except Exception as error:
        REPORT['status'] = 'failed'
        REPORT['error'] = str(error)
        try:
            capture(page, 'failure.png')
            REPORT['failureState'] = observe(page)
        except Exception:
            pass
        raise
    finally:
        write_report()
        browser.close()
